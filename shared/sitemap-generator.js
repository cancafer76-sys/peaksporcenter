import {
  ALL_SITEMAP_PATHS,
  SITE_URL,
  getSitemapChangeFreq,
  getSitemapPriority
} from './sitemap-routes.js';

export function generateSitemapXml(lastmod = new Date().toISOString().slice(0, 10)) {
  const urls = ALL_SITEMAP_PATHS.map(loc => `  <url>
    <loc>${SITE_URL}${loc === '/' ? '' : loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${getSitemapChangeFreq(loc)}</changefreq>
    <priority>${getSitemapPriority(loc)}</priority>
  </url>`).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}

export function generateRobotsTxt() {
  return `User-agent: *
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
`;
}
