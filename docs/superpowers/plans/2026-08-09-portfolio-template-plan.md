# Portfolio Template Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a working local template of Francesco Olmo Bortoloso's portfolio site in Astro: one scrolling homepage (Intro/Me → Project list → Contact) plus a detail page per project, all 12 real projects loaded from structured content, tag badges displayed (non-interactive), an IT/EN language toggle, and GSAP-driven animations (Sirnik-style hero reveal, Magla-style project-list hover).

**Architecture:** Astro static site, one content-collection entry per project (bilingual frontmatter), two parallel route trees (`/` for IT, `/en/` for EN) sharing components via a `locale` prop, GSAP + ScrollTrigger + SplitText for animation, all project media served as static files from `public/projects/<slug>/`.

**Tech Stack:** Astro (static output), TypeScript, GSAP (gsap, ScrollTrigger, SplitText — all free since the 2024 Webflow/GreenSock deal), Vitest + gray-matter for logic tests, marked for rendering the narrative copy (stored as a frontmatter string) to HTML.

## Global Constraints

- Project root: `/Users/olmo/Desktop/portfolio-sito/` (git repo already initialized). Source materials stay untouched at `/Users/olmo/Desktop/portfolio/`.
- Never alter the wording of any project's IT/EN narrative copy, title, subtitle, tags, client, participants, or credits — it is transcribed verbatim from `/Users/olmo/Desktop/portfolio/1 - copy portfolio.md`, already approved by Francesco.
- Never use "—" (em dash) anywhere. It does not appear in the source copy; do not introduce it in any UI string, label, or placeholder text you author.
- Tags render as bordered, non-interactive badges (no click handler, no filtering) — this reverses the tag-filter feature from the original site architecture, per explicit instruction.
- No fabricated content: the Hero "Me" section needs a personal presentation text that does not exist in any source file. Task 18 uses an unmistakable placeholder (`[Testo di presentazione: da scrivere]` / `[Presentation text: to be written]`), never invented prose that could pass as Francesco's real bio.
- **Testing approach for this stack:** classic TDD (write a failing unit test, then code) applies where there is real logic to test — the content schema and the i18n path helper (Task 3). Astro markup/components are validated with `astro check` and `npm run build` (content collections are schema-validated at build time), and GSAP animation behavior is verified manually in-browser per Task 22, per the design spec's own verification approach. Do not invent brittle unit tests for presentational Astro components.
- **Deviation from the design spec, decided during planning:** all media (images and video alike) are served from `public/projects/<slug>/` as plain root-relative URL strings, rendered with plain `<img>`/`<video>` tags — not split between `src/assets` (Astro-optimized images) and `public` (video) as the spec originally proposed. Two reasons found while mapping the real source files: (1) three projects (`forse-sto-bruciando`, `distopia-cronica`, `exploring-villa-restelli`) have only a video file, no still image, so the "cover" field must uniformly support either media type — Astro's `<Image />` optimization pipeline doesn't apply to video anyway, so keeping both in the same plain-file scheme is simpler than a mixed pipeline; (2) the content schema must stay a standalone Zod module importable by Vitest outside the Astro runtime (see Task 3), which rules out `astro:content`'s `image()` schema helper. Image optimization can be reintroduced in the later aesthetic pass.

---

## Task 1: Scaffold the Astro project

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`, `.gitignore`
- Create: `src/pages/index.astro` (temporary placeholder, replaced in Task 20)

**Interfaces:**
- Produces: a buildable Astro project (`npm run dev`, `npm run build`, `npm run preview` scripts) that later tasks add to.

- [ ] **Step 1: Scaffold with the Astro CLI**

Run inside `/Users/olmo/Desktop/portfolio-sito/`:

```bash
npm create astro@latest . -- --template minimal --typescript strict --no-install --no-git
```

(`--no-git` because the repo is already initialized; `--no-install` so we control the install step next.)

- [ ] **Step 2: Install dependencies**

```bash
npm install
npm install gsap marked
npm install -D vitest gray-matter zod @types/node
```

- [ ] **Step 3: Set static output explicitly in `astro.config.mjs`**

```js
import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'static',
});
```

- [ ] **Step 4: Add a `.gitignore`**

```
node_modules/
dist/
.astro/
```

- [ ] **Step 5: Verify the scaffold builds**

Run: `npm run build`
Expected: build succeeds, `dist/index.html` exists.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "Scaffold Astro project"
```

---

## Task 2: Design tokens, global styles, base Layout

**Files:**
- Create: `src/styles/tokens.css`
- Create: `src/styles/global.css`
- Create: `src/layouts/Layout.astro`
- Modify: `src/pages/index.astro` (use the new Layout so the build step can verify it)

**Interfaces:**
- Produces: `Layout.astro` accepting `{ locale: 'it' | 'en', title: string }` props, importing both stylesheets, rendering `<html lang={locale}>` and a `<slot />` for page content. All later pages/components rely on this.

- [ ] **Step 1: Write the design tokens**

`src/styles/tokens.css`:

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
```

- [ ] **Step 2: Write the global stylesheet**

`src/styles/global.css`:

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
}

a {
  color: inherit;
}

img, video {
  max-width: 100%;
  display: block;
}
```

- [ ] **Step 3: Write the base Layout**

`src/layouts/Layout.astro`:

```astro
---
import '../styles/global.css';

interface Props {
  locale: 'it' | 'en';
  title: string;
}

const { locale, title } = Astro.props;
---
<html lang={locale}>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{title}</title>
  </head>
  <body>
    <slot />
  </body>
</html>
```

- [ ] **Step 4: Use the Layout from the placeholder homepage**

`src/pages/index.astro`:

```astro
---
import Layout from '../layouts/Layout.astro';
---
<Layout locale="it" title="Francesco Olmo Bortoloso">
  <p>Placeholder</p>
</Layout>
```

- [ ] **Step 5: Verify**

Run: `npm run build && grep -o 'lang="it"' dist/index.html`
Expected: prints `lang="it"`.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "Add design tokens, global styles, base Layout"
```

---

## Task 3: Content schema and i18n helper (with tests)

**Files:**
- Create: `src/content/schema.ts`
- Create: `src/content/config.ts`
- Create: `src/lib/i18n.ts`
- Test: `tests/schema.test.ts`
- Test: `tests/i18n.test.ts`
- Create: `vitest.config.ts`

**Interfaces:**
- Produces: `projectSchema` (Zod schema, exported from `src/content/schema.ts`) consumed by every content file (Tasks 5-16) and by `src/content/config.ts`'s `projects` collection.
- Produces: `type Locale = 'it' | 'en'`, `t(locale)`, `localizedPath(locale, path)`, `otherLocale(locale)` from `src/lib/i18n.ts`, consumed by Header (Task 17) and every page (Tasks 20-21).

- [ ] **Step 1: Add a Vitest config**

`vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
  },
});
```

Add to `package.json` `scripts`: `"test": "vitest run"`.

- [ ] **Step 2: Write the failing schema test**

`tests/schema.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { projectSchema } from '../src/content/schema';

const validProject = {
  title: { it: 'Cyberstalking', en: 'Cyberstalking' },
  subtitle: { it: 'campagna sociale', en: 'a social campaign' },
  tags: { it: ['Branding'], en: ['Branding'] },
  participants: ['Marta Mitelli'],
  media: {
    cover: { type: 'image', src: '/projects/cyberstalking/cyberstalking-cover.jpeg' },
    gallery: [{ type: 'image', src: '/projects/cyberstalking/cyberstalking-01.jpeg' }],
  },
  copy: { it: 'Testo italiano.', en: 'English text.' },
};

describe('projectSchema', () => {
  it('accepts a fully valid project', () => {
    expect(() => projectSchema.parse(validProject)).not.toThrow();
  });

  it('accepts a project with localized credits and a client', () => {
    expect(() =>
      projectSchema.parse({
        ...validProject,
        client: 'Hines',
        credits: { it: ['Sound design: Riccardo Moschen'], en: ['Sound design: Riccardo Moschen'] },
      })
    ).not.toThrow();
  });

  it('rejects a project missing tags', () => {
    const { tags, ...withoutTags } = validProject;
    expect(() => projectSchema.parse(withoutTags)).toThrow();
  });

  it('rejects a gallery item with an invalid media type', () => {
    expect(() =>
      projectSchema.parse({
        ...validProject,
        media: { ...validProject.media, gallery: [{ type: 'audio', src: 'x.mp3' }] },
      })
    ).toThrow();
  });
});
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `npx vitest run tests/schema.test.ts`
Expected: FAIL — `src/content/schema.ts` does not exist yet.

- [ ] **Step 4: Implement the schema**

`src/content/schema.ts`:

```ts
import { z } from 'zod';

export const localizedTextSchema = z.object({
  it: z.string(),
  en: z.string(),
});

export const localizedListSchema = z.object({
  it: z.array(z.string()).min(1),
  en: z.array(z.string()).min(1),
});

export const mediaItemSchema = z.object({
  type: z.enum(['image', 'video']),
  src: z.string(),
});

export const projectSchema = z.object({
  title: localizedTextSchema,
  subtitle: localizedTextSchema,
  tags: localizedListSchema,
  client: z.string().optional(),
  participants: z.array(z.string()).optional(),
  credits: localizedListSchema.optional(),
  media: z.object({
    cover: mediaItemSchema,
    gallery: z.array(mediaItemSchema).min(1),
  }),
  copy: localizedTextSchema,
});

export type Project = z.infer<typeof projectSchema>;
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `npx vitest run tests/schema.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 6: Wire the schema into the content collection**

`src/content/config.ts`:

```ts
import { defineCollection } from 'astro:content';
import { projectSchema } from './schema';

const projects = defineCollection({
  type: 'content',
  schema: projectSchema,
});

export const collections = { projects };
```

- [ ] **Step 7: Write the failing i18n test**

`tests/i18n.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { localizedPath, otherLocale, t } from '../src/lib/i18n';

describe('localizedPath', () => {
  it('keeps italian paths unprefixed', () => {
    expect(localizedPath('it', '/progetti/hines/')).toBe('/progetti/hines/');
  });

  it('prefixes english paths with /en', () => {
    expect(localizedPath('en', '/progetti/hines/')).toBe('/en/progetti/hines/');
  });

  it('strips an existing /en prefix before re-adding it', () => {
    expect(localizedPath('en', '/en/progetti/hines/')).toBe('/en/progetti/hines/');
  });

  it('handles the homepage root', () => {
    expect(localizedPath('it', '/en/')).toBe('/');
    expect(localizedPath('en', '/')).toBe('/en/');
  });
});

describe('otherLocale', () => {
  it('flips it to en and back', () => {
    expect(otherLocale('it')).toBe('en');
    expect(otherLocale('en')).toBe('it');
  });
});

describe('t', () => {
  it('returns italian labels for it', () => {
    expect(t('it').project).toBe('Project');
  });

  it('returns the opposite-language switch label', () => {
    expect(t('it').switchTo).toBe('EN');
    expect(t('en').switchTo).toBe('IT');
  });
});
```

