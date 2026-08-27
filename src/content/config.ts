import { defineCollection } from 'astro:content';
import { projectSchema } from './schema';

const projects = defineCollection({
  type: 'content',
  schema: projectSchema,
});

export const collections = { projects };
