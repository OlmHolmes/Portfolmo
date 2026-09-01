import { gsap, ScrollTrigger, SplitText } from './gsap-setup';

export function initAboutReveal(sectionSelector: string, bodySelector: string) {
  const section = document.querySelector<HTMLElement>(sectionSelector);
  const body = document.querySelector<HTMLElement>(bodySelector);
  if (!section || !body) return;

  // Creating the ScrollTrigger synchronously (on script mount) measures the
  // section's position before the page has laid out for real: fonts haven't
  // swapped in yet and the Hero section above can still be reporting close
  // to 0px tall, so `start: 'top top'` gets pinned to ~0 instead of Hero's
  // real height. Since the page's scroll position (0) is already "past"
  // that bogus start, ScrollTrigger fires onEnter immediately on creation -
  // the reveal plays instantly, off-screen, before the user has scrolled at
  // all, so by the time About actually reaches the top of the viewport the
  // text is already sitting fully revealed. Waiting for fonts to be ready
  // AND for a couple of frames to pass (so layout/paint has genuinely
  // settled) before measuring anything or creating the trigger avoids ever
  // computing that bogus start in the first place.
  const fontsReady = document.fonts?.ready ?? Promise.resolve();

  fontsReady.then(() => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setupReveal(section, body);
      });
    });
  });
}

function setupReveal(section: HTMLElement, body: HTMLElement) {
  const split = new SplitText(body, { type: 'words' });
  const words = split.words as HTMLElement[];

  let offsets = computeOffscreenOffsets(words);

  // Words stay `display:inline-block` at all times - hiding is done purely
  // via the `x` transform pushing each word past the right edge. Toggling
  // `display` was the original approach (display:none while hidden), but
  // that forces the browser to reflow all ~129 words synchronously, and
  // doing that in the exact same frame the pin engages (onEnter/onEnterBack
  // fire the instant the pin starts) is what caused a visible stutter right
  // as About locks into place, before any word had even started animating.
  // A transform-only change is compositor-only (no layout/reflow), so it
  // costs effectively nothing in that frame. `.about` gets `overflow-x:
  // hidden` (about.css) to keep the far-off-screen words from ever creating
  // a horizontal scrollbar, instead of relying on `display:none` for that.
  const hide = () => {
    words.forEach((word, i) => {
      gsap.set(word, { x: offsets[i] });
    });
  };
  hide();

  let played = false;

  // Scrolling in either direction plays the same intro: down from Hero
  // (onEnter) or back up from Project without ever having played it, e.g.
  // after a fast flick skipped straight past About (onEnterBack). A
  // scroll-lock that blocked further scrolling until the words fully
  // landed was tried here (multiple iterations: it fixed one failure mode
  // and opened another each time - overlapping content, then scroll
  // getting stuck entirely, then a stutter right at pin-engagement) and
  // was reverted at Francesco's call after the last attempt still stuttered
  // - simplicity won over the guarantee. Scrolling fast enough can still
  // outrun the reveal and reach Project before the last word lands.
  const playReveal = () => {
    if (played) return;
    played = true;
    gsap.killTweensOf(words);
    gsap.to(words, {
      x: 0,
      duration: 0.4,
      ease: 'power2.out',
      // `stagger: { amount }` spreads the whole sequence across a fixed
      // total instead of a fixed per-item delay, so the reveal stays quick
      // regardless of how many words the copy has (a fixed per-word delay
      // scaled to ~2s+ once the copy grew past ~130 words).
      stagger: { amount: 0.45, from: 'start' },
    });
  };

  ScrollTrigger.create({
    trigger: section,
    start: 'top top',
    end: '+=600',
    pin: true,
    anticipatePin: 1,
    onEnter: playReveal,
    onEnterBack: playReveal,
    onLeaveBack: () => {
      played = false;
      gsap.killTweensOf(words);
      hide();
    },
  });

  // Sections after About (e.g. the pinned project list) may have already
  // measured their own ScrollTrigger start position before this trigger
  // existed (this one is deliberately created late, see the comment above),
  // so their start doesn't yet account for the pin-spacer this just added
  // to the document flow. Without this, later sections think they start
  // ~600px higher than they actually do, which lets their own pin activate
  // while About is still pinned on top of it - the two visibly overlap.
  ScrollTrigger.refresh();

  // Recompute the off-screen resting position on resize so a viewport-width
  // change doesn't leave not-yet-revealed words visible mid-screen instead
  // of past the right edge. Only reapply while still in the hidden state -
  // once played, words belong at x:0 and must not be touched.
  let resizeTimer: ReturnType<typeof setTimeout> | undefined;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      offsets = computeOffscreenOffsets(words);
      if (!played) hide();
    }, 150);
  });
}

/**
 * For each word, compute an x offset (in px) that lands it fully past the
 * right edge of the viewport from its own natural position - guaranteed
 * regardless of where on the line the word sits, unlike a single fixed
 * '50vw' shift (which isn't enough for words already near the left edge of
 * a line). Because the offset is exact, no ancestor clipping (overflow:
 * hidden) is needed to hide the pre-entrance state, which means the
 * settled/justified paragraph is never at risk of being clipped either.
 */
function computeOffscreenOffsets(words: HTMLElement[]): number[] {
  const vw = window.innerWidth;
  return words.map((word) => {
    const prevTransform = word.style.transform;
    word.style.transform = 'none';
    const rect = word.getBoundingClientRect();
    word.style.transform = prevTransform;
    return vw - rect.left + 40;
  });
}
