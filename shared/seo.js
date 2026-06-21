import { defaultContent } from './defaults.js';
import { buildLocalBusinessGraph, buildRegionalBusinessSchema } from './local-schema.js';

export const SITE_URL = 'https://peaksportcenter.online';
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

export function applyGoogleSiteVerification(token) {
  if (!token) return;
  upsertMeta('google-site-verification', token);
}

export function applyFaviconLinks() {
  upsertLink('icon', '/favicon.ico', { type: 'image/x-icon' });
  upsertLink('icon', '/favicon.png', { type: 'image/png' });
  upsertLink('icon', '/favicon-16x16.png', { type: 'image/png', sizes: '16x16' });
  upsertLink('icon', '/favicon-32x32.png', { type: 'image/png', sizes: '32x32' });
  upsertLink('icon', '/favicon-48x48.png', { type: 'image/png', sizes: '48x48' });
  upsertLink('apple-touch-icon', '/apple-touch-icon.png');
}

function applySocialMeta({ title, description, pageUrl, imageUrl, siteName }) {
  upsertProperty('og:type', 'website');
  upsertProperty('og:site_name', siteName);
  upsertProperty('og:title', title);
  upsertProperty('og:description', description);
  upsertProperty('og:url', pageUrl);
  upsertProperty('og:image', imageUrl);
  upsertProperty('og:image:alt', `${siteName} logo`);
  upsertProperty('og:locale', 'tr_TR');

  upsertMeta('twitter:card', 'summary_large_image');
  upsertMeta('twitter:title', title);
  upsertMeta('twitter:description', description);
  upsertMeta('twitter:image', imageUrl);
}

export function applySiteSeo(seoInput = {}, brandInput = {}, contactInput = {}, options = {}) {
  const seo = mergeSeo(seoInput);
  const brand = { ...defaultContent.brand, ...(brandInput || {}) };
  const contact = { ...defaultContent.contact, ...(contactInput || {}) };
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const siteUrl = (seo.siteUrl || SITE_URL || origin || '').replace(/\/$/, '');
  const pageUrl = typeof window !== 'undefined' ? window.location.href.split('#')[0] : siteUrl;
  const imageUrl = siteUrl ? `${siteUrl}${OG_IMAGE_PATH}` : OG_IMAGE_PATH;

  if (seo.title) document.title = seo.title;
  upsertMeta('description', seo.description);
  upsertMeta('keywords', seo.keywords);
  upsertMeta('author', brand.name || 'PEAKSPOR CENTER');
  upsertMeta('robots', 'index, follow, max-image-preview:large');
  upsertMeta('geo.region', 'TR-41');
  upsertMeta('geo.placename', seo.city || 'Kocaeli');
  upsertMeta('language', 'Turkish');

  applySocialMeta({
    title: seo.title,
    description: seo.description,
    pageUrl,
    imageUrl,
    siteName: brand.name || 'PEAKSPOR CENTER'
  });

  upsertLink('canonical', pageUrl);
  applyFaviconLinks();
  applyGoogleSiteVerification(options.googleSiteVerification);

  try {
    upsertJsonLd('peakspor-local-graph', buildLocalBusinessGraph({
      brand,
      seo,
      contact,
      siteUrl
    }));
  } catch {
    // SEO schema must never block the app shell.
  }
}

export function applyPageSeo({ title, description, canonicalPath, breadcrumbs = [], regionalPage = null }) {
  const canonical = canonicalPath?.startsWith('http')
    ? canonicalPath
    : `${SITE_URL}${canonicalPath || '/'}`;
  const imageUrl = `${SITE_URL}${OG_IMAGE_PATH}`;

  if (title) document.title = title;
  upsertMeta('description', description);
  upsertMeta('robots', 'index, follow, max-image-preview:large');
  upsertLink('canonical', canonical);
  applyFaviconLinks();

  applySocialMeta({
    title,
    description,
    pageUrl: canonical,
    imageUrl,
    siteName: 'PEAKSPOR CENTER'
  });

  if (breadcrumbs.length) {
    upsertJsonLd('peakspor-breadcrumb', {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbs.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: `${SITE_URL}${item.path}`
      }))
    });
  }

  if (regionalPage) {
    upsertJsonLd('peakspor-regional-business', buildRegionalBusinessSchema(regionalPage));
  }
}
