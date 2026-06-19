import { SITE_URL } from './sitemap-routes.js';
import {
  ALL_SERVICE_AREAS,
  KOCAELI_AREAS,
  ISTANBUL_AREAS,
  cityToRegionalPath,
  cityToRegionalSlug,
  getAreaRegion
} from './local-areas.js';

const LOGO_PATH = '/logo-circle.png';
const OG_IMAGE_PATH = '/og-image.jpg';

function buildAreaServed(city) {
  const region = getAreaRegion(city);
  return {
    '@type': 'City',
    name: city,
    containedInPlace: {
      '@type': 'AdministrativeArea',
      name: region,
      containedInPlace: {
        '@type': 'Country',
        name: 'Türkiye'
      }
    }
  };
}

export function buildLocalBusinessGraph({ brand = {}, seo = {}, contact = {}, siteUrl = SITE_URL }) {
  const businessName = brand.name || 'PEAKSPOR CENTER';
  const description =
    seo.description ||
    'Kocaeli ve İstanbul Anadolu Yakası\'na hizmet veren premium fitness merkezi. Kişisel antrenman, pilates, crossfit ve üyelik paketleri.';
  const imageUrl = `${siteUrl}${OG_IMAGE_PATH}`;
  const logoUrl = `${siteUrl}${LOGO_PATH}`;
  const pageUrl = siteUrl;

  const organization = {
    '@type': 'Organization',
    '@id': `${pageUrl}#organization`,
    name: businessName,
    url: pageUrl,
    logo: logoUrl,
    description
  };

  const website = {
    '@type': 'WebSite',
    '@id': `${pageUrl}#website`,
    url: pageUrl,
    name: businessName,
    description,
    publisher: { '@id': `${pageUrl}#organization` },
    inLanguage: 'tr-TR'
  };

  const mainBusiness = {
    '@type': ['LocalBusiness', 'SportsActivityLocation', 'ExerciseGym'],
    '@id': `${pageUrl}#fitnesscenter`,
    name: businessName,
    description,
    url: pageUrl,
    image: imageUrl,
    logo: logoUrl,
    telephone: contact.phone || '',
    email: contact.email || '',
    address: {
      '@type': 'PostalAddress',
      streetAddress: contact.address || '',
      addressLocality: contact.city || seo.city || 'Kocaeli',
      addressRegion: seo.region || 'Kocaeli',
      addressCountry: seo.country || 'TR'
    },
    areaServed: ALL_SERVICE_AREAS.map(buildAreaServed),
    sameAs: (seo.socialLinks || []).filter(Boolean),
    parentOrganization: { '@id': `${pageUrl}#organization` }
  };

  const serviceCatalog = {
    '@type': 'ItemList',
    '@id': `${pageUrl}#service-areas`,
    name: 'PEAKSPOR CENTER Hizmet Bölgeleri',
    itemListElement: ALL_SERVICE_AREAS.map((city, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: `${city} Spor Salonu`,
      url: `${siteUrl}${cityToRegionalPath(city)}`
    }))
  };

  const kocaeliList = {
    '@type': 'ItemList',
    '@id': `${pageUrl}#kocaeli-areas`,
    name: 'Kocaeli Hizmet Bölgeleri',
    itemListElement: KOCAELI_AREAS.map((city, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: city,
      url: `${siteUrl}${cityToRegionalPath(city)}`
    }))
  };

  const istanbulList = {
    '@type': 'ItemList',
    '@id': `${pageUrl}#istanbul-areas`,
    name: 'İstanbul Hizmet Bölgeleri',
    itemListElement: ISTANBUL_AREAS.map((city, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: city,
      url: `${siteUrl}${cityToRegionalPath(city)}`
    }))
  };

  return {
    '@context': 'https://schema.org',
    '@graph': [organization, website, mainBusiness, serviceCatalog, kocaeliList, istanbulList]
  };
}

export function buildRegionalBusinessSchema(page, siteUrl = SITE_URL) {
  const regionalUrl = `${siteUrl}/${page.slug}`;
  const region = getAreaRegion(page.city);
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': ['LocalBusiness', 'ExerciseGym', 'SportsActivityLocation'],
        '@id': `${regionalUrl}#localbusiness`,
        name: `PEAKSPOR CENTER | ${page.city} Spor Salonu`,
        description: page.description,
        url: regionalUrl,
        image: `${siteUrl}${OG_IMAGE_PATH}`,
        areaServed: buildAreaServed(page.city),
        address: {
          '@type': 'PostalAddress',
          addressLocality: page.city,
          addressRegion: region,
          addressCountry: 'TR'
        }
      }
    ]
  };
}

export { cityToRegionalSlug };
