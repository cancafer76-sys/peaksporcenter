export const KOCAELI_AREAS = [
  'Kocaeli',
  'Gebze',
  'Darıca',
  'Çayırova',
  'Dilovası',
  'İzmit',
  'Başiskele',
  'Kartepe',
  'Gölcük',
  'Körfez',
  'Derince'
];

export const ISTANBUL_AREAS = [
  'İstanbul',
  'Kadıköy',
  'Üsküdar',
  'Ataşehir',
  'Pendik',
  'Kartal',
  'Maltepe',
  'Beşiktaş',
  'Şişli',
  'Bakırköy',
  'Bahçelievler',
  'Küçükçekmece',
  'Başakşehir',
  'Avcılar',
  'Beylikdüzü'
];

export const ALL_SERVICE_AREAS = [...KOCAELI_AREAS, ...ISTANBUL_AREAS];

const SLUG_MAP = {
  ç: 'c',
  ğ: 'g',
  ı: 'i',
  ö: 'o',
  ş: 's',
  ü: 'u',
  Ç: 'c',
  Ğ: 'g',
  İ: 'i',
  I: 'i',
  Ö: 'o',
  Ş: 's',
  Ü: 'u'
};

export function cityToSlug(city) {
  return city
    .split('')
    .map(char => SLUG_MAP[char] || char)
    .join('')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function cityToRegionalSlug(city) {
  return `${cityToSlug(city)}-spor-salonu`;
}

export function cityToRegionalPath(city) {
  return `/${cityToRegionalSlug(city)}`;
}

export const ALL_REGIONAL_PATHS = ALL_SERVICE_AREAS.map(city => cityToRegionalPath(city));

export function getAreaRegion(city) {
  if (KOCAELI_AREAS.includes(city)) return 'Kocaeli';
  if (ISTANBUL_AREAS.includes(city)) return 'İstanbul';
  return 'Türkiye';
}
