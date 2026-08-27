# Hero/About Split + Pinned Reveal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** split the current single Hero section (name heading + bio paragraph together) into two sections — a landing Hero (name only, unchanged animation) and a separate, pinned About section (heading + bio) whose word-by-word reveal is scroll-scrubbed while the section is pinned to the viewport, so the reveal always starts at 0% and always finishes before the user can scroll past it.

**Context:** this is a direct follow-up to `docs/superpowers/plans/2026-08-10-visual-redesign-plan.md` (all 3 of its tasks are done and merged) plus several ad-hoc Hero iterations that happened after it in direct conversation with Francesco (not tracked as formal plan tasks — see git log on `worktree-portfolio-template` between commits `366ccf8` and `1411aa6` for that history if needed). This plan captures the next agreed step precisely so it can be executed in a fresh session without re-deriving the reasoning below.

**Problem being fixed (in Francesco's own words, most recent session):**
1. "quando inizio a scrollare metà del testo è già entrato" — the bio paragraph sits inside the same viewport-height Hero as the name, so by the time any scrolling happens, the scroll-linked word reveal (tied to page scroll position via a fixed pixel range) has already partially or fully played out.
2. "il testo finisce di comparire quando ormai ho già scrollato e sono arrivato ai miei progetti e non posso più leggerlo" — because the reveal is tied to raw page scroll with no pinning, continuing to scroll past the paragraph keeps advancing (and can finish) the reveal after the paragraph has already scrolled out of view.
3. "il testo vorrei che entrasse da fuori dallo schermo... non è molto fluida l'animazione" — currently each word snaps from `display:none` to `display:inline-block` with no transition (a plain style flip, since `display` isn't animatable), so nothing actually tweens; it just pops in.

**Agreed fix:** move the bio into its own `About` section, sized `min-height: 100vh`, pinned via `ScrollTrigger({ pin: true, scrub: true })` while its words reveal. Pinning guarantees the reveal starts at exactly 0% (the pin's `start: 'top top'` is a clean trigger point, not a fuzzy percentage-of-viewport heuristic) and guarantees the section cannot scroll away before the reveal completes (it's physically pinned until `end` is reached). Each word gets a real, animated fade + slight rise when it's revealed instead of an instant style flip.

**Architecture:** `Hero.astro` keeps only the name heading (drops the bio entirely, drops the now-unused `locale` prop and `bodySelector` parameter). A new `About.astro` component (new `about.css`, new `about-reveal.ts` script) owns the bio heading + paragraph and the pinned reveal. Both sections render in sequence on the homepage, in place of the current single Hero.

**Tech Stack:** unchanged — Astro, TypeScript, GSAP (`gsap`, `ScrollTrigger`, `SplitText`, already installed and registered in `src/scripts/gsap-setup.ts`).

## Global Constraints

- Project root: `/Users/olmo/Desktop/portfolio-sito/.claude/worktrees/portfolio-template/` (git worktree, branch `worktree-portfolio-template`). Never touch `/Users/olmo/Desktop/portfolio-sito` directly — a different checkout of the same repo, off-limits.
- Never use "—" (em dash) anywhere in any UI string, label, or copy authored or transcribed.
- Do not add, upgrade, or modify any npm dependency.
- The bio's Italian text and its English translation must be transcribed exactly as given in this plan (already approved by Francesco in the prior session, including the "Olmo" correction to his name).
- **Testing this GSAP/ScrollTrigger pin-and-scrub behavior in this project's automated browser tooling is known to be unreliable**: the tool's browser tab runs in a backgrounded/hidden state (`document.hidden === true`), which pauses `requestAnimationFrame` — the mechanism both GSAP's tween ticker and ScrollTrigger's own update batching rely on. Symptoms observed in the prior session: tweens create successfully (`gsap.to()` returns a valid tween) but never fire `onStart`/`onComplete`; `ScrollTrigger`'s calculated trigger points can be wildly wrong when `window.innerHeight` reads `0` (also a symptom of the tab's backgrounded state) until the browser pane is explicitly resized to a real viewport (e.g. via `resize_window`); scroll-position changes via `window.scrollTo()` don't propagate to `ScrollTrigger.onUpdate` until `ScrollTrigger.update()` is called manually to bypass the stalled rAF batching. **Do not treat a blank/frozen-looking screenshot as a failure on its own** — first resize the viewport to a real size, force `ScrollTrigger.update()` after any programmatic scroll, and confirm state changes via DOM inspection (e.g. checking each word's `display`/`opacity` via `javascript_tool`) rather than relying solely on screenshots. If genuinely stuck, verify the build succeeds and the logic is sound by code review, note the tooling limitation explicitly in the task report, and ask Francesco to confirm visually in his own browser rather than looping on this environment issue.

---

## Task 1: Split Hero into landing Hero + pinned About section

