// Rendu vidéo du livre : chaque image est produite par BOOK.renderAt(t), puis envoyée à ffmpeg (H.264 + AAC).
// Usage :
//   node tools/render.mjs                      -> 1920x1080, 30 i/s, toute la chanson, sortie tmp/render/dolma-forever.mp4
//   node tools/render.mjs --preview            -> 960x540 (aperçu rapide)
//   node tools/render.mjs --from 40 --to 60    -> seulement l'intervalle 40–60 s (audio compris)
//   node tools/render.mjs --out chemin.mp4     -> autre fichier de sortie
// Prérequis : Node 18+, npm i puppeteer-core ; un Chrome dont le chemin est dans CHROME_PATH ;
//             ffmpeg dans le PATH (ou chemin dans FFMPEG).
// CLIP_DIR (optionnel) : dossier du clip, si le script n'est pas lancé depuis tools/.
// Le rendu ne dépend que de t : même t => même image (voir pages/book.js).
import { mkdirSync, statSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { spawn } from 'node:child_process';
import puppeteer from 'puppeteer-core';

const args = process.argv.slice(2);
const opt = (name, def) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : def;
};
const has = (name) => args.includes(name);

const here = process.env.CLIP_DIR ? resolve(process.env.CLIP_DIR, 'tools') : dirname(fileURLToPath(import.meta.url));
const clipDir = resolve(here, '..');
const FPS = 30;
const preview = has('--preview');
const scale = preview ? 0.5 : 1;
const outFile = resolve(opt('--out', join(clipDir, 'tmp', 'render', preview ? 'dolma-forever-preview.mp4' : 'dolma-forever.mp4')));
const audio = join(clipDir, 'audio', 'song.mp3');
const duration = 239.92; // durée de la chanson (timings/timings.json)
const from = Number(opt('--from', 0));
const to = Number(opt('--to', duration));
const ffmpegBin = process.env.FFMPEG || 'ffmpeg';
const frameCount = Math.round((to - from) * FPS);

mkdirSync(dirname(outFile), { recursive: true });

const ffArgs = [
  '-y', '-loglevel', 'error', '-stats',
  '-f', 'image2pipe', '-c:v', 'png', '-framerate', String(FPS), '-i', '-',
  '-ss', String(from), '-t', String(to - from), '-i', audio,
  '-map', '0:v', '-map', '1:a',
  '-c:v', 'libx264', '-preset', preview ? 'veryfast' : 'slow', '-crf', preview ? '23' : '18',
  '-pix_fmt', 'yuv420p', '-r', String(FPS),
  '-c:a', 'aac', '-b:a', '320k',
  '-movflags', '+faststart', '-shortest',
  outFile,
];
const ff = spawn(ffmpegBin, ffArgs, { stdio: ['pipe', 'inherit', 'inherit'] });
const ffDone = new Promise((res, rej) => ff.on('exit', (code) => (code === 0 ? res() : rej(new Error('ffmpeg a échoué, code ' + code)))));

const chromePath = process.env.CHROME_PATH;
const browser = await puppeteer.launch({
  executablePath: chromePath,
  headless: true,
  args: ['--no-sandbox', '--disable-gpu', '--font-render-hinting=none'],
});
const page = await browser.newPage();
await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: scale });
const errors = [];
page.on('pageerror', (e) => errors.push(String(e)));
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });

const index = pathToFileURL(join(clipDir, 'pages', 'index.html')).href;
await page.goto(`${index}?t=${from}`, { waitUntil: 'load' });
await page.waitForFunction(() => document.body.dataset.ready === '1');
await page.evaluate(() => document.fonts.ready);

const t0 = Date.now();
for (let n = 0; n < frameCount; n++) {
  const t = from + n / FPS;
  await page.evaluate((tt) => window.BOOK.renderAt(tt), t);
  const png = await page.screenshot({ type: 'png', encoding: 'binary' });
  if (!ff.stdin.write(png)) await new Promise((r) => ff.stdin.once('drain', r));
  if (n % 300 === 0) {
    const s = (Date.now() - t0) / 1000;
    console.log(`image ${n}/${frameCount} (t=${t.toFixed(2)} s, ${s.toFixed(0)} s écoulées)`);
  }
}
ff.stdin.end();
await ffDone;
await browser.close();
if (errors.length) console.log('erreurs de page :\n' + errors.join('\n'));
console.log(`fichier : ${outFile} (${(statSync(outFile).size / 1e6).toFixed(1)} Mo)`);
