# Visual Redesign Pass — Header, Hero, Project List, Theme Toggle

**Goal:** revise four areas of the shipped functional template (Astro + GSAP, 12 real projects, IT/EN routes) based on Francesco's direct feedback after reviewing it: replace the dropdown Header nav with a horizontal one, fill in the Hero's real bio copy, replace the Magla-style cursor-following project hover preview with a Sirnik-style fixed side panel, and add a day/night theme toggle. Project detail pages are explicitly out of scope for this pass — revisit later.

**Context:** builds on the completed template (plan: `docs/superpowers/plans/2026-08-09-portfolio-template-plan.md`, all 22 tasks done and reviewed). This is a design revision, not a bug fix, so it gets its own spec + plan rather than reopening the closed tasks.

**Reference:** sirnik.co (referenced by Francesco for the nav, hero animation direction, and project-list layout). The site's WebGL-heavy loader could not be made to finish loading in the available browser tooling (confirmed stuck at "100%" across repeated attempts, same failure mode noted in the original design spec) — visual details below are built from the page's underlying text/structure (readable despite the stuck loader) and from Francesco's own description, not from watching the live animation. Francesco has accepted this constraint and asked to proceed with best-effort recreation of the already-built Hero animation from Task 18 (see section 2).

---

## 1. Header — horizontal nav (replaces dropdown)

**Removed:** `src/scripts/menu-panel.ts` (the `initMenuPanel` open/close logic) and the hamburger `<button id="menu-toggle">` + `<nav id="menu-panel">` dropdown markup in `Header.astro`.