**Files:**
- Modify: `src/components/Hero.astro` (remove bio, keep only the name heading)
- Modify: `src/scripts/hero-reveal.ts` (drop the `bodySelector` parameter and its logic — that moves to `about-reveal.ts`)
- Modify: `src/styles/hero.css` (remove `.hero__body` — moves to `about.css`)
- Create: `src/components/About.astro`
- Create: `src/styles/about.css`
- Create: `src/scripts/about-reveal.ts`
- Modify: `src/components/Header.astro` (the "About" nav link must point at the new `#about` section, not `#hero`)
- Modify: `src/pages/index.astro` (render `<Hero />` then `<About locale={locale} />`)
- Modify: `src/pages/en/index.astro` (same)

**Interfaces:**
- Consumes: `t`, `type Locale` from `src/lib/i18n.ts` (unchanged); `gsap`, `ScrollTrigger`, `SplitText` from `src/scripts/gsap-setup.ts` (unchanged).
- Produces: `About.astro` accepting `{ locale: Locale }`; `initAboutReveal(sectionSelector: string, bodySelector: string): void` from `src/scripts/about-reveal.ts`.
- Changes: `Hero.astro` no longer accepts any props (drop the `Props` interface and `locale` entirely — the name is locale-invariant); `initHeroReveal(headingSelector: string)` drops its second parameter.

- [ ] **Step 1: Simplify Hero back to a name-only landing section**

`src/components/Hero.astro` (full file):

```astro
---
import '../styles/hero.css';
---
<section id="hero" class="hero">
  <h1 class="hero__heading">Francesco Olmo Bortoloso</h1>
</section>
<script>
  import { initHeroReveal } from '../scripts/hero-reveal';
  initHeroReveal('.hero__heading');
</script>
```

- [ ] **Step 2: Drop the body-reveal logic from hero-reveal.ts**

`src/scripts/hero-reveal.ts` (full file):

```ts
import { gsap, SplitText } from './gsap-setup';

export function initHeroReveal(headingSelector: string) {
  const heading = document.querySelector<HTMLElement>(headingSelector);
  if (!heading) return;

  const split = new SplitText(heading, { type: 'lines,words' });

  split.words.forEach((word, index) => {
    gsap.set(word, { x: index % 2 === 0 ? -80 : 80, opacity: 0 });
  });

  gsap.to(split.words, {
    x: 0,
    opacity: 1,
    stagger: 0.05,
    duration: 0.8,
    delay: 0.2,
    ease: 'power3.out',
  });
}
```

- [ ] **Step 3: Remove the body rule from hero.css**

`src/styles/hero.css` (full file):

```css
.hero {
  min-height: 80vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: var(--space-3);
  padding: var(--space-4) var(--space-3);
}

.hero__heading {
  font-family: var(--font-display);
  font-size: clamp(2rem, 6vw, 4.5rem);
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 1.1;
  margin: 0;
}
```

- [ ] **Step 4: Write the About section styles**

`src/styles/about.css`:

```css
.about {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: var(--space-3);
  padding: var(--space-4) var(--space-3);
}

.about__heading {
  font-family: var(--font-display);
  font-size: clamp(1.5rem, 3vw, 2.5rem);
  font-weight: 800;
  letter-spacing: -0.02em;
  margin: 0;
}

.about__body {
  font-family: var(--font-display);
  max-width: 70ch;
  font-size: 1.75rem;
  font-weight: 600;
  line-height: 1.5;
  text-align: justify;
  text-align-last: justify;
  color: var(--color-fg);
}
```

- [ ] **Step 5: Write the pinned, scroll-scrubbed word reveal**

`src/scripts/about-reveal.ts`:

```ts
import { gsap, ScrollTrigger, SplitText } from './gsap-setup';

export function initAboutReveal(sectionSelector: string, bodySelector: string) {
  const section = document.querySelector<HTMLElement>(sectionSelector);
  const body = document.querySelector<HTMLElement>(bodySelector);
  if (!section || !body) return;

  const split = new SplitText(body, { type: 'words' });
  const words = split.words;

  words.forEach((word) => {
    gsap.set(word, { display: 'none', opacity: 0, y: 24 });
  });

  let revealed = 0;

  ScrollTrigger.create({
    trigger: section,
    start: 'top top',
    end: '+=2000',
    pin: true,
    scrub: true,
    onUpdate: (self) => {
      const target = Math.round(self.progress * words.length);

      if (target > revealed) {
        for (let i = revealed; i < target; i++) {
          gsap.set(words[i], { display: 'inline-block' });
          gsap.to(words[i], { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' });
        }
      } else if (target < revealed) {
        for (let i = target; i < revealed; i++) {
          gsap.set(words[i], { display: 'none', opacity: 0, y: 24 });
        }
      }
      revealed = target;
    },
  });
}
```

