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
