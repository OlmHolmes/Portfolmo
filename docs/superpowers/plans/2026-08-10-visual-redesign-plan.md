# Visual Redesign Pass Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** revise the shipped functional template's Header (horizontal nav + day/night toggle), Hero (real bio copy), and project list (Sirnik-style fixed preview panel, replacing the Magla-style cursor-follow), per Francesco's direct feedback after reviewing the template. Project detail pages are untouched in this pass.

**Architecture:** each task modifies an existing, already-built component in place — no new pages, no new content-collection entries, no new npm dependencies. The day/night toggle is a plain DOM attribute flip persisted to `localStorage`, using the same CSS custom-property tokens every component already reads.

**Tech Stack:** unchanged from the base template — Astro (static output), TypeScript, GSAP (already installed and registered in `src/scripts/gsap-setup.ts`).

## Global Constraints

- Project root: `/Users/olmo/Desktop/portfolio-sito/.claude/worktrees/portfolio-template/` (git worktree, branch `worktree-portfolio-template`). Never touch `/Users/olmo/Desktop/portfolio-sito` directly — a different checkout of the same repo, off-limits.
- Never use "—" (em dash) anywhere in any UI string, label, or copy authored or transcribed.
- Do not add, upgrade, or modify any npm dependency. If a build step appears to want to touch `package.json`/`package-lock.json`, stop and treat it as a red flag rather than committing it — a prior task in the base plan accidentally committed unrequested dependency bumps and had to revert them.
- Project detail pages are out of scope: do not modify `src/pages/progetti/[slug].astro`, `src/pages/en/progetti/[slug].astro`, `src/components/ProjectMeta.astro`, or `src/components/ProjectGallery.astro`.
- The Hero's Italian bio text and its English translation (Task 2) must be transcribed exactly as given in this plan — they were already reviewed and approved by Francesco. Do not paraphrase or "improve" either version.
- Verification for presentational/animated components is `npm run build` plus structural `grep` checks on the built output — this project's established convention is not to write brittle unit tests for GSAP-driven or purely presentational components (see the base plan's own constraint on this).

---

## Task 1: Header — horizontal nav + day/night theme toggle

**Files:**
- Modify: `src/components/Header.astro`
- Delete: `src/scripts/menu-panel.ts`
- Create: `src/scripts/theme-toggle.ts`
- Modify: `src/styles/header.css`
- Modify: `src/styles/tokens.css`
- Modify: `src/styles/global.css`
- Modify: `src/lib/i18n.ts`

**Interfaces:**
- Consumes: `t`, `localizedPath`, `otherLocale`, `type Locale` from `src/lib/i18n.ts` (unchanged signatures).
- Produces: `initThemeToggle(buttonSelector: string): void` from `src/scripts/theme-toggle.ts`, consumed by `Header.astro`.
- Removes: `initMenuPanel` (no other file imports it — safe to delete `menu-panel.ts` outright).

- [ ] **Step 1: Relabel the "Me" nav label to "About"**

In `src/lib/i18n.ts`, change the `me` value in both locale entries. Full file after the change:

```ts
export type Locale = 'it' | 'en';

const labels = {
  it: { me: 'About', project: 'Project', contact: 'Contact', switchTo: 'EN' },
  en: { me: 'About', project: 'Project', contact: 'Contact', switchTo: 'IT' },
} as const;

export function t(locale: Locale) {
  return labels[locale];
}

export function localizedPath(locale: Locale, path: string): string {
  const withoutEnPrefix = path.replace(/^\/en\//, '/').replace(/^\/en$/, '/');
  return locale === 'en'
    ? `/en${withoutEnPrefix === '/' ? '/' : withoutEnPrefix}`
    : withoutEnPrefix;
}

export function otherLocale(locale: Locale): Locale {
  return locale === 'it' ? 'en' : 'it';
}
```

- [ ] **Step 2: Add the light theme token override**

In `src/styles/tokens.css`, add a `[data-theme="light"]` block after the existing `:root` block. Full file after the change:

```css
:root {
  --color-bg: #0d0b0a;
  --color-fg: #f5efe6;
  --color-accent: #ff4d1c;
  --font-mono: "JetBrains Mono", "SFMono-Regular", Consolas, monospace;
  --space-1: 0.5rem;
  --space-2: 1rem;
  --space-3: 2rem;
  --space-4: 4rem;
}

[data-theme="light"] {
  --color-bg: #f5efe6;
  --color-fg: #0d0b0a;
  --color-accent: #ff4d1c;
}
```