**Added:** the same three destinations (`#hero`, `#projects`, `#contact`) as plain inline links in the header itself, always visible, no open/close state. Labels: **About** (both locales, used verbatim in English per Francesco's own wording) for `#hero`, "Progetti"/"Projects" for `#projects`, "Contact" for `#contact` (already locale-invariant in `t()`).

**Layout:** logo/name far left, nav links next, IT/EN toggle and the new day/night toggle (section 4) on the far right, all one row. No mobile hamburger fallback — on narrow viewports the row wraps/shrinks via CSS (flex-wrap), no separate mobile menu component. This is an explicit YAGNI call: revisit only if it looks broken on real mobile testing.

**Interface impact:** `Header.astro`'s props (`{ locale, currentPath }`) are unchanged. `t(locale)` in `src/lib/i18n.ts` needs a `me` label; it already exists (`'Me'`/`'Me'`) — will be relabeled to `'About'` for both locales in this pass, so no schema/type change, just a value change in the existing `labels` object. `menu-panel.ts` file is deleted (nothing else imports it).

---

## 2. Hero — real bio copy, existing animation kept

`src/components/Hero.astro`'s placeholder body text is replaced with Francesco's real bio, verbatim in Italian, and an English translation (translated by Claude, shown to Francesco for confirmation before being committed to any file — per the established copy-review process for this project).

Italian (verbatim, as given):
> Mi chiamo Francesco Bortoloso, vengo da Verbania, sul Lago Maggiore, e vivo a Milano. Ho sempre sentito il bisogno di esprimermi creativamente, cosa che mi ha portato a studiare Design della Comunicazione al Politecnico di Milano e, in seguito, a specializzarmi in New Media Art con un master alla D-House Academy, dove ho imparato a utilizzare TouchDesigner e sensori per realizzare videomapping e installazioni interattive. Nel mio percorso ho lavorato a numerosi progetti che mi hanno permesso di crescere professionalmente e sviluppare uno stile personale, fatto di creatività, funzionalità e attenzione al dettaglio.

English (Claude's translation, pending Francesco's confirmation):
> My name is Francesco Bortoloso, I'm from Verbania, on Lake Maggiore, and I live in Milan. I've always felt the need to express myself creatively, which led me to study Communication Design at Politecnico di Milano and, later, specialize in New Media Art with a master's at D-House Academy, where I learned to use TouchDesigner and sensors to create videomapping and interactive installations. Along the way I've worked on numerous projects that helped me grow professionally and develop a personal style built on creativity, functionality, and attention to detail.

**Animation:** unchanged — `src/scripts/hero-reveal.ts`'s existing SplitText + ScrollTrigger word-reveal (alternating left/right slide-in, scroll-scrubbed) stays as-is, per Francesco's direction to keep the current interpretation given the live reference couldn't be viewed.

**Interface impact:** none — `Hero.astro`'s `{ locale }` prop and `initHeroReveal` export are unchanged, only the two string literals for `body` change.

---

## 3. Project list — Sirnik-style fixed preview panel (replaces Magla-style cursor-follow)

**Layout:** two-column section. Left column: the existing vertical list of project rows (title, subtitle, tag badges — unchanged from Task 19's `ProjectRow.astro`/`TagBadge.astro`). Right column: a preview panel fixed in place (not following the cursor) that shows the hovered row's cover image or video.

**Behavior:** on `mouseenter` of a row, the fixed panel's content crossfades to that row's `media.cover` (image or video, same as the current implementation already branches on `type`). On `mouseleave` of the whole list (not just a row, so moving between rows doesn't flicker to empty), the panel fades out or reverts to a neutral/empty state. No cursor-tracking transform — position is fixed via CSS, only the content and opacity animate.

**Removed:** `src/scripts/project-hover.ts`'s cursor-following `mousemove` handler and the `gsap.to(preview, { x, y })` tween. Replaced with a simpler hover-to-crossfade script (`initProjectPreviewPanel` or similar) that swaps the panel's `<img>`/`<video>` and fades opacity — no positional math needed since the panel doesn't move.

**Mobile:** the fixed panel is desktop-only (hidden below a breakpoint, e.g. `768px`, matching the project's existing breakpoint conventions) — same scoping the current hover-preview already had implicitly (the plan's Task 22 manual-check called it out as "Hovering a project row on desktop").

**Interface impact:** `ProjectList.astro`'s props (`{ locale, projects }`) are unchanged. `ProjectRow.astro`'s `data-preview-src`/`data-preview-type` attributes are reused as-is (the new script reads the same data attributes, just renders them differently). CSS in `project-list.css` gets a new two-column grid/flex layout and a `.project-preview-panel` (or similar) fixed-position block, replacing `.project-hover-preview`'s `position: fixed; ... /* follows cursor via JS */`.

---

## 4. Day/night theme toggle (new)

**Tokens:** `src/styles/tokens.css` keeps its current dark palette as the default (`:root`: `--color-bg: #0d0b0a`, `--color-fg: #f5efe6`, `--color-accent: #ff4d1c`), and gains a `[data-theme="light"]` override block that swaps background/foreground (`--color-bg: #f5efe6`, `--color-fg: #0d0b0a`) while keeping the same `--color-accent: #ff4d1c` (the orange-red reads clearly against both). Same token names throughout, so no component needs to change how it references color.

**Toggle:** a button in the header (section 1) that flips `document.documentElement`'s `data-theme` attribute between `"dark"` (default) and `"light"`, and persists the choice in `localStorage` so it survives reloads. Default on first visit (no stored preference): dark, matching the current shipped aesthetic — not the OS `prefers-color-scheme`, to keep the designed-for-dark look as the default first impression.

**Interface impact:** new file, e.g. `src/scripts/theme-toggle.ts`, exporting an `initThemeToggle(buttonSelector: string): void` used the same way `initMenuPanel`/`initHeroReveal` are used today (imported and called from an inline `<script>` in `Header.astro`). No new npm dependency — plain DOM + `localStorage`, no GSAP needed for a simple attribute flip (a CSS `transition` on `background-color`/`color` in `global.css` handles the visual smoothness).

---

## Out of scope for this pass

- **Project detail pages** (`src/pages/progetti/[slug].astro`, `en/progetti/[slug].astro`, `ProjectMeta.astro`, `ProjectGallery.astro`) — left exactly as built in Task 21. Francesco wants to revisit these last, after the homepage redesign is settled.
- Re-verifying the exact sirnik.co animation timing/easing pixel-for-pixel — not possible given the loader issue; can be refined later if Francesco records or screenshots the live site.

## Testing approach

Same as the original plan: `npm run build` / `astro check` for structural verification (content collections, TypeScript), manual browser verification for the animated/interactive behavior (hover crossfade, theme toggle, nav links, scroll reveal) since these are presentational/GSAP-driven, not unit-testable logic. No new unit-testable logic is introduced in this pass (the theme toggle is a DOM attribute flip + localStorage read, thin enough not to warrant a dedicated test per the original plan's existing "don't invent brittle unit tests for presentational components" constraint).
