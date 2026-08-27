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
