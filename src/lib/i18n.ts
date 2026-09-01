export type Locale = 'it' | 'en';

const labels = {
  it: {
    me: 'About',
    project: 'Project',
    contact: 'Contatti',
    switchTo: 'EN',
    overview: 'Panoramica',
    tagsLabel: 'Tag',
    category: 'Tag',
    date: 'Data',
    participants: 'Team',
    credits: 'Crediti',
    client: 'Cliente',
    exploreCase: 'Scopri il progetto',
    phone: 'Telefono',
    email: 'Email',
    instagram: 'Instagram',
    mobileNote: 'Questo sito è pensato per il computer. Da telefono si vede bene lo stesso, ma sul grande schermo dà il meglio. Se puoi, fatti un giro anche da lì.',
  },
  en: {
    me: 'About',
    project: 'Project',
    contact: 'Contact',
    switchTo: 'IT',
    overview: 'Overview',
    tagsLabel: 'Tags',
    category: 'Tag',
    date: 'Date',
    participants: 'Team',
    credits: 'Credits',
    client: 'Client',
    exploreCase: 'Explore the case',
    phone: 'Phone',
    email: 'Email',
    instagram: 'Instagram',
    mobileNote: 'This site is built for desktop. It looks good on phone too, but it really shines on a bigger screen. If you can, take a look from there.',
  },
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
