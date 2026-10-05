// Turns the raw Instagram pull in _source/ into web-ready assets.
// Run with: node scripts/build-media.mjs
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import sharp from 'sharp';

const root = path.resolve(import.meta.dirname, '..');
const src = path.join(root, '_source/instagram');
const outImg = path.join(root, 'public/media/ig');
const outVid = path.join(root, 'public/media/video');
const outBrand = path.join(root, 'public/brand');
for (const d of [outImg, outVid, outBrand]) fs.mkdirSync(d, { recursive: true });

// Scripture-on-smoke graphics are text-only posts; the site sets those words in real type instead.
const SKIP = new Set(['DWUn9r2D6HT', 'DWO7d3lEehZ', 'DdffliYka8z']);

const manifest = JSON.parse(fs.readFileSync(path.join(src, 'manifest.json'), 'utf8'));
const media = {};

for (const post of manifest) {
  if (SKIP.has(post.code)) continue;
  for (const item of post.items) {
    if (!item.file) continue;
    const id = `${post.code}-${item.i}`;
    const file = `${id}.webp`;
    const input = sharp(path.join(src, item.file)).rotate();
    const resized = input.clone().resize({ width: 1600, height: 2000, fit: 'inside', withoutEnlargement: true });
    const info = await resized.clone().webp({ quality: 80, effort: 5 }).toFile(path.join(outImg, file));
    const blur = await input.clone().resize(12).webp({ quality: 40 }).toBuffer();
    media[id] = {
      src: `/media/ig/${file}`,
      w: info.width,
      h: info.height,
      blur: `data:image/webp;base64,${blur.toString('base64')}`,
      post: post.code,
      date: post.date,
    };
  }
}

fs.writeFileSync(path.join(root, 'lib/media.generated.json'), JSON.stringify(media, null, 1));
console.log('images', Object.keys(media).length);

// Brand mark: chrome wordmark cut out of its white square (see _source/logo_chrome_cutout.png).
const logo = sharp(path.join(root, '_source/logo_chrome_cutout.png'));
await logo.clone().resize({ width: 1200 }).webp({ quality: 90, alphaQuality: 100 }).toFile(path.join(outBrand, 'light-chrome.webp'));
await logo.clone().resize({ width: 1200 }).png({ compressionLevel: 9 }).toFile(path.join(outBrand, 'light-chrome.png'));
const lm = await sharp(path.join(outBrand, 'light-chrome.webp')).metadata();
console.log('logo', lm.width, lm.height);

// Video loops: muted, trimmed to the strongest stretch, faststart for instant playback.
function cut(input, out, start, dur, width) {
  execFileSync('ffmpeg', [
    '-v', 'error', '-y', '-ss', String(start), '-t', String(dur), '-i', path.join(src, input),
    '-an', '-vf', `scale=${width}:-2,fps=30`, '-c:v', 'libx264', '-preset', 'slow', '-crf', '25',
    '-pix_fmt', 'yuv420p', '-movflags', '+faststart', path.join(outVid, out),
  ]);
}
function poster(input, out, at) {
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-ss', String(at), '-i', path.join(src, input), '-frames:v', '1', '-vf', 'scale=1600:-2', path.join(outVid, out)]);
}

cut('Ddj5474mwHl_0.mp4', 'runway.mp4', 5.2, 23.6, 1280);
poster('Ddj5474mwHl_0.mp4', 'runway-poster.jpg', 9.3);
cut('DdpVWg7qRES_0.mp4', 'forgiven.mp4', 8.4, 10, 1280);
poster('DdpVWg7qRES_0.mp4', 'forgiven-poster.jpg', 15.2);
for (const f of ['runway-poster.jpg', 'forgiven-poster.jpg']) {
  const p = path.join(outVid, f);
  await sharp(p).webp({ quality: 78 }).toFile(p.replace('.jpg', '.webp'));
  fs.unlinkSync(p);
}
for (const f of fs.readdirSync(outVid)) console.log(f, Math.round(fs.statSync(path.join(outVid, f)).size / 1024), 'KB');