Notes for whoever implements this:
- `pin: true` freezes the section in place (via a wrapper GSAP inserts) for the full `start`→`end` scroll range, then releases it — this is what guarantees the reveal can't be outscrolled.
- `start: 'top top'` (section's top hits viewport top) is a clean, unambiguous trigger point, unlike the previous percentage-based `'top 80%'` which produced inconsistent partial-reveal-at-load behavior depending on page layout.
- `end: '+=2000'` means 2000px of scroll is consumed while pinned. If manual testing (by Francesco, in his own browser — see the Global Constraints note on why this tool can't reliably verify it) shows the reveal finishing too early or too late relative to a comfortable reading pace, this is the number to tune first.
- The `target < revealed` branch handles scrolling back up during the pinned range (scrub is bidirectional) by re-hiding words past the current scroll-derived target, keeping state consistent both directions.

- [ ] **Step 6: Write the About component**

`src/components/About.astro`:

```astro
---
import '../styles/about.css';
import { t, type Locale } from '../lib/i18n';

interface Props {
  locale: Locale;
}

const { locale } = Astro.props;
const labels = t(locale);

const body =
  locale === 'it'
    ? "Mi chiamo Francesco Olmo Bortoloso, vengo da Verbania, sul Lago Maggiore, e vivo a Milano. Fin da piccolo ho sentito il bisogno di esprimermi creativamente, e questo mi ha portato a esplorare diversi ambiti delle arti visive nel tempo libero. Dopo il diploma ho continuato gli studi al Politecnico di Milano, dove ho approfondito il design e la comunicazione visiva, per poi specializzarmi in New Media Art con un master alla D-House Academy. Lì ho imparato a utilizzare TouchDesigner e sensori per realizzare videomapping e installazioni interattive. Nel corso di questo percorso ho lavorato a numerosi progetti che mi hanno permesso di crescere professionalmente e sviluppare uno stile personale, fatto di equilibrio tra creatività, funzionalità e attenzione al dettaglio nella comunicazione visiva."
    : "My name is Francesco Olmo Bortoloso, I'm from Verbania, on Lake Maggiore, and I live in Milan. From a young age I felt the need to express myself creatively, and this led me to explore different areas of the visual arts in my free time. After finishing school I continued my studies at Politecnico di Milano, where I deepened my knowledge of design and visual communication, before specializing in New Media Art with a master's at D-House Academy. There I learned to use TouchDesigner and sensors to create videomapping and interactive installations. Throughout this journey I've worked on numerous projects that helped me grow professionally and develop a personal style built on balance between creativity, functionality, and attention to detail in visual communication.";
---
<section id="about" class="about">
  <h2 class="about__heading">{labels.me}</h2>
  <p class="about__body">{body}</p>
</section>
<script>
  import { initAboutReveal } from '../scripts/about-reveal';
  initAboutReveal('.about', '.about__body');
</script>
```

- [ ] **Step 7: Point the header's "About" nav link at the new section**

In `src/components/Header.astro`, change the first nav link's `href` from `` `${home}#hero` `` to `` `${home}#about` ``. The rest of the file is unchanged. Resulting nav block:

```astro
  <nav class="site-header__nav">
    <a href={`${home}#about`}>{labels.me}</a>
    <a href={`${home}#projects`}>{labels.project}</a>
    <a href={`${home}#contact`}>{labels.contact}</a>
  </nav>
```

- [ ] **Step 8: Render both sections on the Italian homepage**

In `src/pages/index.astro`, import `About` and render it right after `Hero`, passing `locale`. Resulting body:

```astro
<Layout locale={locale} title="Francesco Olmo Bortoloso">
  <Header locale={locale} currentPath="/" />
  <Hero />
  <About locale={locale} />
  <ProjectList locale={locale} projects={projects} />
  <Contact locale={locale} />
</Layout>
```

(add `import About from '../components/About.astro';` alongside the existing imports; `Hero` no longer takes a `locale` prop, per Step 1.)

- [ ] **Step 9: Render both sections on the English homepage**

Same change in `src/pages/en/index.astro` (adjust the relative import path to `'../../components/About.astro'` and keep `currentPath="/en/"` as it already is).

- [ ] **Step 10: Verify**

Run: `npm run build`
Expected: build succeeds, no TypeScript errors (in particular, confirm nothing else still imports `Hero` with a `locale` prop or calls `initHeroReveal` with a second argument — search the codebase for both before considering this step done).

Run: `grep -o 'id="about"' dist/index.html`
Expected: prints the match.

Run: `grep -o 'href="/#about"' dist/index.html` (or whatever the actual home-relative anchor resolves to — check `localizedPath`'s output for `'/'` first if this exact string doesn't match)
Expected: the About nav link points at `#about`, not `#hero`.

Manual verification (Francesco, in his own browser — do not rely on this project's automated browser tool for this step, per the Global Constraints note):
1. Load the homepage. The name should appear first (existing alternating-word animation), full viewport.
2. Scroll down. The About section should lock in place as soon as it reaches the top of the screen, starting with zero words visible.
3. Continue scrolling: words should fill in with a visible fade + slight rise, the justified line-stretch effect should be visible on the currently-filling line, and the section should stay pinned until the paragraph is fully revealed.
4. Only after the paragraph is fully visible should scrolling continue on to the Projects section.
5. Repeat on `/en/`.

- [ ] **Step 11: Commit**

```bash
git add -A
git commit -m "Split Hero into landing name section + pinned, scroll-scrubbed About section"
```
