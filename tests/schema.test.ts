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
