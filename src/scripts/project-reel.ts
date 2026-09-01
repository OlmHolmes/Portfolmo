import { gsap, ScrollTrigger } from './gsap-setup';

export function initProjectReel(
  sectionSelector: string,
  windowSelector: string,
  listSelector: string,
  panelSelector: string
) {
  const section = document.querySelector<HTMLElement>(sectionSelector);
  const win = document.querySelector<HTMLElement>(windowSelector);
  const list = document.querySelector<HTMLElement>(listSelector);
  const panel = document.querySelector<HTMLElement>(panelSelector);
  if (!section || !win || !list || !panel) return;

  const rows = Array.from(list.querySelectorAll<HTMLAnchorElement>('[data-project-row]'));
  if (rows.length === 0) return;

  const media = panel.querySelector<HTMLElement>('[data-panel-media]');
  const overview = panel.querySelector<HTMLElement>('[data-panel-overview]');
  const tagsEl = panel.querySelector<HTMLElement>('[data-panel-tags]');
  const clientRow = panel.querySelector<HTMLElement>('[data-panel-client-row]');
  const clientEl = panel.querySelector<HTMLElement>('[data-panel-client]');
  const dateEl = panel.querySelector<HTMLElement>('[data-panel-date]');
  const link = panel.querySelector<HTMLAnchorElement>('[data-panel-link]');
  if (!media || !overview || !tagsEl || !clientRow || !clientEl || !dateEl || !link) return;

  // Creating this section's ScrollTrigger synchronously (on script mount)
  // measures 'top top' against the document as it exists at that instant -
  // which is BEFORE About's own trigger (deferred until fonts.ready + two
  // rAFs, see about-reveal.ts) has inserted its pin-spacer. That spacer adds
  // real height to the document (About's pin duration), so this section's
  // true natural top is that much lower than what gets measured here.
  // Calling ScrollTrigger.refresh() later (as About's setup does, once its
  // own pin exists) does NOT fix this retroactively for an already-pinned
  // trigger: verified live that refresh() leaves this trigger's cached
  // `start` unchanged even though a freshly-created trigger for the same
  // element immediately measures the correct, larger value. So the fix is
  // to not create this trigger until after About's pin-spacer already
  // exists - deferring with the same fonts.ready + two-rAF pattern as About
  // guarantees (via same-frame rAF callback ordering, since About's script
  // runs first in document order) that this runs after About's setup.
  const fontsReady = document.fonts?.ready ?? Promise.resolve();
  fontsReady.then(() => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setupReel();
      });
    });
  });

  function computeTargets(): number[] {
    const centerY = win!.offsetHeight / 2;
    return rows.map((row) => centerY - (row.offsetTop + row.offsetHeight / 2));
  }

  let targets: number[];

  function setActive(index: number) {
    const row = rows[index];
    rows.forEach((r, i) => r.classList.toggle('is-active', i === index));

    const type = row.dataset.previewType === 'video' ? 'video' : 'img';
    media!.innerHTML = '';
    const mediaEl = document.createElement(type);
    mediaEl.setAttribute('src', row.dataset.previewSrc ?? '');
    if (type === 'video') {
      mediaEl.setAttribute('muted', '');
      mediaEl.setAttribute('loop', '');
      mediaEl.setAttribute('autoplay', '');
      mediaEl.setAttribute('playsinline', '');
    }
    media!.appendChild(mediaEl);

    overview!.textContent = row.dataset.overview ?? '';

    const tags: string[] = JSON.parse(row.dataset.tags ?? '[]');
    tagsEl!.innerHTML = '';
    tags.forEach((tag) => {
      const line = document.createElement('span');
      line.textContent = tag;
      tagsEl!.appendChild(line);
    });

    const client = row.dataset.client ?? '';
    const date = row.dataset.date ?? '';
    clientRow!.style.display = client || date ? '' : 'none';
    clientEl!.textContent = client;
    dateEl!.textContent = date;

    link!.href = row.href;

    gsap.fromTo(panel!, { autoAlpha: 0.4 }, { autoAlpha: 1, duration: 0.25, ease: 'power2.out' });
  }

  let current = -1;
  let trigger: ScrollTrigger | undefined;

  function scrollToIndex(index: number) {
    if (!trigger) return;
    const progress = rows.length > 1 ? index / (rows.length - 1) : 0;
    const targetY = trigger.start + progress * (trigger.end - trigger.start);
    gsap.to(window, {
      scrollTo: { y: targetY, autoKill: true },
      duration: 0.8,
      ease: 'power2.inOut',
    });
  }

  // Clicking a project row that isn't already front-and-center brings it
  // into focus instead of navigating straight to its page - only clicking
  // the already-active row opens it.
  rows.forEach((row, index) => {
    row.addEventListener('click', (event) => {
      if (index === current) return;
      event.preventDefault();
      scrollToIndex(index);
    });
  });

  function setupReel() {
    targets = computeTargets();

    // A previous attempt offset this to 'top+=80 top' on the theory that the
    // About section above (which pulls this section up ~48px via its
    // negative --about-shift margin) could let this trigger's pin engage
    // while About's own pin was still active. That offset was wrong in a
    // way that made things worse: offsetting the *trigger-side* token
    // doesn't just delay when the pin engages, it permanently shifts where
    // GSAP renders the pin - for the entire pinned duration, not just at
    // the moment of engagement, since GSAP keeps that offset point aligned
    // with the scroller-side token the whole time the pin is active.
    // Measured live (pin-spacer rects + ScrollTrigger start/end at runtime):
    // with that 80px offset, this section's pinned rect.top sat at -80 for
    // its entire scrub-through-projects duration, permanently clipping ~80px
    // off the top of the preview panel - a persistent misalignment, not a
    // one-time delay, and the real source of the "project section itself
    // scatta" complaint, independent of About.
    // A plain 'top top', created here (after About's pin-spacer already
    // exists thanks to the fonts.ready + two-rAF deferral above this
    // function), measures a natural start ~670px of scroll after About's
    // pin fully releases (About releases at scrollY 1320, this section's
    // natural start is 1992) - comfortably no overlap, no offset needed.
    trigger = ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: `+=${rows.length * 500}`,
      pin: true,
      anticipatePin: 1,
      scrub: 0.8,
      onRefresh: () => {
        targets = computeTargets();
      },
      onUpdate: (self) => {
        const virtual = self.progress * (rows.length - 1);
        const i0 = Math.floor(virtual);
        const i1 = Math.min(rows.length - 1, i0 + 1);
        const frac = virtual - i0;
        const y = gsap.utils.interpolate(targets[i0], targets[i1], frac);
        gsap.set(list, { y });

        const activeIndex = Math.round(virtual);
        if (activeIndex !== current) {
          current = activeIndex;
          setActive(activeIndex);
        }
      },
    });

    gsap.set(list, { y: targets[0] });
    current = 0;
    setActive(0);
  }
}
