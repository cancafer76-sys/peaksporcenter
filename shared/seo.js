import { defaultContent } from './defaults.js';

const LOGO_PATH = '/logo-circle.png';
const OG_IMAGE_PATH = '/og-image.jpg';

function upsertMeta(name, content) {
  if (!content) return;
  let node = document.querySelector(`meta[name="${name}"]`);
  if (!node) {
    node = document.createElement('meta');
    node.setAttribute('name', name);
    document.head.appendChild(node);
  }
  node.setAttribute('content', content);
}

function upsertProperty(property, content) {
  if (!content) return;
  let node = document.querySelector(`meta[property="${property}"]`);
  if (!node) {
    node = document.createElement('meta');
    node.setAttribute('property', property);
    document.head.appendChild(node);
  }
  node.setAttribute('content', content);
}

function upsertLink(rel, href, extra = {}) {
  if (!href) return;
  let node = document.querySelector(`link[rel="${rel}"]${extra.sizes ? `[sizes="${extra.sizes}"]` : ''}`);
  if (!node) {
    node = document.createElement('link');
    node.setAttribute('rel', rel);
    document.head.appendChild(node);
  }
  node.setAttribute('href', href);
  if (extra.type) node.setAttribute('type', extra.type);
  if (extra.sizes) node.setAttribute('sizes', extra.sizes);
}

function upsertJsonLd(id, data) {
  let node = document.getElementById(id);
  if (!node) {
    node = document.createElement('script');
    node.type = 'application/ld+json';
    node.id = id;
    document.head.appendChild(node);
  }
  node.textContent = JSON.stringify(data);
}

export function mergeSeo(seo = {}) {
  return {
    ...defaultContent.seo,
    ...(seo || {})
  };
}

export function applySiteSeo(seoInput = {}, brandInput = {}) {
  const seo = mergeSeo(seoInput);
  const brand = { ...defaultContent.brand, ...(brandInput || {}) };
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const siteUrl = (seo.siteUrl || origin || '').replace(/\/$/, '');
  const pageUrl = typeof window !== 'undefined' ? window.location.href.split('#')[0] : siteUrl;
  const imageUrl = siteUrl ? `${siteUrl}${OG_IMAGE_PATH}` : OG_IMAGE_PATH;
  const logoUrl = siteUrl ? `${siteUrl}${LOGO_PATH}` : LOGO_PATH;

  if (seo.title) document.title = seo.title;
  upsertMeta('description', seo.description);
  upsertMeta('keywords', seo.keywords);
  upsertMeta('author', brand.name || 'PEAK SPOR CENTER');
  upsertMeta('robots', 'index, follow, max-image-preview:large');
  upsertMeta('geo.region', 'TR-41');
  upsertMeta('geo.placename', seo.city || 'Kocaeli');
  upsertMeta('language', 'Turkish');

  upsertProperty('og:type', 'website');
  upsertProperty('og:site_name', brand.name || 'PEAK SPOR CENTER');
  upsertProperty('og:title', seo.title);
  upsertProperty('og:description', seo.description);
  upsertProperty('og:url', pageUrl);
  upsertProperty('og:image', imageUrl);
  upsertProperty('og:image:alt', `${brand.name} logo`);
  upsertProperty('og:locale', 'tr_TR');

  upsertMeta('twitter:card', 'summary_large_image');
  upsertMeta('twitter:title', seo.title);
  upsertMeta('twitter:description', seo.description);
  upsertMeta('twitter:image', imageUrl);

  upsertLink('canonical', pageUrl);
  upsertLink('icon', '/favicon.ico', { type: 'image/x-icon' });
  upsertLink('icon', '/favicon-32x32.png', { type: 'image/png', sizes: '32x32' });
  upsertLink('apple-touch-icon', '/apple-touch-icon.png');

  upsertJsonLd('peakspor-local-business', {
    '@context': 'https://schema.org',
    '@type': 'SportsActivityLocation',
    name: brand.name || 'PEAK SPOR CENTER',
    description: seo.description,
    url: siteUrl || pageUrl,
    image: imageUrl,
    logo: logoUrl,
    address: {
      '@type': 'PostalAddress',
      addressLocality: seo.city || 'Kocaeli',
      addressRegion: seo.region || 'Kocaeli',
      addressCountry: seo.country || 'TR'
    },
    areaServed: {
      '@type': 'Country',
      name: seo.countryName || 'Türkiye'
    },
    keywords: seo.keywords,
    sameAs: (seo.socialLinks || []).filter(Boolean)
  });

  upsertJsonLd('peakspor-organization', {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: brand.name || 'PEAK SPOR CENTER',
    url: siteUrl || pageUrl,
    logo: logoUrl,
    description: seo.description
  });
}
