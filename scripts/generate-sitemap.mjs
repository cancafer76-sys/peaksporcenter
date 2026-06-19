import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateSitemapXml } from '../shared/sitemap-generator.js';
import { ALL_SITEMAP_PATHS } from '../shared/sitemap-routes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const outputPath = path.join(rootDir, 'public', 'sitemap.xml');

fs.writeFileSync(outputPath, generateSitemapXml(), 'utf8');
console.log(`Sitemap written: ${outputPath} (${ALL_SITEMAP_PATHS.length} URLs)`);