- [ ] **Step 3: Add a smooth color transition for the theme switch**

In `src/styles/global.css`, add a `transition` line to the `html, body` rule. Full file after the change:

```css
@import "./tokens.css";

*, *::before, *::after {
  box-sizing: border-box;
}

html, body {
  margin: 0;
  padding: 0;
  background: var(--color-bg);
  color: var(--color-fg);
  font-family: var(--font-mono);
  transition: background-color 0.3s ease, color 0.3s ease;
}

a {
  color: inherit;
}

img, video {
  max-width: 100%;
  display: block;
}
```

- [ ] **Step 4: Write the theme toggle script**

`src/scripts/theme-toggle.ts`:

```ts
const STORAGE_KEY = 'theme';

export function initThemeToggle(buttonSelector: string) {
  const button = document.querySelector<HTMLButtonElement>(buttonSelector);
  if (!button) return;

  function applyTheme(theme: 'dark' | 'light') {
    document.documentElement.setAttribute('data-theme', theme);
    button!.textContent = theme === 'dark' ? '☾' : '☀';
  }

  const stored = localStorage.getItem(STORAGE_KEY);
  const initial = stored === 'light' ? 'light' : 'dark';
  applyTheme(initial);

  button.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    localStorage.setItem(STORAGE_KEY, next);
    applyTheme(next);
  });
}
```

(`☾` is the moon symbol ☾, `☀` is the sun symbol ☀ — written as escapes so the file stays plain ASCII; both render correctly as button text.)

- [ ] **Step 5: Delete the old dropdown script**

```bash
git rm src/scripts/menu-panel.ts
```

- [ ] **Step 6: Rewrite the header styles — remove dropdown/menu-button rules, add nav + theme-button rules**

`src/styles/header.css` (full file):

```css
.site-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
}

.site-header__nav {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex-wrap: wrap;
}

.site-header__nav a {
  text-decoration: none;
}

.site-header__controls {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.site-header__lang {
  text-decoration: none;
  border: 1px solid var(--color-fg);
  padding: 0.1rem 0.5rem;
  font-size: 0.85rem;
}

.site-header__theme-button {
  background: none;
  border: 1px solid var(--color-fg);
  color: var(--color-fg);
  font-family: var(--font-mono);
  padding: 0.2rem 0.6rem;
  cursor: pointer;
  line-height: 1;
}
```

- [ ] **Step 7: Rewrite the Header component — inline nav links, theme button, no dropdown**

`src/components/Header.astro` (full file):

```astro
---
import { t, localizedPath, otherLocale, type Locale } from '../lib/i18n';
import '../styles/header.css';

interface Props {
  locale: Locale;
  currentPath: string;
}

const { locale, currentPath } = Astro.props;
const labels = t(locale);
const other = otherLocale(locale);
const home = localizedPath(locale, '/');
---
<header class="site-header">
  <a href={home} class="site-header__logo">Francesco Olmo Bortoloso</a>
  <nav class="site-header__nav">
    <a href={`${home}#hero`}>{labels.me}</a>
    <a href={`${home}#projects`}>{labels.project}</a>
    <a href={`${home}#contact`}>{labels.contact}</a>
  </nav>
  <div class="site-header__controls">
    <a href={localizedPath(other, currentPath)} class="site-header__lang">{labels.switchTo}</a>
    <button id="theme-toggle" class="site-header__theme-button" aria-label="Toggle day/night theme">&#9790;</button>
  </div>
</header>
<script>
  import { initThemeToggle } from '../scripts/theme-toggle';
  initThemeToggle('#theme-toggle');
</script>
```

(`&#9790;` is the HTML entity for ☾, used as the button's initial visible glyph before JS runs; `theme-toggle.ts`'s `applyTheme` overwrites it with the correct glyph for the stored/default theme on load.)

- [ ] **Step 8: Verify**

Run: `npm run build`
Expected: build succeeds, no TypeScript errors, no reference-not-found errors for the deleted `menu-panel.ts`.

Run: `grep -o 'site-header__nav' dist/index.html | head -1`
Expected: prints `site-header__nav` (the inline nav is present).

Run: `grep -c 'menu-panel' dist/index.html`
Expected: `0` (the dropdown is fully removed).

