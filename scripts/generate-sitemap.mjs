import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  ALL_SITEMAP_PATHS,
  SITE_URL,
  getSitemapChangeFreq,
  getSitemapPriority
} from '../shared/sitemap-routes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const lastmod = new Date().toISOString().slice(0, 10);

const urls = ALL_SITEMAP_PATHS.map(loc => `  <url>
    <loc>${SITE_URL}${loc === '/' ? '' : loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${getSitemapChangeFreq(loc)}</changefreq>
    <priority>${getSitemapPriority(loc)}</priority>
  </url>`).join('\n');

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

const outputPath = path.join(rootDir, 'public', 'sitemap.xml');
fs.writeFileSync(outputPath, xml, 'utf8');
console.log(`Sitemap written: ${outputPath} (${ALL_SITEMAP_PATHS.length} URLs)`);
