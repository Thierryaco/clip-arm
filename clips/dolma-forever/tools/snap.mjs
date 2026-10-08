// Capture d'images du livre à des instants donnés (pour contrôler le rendu).
// Usage :  node tools/snap.mjs 4.9 40.5 55 --out tmp/snaps
// Prérequis : npm i puppeteer-core ; un Chrome dont le chemin est dans CHROME_PATH.
// CLIP_DIR (optionnel) : dossier du clip, si le script n'est pas lancé depuis tools/.
import { mkdirSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import puppeteer from 'puppeteer-core';

const here = process.env.CLIP_DIR ? resolve(process.env.CLIP_DIR, 'tools') : dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const outIdx = args.indexOf('--out');
const outDir = resolve(outIdx >= 0 ? args[outIdx + 1] : join(here, '..', 'tmp', 'snaps'));
const times = args.filter((a, i) => !a.startsWith('--') && (outIdx < 0 || i !== outIdx + 1)).map(Number);
mkdirSync(outDir, { recursive: true });

const chromePath = process.env.CHROME_PATH;
const browser = await puppeteer.launch({
  executablePath: chromePath,
  headless: true,
  args: ['--no-sandbox', '--disable-gpu', '--font-render-hinting=none'],
});
const page = await browser.newPage();
await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });
const errors = [];
page.on('pageerror', (e) => errors.push(String(e)));
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });

const index = pathToFileURL(join(here, '..', 'pages', 'index.html')).href;
for (const t of times) {
  await page.goto(`${index}?t=${t}`, { waitUntil: 'load' });
  await page.waitForFunction(() => document.body.dataset.ready === '1');
  await page.evaluate(() => document.fonts.ready);
  const file = join(outDir, `t${String(t).replace('.', '_')}.png`);
  await page.screenshot({ path: file });
  console.log(file);
}
if (errors.length) console.log('erreurs de page :\n' + errors.join('\n'));
await browser.close();
