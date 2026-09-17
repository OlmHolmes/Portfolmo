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
  layout: z.enum(['half', 'half-inline', 'third', 'inline', 'hover', 'full']).optional(),
  // Scales a duo/trio row's computed fill height (1 = fill the row width
  // exactly, <1 = deliberately smaller/centered, read from the row's first item).
  scale: z.number().optional(),
  // Trio row only, read from the row's first item: when the items (at their
  // set scale) don't fill the full-bleed width, spread them to the row's
  // edges instead of clustering them centered.
  spread: z.boolean().optional(),
  // Rotates this single image in place (degrees, CSS convention: positive = clockwise).
  rotate: z.number().optional(),
  // Dark-theme image swapped for a recolored light-theme version at runtime
  // (e.g. a black-bg/white-text wordmark that needs to read against the
  // light theme's page background instead). `ratio` (width/height) is
  // required alongside it so height-matching layouts don't need to wait on
  // image load to know the aspect ratio.
  srcLight: z.string().optional(),
  ratio: z.number().optional(),
});

export const projectSchema = z.object({
  order: z.number(),
  title: localizedTextSchema,
  subtitle: localizedTextSchema,
  tags: localizedListSchema,
  client: z.string().optional(),
  clientShort: z.string().optional(),
  date: z.string(),
  participants: z.array(z.string()).optional(),
  credits: localizedListSchema.optional(),
  media: z.object({
    cover: mediaItemSchema,
    gallery: z.array(mediaItemSchema).min(1),
  }),
  overview: localizedTextSchema,
  copy: localizedTextSchema,
});

export type Project = z.infer<typeof projectSchema>;