- [ ] **Step 8: Run the test to verify it fails**

Run: `npx vitest run tests/i18n.test.ts`
Expected: FAIL — `src/lib/i18n.ts` does not exist yet.

- [ ] **Step 9: Implement the i18n helper**

`src/lib/i18n.ts`:

```ts
export type Locale = 'it' | 'en';

const labels = {
  it: { me: 'Me', project: 'Project', contact: 'Contact', switchTo: 'EN' },
  en: { me: 'Me', project: 'Project', contact: 'Contact', switchTo: 'IT' },
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

- [ ] **Step 10: Run the test to verify it passes**

Run: `npx vitest run tests/i18n.test.ts`
Expected: PASS (7 tests).

- [ ] **Step 11: Run the full test suite and the build**

Run: `npx vitest run && npm run build`
Expected: all tests pass, build succeeds (empty `projects` collection is valid — no entries yet).

- [ ] **Step 12: Commit**

```bash
git add -A
git commit -m "Add project content schema and i18n path helper with tests"
```

---

## Task 4: Prepare project media files

**Files:**
- Create: `public/projects/<slug>/*` (62 files total across 12 project folders)
- Create: `scripts/copy-media.sh` (kept in the repo as a record of the mapping, not run again after this task)

**Interfaces:**
- Produces: every file path referenced by the `media.cover.src` / `media.gallery[].src` values used in Tasks 5-16.

**Before running:** two source folders have names that don't match their project title in the copy file — `output pecoranera` (mapped to Amor Sanguinis, client Pecoranera) and `Welcome To Distopia` (mapped to Distopia Cronica). Francesco said he'd verify and correct these names himself. Run this check first:

```bash
ls "/Users/olmo/Desktop/portfolio/output pecoranera" "/Users/olmo/Desktop/portfolio/Welcome To Distopia" 2>&1
```

If either path no longer exists, ask Francesco for the corrected folder name before continuing — do not guess.

- [ ] **Step 1: Write the copy script**

`scripts/copy-media.sh`:

```bash
#!/usr/bin/env bash
set -euo pipefail

SRC="/Users/olmo/Desktop/portfolio"
DEST="/Users/olmo/Desktop/portfolio-sito/public/projects"

mkdir -p "$DEST"/cyberstalking "$DEST"/agrabah "$DEST"/hines "$DEST"/lift-to-feel \
  "$DEST"/x-triennale "$DEST"/polly-peck "$DEST"/amor-sanguinis "$DEST"/data-footprint \
  "$DEST"/ultrasynesthesia "$DEST"/forse-sto-bruciando "$DEST"/distopia-cronica \
  "$DEST"/exploring-villa-restelli

# cyberstalking
cp "$SRC/Cyberstalking/1_cover.jpeg" "$DEST/cyberstalking/cyberstalking-cover.jpeg"
cp "$SRC/Cyberstalking/cyberstalking_01.jpeg" "$DEST/cyberstalking/cyberstalking-01.jpeg"
cp "$SRC/Cyberstalking/cyberstalking_02.jpeg .jpeg" "$DEST/cyberstalking/cyberstalking-02.jpeg"
cp "$SRC/Cyberstalking/cyberstalking_03.mp4" "$DEST/cyberstalking/cyberstalking-03.mp4"
cp "$SRC/Cyberstalking/cyberstalking_04_statico.jpeg" "$DEST/cyberstalking/cyberstalking-04-statico.jpeg"
cp "$SRC/Cyberstalking/cyberstalking_04_animato.mp4" "$DEST/cyberstalking/cyberstalking-04-animato.mp4"
cp "$SRC/Cyberstalking/cyberstalking_05.jpeg" "$DEST/cyberstalking/cyberstalking-05.jpeg"
cp "$SRC/Cyberstalking/cyberstalking_06.jpeg" "$DEST/cyberstalking/cyberstalking-06.jpeg"
cp "$SRC/Cyberstalking/cyberstalking_07.jpeg" "$DEST/cyberstalking/cyberstalking-07.jpeg"
cp "$SRC/Cyberstalking/cyberstalking_08.jpeg" "$DEST/cyberstalking/cyberstalking-08.jpeg"
cp "$SRC/Cyberstalking/cyberstalking_09.jpeg" "$DEST/cyberstalking/cyberstalking-09.jpeg"
cp "$SRC/Cyberstalking/cyberstalking_10.mp4" "$DEST/cyberstalking/cyberstalking-10.mp4"
cp "$SRC/Cyberstalking/cyberstalking_12.jpeg" "$DEST/cyberstalking/cyberstalking-12.jpeg"
cp "$SRC/Cyberstalking/cyberstalking_13.jpeg" "$DEST/cyberstalking/cyberstalking-13.jpeg"

# agrabah
cp "$SRC/Agrabah/1_cover.jpeg" "$DEST/agrabah/agrabah-cover.jpeg"
cp "$SRC/Agrabah/agrabah_02.jpeg" "$DEST/agrabah/agrabah-02.jpeg"
cp "$SRC/Agrabah/agrabah_03.jpeg" "$DEST/agrabah/agrabah-03.jpeg"
cp "$SRC/Agrabah/agrabah_04.jpeg" "$DEST/agrabah/agrabah-04.jpeg"
cp "$SRC/Agrabah/agrabah_05.jpeg" "$DEST/agrabah/agrabah-05.jpeg"
cp "$SRC/Agrabah/agrabah_06.jpeg" "$DEST/agrabah/agrabah-06.jpeg"
cp "$SRC/Agrabah/agrabah_07.jpeg" "$DEST/agrabah/agrabah-07.jpeg"
cp "$SRC/Agrabah/agrabah_08.jpeg" "$DEST/agrabah/agrabah-08.jpeg"
cp "$SRC/Agrabah/agrabah_09.jpeg" "$DEST/agrabah/agrabah-09.jpeg"
cp "$SRC/Agrabah/agrabah_10.jpeg" "$DEST/agrabah/agrabah-10.jpeg"
cp "$SRC/Agrabah/Motion_Agrabah.mp4" "$DEST/agrabah/agrabah-motion.mp4"

# hines
cp "$SRC/Hines/1_cover.png" "$DEST/hines/hines-cover.png"
cp "$SRC/Hines/hines_01.jpeg" "$DEST/hines/hines-01.jpeg"
cp "$SRC/Hines/hines_02.jpeg" "$DEST/hines/hines-02.jpeg"
cp "$SRC/Hines/hines_03.jpeg" "$DEST/hines/hines-03.jpeg"
cp "$SRC/Hines/hines_04.jpeg" "$DEST/hines/hines-04.jpeg"
cp "$SRC/Hines/hines_06.jpeg" "$DEST/hines/hines-06.jpeg"
cp "$SRC/Hines/hines_07.jpeg" "$DEST/hines/hines-07.jpeg"
cp "$SRC/Hines/hines_08.jpeg" "$DEST/hines/hines-08.jpeg"

# lift-to-feel (source folder has a trailing space: "Lift to Feel ")
cp "$SRC/Lift to Feel /1_cover.jpeg" "$DEST/lift-to-feel/lift-to-feel-cover.jpeg"
cp "$SRC/Lift to Feel /lifttofeel_02.jpeg" "$DEST/lift-to-feel/lift-to-feel-02.jpeg"
cp "$SRC/Lift to Feel /lifttofeel_03.jpeg" "$DEST/lift-to-feel/lift-to-feel-03.jpeg"
cp "$SRC/Lift to Feel /lifttofeel_04.jpeg" "$DEST/lift-to-feel/lift-to-feel-04.jpeg"
cp "$SRC/Lift to Feel /lifttofeel_05.jpeg" "$DEST/lift-to-feel/lift-to-feel-05.jpeg"
cp "$SRC/Lift to Feel /lifttofeel_06.jpeg" "$DEST/lift-to-feel/lift-to-feel-06.jpeg"
cp "$SRC/Lift to Feel /lifttofeel_07.jpeg" "$DEST/lift-to-feel/lift-to-feel-07.jpeg"
cp "$SRC/Lift to Feel /lifttofeel_08.jpeg" "$DEST/lift-to-feel/lift-to-feel-08.jpeg"
cp "$SRC/Lift to Feel /lifttofeel_09.jpeg" "$DEST/lift-to-feel/lift-to-feel-09.jpeg"

# x-triennale
cp "$SRC/X Triennale/1_cover.jpeg" "$DEST/x-triennale/x-triennale-cover.jpeg"
cp "$SRC/X Triennale/xtriennale_02.jpeg" "$DEST/x-triennale/x-triennale-02.jpeg"
cp "$SRC/X Triennale/xtriennale_03.jpeg" "$DEST/x-triennale/x-triennale-03.jpeg"
cp "$SRC/X Triennale/xtriennale_04.jpeg" "$DEST/x-triennale/x-triennale-04.jpeg"
cp "$SRC/X Triennale/xtriennale_05.jpeg" "$DEST/x-triennale/x-triennale-05.jpeg"

# polly-peck
cp "$SRC/Polly Peck/1_cover.jpeg" "$DEST/polly-peck/polly-peck-cover.jpeg"
cp "$SRC/Polly Peck/pollypeck_02.jpeg" "$DEST/polly-peck/polly-peck-02.jpeg"
cp "$SRC/Polly Peck/pollypeck_03.jpeg" "$DEST/polly-peck/polly-peck-03.jpeg"
cp "$SRC/Polly Peck/pollypeck_04.jpeg" "$DEST/polly-peck/polly-peck-04.jpeg"
cp "$SRC/Polly Peck/pollypeck_05.jpeg" "$DEST/polly-peck/polly-peck-05.jpeg"

# amor-sanguinis (source folder name pending Francesco's confirmation, see note above)
cp "$SRC/output pecoranera/Foto.png" "$DEST/amor-sanguinis/amor-sanguinis-cover.png"
cp "$SRC/output pecoranera/video_hq.mp4" "$DEST/amor-sanguinis/amor-sanguinis-01.mp4"

# data-footprint
cp "$SRC/Data Footprint/Screenshot 2026-07-29 alle 19.21.39.png" "$DEST/data-footprint/data-footprint-cover.png"
cp "$SRC/Data Footprint/Portfolio.mp4" "$DEST/data-footprint/data-footprint-01.mp4"

# ultrasynesthesia
cp "$SRC/Ultrasynesthesia/IMG_20260602_142415398.jpg" "$DEST/ultrasynesthesia/ultrasynesthesia-cover.jpg"
cp "$SRC/Ultrasynesthesia/ultratechno.mp4" "$DEST/ultrasynesthesia/ultrasynesthesia-01.mp4"
if command -v ffmpeg >/dev/null 2>&1; then
  ffmpeg -y -i "$SRC/Ultrasynesthesia/IMG_2026.MOV" -c:v libx264 -c:a aac "$DEST/ultrasynesthesia/ultrasynesthesia-02.mp4"
else
  cp "$SRC/Ultrasynesthesia/IMG_2026.MOV" "$DEST/ultrasynesthesia/ultrasynesthesia-02.mov"
fi

# forse-sto-bruciando (source folder has two trailing spaces: "Forse Sto Bruciando  ")
if command -v ffmpeg >/dev/null 2>&1; then
  ffmpeg -y -i "$SRC/Forse Sto Bruciando  /IMG_9214.MOV" -c:v libx264 -c:a aac "$DEST/forse-sto-bruciando/forse-sto-bruciando-01.mp4"
else
  cp "$SRC/Forse Sto Bruciando  /IMG_9214.MOV" "$DEST/forse-sto-bruciando/forse-sto-bruciando-01.mov"
fi

# distopia-cronica (source folder name pending Francesco's confirmation, see note above)
cp "$SRC/Welcome To Distopia/Comp 1.mp4" "$DEST/distopia-cronica/distopia-cronica-01.mp4"

# exploring-villa-restelli
cp "$SRC/Exploring Villa Restelli/VillaRestelli1.0.mp4" "$DEST/exploring-villa-restelli/exploring-villa-restelli-01.mp4"

echo "Media copy complete."
```

- [ ] **Step 2: Run it**

```bash
chmod +x scripts/copy-media.sh
./scripts/copy-media.sh
```

- [ ] **Step 3: Verify the file count**

Run: `find public/projects -type f | wc -l`
Expected: `62`

If any single `cp` line fails because a source file is missing, stop and re-check that project's folder listing before continuing — do not silently skip it.

- [ ] **Step 4: If any `.mov`/`.MOV` file ended up copied as-is (no ffmpeg available), note it**

Run: `find public/projects -iname '*.mov'`
Expected: ideally empty (ffmpeg converted them). If not empty, flag to Francesco that those two clips may not play in all browsers (Safari plays `.mov`/HEVC directly, Chrome/Firefox often don't) and that installing ffmpeg and re-running Step 2 would fix it — do not silently ship a broken video.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "Add project media files"
```

---

## Task 5: Content — Cyberstalking

**Files:**
- Create: `src/content/projects/cyberstalking.md`

**Interfaces:**
- Consumes: `projectSchema` from Task 3, media files from Task 4.

- [ ] **Step 1: Write the content file**

`src/content/projects/cyberstalking.md`:

```markdown
---
title:
  it: Cyberstalking
  en: Cyberstalking
subtitle:
  it: campagna sociale contro il cyberstalking
  en: a social campaign against cyberstalking
tags:
  it:
    - Branding
    - Editorial
    - Motion
    - Ricerca sul campo
    - Motion Design
  en:
    - Branding
    - Editorial
    - Motion
    - Field Research
    - Motion Design
participants:
  - Marta Mitelli
  - Cristiano Romanò
  - Bernardo Reale
  - Beatrice Ciavarella
media:
  cover: { type: image, src: "/projects/cyberstalking/cyberstalking-cover.jpeg" }
  gallery:
    - { type: image, src: "/projects/cyberstalking/cyberstalking-01.jpeg" }
    - { type: image, src: "/projects/cyberstalking/cyberstalking-02.jpeg" }
    - { type: video, src: "/projects/cyberstalking/cyberstalking-03.mp4" }
    - { type: image, src: "/projects/cyberstalking/cyberstalking-04-statico.jpeg" }
    - { type: video, src: "/projects/cyberstalking/cyberstalking-04-animato.mp4" }
    - { type: image, src: "/projects/cyberstalking/cyberstalking-05.jpeg" }
    - { type: image, src: "/projects/cyberstalking/cyberstalking-06.jpeg" }
    - { type: image, src: "/projects/cyberstalking/cyberstalking-07.jpeg" }
    - { type: image, src: "/projects/cyberstalking/cyberstalking-08.jpeg" }
    - { type: image, src: "/projects/cyberstalking/cyberstalking-09.jpeg" }
    - { type: video, src: "/projects/cyberstalking/cyberstalking-10.mp4" }
    - { type: image, src: "/projects/cyberstalking/cyberstalking-12.jpeg" }
    - { type: image, src: "/projects/cyberstalking/cyberstalking-13.jpeg" }
copy:
  it: |
    Il cyberstalking raramente ha l'aspetto di un'emergenza. È un messaggio che non hai chiesto, un like su una foto di tre anni fa, una richiesta di amicizia da qualcuno che non conosci. È l'accumulo a logorare le persone, ed è proprio questo che rende difficile progettarci contro: come costruisci urgenza attorno a qualcosa che, preso singolarmente, sembra così normale?

    Il progetto è partito dal campo, non dal tavolo da lavoro. Abbiamo passato le prime settimane a fermare persone per Milano, chiedendo cosa sapessero (e cosa provassero) riguardo allo stalking online, affiancando queste conversazioni a interviste con psicologi ed esperti legali che lavorano direttamente con le vittime. Il quadro emerso ci ha indicato un pubblico preciso: 15-25 anni, il gruppo più esposto a questo tipo di violenza e, spesso, meno attrezzato per riconoscerla.

    Raggiungere questo pubblico ha richiesto due registri diversi: uno informale e provocatorio, pensato per interrompere lo scroll, l'altro più istituzionale, per restituire informazioni chiare una volta ottenuta l'attenzione. Nessuno dei due funzionava da solo: la provocazione senza contenuto avrebbe banalizzato il tema, l'informazione senza provocazione non sarebbe mai stata vista.

    Dalla ricerca sono nati un Visual Dossier e un motion graphic (quest'ultimo realizzato da me), pensato per portare le persone dentro al dossier. Da lì la campagna si è spostata sull'identificazione: tre poster illustrati, ciascuno costruito attorno a un comportamento specifico, sentirsi osservati, ricevere messaggi senza sosta, ricevere chiamate ad orari impossibili, poi resi dinamici per enfatizzare la reazione della vittima. Il tutto si è esteso su sito, social e un evento gratuito con esperti del settore, durante il quale abbiamo organizzato anche un workshop di serigrafia: i partecipanti potevano stampare le nostre grafiche di persona, portandosi a casa un pezzo tangibile della campagna. All'uscita, un kit "anti cyberstronzi": opuscolo, copricamera, adesivi e maglietta.
  en: |
    Cyberstalking rarely looks like an emergency. It's a message you didn't ask for, a like on a three-year-old photo, a follower request from someone you don't recognize. It's the accumulation that wears people down, and that's what made it hard to design against: how do you build urgency around something that, taken on its own, looks so ordinary?

    The project started in the field, not at a desk. We spent the first weeks stopping people around Milan, asking what they actually knew (and felt) about online stalking, then paired those conversations with interviews with psychologists and legal experts who work directly with victims. The picture that emerged pointed us toward a specific audience: 15 to 25 year-olds, the group most exposed to this kind of violence and, often, least equipped to recognize it.

    Reaching that audience meant working in two registers: one informal and provocative, built to interrupt a scroll, the other more institutional, there to deliver clear information once we had someone's attention. Neither worked alone: provocation without substance would have trivialized the subject, information without provocation would never have been seen.

    From the research came a Visual Dossier and a motion graphic (I directed the motion), built to pull people into the dossier. From there the campaign moved to identification: three illustrated posters, each built around a specific behavior, being watched, being messaged without pause, being called at hours no one should call, later animated to push further into the victim's reaction. It all extended into a website, social channels, and a free public event with experts, built around a screen-printing workshop where visitors could print our graphics themselves and take a physical piece of the campaign home. Everyone left with an "anti-cyberstronzi" kit: booklet, webcam cover, stickers, t-shirt.
---
```

- [ ] **Step 2: Verify against the schema**

Run: `npx astro check`
Expected: no errors reported for `cyberstalking.md`.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "Add Cyberstalking project content"
```

---

## Task 6: Content — Agrabah

**Files:**
- Create: `src/content/projects/agrabah.md`

- [ ] **Step 1: Write the content file**

`src/content/projects/agrabah.md`:

```markdown
---
title:
  it: Agrabah
  en: Agrabah
subtitle:
  it: identità visiva per una città
  en: visual identity for a city
tags:
  it:
    - Branding
    - Logo
    - Motion Graphic
  en:
    - Branding
    - Logo
    - Motion Graphic
participants:
  - Sara Cattivelli
  - Francesca Modini
  - Matteo Zilio
media:
  cover: { type: image, src: "/projects/agrabah/agrabah-cover.jpeg" }
  gallery:
    - { type: image, src: "/projects/agrabah/agrabah-02.jpeg" }
    - { type: image, src: "/projects/agrabah/agrabah-03.jpeg" }
    - { type: image, src: "/projects/agrabah/agrabah-04.jpeg" }
    - { type: image, src: "/projects/agrabah/agrabah-05.jpeg" }
    - { type: image, src: "/projects/agrabah/agrabah-06.jpeg" }
    - { type: image, src: "/projects/agrabah/agrabah-07.jpeg" }
    - { type: image, src: "/projects/agrabah/agrabah-08.jpeg" }
    - { type: image, src: "/projects/agrabah/agrabah-09.jpeg" }
    - { type: image, src: "/projects/agrabah/agrabah-10.jpeg" }
    - { type: video, src: "/projects/agrabah/agrabah-motion.mp4" }
copy:
  it: |
    Per questo workshop ci è stato chiesto di costruire l'identità visiva di Agrabah, la città di Aladdin. Abbiamo guardato al branding di città mediorientali reali per trovare ispirazione, distillando elementi della tradizione araba in un set di pittogrammi, poi ripiegati nella lettera A e ripetuti in forme diverse lungo tutto il logotipo.

    Da lì abbiamo costruito un'identità coerente, combinando gli elementi del marchio con altri riferimenti all'immaginario arabo e indiano, applicata a segnaletica, merchandising e comunicazione digitale.
  en: |
    For this workshop we were asked to build the visual identity of Agrabah, the city from Aladdin. We looked at the branding of real Middle Eastern cities for inspiration, distilling elements of Arab tradition into a set of pictograms, later folded into the letter A, repeated in different forms throughout the logotype.

    From there we built a coherent identity, combining elements from the mark with other references to the Arab and Indian imaginary, applied across signage, merchandise, and digital communication.
---
```

- [ ] **Step 2: Verify against the schema**

Run: `npx astro check`
Expected: no errors reported for `agrabah.md`.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "Add Agrabah project content"
```

---

## Task 7: Content — Hines

**Files:**
- Create: `src/content/projects/hines.md`

- [ ] **Step 1: Write the content file**

`src/content/projects/hines.md`:

```markdown
---
title:
  it: Hines
  en: Hines
subtitle:
  it: identità visiva per un quartiere
  en: visual identity for a neighborhood
tags:
  it:
    - Branding
    - Logo
  en:
    - Branding
    - Logo
client: Hines
participants:
  - Cecilia Rosmini
  - Simone Amico
  - Luca Molinari
media:
  cover: { type: image, src: "/projects/hines/hines-cover.png" }
  gallery:
    - { type: image, src: "/projects/hines/hines-01.jpeg" }
    - { type: image, src: "/projects/hines/hines-02.jpeg" }
    - { type: image, src: "/projects/hines/hines-03.jpeg" }
    - { type: image, src: "/projects/hines/hines-04.jpeg" }
    - { type: image, src: "/projects/hines/hines-06.jpeg" }
    - { type: image, src: "/projects/hines/hines-07.jpeg" }
    - { type: image, src: "/projects/hines/hines-08.jpeg" }
copy:
  it: |
    Per questo workshop io e il mio gruppo abbiamo costruito l'identità visiva di un quartiere che sorgerà a Milano nei prossimi anni, in zona 7. Il nome scelto è "Aequus", che in latino richiama l'idea di equità, affiancato dalla scritta in dialetto milanese "l'è 'l trott" (il trotto), un modo per tenere insieme il futuro del quartiere e la storia del luogo.

    Per il logotipo abbiamo scelto Love, un carattere display maiuscolo dai contrasti molto marcati, capace di creare ritmi diversi mantenendo l'equilibrio tra le parole.
  en: |
    For this workshop, my group and I built the visual identity of a neighborhood set to rise in Milan in the coming years, in zone 7. We named it "Aequus," a Latin word that evokes the idea of fairness, paired with "l'è 'l trott" (the trot), a line in Milanese dialect meant to keep the neighborhood's future tied to the history of the place.

    For the logotype we chose Love, an all-caps display typeface with strong contrasts, able to build different rhythms while keeping the words in balance.
---
```

- [ ] **Step 2: Verify against the schema**

Run: `npx astro check`
Expected: no errors reported for `hines.md`.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "Add Hines project content"
```

---

## Task 8: Content — Lift to Feel

**Files:**
- Create: `src/content/projects/lift-to-feel.md`

- [ ] **Step 1: Write the content file**

`src/content/projects/lift-to-feel.md`:

```markdown
---
title:
  it: Lift to Feel
  en: Lift to Feel
subtitle:
  it: caratteri poco importanti
  en: unimportant characters
tags:
  it:
    - Editorial
  en:
    - Editorial
participants:
  - Bernardo Reale
  - Cristiano Romanò
  - Caterina Marinelli
  - Andrea Moraschinelli
media:
  cover: { type: image, src: "/projects/lift-to-feel/lift-to-feel-cover.jpeg" }
  gallery:
    - { type: image, src: "/projects/lift-to-feel/lift-to-feel-02.jpeg" }
    - { type: image, src: "/projects/lift-to-feel/lift-to-feel-03.jpeg" }
    - { type: image, src: "/projects/lift-to-feel/lift-to-feel-04.jpeg" }
    - { type: image, src: "/projects/lift-to-feel/lift-to-feel-05.jpeg" }
    - { type: image, src: "/projects/lift-to-feel/lift-to-feel-06.jpeg" }
    - { type: image, src: "/projects/lift-to-feel/lift-to-feel-07.jpeg" }
    - { type: image, src: "/projects/lift-to-feel/lift-to-feel-08.jpeg" }
    - { type: image, src: "/projects/lift-to-feel/lift-to-feel-09.jpeg" }
copy:
  it: |
    Il progetto nasce da una domanda sulla tipografia negletta: quella tecnica, in secondo piano, che nessuno nota perché la sua forma nasce solo dalla sua funzione. Quella che sta lì, senza pretese, ai margini.

    Con il mio gruppo abbiamo deciso di darle dignità, dimostrando che la bellezza nel design può nascondersi ovunque: nell'incisione di una moneta da 5 centesimi, nel rilievo di un tappo di bottiglia, in ogni dettaglio tipografico che la quotidianità ci mostra senza che lo notiamo davvero.

    Per raccontarlo abbiamo costruito una metafora: una città immaginaria fatta di palazzi maestosi e vie intricate, specchio della frenesia della vita moderna. Alcuni degli elementi architettonici di questa città non sono illustrazioni ma fotografie di oggetti quotidiani, ridotte a bianco e nero puro con un effetto threshold che fa emergere la loro tipografia nascosta: un motel che nasce da delle cannucce da caffè, una ferrovia composta dai cuscinetti di uno skateboard. Anche il testo segue questa logica di città: giustificato su entrambi i margini, con una spaziatura che disegna ogni riga come un isolato, un edificio, un blocco urbano.

    Il libro diventa la mappa di quella città e ci guida a scoprire i dettagli preziosi che la fretta ci fa perdere: aperto e disteso pagina dopo pagina, da un lato restituisce i testi in sequenza, dall'altro ricompone la mappa continua della città. "Lift to Feel" invita chi lo sfoglia ad alzare la copertina ed entrare in questa avventura personale, per riscoprire il valore delle piccole cose.
  en: |
    The project started with a question about neglected typography: the technical kind, pushed to the background, the kind nobody notices because its form comes only from its function. The kind that just sits there, unassuming, off to the side.

    With my group, we decided to give it some dignity, to prove that beauty in design can hide anywhere: in the engraving on a 5 cent coin, in the ridge of a bottle cap, in every typographic detail everyday life shows us without us ever really looking.

    To tell that story, we built a metaphor: an imaginary city of towering buildings and tangled streets, a mirror of the frenzy of modern life. Some of the city's architectural elements aren't illustrations but photographs of everyday objects, reduced to pure black and white with a threshold effect that brings out their hidden typography, a motel built from coffee stirrers, a railway made of skateboard bearings. The text follows the same logic: justified on both margins, spaced so every line reads like a city block, a building, a stretch of urban grid.

    The book becomes the map of that city, guiding us to the small, precious details that a rushed life makes us miss. Opened and laid flat page by page, one side runs the text in sequence, the other reassembles into a continuous map of the city. "Lift to Feel" invites whoever picks it up to lift the cover and step into this personal journey, rediscovering the value of small things.
---
```

- [ ] **Step 2: Verify against the schema**

Run: `npx astro check`
Expected: no errors reported for `lift-to-feel.md`.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "Add Lift to Feel project content"
```

---

## Task 9: Content — X Triennale

**Files:**
- Create: `src/content/projects/x-triennale.md`

- [ ] **Step 1: Write the content file**

`src/content/projects/x-triennale.md`:

```markdown
---
title:
  it: X Triennale
  en: X Triennale
subtitle:
  it: il labirinto dei ragazzi
  en: the children's labyrinth
tags:
  it:
    - Editorial
    - Ricerca d'Archivio
  en:
    - Editorial
    - Archival Research
participants:
  - Matteo Zilio
  - Beatrice Borghi
  - Mariapia Carpanelli
  - Yeni Sartori
media:
  cover: { type: image, src: "/projects/x-triennale/x-triennale-cover.jpeg" }
  gallery:
    - { type: image, src: "/projects/x-triennale/x-triennale-02.jpeg" }
    - { type: image, src: "/projects/x-triennale/x-triennale-03.jpeg" }
    - { type: image, src: "/projects/x-triennale/x-triennale-04.jpeg" }
    - { type: image, src: "/projects/x-triennale/x-triennale-05.jpeg" }
copy:
  it: |
    Il progetto nasce come un quaderno di ricerca dedicato a un'installazione della decima Triennale di Milano, nel 1954: il "Labirinto dei ragazzi", curato dallo studio BBPR. Uno spazio ludico pensato per avvicinare i più piccoli alle arti, costruito con un linguaggio architettonico in continuità con il contesto urbano circostante.

    L'opera venne poi ricordata come uno dei primi "musei per bambini", merito anche dei graffiti di Saul Steinberg che, lungo le pareti interne delle sei spirali del labirinto, raccontavano "cosa sono le arti plastiche: pittura, scultura, architettura" con un disegno naturale e continuo.
  en: |
    The project started as a research notebook on an installation from the tenth Milan Triennale, in 1954: the "Labirinto dei ragazzi" (children's labyrinth), curated by studio BBPR. A playful space designed to bring children closer to the arts, built with an architectural language in continuity with the surrounding urban context.

    The work was later remembered as one of the first "museums for children," largely thanks to Saul Steinberg's graffiti, which ran along the inner walls of the labyrinth's six spirals, telling the story of "what the plastic arts are: painting, sculpture, architecture" through a continuous, natural line.
---
```

- [ ] **Step 2: Verify against the schema**

Run: `npx astro check`
Expected: no errors reported for `x-triennale.md`.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "Add X Triennale project content"
```

---

## Task 10: Content — Polly Peck

**Files:**
- Create: `src/content/projects/polly-peck.md`

- [ ] **Step 1: Write the content file**

`src/content/projects/polly-peck.md`:

```markdown
---
title:
  it: Polly Peck
  en: Polly Peck
subtitle:
  it: brandbook di un marchio fallito
  en: brandbook of a failed brand
tags:
  it:
    - Editorial
    - Brand Storytelling
  en:
    - Editorial
    - Brand Storytelling
participants:
  - Cecilia Marzocchi
  - Andrea Moraschinelli
  - Bernardo Reale
  - Cheyenne Grasso
  - Caterina Marinelli
media:
  cover: { type: image, src: "/projects/polly-peck/polly-peck-cover.jpeg" }
  gallery:
    - { type: image, src: "/projects/polly-peck/polly-peck-02.jpeg" }
    - { type: image, src: "/projects/polly-peck/polly-peck-03.jpeg" }
    - { type: image, src: "/projects/polly-peck/polly-peck-04.jpeg" }
    - { type: image, src: "/projects/polly-peck/polly-peck-05.jpeg" }
copy:
  it: |
    Per questo laboratorio di metaprogetto ci è stato chiesto di ricercare e raccontare la storia di un brand fallito. Il nostro gruppo ha scelto Polly Peck: ne abbiamo ricostruito il declino, la filosofia alla base del progetto imprenditoriale e i metodi di vendita, per poi individuarne caratteristiche e valori, associandoli a elementi reali come città, fotografie iconiche e immagini evocative.

    Tutto il materiale è confluito in un book in formato magazine, che nell'ultima sezione definisce tono di voce, profilo del prosumer, mondi di riferimento ed estetica del brand, accompagnati da immagini esplicative.
  en: |
    For this metaproject workshop, we were asked to research and tell the story of a failed brand. Our group chose Polly Peck: we traced its decline, the philosophy behind the business, and the sales methods it used, then studied its traits and values, tying them to real-world references like cities, iconic photographs, and other evocative imagery.

    All the material came together in a magazine-format book, closing with a section that defines the brand's tone of voice, prosumer profile, reference worlds, and aesthetic, supported throughout by explanatory images.
---
```

- [ ] **Step 2: Verify against the schema**

Run: `npx astro check`
Expected: no errors reported for `polly-peck.md`.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "Add Polly Peck project content"
```

---

## Task 11: Content — Amor Sanguinis

**Files:**
- Create: `src/content/projects/amor-sanguinis.md`

**Before writing:** confirm with Francesco (or your Task 4 check) that `output pecoranera` is indeed the Amor Sanguinis media folder. If he gave a different folder name, use that instead when checking media paths below.

- [ ] **Step 1: Write the content file**

`src/content/projects/amor-sanguinis.md`:

```markdown
---
title:
  it: Amor Sanguinis
  en: Amor Sanguinis
subtitle:
  it: una stanza immersiva
  en: an immersive room
tags:
  it:
    - Installazioni
    - Motion Graphics
    - Videomapping
    - Light Design
  en:
    - Installations
    - Motion Graphics
    - Videomapping
    - Light Design
client: Pecoranera
credits:
  it:
    - "Sound design: Riccardo Moschen"
  en:
    - "Sound design: Riccardo Moschen"
media:
  cover: { type: image, src: "/projects/amor-sanguinis/amor-sanguinis-cover.png" }
  gallery:
    - { type: image, src: "/projects/amor-sanguinis/amor-sanguinis-cover.png" }
    - { type: video, src: "/projects/amor-sanguinis/amor-sanguinis-01.mp4" }
copy:
  it: |
    Il 25 giugno 2026, presso Design Tech, si è tenuto Future Fashion 2.0, evento organizzato da D-House e dedicato al mondo della moda. Per l'occasione ho realizzato per Pecoranera una stanza immersiva: un videomapping proiettato sul vestito e sulla parete alle sue spalle, accompagnato da luci LED nascoste dietro i teli, con contenuti e audio in loop continuo.

    Al centro del progetto, la volontà di far risaltare gli occhi presenti sul vestito, portandoli in primo piano attraverso il colore rosso: un richiamo diretto ad *amor sanguinis*, lo sguardo come forza capace di portare all'esterno le passioni interiori.
  en: |
    On June 25, 2026, Design Tech hosted Future Fashion 2.0, an event organized by D-House and dedicated to fashion. For the occasion, I built an immersive room for Pecoranera: a video mapping projected onto the dress and the wall behind it, paired with LED lights hidden behind the fabric panels, with content and audio running in a continuous loop.

    At the center of the project, the intent to bring out the eyes on the dress, pushing them forward through the color red: a direct nod to *amor sanguinis*, the gaze as a force that carries inner passions out into the world.
---
```

- [ ] **Step 2: Verify against the schema**

Run: `npx astro check`
Expected: no errors reported for `amor-sanguinis.md`.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "Add Amor Sanguinis project content"
```

---

## Task 12: Content — Data Footprint

**Files:**
- Create: `src/content/projects/data-footprint.md`

- [ ] **Step 1: Write the content file**

`src/content/projects/data-footprint.md`:

```markdown
---
title:
  it: Data Footprint
  en: Data Footprint
subtitle:
  it: un paesaggio da esplorare
  en: a landscape to explore
tags:
  it:
    - Installazioni
    - Interactive
    - TouchDesigner
  en:
    - Installations
    - Interactive
    - TouchDesigner
client: "Look at Sangi, Materia Adapt, Kornit Digital"
credits:
  it:
    - "Sound design: Riccardo Moschen"
  en:
    - "Sound design: Riccardo Moschen"
media:
  cover: { type: image, src: "/projects/data-footprint/data-footprint-cover.png" }
  gallery:
    - { type: image, src: "/projects/data-footprint/data-footprint-cover.png" }
    - { type: video, src: "/projects/data-footprint/data-footprint-01.mp4" }
copy:
  it: |
    Il 25 giugno, durante Future Fashion 2.0 (evento organizzato da D-House Laboratorio Urbano), ho presentato Data Footprint, un'installazione interattiva realizzata per la nuova collezione di calzature nata dalla collaborazione tra Look at Sangi, Materia Adapt e Kornit Digital, mostrata per la prima volta durante la Design Week di quest'anno.

    La scarpa diventa un'interfaccia di esplorazione: sollevandola e ruotandola nello spazio, il visitatore controlla un pianeta digitale ispirato alle superfici marziane, in un dialogo diretto tra oggetto fisico e ambiente virtuale. Esplorando il pianeta si attivano contenuti che popolano progressivamente l'interfaccia: immagini, video, approfondimenti sui materiali, modelli 3D e informazioni sui partner del progetto, in un linguaggio visivo ispirato agli HUD delle missioni spaziali.

    Il sound design, di Riccardo Moschen, evolve insieme all'interazione: ogni movimento della scarpa ridisegna il paesaggio sonoro, in un dialogo continuo tra gesto, immagine e suono. Il tutto sviluppato in TouchDesigner, per gestire l'interazione in tempo reale tra oggetto fisico, sistema visivo e audio.

    Data Footprint indaga il rapporto tra materiale, tecnologia e percezione: non un semplice oggetto di design, ma un paesaggio da esplorare.
  en: |
    On June 25, during Future Fashion 2.0 (an event organized by D-House Laboratorio Urbano), I presented Data Footprint, an interactive installation created for the new footwear collection born from the collaboration between Look at Sangi, Materia Adapt, and Kornit Digital, first shown during this year's Design Week.

    The shoe becomes an exploration interface: lifting and rotating it in space, the visitor controls a digital planet inspired by Martian surfaces, in a direct dialogue between physical object and virtual environment. Exploring the planet triggers content that progressively populates the interface: images, videos, material insights, 3D models, and information on the project's partners, in a visual language inspired by space mission HUDs.

    The sound design, by Riccardo Moschen, evolves alongside the interaction: every movement of the shoe reshapes the sonic landscape, in a continuous dialogue between gesture, image, and sound. The whole thing was built in TouchDesigner, to handle real-time interaction between the physical object, the visual system, and the audio.

    Data Footprint explores the relationship between material, technology, and perception: not simply a design object, but a landscape to explore.
---
```

- [ ] **Step 2: Verify against the schema**

Run: `npx astro check`
Expected: no errors reported for `data-footprint.md`.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "Add Data Footprint project content"
```

---

## Task 13: Content — Ultrasynesthesia × Ultrasuono

**Files:**
- Create: `src/content/projects/ultrasynesthesia.md`

- [ ] **Step 1: Write the content file**

`src/content/projects/ultrasynesthesia.md`:

```markdown
---
title:
  it: Ultrasynesthesia × Ultrasuono
  en: Ultrasynesthesia × Ultrasuono
subtitle:
  it: un ambiente che diventa suono
  en: an environment that becomes sound
tags:
  it:
    - Installazioni
    - Interactive
    - TouchDesigner
  en:
    - Installations
    - Interactive
    - TouchDesigner
client: Ultrasuono
media:
  cover: { type: image, src: "/projects/ultrasynesthesia/ultrasynesthesia-cover.jpg" }
  gallery:
    - { type: image, src: "/projects/ultrasynesthesia/ultrasynesthesia-cover.jpg" }
    - { type: video, src: "/projects/ultrasynesthesia/ultrasynesthesia-01.mp4" }
    - { type: video, src: "/projects/ultrasynesthesia/ultrasynesthesia-02.mp4" }
copy:
  it: |
    Dal 3 al 7 giugno 2026, alla Genova Design Week, ho collaborato con Ultrasuono allo sviluppo di un'installazione interattiva. Ultrasuono è un dispositivo musicale pensato per esplorare il rapporto tra suono e ambiente: un sensore di luce, temperatura e umidità fa entrare i dati ambientali direttamente nel processo sonoro, influenzando una matrice di effetti che trasforma il segnale audio in tempo reale.

    Da questo principio nasce Ultrasynesthesia, un'installazione che indaga il rapporto tra percezione, ambiente e rappresentazione digitale, rivelando come parametri normalmente invisibili modellino continuamente gli spazi che abitiamo, influenzando la nostra percezione senza che ce ne accorgiamo.

    L'installazione traduce i dati ambientali in un'esperienza audiovisiva in tempo reale attraverso le funzionalità MIDI di Ultrasuono. Per favorire l'interazione diretta, due manopole sono state assegnate a temperatura e umidità, lasciate al controllo del pubblico; la luce resta invece sotto il controllo diretto del sensore. Una terza manopola regola il rapporto dry/wet, determinando quanto questi parametri influenzano suono e visual.

    Al centro dell'esperienza, un'interpretazione visiva del logo di Ultrasuono generata attraverso un sistema di particelle dinamico, che risponde ai dati dei sensori traducendo le trasformazioni sonore in movimento. In parallelo, una traccia audio viene alterata in tempo reale dagli stessi parametri ambientali, stabilendo una relazione diretta tra suono, immagine e ambiente circostante. Ho realizzato l'intera installazione in TouchDesigner.
  en: |
    From June 3rd to 7th, 2026, at Genoa Design Week, I collaborated with Ultrasuono on the development of an interactive installation. Ultrasuono is a musical device designed to explore the relationship between sound and environment: a single sensor for light, temperature, and humidity feeds environmental data directly into the sound process, influencing a matrix of effects that transforms the audio signal in real time.

    From this principle comes Ultrasynesthesia, an installation that investigates the relationship between perception, environment, and digital representation, revealing how normally invisible parameters continuously shape the spaces we inhabit, influencing our perception without our awareness.

    The installation translates environmental data into a real-time audiovisual experience through Ultrasuono's MIDI functionality. To encourage direct interaction, two knobs were assigned to temperature and humidity, left to the audience's control; light instead remained directly controlled by the sensor. A third knob adjusts the dry/wet ratio, determining how strongly these parameters affect both sound and visuals.

    At the center of the experience is a visual interpretation of the Ultrasuono logo, generated through a dynamic particle system that responds to sensor data, translating sonic transformations into movement. At the same time, an audio track is altered in real time by the same environmental parameters, establishing a direct relationship between sound, image, and the surrounding environment. I built the entire installation in TouchDesigner.
---
```

- [ ] **Step 2: Verify against the schema**

Run: `npx astro check`
Expected: no errors reported for `ultrasynesthesia.md`.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "Add Ultrasynesthesia x Ultrasuono project content"
```

---

## Task 14: Content — Forse sto bruciando

**Files:**
- Create: `src/content/projects/forse-sto-bruciando.md`

**Note:** this project's source folder has only one video file, no still image (see Task 4). Its `media.cover` is therefore `type: video`.

- [ ] **Step 1: Write the content file**

`src/content/projects/forse-sto-bruciando.md`:

```markdown
---
title:
  it: Forse sto bruciando
  en: Forse sto bruciando
subtitle:
  it: light design audioreattivo
  en: audio-reactive light design
tags:
  it:
    - Installazioni
    - Light Design
    - TouchDesigner
  en:
    - Installations
    - Light Design
    - TouchDesigner
credits:
  it:
    - "Installazione di: Paolo Dell'Anna"
    - "Musica: Jackbloom"
  en:
    - "Installation by: Paolo Dell'Anna"
    - "Music: Jackbloom"
media:
  cover: { type: video, src: "/projects/forse-sto-bruciando/forse-sto-bruciando-01.mp4" }
  gallery:
    - { type: video, src: "/projects/forse-sto-bruciando/forse-sto-bruciando-01.mp4" }
copy:
  it: |
    "Forse sto bruciando" è un'installazione performativa di Paolo Dell'Anna che indaga vuoto, noia, memoria e narrazione personale: il pubblico è invitato a tradurre un racconto personale che viene stampato, tramite una stampante alimentare, su un toast completamente edibile, trasformando l'atto di mangiare in una metafora di assimilazione ed elaborazione del vissuto.

    Per questa installazione, della durata di tre giorni, ho curato il light design: luci audioreattive sincronizzate alla traccia ambient realizzata da Jackbloom, con palette cromatiche che cambiavano seguendo i capitoli del brano lungo l'intera durata dell'opera.
  en: |
    "Forse sto bruciando" ("Maybe I'm Burning") is a performative installation by Paolo Dell'Anna that explores emptiness, boredom, memory, and personal narrative: visitors are invited to translate a personal story that gets printed, through a food printer, onto a fully edible piece of toast, turning the act of eating into a metaphor for assimilating and processing lived experience.

    For this three-day installation, I handled the light design: audio-reactive lighting synced to the ambient track by Jackbloom, with color palettes shifting along the chapters of the piece across its full duration.
---
```

- [ ] **Step 2: Verify against the schema**

Run: `npx astro check`
Expected: no errors reported for `forse-sto-bruciando.md`.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "Add Forse sto bruciando project content"
```

---

## Task 15: Content — Distopia Cronica

**Files:**
- Create: `src/content/projects/distopia-cronica.md`

**Before writing:** confirm with Francesco (or your Task 4 check) that `Welcome To Distopia` is indeed the Distopia Cronica media folder. This project's source folder has only one video file, no still image, so `media.cover` is `type: video`.

- [ ] **Step 1: Write the content file**

`src/content/projects/distopia-cronica.md`:

```markdown
---
title:
  it: Distopia Cronica
  en: Distopia Cronica
subtitle:
  it: Videomapping on a structure
  en: Videomapping on a structure
tags:
  it:
    - Motion Graphics
    - Videomapping
  en:
    - Motion Graphics
    - Videomapping
media:
  cover: { type: video, src: "/projects/distopia-cronica/distopia-cronica-01.mp4" }
  gallery:
    - { type: video, src: "/projects/distopia-cronica/distopia-cronica-01.mp4" }
copy:
  it: |
    Distopia Cronica nasce all'interno del corso di videomapping del master, come tentativo di dare forma visiva a una domanda che mi porto dietro da tempo: quanto di quello che penso è davvero mio, e quanto invece mi viene consegnato già filtrato? Il progetto affronta la violazione della privacy e la sorveglianza diffusa che la accompagna, non come minaccia esterna e riconoscibile, ma come condizione ormai ambientale: gli algoritmi che selezionano ciò che vediamo finiscono per selezionare anche il modo in cui pensiamo, restituendoci un mondo già orientato che raramente mettiamo in discussione, proprio perché non ci accorgiamo più di essere osservati mentre lo attraversiamo.

    Per raccontarlo ho scelto un linguaggio visivo debitore dell'estetica CRT: immagini disturbate, sgranate, distanti, che restituiscono la sensazione di guardare, ed essere guardati, attraverso uno schermo di sorveglianza piuttosto che con un occhio libero. Ai video originali ho affiancato elementi generati con intelligenza artificiale, usati come strumento per costruire rapidamente un immaginario coerente.

    *Progetto individuale.*
  en: |
    Distopia Cronica was born inside a videomapping course during my master's, as an attempt to give visual form to a question I've been carrying for a while: how much of what I think is actually mine, and how much arrives already filtered? The project deals with privacy violation and the surveillance that comes with it, not as an external, recognizable threat, but as a condition that has become ambient: the algorithms that select what we see end up selecting how we think, handing us a world that's already been oriented, one we rarely question, precisely because we no longer notice we're being watched as we move through it.

    To tell it, I chose a visual language rooted in CRT aesthetics: disturbed, grainy, distant images that give the sense of watching, and being watched, through a surveillance screen rather than a free eye. I paired the original footage with elements generated through artificial intelligence, used as a tool to quickly build a coherent imaginary.

    *Solo project.*
---
```

- [ ] **Step 2: Verify against the schema**

Run: `npx astro check`
Expected: no errors reported for `distopia-cronica.md`.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "Add Distopia Cronica project content"
```

---

## Task 16: Content — Exploring Villa Restelli

**Files:**
- Create: `src/content/projects/exploring-villa-restelli.md`

**Note:** this project's source folder has only one video file, no still image, so `media.cover` is `type: video`.

- [ ] **Step 1: Write the content file**

`src/content/projects/exploring-villa-restelli.md`:

```markdown
---
title:
  it: Exploring Villa Restelli
  en: Exploring Villa Restelli
subtitle:
  it: un particellare della memoria
  en: a particle system of memory
tags:
  it:
    - Motion
    - 3D Scan
    - Blender
    - TouchDesigner
  en:
    - Motion
    - 3D Scan
    - Blender
    - TouchDesigner
media:
  cover: { type: video, src: "/projects/exploring-villa-restelli/exploring-villa-restelli-01.mp4" }
  gallery:
    - { type: video, src: "/projects/exploring-villa-restelli/exploring-villa-restelli-01.mp4" }
copy:
  it: |
    Ho scoperto Villa Restelli a gennaio, una villa vicino a Olgiate Olona dove un gruppo di ragazzi vive in una forma di comunità. Sono rimasto colpito dalla bellezza del posto al primo sguardo, al punto da tornarci per scansionarla con Scaniverse, l'app di scansione 3D sul telefono, senza avere ancora un'idea precisa di cosa farne. Aggirandomi da solo per gli ambienti mentre facevo le scansioni, ho percepito quanto la villa fosse legata ai suoni della natura che la circonda, con un'intensità che aveva qualcosa di quasi inquietante.

    Da quella sensazione è nato il progetto: ho unito le scansioni in Blender, costruendo un percorso virtuale attraverso gli spazi della villa, poi portato in TouchDesigner per l'animazione. Il modello non è un semplice render statico ma un particellare, migliaia di piccoli cubi che ricompongono la forma dell'edificio e si muovono seguendo l'audio, reagendo in tempo reale alla traccia sonora che ho realizzato in Ableton, costruita con campioni di elementi naturali presi da Soundly, modificati e arrangiati in una traccia audio insieme ad altri suoni.

    Il risultato è un attraversamento sospeso tra reale e virtuale, dove la villa si scompone e ricompone al ritmo della natura che l'ha sempre abitata.

    *Progetto individuale.*
  en: |
    I discovered Villa Restelli in January, a villa near Olgiate Olona where a group of people lives in a kind of community. I was struck by the beauty of the place from the first visit, enough to go back and scan it with Scaniverse, the 3D scanning app on my phone, without yet knowing what I'd do with it. Wandering the rooms alone while scanning, I felt how strongly the villa was tied to the sounds of the nature surrounding it, an intensity that had something almost unsettling about it.

    That feeling became the project: I merged the scans in Blender, building a virtual path through the villa's spaces, then brought it into TouchDesigner for animation. The model isn't a static render but a particle system, thousands of small cubes that reassemble into the shape of the building and move with the audio, reacting in real time to a soundtrack I built in Ableton, made from natural sound samples sourced from Soundly, modified and arranged into a track alongside other sounds.

    The result is a passage suspended between real and virtual, where the villa breaks apart and comes back together to the rhythm of the nature that has always surrounded it.

    *Solo project.*
---
```

- [ ] **Step 2: Verify against the schema and run the full content check**

Run: `npx astro check`
Expected: no errors for any of the 12 files.

Run: `npx vitest run tests/schema.test.ts`
Expected: still PASS (unaffected by content additions).

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "Add Exploring Villa Restelli project content"
```

---

## Task 17: Header, MenuPanel, language toggle

**Files:**
- Create: `src/components/Header.astro`
- Create: `src/scripts/gsap-setup.ts`
- Create: `src/scripts/menu-panel.ts`
- Create: `src/styles/header.css`

**Interfaces:**
- Consumes: `t`, `localizedPath`, `otherLocale`, `type Locale` from `src/lib/i18n.ts` (Task 3).
- Produces: `Header.astro` accepting `{ locale: Locale, currentPath: string }`, consumed by every page (Tasks 20-21).
- Produces: `initMenuPanel(buttonSelector: string, panelSelector: string): void` from `src/scripts/menu-panel.ts`.

- [ ] **Step 1: Register GSAP plugins once, shared by every animated component**

`src/scripts/gsap-setup.ts`:

```ts
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(ScrollTrigger, SplitText);

export { gsap, ScrollTrigger, SplitText };
```

- [ ] **Step 2: Write the menu panel open/close logic**

`src/scripts/menu-panel.ts`:

```ts
import { gsap } from './gsap-setup';

export function initMenuPanel(buttonSelector: string, panelSelector: string) {
  const button = document.querySelector<HTMLButtonElement>(buttonSelector);
  const panel = document.querySelector<HTMLElement>(panelSelector);
  if (!button || !panel) return;

  gsap.set(panel, { autoAlpha: 0, y: -12 });
  let isOpen = false;

  function setOpen(next: boolean) {
    isOpen = next;
    button!.setAttribute('aria-expanded', String(isOpen));
    gsap.to(panel, {
      autoAlpha: isOpen ? 1 : 0,
      y: isOpen ? 0 : -12,
      duration: 0.3,
      ease: 'power2.out',
    });
  }

  button.addEventListener('click', () => setOpen(!isOpen));
  panel.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => setOpen(false));
  });
}
```

- [ ] **Step 3: Write the header styles**

`src/styles/header.css`:

```css
.site-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-2) var(--space-3);
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

.site-header__menu-button {
  background: none;
  border: 1px solid var(--color-fg);
  color: var(--color-fg);
  font-family: var(--font-mono);
  padding: 0.3rem 0.8rem;
  cursor: pointer;
}

.menu-panel {
  position: fixed;
  top: 4rem;
  right: var(--space-3);
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  background: var(--color-bg);
  border: 1px solid var(--color-fg);
  padding: var(--space-2);
  z-index: 10;
}

.menu-panel a {
  text-decoration: none;
}
```

- [ ] **Step 4: Write the Header component**

`src/components/Header.astro`:

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
  <div class="site-header__controls">
    <a href={localizedPath(other, currentPath)} class="site-header__lang">{labels.switchTo}</a>
    <button id="menu-toggle" class="site-header__menu-button" aria-expanded="false" aria-controls="menu-panel">
      Menu
    </button>
  </div>
</header>
<nav id="menu-panel" class="menu-panel">
  <a href={`${home}#hero`}>{labels.me}</a>
  <a href={`${home}#projects`}>{labels.project}</a>
  <a href={`${home}#contact`}>{labels.contact}</a>
</nav>
<script>
  import { initMenuPanel } from '../scripts/menu-panel';
  initMenuPanel('#menu-toggle', '#menu-panel');
</script>
```

- [ ] **Step 5: Verify it builds**

Add `<Header locale="it" currentPath="/" />` temporarily inside `src/pages/index.astro` (under the existing `<Layout>`), then:

Run: `npm run build`
Expected: build succeeds, no TypeScript errors.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "Add Header, MenuPanel, and language toggle"
```

---

## Task 18: Hero component (Sirnik-style scroll reveal)

**Files:**
- Create: `src/components/Hero.astro`
- Create: `src/scripts/hero-reveal.ts`
- Create: `src/styles/hero.css`

**Interfaces:**
- Produces: `Hero.astro` accepting `{ locale: 'it' | 'en' }`, consumed by `index.astro` / `en/index.astro` (Task 20).
- Produces: `initHeroReveal(headingSelector: string): void` from `src/scripts/hero-reveal.ts`.

**Content note:** there is no source text anywhere for Francesco's personal presentation ("Me" section). Do not invent one — use the placeholder below verbatim so it's obviously not final copy, and tell Francesco it needs real text.

- [ ] **Step 1: Write the scroll-reveal animation**

`src/scripts/hero-reveal.ts`:

```ts
import { gsap, ScrollTrigger, SplitText } from './gsap-setup';

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
    ease: 'power3.out',
    scrollTrigger: {
      trigger: heading,
      start: 'top 85%',
      end: 'top 30%',
      scrub: true,
    },
  });
}
```

- [ ] **Step 2: Write hero styles**

`src/styles/hero.css`:

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
  max-width: 40ch;
  font-size: 1rem;
  color: var(--color-fg);
}
```

- [ ] **Step 3: Write the Hero component**

`src/components/Hero.astro`:

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
    ? '[Testo di presentazione: da scrivere]'
    : '[Presentation text: to be written]';
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

- [ ] **Step 4: Verify it builds**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "Add Hero component with SplitText scroll reveal"
```

---

## Task 19: ProjectList, ProjectRow, TagBadge, hover preview

**Files:**
- Create: `src/components/ProjectList.astro`
- Create: `src/components/ProjectRow.astro`
- Create: `src/components/TagBadge.astro`
- Create: `src/scripts/project-hover.ts`
- Create: `src/styles/project-list.css`

**Interfaces:**
- Consumes: content collection entries of type `projects` (Task 3 schema), `t(locale)` from `src/lib/i18n.ts`, `localizedPath` for building each row's link to its detail page.
- Produces: `ProjectList.astro` accepting `{ locale: 'it' | 'en', projects: CollectionEntry<'projects'>[] }`, consumed by `index.astro` (Task 20).
- Produces: `initProjectHoverPreview(listSelector: string): void`.

- [ ] **Step 1: Write the TagBadge component (display-only, no click handler)**

`src/components/TagBadge.astro`:

```astro
---
interface Props {
  label: string;
}

const { label } = Astro.props;
---
<span class="tag-badge">{label}</span>

<style>
  .tag-badge {
    display: inline-block;
    border: 1px solid var(--color-fg);
    padding: 0.1rem 0.5rem;
    font-size: 0.75rem;
    margin-right: 0.3rem;
  }
</style>
```

- [ ] **Step 2: Write the hover-preview script (handles both image and video covers)**

`src/scripts/project-hover.ts`:

```ts
import { gsap } from './gsap-setup';

export function initProjectHoverPreview(listSelector: string) {
  const list = document.querySelector<HTMLElement>(listSelector);
  if (!list) return;

  const preview = document.createElement('div');
  preview.className = 'project-hover-preview';
  document.body.appendChild(preview);
  gsap.set(preview, { autoAlpha: 0, scale: 0.9 });

  function move(event: MouseEvent) {
    gsap.to(preview, { x: event.clientX + 24, y: event.clientY - 60, duration: 0.2, ease: 'power2.out' });
  }

  list.querySelectorAll<HTMLElement>('[data-preview-src]').forEach((row) => {
    row.addEventListener('mouseenter', () => {
      const src = row.dataset.previewSrc ?? '';
      const type = row.dataset.previewType === 'video' ? 'video' : 'img';
      preview.innerHTML = '';
      const media = document.createElement(type);
      media.setAttribute('src', src);
      if (type === 'video') {
        media.setAttribute('muted', '');
        media.setAttribute('loop', '');
        media.setAttribute('autoplay', '');
        media.setAttribute('playsinline', '');
      }
      preview.appendChild(media);
      gsap.to(preview, { autoAlpha: 1, scale: 1, duration: 0.25, ease: 'power2.out' });
    });
    row.addEventListener('mousemove', move);
    row.addEventListener('mouseleave', () => {
      gsap.to(preview, { autoAlpha: 0, scale: 0.9, duration: 0.2, ease: 'power2.out' });
    });
  });
}
```

- [ ] **Step 3: Write the scroll-into-view reveal script (fade + translateY, lighter than the Hero's SplitText reveal — used for project rows and, in Task 20, the Contact footer)**

`src/scripts/reveal-on-scroll.ts`:

```ts
import { gsap, ScrollTrigger } from './gsap-setup';

export function initRevealOnScroll(selector: string) {
  const elements = document.querySelectorAll<HTMLElement>(selector);

  elements.forEach((element) => {
    gsap.fromTo(
      element,
      { opacity: 0, y: 24 },
      {
        opacity: 1,
        y: 0,
        duration: 0.5,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: element,
          start: 'top 80%',
        },
      }
    );
  });
}
```

- [ ] **Step 4: Write list/row/preview styles**

`src/styles/project-list.css`:

```css
.project-list {
  display: flex;
  flex-direction: column;
  padding: var(--space-3);
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

.project-hover-preview {
  position: fixed;
  top: 0;
  left: 0;
  width: 220px;
  pointer-events: none;
  z-index: 20;
}

.project-hover-preview img,
.project-hover-preview video {
  width: 100%;
  display: block;
}
```

- [ ] **Step 5: Write the ProjectRow component**

`src/components/ProjectRow.astro`:

```astro
---
import type { CollectionEntry } from 'astro:content';
import TagBadge from './TagBadge.astro';
import { localizedPath, type Locale } from '../lib/i18n';

interface Props {
  locale: Locale;
  project: CollectionEntry<'projects'>;
}

const { locale, project } = Astro.props;
const { title, subtitle, tags, media } = project.data;
const href = localizedPath(locale, `/progetti/${project.slug}/`);
---
<a
  class="project-row"
  href={href}
  data-preview-src={media.cover.src}
  data-preview-type={media.cover.type}
>
  <div class="project-row__titles">
    <span class="project-row__title">{title[locale]}</span>
    <span class="project-row__subtitle">{subtitle[locale]}</span>
  </div>
  <div class="project-row__tags">
    {tags[locale].map((tag) => <TagBadge label={tag} />)}
  </div>
</a>
```

- [ ] **Step 6: Write the ProjectList component (wires both the hover preview and the scroll-into-view reveal onto each row)**

`src/components/ProjectList.astro`:

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
  <div class="project-list">
    {projects.map((project) => <ProjectRow locale={locale} project={project} />)}
  </div>
</section>
<script>
  import { initProjectHoverPreview } from '../scripts/project-hover';
  import { initRevealOnScroll } from '../scripts/reveal-on-scroll';
  initProjectHoverPreview('.project-list');
  initRevealOnScroll('.project-row');
</script>
```

- [ ] **Step 7: Verify it builds**

Add a temporary `<ProjectList locale="it" projects={await getCollection('projects')} />` to `src/pages/index.astro` (import `getCollection` from `astro:content`), then:

Run: `npm run build`
Expected: build succeeds and lists all 12 projects (grep `dist/index.html` for `project-row` and count 12 matches).

Run: `grep -o 'class="project-row"' dist/index.html | wc -l`
Expected: `12`

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "Add ProjectList, ProjectRow, TagBadge, hover preview, and scroll reveal"
```

---

## Task 20: Homepage assembly (IT + EN)

**Files:**
- Modify: `src/pages/index.astro` (replace placeholder content with the real page)
- Create: `src/pages/en/index.astro`
- Create: `src/components/Contact.astro` (used here so the homepage is complete; expanded further in Task 22 if needed)
- Create: `src/styles/contact.css`

**Interfaces:**
- Consumes: `Layout`, `Header`, `Hero`, `ProjectList` (Tasks 2, 17, 18, 19), `getCollection('projects')` from `astro:content`, `t(locale)` from `src/lib/i18n.ts`, `initRevealOnScroll` from `src/scripts/reveal-on-scroll.ts` (Task 19).

- [ ] **Step 1: Write the Contact component**

`src/styles/contact.css`:

```css
.contact {
  padding: var(--space-4) var(--space-3);
  border-top: 1px solid var(--color-fg);
}

.contact__email {
  color: var(--color-accent);
  text-decoration: none;
  font-size: 1.2rem;
}
```

`src/components/Contact.astro`:

```astro
---
import { t, type Locale } from '../lib/i18n';
import '../styles/contact.css';

interface Props {
  locale: Locale;
}

const { locale } = Astro.props;
const labels = t(locale);
const email = 'p.bortoloso@gbo-studio.it';
---
<footer id="contact" class="contact">
  <h2>{labels.contact}</h2>
  <a class="contact__email" href={`mailto:${email}`}>{email}</a>
</footer>
<script>
  import { initRevealOnScroll } from '../scripts/reveal-on-scroll';
  initRevealOnScroll('.contact');
</script>
```

- [ ] **Step 2: Assemble the Italian homepage**

`src/pages/index.astro`:

```astro
---
import Layout from '../layouts/Layout.astro';
import Header from '../components/Header.astro';
import Hero from '../components/Hero.astro';
import ProjectList from '../components/ProjectList.astro';
import Contact from '../components/Contact.astro';
import { getCollection } from 'astro:content';

const locale = 'it' as const;
const projects = await getCollection('projects');
---
<Layout locale={locale} title="Francesco Olmo Bortoloso">
  <Header locale={locale} currentPath="/" />
  <Hero locale={locale} />
  <ProjectList locale={locale} projects={projects} />
  <Contact locale={locale} />
</Layout>
```

- [ ] **Step 3: Assemble the English homepage**

`src/pages/en/index.astro`:

```astro
---
import Layout from '../../layouts/Layout.astro';
import Header from '../../components/Header.astro';
import Hero from '../../components/Hero.astro';
import ProjectList from '../../components/ProjectList.astro';
import Contact from '../../components/Contact.astro';
import { getCollection } from 'astro:content';

const locale = 'en' as const;
const projects = await getCollection('projects');
---
<Layout locale={locale} title="Francesco Olmo Bortoloso">
  <Header locale={locale} currentPath="/en/" />
  <Hero locale={locale} />
  <ProjectList locale={locale} projects={projects} />
  <Contact locale={locale} />
</Layout>
```

- [ ] **Step 4: Verify both homepages build and the language toggle links are correct**

Run: `npm run build`
Expected: build succeeds, `dist/index.html` and `dist/en/index.html` both exist.

Run: `grep -o 'href="/en/"' dist/index.html`
Expected: prints the match (IT page's language toggle points to `/en/`).

Run: `grep -o 'href="/"' dist/en/index.html`
Expected: prints the match (EN page's language toggle points back to `/`).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "Assemble IT and EN homepages"
```

---

## Task 21: Project detail pages (IT + EN)

**Files:**
- Create: `src/components/ProjectMeta.astro`
- Create: `src/components/ProjectGallery.astro`
- Create: `src/pages/progetti/[slug].astro`
- Create: `src/pages/en/progetti/[slug].astro`
- Create: `src/styles/project-detail.css`

**Interfaces:**
- Consumes: `projectSchema`/content collection (Task 3, Tasks 5-16), `Layout`, `Header` (Tasks 2, 17), `marked` (installed in Task 1) to render the `copy.it`/`copy.en` markdown string to HTML.

- [ ] **Step 1: Write detail-page styles**

`src/styles/project-detail.css`:

```css
.project-detail {
  padding: var(--space-4) var(--space-3);
  max-width: 60rem;
  margin: 0 auto;
}

.project-detail__subtitle {
  opacity: 0.8;
}

.project-detail__meta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-1) var(--space-2);
  margin: var(--space-2) 0;
  font-size: 0.85rem;
}

.project-detail__body {
  text-align: justify;
  max-width: 65ch;
  line-height: 1.6;
}

.project-detail__body p {
  margin-bottom: var(--space-2);
}

.project-detail__gallery {
  display: grid;
  gap: var(--space-2);
  margin-top: var(--space-3);
}
```

- [ ] **Step 2: Write the ProjectMeta component (tags, client badge, participants/credits, kept separate from the narrative body)**

`src/components/ProjectMeta.astro`:

```astro
---
import type { CollectionEntry } from 'astro:content';
import TagBadge from './TagBadge.astro';
import type { Locale } from '../lib/i18n';

interface Props {
  locale: Locale;
  project: CollectionEntry<'projects'>;
}

const { locale, project } = Astro.props;
const { tags, client, participants, credits } = project.data;
---
<div class="project-detail__meta">
  {tags[locale].map((tag) => <TagBadge label={tag} />)}
  {client && <span class="project-detail__client">{client}</span>}
</div>
{participants && (
  <ul class="project-detail__participants">
    {participants.map((name) => <li>{name}</li>)}
  </ul>
)}
{credits && (
  <ul class="project-detail__credits">
    {credits[locale].map((line) => <li>{line}</li>)}
  </ul>
)}
```

- [ ] **Step 3: Write the ProjectGallery component (handles both image and video items)**

`src/components/ProjectGallery.astro`:

```astro
---
import type { CollectionEntry } from 'astro:content';

interface Props {
  project: CollectionEntry<'projects'>;
}

const { project } = Astro.props;
const { gallery } = project.data.media;
---
<div class="project-detail__gallery">
  {gallery.map((item) =>
    item.type === 'video' ? (
      <video src={item.src} controls />
    ) : (
      <img src={item.src} alt="" />
    )
  )}
</div>
```

- [ ] **Step 4: Write the Italian detail page**

`src/pages/progetti/[slug].astro`:

```astro
---
import { getCollection } from 'astro:content';
import { marked } from 'marked';
import Layout from '../../layouts/Layout.astro';
import Header from '../../components/Header.astro';
import ProjectMeta from '../../components/ProjectMeta.astro';
import ProjectGallery from '../../components/ProjectGallery.astro';
import '../../styles/project-detail.css';

export async function getStaticPaths() {
  const projects = await getCollection('projects');
  return projects.map((project) => ({
    params: { slug: project.slug },
    props: { project },
  }));
}

const { project } = Astro.props;
const locale = 'it' as const;
const bodyHtml = marked.parse(project.data.copy[locale]);
---
<Layout locale={locale} title={project.data.title[locale]}>
  <Header locale={locale} currentPath={`/progetti/${project.slug}/`} />
  <article class="project-detail">
    <h1>{project.data.title[locale]}</h1>
    <p class="project-detail__subtitle">{project.data.subtitle[locale]}</p>
    <ProjectMeta locale={locale} project={project} />
    <div class="project-detail__body" set:html={bodyHtml} />
    <ProjectGallery project={project} />
  </article>
</Layout>
```

- [ ] **Step 5: Write the English detail page**

`src/pages/en/progetti/[slug].astro`:

```astro
---
import { getCollection } from 'astro:content';
import { marked } from 'marked';
import Layout from '../../../layouts/Layout.astro';
import Header from '../../../components/Header.astro';
import ProjectMeta from '../../../components/ProjectMeta.astro';
import ProjectGallery from '../../../components/ProjectGallery.astro';
import '../../../styles/project-detail.css';

export async function getStaticPaths() {
  const projects = await getCollection('projects');
  return projects.map((project) => ({
    params: { slug: project.slug },
    props: { project },
  }));
}

const { project } = Astro.props;
const locale = 'en' as const;
const bodyHtml = marked.parse(project.data.copy[locale]);
---
<Layout locale={locale} title={project.data.title[locale]}>
  <Header locale={locale} currentPath={`/en/progetti/${project.slug}/`} />
  <article class="project-detail">
    <h1>{project.data.title[locale]}</h1>
    <p class="project-detail__subtitle">{project.data.subtitle[locale]}</p>
    <ProjectMeta locale={locale} project={project} />
    <div class="project-detail__body" set:html={bodyHtml} />
    <ProjectGallery project={project} />
  </article>
</Layout>
```

- [ ] **Step 6: Verify all 24 detail pages build (12 projects × 2 languages)**

Run: `npm run build`
Expected: build succeeds.

Run: `find dist/progetti dist/en/progetti -name 'index.html' | wc -l`
Expected: `24`

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "Add project detail pages for IT and EN"
```

---

## Task 22: Final integration pass, README, manual verification

**Files:**
- Create: `README.md`

**Interfaces:**
- Consumes: the full built site from Tasks 1-21.

- [ ] **Step 1: Write a README with run instructions**

`README.md`:

```markdown
# Portfolio — Francesco Olmo Bortoloso

Template funzionante costruito con Astro + GSAP. Stato: struttura e contenuti reali, estetica non ancora rifinita.

## Sviluppo locale

npm install
npm run dev

Il sito è disponibile su http://localhost:4321

## Test

npm run test    # Vitest: schema contenuti + helper i18n
npm run build   # build statica + validazione content collection (astro check integrato)

## Struttura

- `src/content/projects/` — un file per progetto (12 totali), schema in `src/content/schema.ts`
- `src/pages/` — homepage IT (`/`) ed EN (`/en/`), dettaglio progetto (`/progetti/<slug>/`, `/en/progetti/<slug>/`)
- `public/projects/<slug>/` — immagini e video di ogni progetto
- `docs/superpowers/specs/` e `docs/superpowers/plans/` — design e piano di implementazione di questa fase

## Punti aperti

- Testo di presentazione nella sezione Hero ("Me") è un placeholder, non testo reale — vedi `src/components/Hero.astro`.
- Corrispondenza cartella sorgente confermata per Amor Sanguinis e Distopia Cronica? Vedi nota in `docs/superpowers/specs/2026-08-09-portfolio-template-design.md`.
```

- [ ] **Step 2: Run the full automated check**

Run: `npm run test && npm run build`
Expected: all Vitest tests pass, build succeeds with no errors, `dist/` contains `index.html`, `en/index.html`, 12 IT detail pages, 12 EN detail pages.

- [ ] **Step 3: Manual browser verification**

Start the dev server (`npm run dev`) and, using the project's browser preview tool, check each of the following and note anything broken:

1. Homepage loads, menu button opens the dropdown panel (Me/Project/Contact) with a visible open/close animation, and clicking a link closes the panel and scrolls to the right section.
2. The Hero heading animates in as you scroll past it (words sliding in from alternating sides).
3. The project list shows all 12 projects with correct titles, subtitles, and tag badges (tags are visibly not clickable — no hover state indicating interactivity), and each row fades/slides in as it enters the viewport while scrolling down. The Contact footer does the same.
4. Hovering a project row on desktop shows a floating image (or looping video, for the three video-cover projects) following the cursor.
5. Clicking a project opens its detail page at `/progetti/<slug>/`, showing title, subtitle, tag badges, client (if any), participants/credits (if any, and separate from the narrative text), justified body text, and a gallery rendering every image and video.
6. The language toggle (IT/EN) in the header switches to the equivalent page in the other language, from both the homepage and a project detail page.
7. Repeat 3-6 once on `/en/` to confirm the English tree independently.

- [ ] **Step 4: Fix anything broken found in Step 3, re-run Steps 2-3 until clean**

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "Add README and complete functional-template verification pass"
```