Run: `grep -o 'id="theme-toggle"' dist/index.html`
Expected: prints the match.

Run: `grep -o '>About<' dist/index.html`
Expected: prints the match (relabeled nav link).

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "Replace dropdown Header nav with horizontal nav, add day/night theme toggle"
```

---

## Task 2: Hero — real bio copy (IT + EN)

**Files:**
- Modify: `src/components/Hero.astro`
- Modify: `src/styles/hero.css`

**Interfaces:** none change — `Hero.astro` still accepts `{ locale: 'it' | 'en' }`, `initHeroReveal` is still called the same way from Task 18's `hero-reveal.ts` (untouched by this task).

- [ ] **Step 1: Widen the body text column for a full paragraph**

The current `.hero__body` was sized for a short placeholder (`max-width: 40ch`). Widen it and add line-height for a real paragraph. `src/styles/hero.css` (full file):

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
  font-size: clamp(2rem, 6vw, 4.5rem);
  line-height: 1.1;
  margin: 0;
}

.hero__body {
  max-width: 60ch;
  font-size: 1rem;
  line-height: 1.6;
  color: var(--color-fg);
}
```

- [ ] **Step 2: Replace the placeholder body text with the real bio**

`src/components/Hero.astro` (full file):

```astro
---
import '../styles/hero.css';

interface Props {
  locale: 'it' | 'en';
}

const { locale } = Astro.props;

const heading = locale === 'it' ? 'Francesco Olmo Bortoloso' : 'Francesco Olmo Bortoloso';
const body =
  locale === 'it'
    ? "Mi chiamo Francesco Bortoloso, vengo da Verbania, sul Lago Maggiore, e vivo a Milano. Ho sempre sentito il bisogno di esprimermi creativamente, cosa che mi ha portato a studiare Design della Comunicazione al Politecnico di Milano e, in seguito, a specializzarmi in New Media Art con un master alla D-House Academy, dove ho imparato a utilizzare TouchDesigner e sensori per realizzare videomapping e installazioni interattive. Nel mio percorso ho lavorato a numerosi progetti che mi hanno permesso di crescere professionalmente e sviluppare uno stile personale, fatto di creatività, funzionalità e attenzione al dettaglio."
    : "My name is Francesco Bortoloso, I'm from Verbania, on Lake Maggiore, and I live in Milan. I've always felt the need to express myself creatively, which led me to study Communication Design at Politecnico di Milano and, later, specialize in New Media Art with a master's at D-House Academy, where I learned to use TouchDesigner and sensors to create videomapping and interactive installations. Along the way I've worked on numerous projects that helped me grow professionally and develop a personal style built on creativity, functionality, and attention to detail.";
---
<section id="hero" class="hero">
  <h1 class="hero__heading">{heading}</h1>
  <p class="hero__body">{body}</p>
</section>
<script>
  import { initHeroReveal } from '../scripts/hero-reveal';
  initHeroReveal('.hero__heading');
</script>
```

- [ ] **Step 3: Verify**

Run: `npm run build`
Expected: build succeeds.

Run: `grep -o 'Design della Comunicazione' dist/index.html`
Expected: prints the match (Italian bio present on the IT homepage).

Run: `grep -o 'Communication Design' dist/en/index.html`
Expected: prints the match (English bio present on the EN homepage).

Run: `grep -c 'da scrivere' dist/index.html dist/en/index.html`
Expected: `dist/index.html:0` and `dist/en/index.html:0` (placeholder fully gone from both).

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "Replace Hero placeholder with real bio copy (IT + EN)"
```

---

## Task 3: Project list — Sirnik-style fixed preview panel

**Files:**
- Modify: `src/components/ProjectList.astro`
- Delete: `src/scripts/project-hover.ts`
- Create: `src/scripts/project-preview-panel.ts`
- Modify: `src/styles/project-list.css`

**Interfaces:**
- Consumes: `data-preview-src` / `data-preview-type` attributes on each `.project-row` (unchanged, still written by `ProjectRow.astro` from Task 19 — not modified by this task).
- Produces: `initProjectPreviewPanel(listSelector: string, panelSelector: string): void` from `src/scripts/project-preview-panel.ts`, replacing the removed `initProjectHoverPreview`.
- Removes: `initProjectHoverPreview` and its cursor-following `mousemove` handler entirely.

- [ ] **Step 1: Delete the cursor-following hover script**

```bash
git rm src/scripts/project-hover.ts
```

- [ ] **Step 2: Write the fixed preview panel script**

`src/scripts/project-preview-panel.ts`:

```ts
import { gsap } from './gsap-setup';

