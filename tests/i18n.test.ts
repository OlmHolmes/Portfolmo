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
