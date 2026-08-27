# Portfolio Francesco Olmo Bortoloso — template funzionante

Data: 2026-08-09

## Contesto

Sito portfolio personale di Francesco Olmo Bortoloso. Questa fase costruisce la struttura/template funzionante del sito, non l'estetica finale. Requisiti sorgente: `/Users/olmo/Desktop/prompt-sviluppo-sito.md`.

## Decisioni architetturali (confermate con l'utente)

- **Navigazione**: una sola pagina che scrolla (Header → Intro/Hero "Me" → Project list → Contact footer), con il pannello menu che scrolla ad ancore sulla stessa pagina. Cliccando su un progetto per vedere più info si apre una pagina separata di dettaglio.
- **Tag**: restano visibili come metadato (caselle con bordo, stile riferimento `ref box filtri`) sotto titolo/sottotitolo di ogni progetto, sia in lista che nel dettaglio. Non sono più cliccabili e non filtrano nulla (funzionalità di filtro rimossa su richiesta esplicita dell'utente — inverte una decisione precedente documentata in memoria).
- **Lingua**: selettore IT/EN che cambia l'intera pagina. Due alberi di route paralleli (`/` e `/en/`) invece di i18n dinamico lato client.
- **Cover mancanti**: 7 progetti su 12 non hanno un file "cover" riconoscibile nella cartella sorgente. Poiché i 12 progetti vengono trascritti a mano in file di contenuto strutturato, la cover per ciascuno viene decisa una volta in fase di trascrizione (primo file utile trovato quando non c'è un cover esplicito), non calcolata a runtime.

## Stack

- **Astro** (output statico), **GSAP + ScrollTrigger** per le animazioni, plugin SplitText incluso (gratuito dal 2024, acquisizione Webflow di GreenSock).
- CSS con custom properties per i token del tema (`--color-bg`, `--color-fg`, `--color-accent`, `--font-mono`) così che la rifinitura estetica successiva sia un cambio di valori, non una riscrittura.
- Progetto in `/Users/olmo/Desktop/portfolio-sito/` (separato da `/Users/olmo/Desktop/portfolio/`, che resta la fonte di testi/immagini e non viene toccato).

## Modello dati

Content collection `src/content/projects/<slug>.md`, un file per progetto (12 totali). Schema (Zod):

```
title: string
subtitle: string
tags: string[]
client?: string
participants?: string[]
credits?: string[]
media: { cover: string, gallery: Array<{ type: 'image' | 'video', src: string }> }
copy: { it: string, en: string }
```

Immagini in `src/assets/projects/<slug>/` (ottimizzate via `<Image />`), video in `public/projects/<slug>/` (serviti così come sono, Astro non trasforma i video).

Ordine di visualizzazione nella lista: stesso ordine del file master (Cyberstalking → Exploring Villa Restelli), nessun altro criterio specificato.

## Routing

- `src/pages/index.astro` / `src/pages/en/index.astro`: pagina unica con le sezioni Header, Intro/Hero, Project list, Contact.
- `src/pages/progetti/[slug].astro` / `src/pages/en/progetti/[slug].astro`: dettaglio progetto, `getStaticPaths()` dalla content collection.

Due alberi di route paralleli che condividono componenti tramite prop `locale`, invece dell'integrazione i18n di Astro (più semplice per due sole lingue).

## Componenti

`Layout` (shell, font, token CSS) → `Header` (logo/nome a sinistra, bottone menu a destra) → `MenuPanel` (pannello a tendina con Me/Project/Contact, GSAP per apertura/chiusura, chiude al click su un link) → `Hero` (sezione Intro/Me, animazione di reveal) → `ProjectList` + `ProjectRow` (titolo/sottotitolo/tag per riga, hover stile Magla) → `TagBadge` (casella con bordo, solo display, nessun handler di click) → `ProjectDetail` (titolo, metadati, testo narrativo giustificato, crediti/partecipanti separati dal testo, galleria media) → `Contact` (footer).

Contatto placeholder: `p.bortoloso@gbo-studio.it` (indirizzo email noto dell'utente), da correggere se non è quello giusto o se servono altri contatti.

## Animazioni

GSAP + ScrollTrigger + SplitText, import in blocchi `<script>` per componente (JS inviato solo alle pagine che lo usano, coerente con l'approccio "poco JS di default" di Astro).

- **Hero (ispirata a Sirnik)**: titolo diviso in parole/righe che scivolano in orizzontale da lati alterni, animazione scrub-linked allo scroll, si compongono in posizione durante lo scroll della sezione hero. (Nota: non sono riuscito a caricare il sito live sirnik.co nel browser di sviluppo per osservare l'animazione esatta — loader bloccato in loop infinito, probabilmente un problema WebGL nell'ambiente. Uso quindi un'interpretazione standard di questo pattern; da rifinire nella fase estetica con l'aiuto di una registrazione schermo o descrizione più precisa.)
- **Reveal sezioni/righe**: fade + translateY più leggero all'ingresso in viewport per la lista progetti e il contact.
- **Hover riga progetto (ispirato a Studio Magla)**: anteprima flottante dell'immagine che segue il cursore vicino alla riga, fade/scale via GSAP.

## Verifica

Server di sviluppo avviato e controllato nel browser: apertura/chiusura pannello menu, animazione scroll dell'hero, lista dei 12 progetti con tag/cover corretti, apertura pagina di dettaglio con testo giustificato e crediti corretti, selettore lingua che cambia tutti i testi. Non viene valutata l'estetica finale (fuori scope di questa fase), solo il funzionamento.

## Punti aperti (in attesa di conferma dall'utente, non bloccanti per l'inizio dell'implementazione)

- Corrispondenza cartella → progetto per 2 dei 12 progetti: `output pecoranera` → Amor Sanguinis (cliente Pecoranera), `Welcome To Distopia` → Distopia Cronica. L'utente ha detto di voler controllare lui stesso e dare i nomi corretti. Questi due progetti verranno trascritti per ultimi, dopo conferma.
- Comportamento esatto dell'animazione hero (vedi nota sopra su sirnik.co non raggiungibile).