export function initProjectPreviewPanel(listSelector: string, panelSelector: string) {
  const list = document.querySelector<HTMLElement>(listSelector);
  const panel = document.querySelector<HTMLElement>(panelSelector);
  if (!list || !panel) return;

  gsap.set(panel, { autoAlpha: 0 });
  let isVisible = false;

  function showRow(row: HTMLElement) {
    const src = row.dataset.previewSrc ?? '';
    const type = row.dataset.previewType === 'video' ? 'video' : 'img';
    panel.innerHTML = '';
    const media = document.createElement(type);
    media.setAttribute('src', src);
    if (type === 'video') {
      media.setAttribute('muted', '');
      media.setAttribute('loop', '');
      media.setAttribute('autoplay', '');
      media.setAttribute('playsinline', '');
    }
    panel.appendChild(media);
    if (!isVisible) {
      isVisible = true;
      gsap.to(panel, { autoAlpha: 1, duration: 0.3, ease: 'power2.out' });
    }
  }

  list.querySelectorAll<HTMLElement>('[data-preview-src]').forEach((row) => {
    row.addEventListener('mouseenter', () => showRow(row));
  });

  list.addEventListener('mouseleave', () => {
    isVisible = false;
    gsap.to(panel, { autoAlpha: 0, duration: 0.2, ease: 'power2.out' });
  });
}
```

Note on behavior: the panel fades in once when the cursor enters the list and fades out once when it leaves the list entirely; moving between individual rows swaps the panel's image/video instantly without re-triggering the fade, so hovering quickly down the list doesn't flicker.

- [ ] **Step 3: Rewrite the project list styles — two-column layout, static panel instead of cursor-tracking preview**

`src/styles/project-list.css` (full file):

```css
.project-list-layout {
  display: flex;
  gap: var(--space-3);
  padding: var(--space-3);
}

.project-list {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.project-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--space-2);
  padding: var(--space-2) 0;
  border-top: 1px solid var(--color-fg);
  text-decoration: none;
  color: var(--color-fg);
}

.project-row:last-child {
  border-bottom: 1px solid var(--color-fg);
}

.project-row__titles {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.project-row__subtitle {
  font-size: 0.85rem;
  opacity: 0.8;
}

.project-row__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.2rem;
}

.project-preview-panel {
  display: none;
  position: sticky;
  top: var(--space-3);
  width: 320px;
  height: 220px;
  flex-shrink: 0;
}

.project-preview-panel img,
.project-preview-panel video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

@media (min-width: 768px) {
  .project-preview-panel {
    display: block;
  }
}
```

- [ ] **Step 4: Rewrite ProjectList to use the two-column layout and the new script**

`src/components/ProjectList.astro` (full file):

```astro
---
import type { CollectionEntry } from 'astro:content';
import ProjectRow from './ProjectRow.astro';
import { t, type Locale } from '../lib/i18n';
import '../styles/project-list.css';

interface Props {
  locale: Locale;
  projects: CollectionEntry<'projects'>[];
}

const { locale, projects } = Astro.props;
const labels = t(locale);
---
<section id="projects" class="project-list-section">
  <h2>{labels.project}</h2>
  <div class="project-list-layout">
    <div class="project-list">
      {projects.map((project) => <ProjectRow locale={locale} project={project} />)}
    </div>
    <div class="project-preview-panel" aria-hidden="true"></div>
  </div>
</section>
<script>
  import { initProjectPreviewPanel } from '../scripts/project-preview-panel';
  import { initRevealOnScroll } from '../scripts/reveal-on-scroll';
  initProjectPreviewPanel('.project-list', '.project-preview-panel');
  initRevealOnScroll('.project-row');
</script>
```

- [ ] **Step 5: Verify**

Run: `npm run build`
Expected: build succeeds.

Run: `grep -o 'class="project-preview-panel"' dist/index.html`
Expected: prints the match.

Run: `grep -c 'project-hover-preview' dist/index.html`
Expected: `0` (old cursor-following preview class fully removed).

Run: `grep -o 'class="project-row"' dist/index.html | wc -l`
Expected: `12` (still all 12 rows, unaffected by the layout change).

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "Replace cursor-following project hover with fixed Sirnik-style preview panel"
```
