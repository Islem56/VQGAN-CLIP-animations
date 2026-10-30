// Renders the film:   node render.cjs [--out file.mp4] [--work dir] [--workers 4] [--frames a:b]
//   1. renders the soundtrack with the Web Audio API (OfflineAudioContext) → audio.wav
//   2. renders 60 fps × 3 subframes with Playwright (each subframe = window.seek(t) + screenshot)
//   3. blends every 3 subframes with ffmpeg tmix (motion blur), encodes H.264 and muxes the audio
const { chromium } = require('playwright');
const { spawnSync } = require('child_process');
const fs = require('fs'), path = require('path');

const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > -1 ? process.argv[i + 1] : d; };
const OUT = path.resolve(arg('out', path.join(__dirname, 'out', 'auraluna-point.mp4')));
const WORK = path.resolve(arg('work', path.join(__dirname, 'out', 'frames')));
const WORKERS = +arg('workers', 4);
const FPS = 60, SUB = 3, DUR = 15, NF = FPS * DUR;                       // 900 frames, 2700 subframes
const [F0, F1] = arg('frames', `0:${NF}`).split(':').map(Number);
const VERT = arg('format', 'h') === 'v', VW = VERT ? 1080 : 1920, VH = VERT ? 1920 : 1080;   // --format v → the 9:16 film
const html = 'file://' + path.join(__dirname, VERT ? 'auraluna-point-vertical.html' : 'auraluna-point.html');
const tSub = (f, j) => (f === 0 ? 0 : Math.min(DUR, Math.max(0, f / FPS + (j - 1) / (FPS * SUB))));   // subframes centred on the frame time; frame 0 is the exact first-frame state (= the last frame)

(async () => {
  fs.mkdirSync(path.dirname(OUT), { recursive: true }); fs.mkdirSync(WORK, { recursive: true });
  const browser = await chromium.launch();

  // 1 · soundtrack
  const wavPath = path.join(path.dirname(OUT), 'audio.wav');
  {
    const page = await browser.newPage(); await page.goto(html); await page.evaluate(() => window.__ready);
    const b64 = await page.evaluate(() => window.renderAudio());
    fs.writeFileSync(wavPath, Buffer.from(b64, 'base64')); await page.close();
    console.log('audio →', wavPath, (fs.statSync(wavPath).size / 1e6).toFixed(1) + ' MB');
  }

  // 2 · frames
  const t0 = Date.now(); let done = 0; const total = (F1 - F0) * SUB;
  await Promise.all(Array.from({ length: WORKERS }, async (_, w) => {
    const page = await browser.newPage({ viewport: { width: VW, height: VH } });
    page.on('pageerror', (e) => console.log('[pageerror]', e.message));
    await page.goto(html); await page.evaluate(() => window.__ready);
    for (let f = F0 + w; f < F1; f += WORKERS) {
      for (let j = 0; j < SUB; j++) {
        await page.evaluate((t) => window.seek(t), tSub(f, j));
        fs.writeFileSync(path.join(WORK, `sub_${String((f - F0) * SUB + j).padStart(5, '0')}.jpg`), await page.screenshot({ type: 'jpeg', quality: 95 }));
        if (++done % 150 === 0) console.log(`${done}/${total} subframes · ${((Date.now() - t0) / 1000).toFixed(0)} s`);
      }
    }
    await page.close();
  }));
  await browser.close();
  console.log('frames done in', ((Date.now() - t0) / 1000).toFixed(0), 's');

  // 3 · blend + encode + mux
  const r = spawnSync('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error', '-framerate', String(FPS * SUB), '-i', path.join(WORK, 'sub_%05d.jpg'), '-i', wavPath,
    '-vf', `tmix=frames=${SUB}:weights='1 1 1',select='eq(mod(n\\,${SUB})\\,${SUB - 1})',setpts=N/(${FPS}*TB),format=yuv420p`,
    '-r', String(FPS), '-c:v', 'libx264', '-preset', 'slow', '-crf', '14', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '256k', '-movflags', '+faststart', '-shortest', OUT], { stdio: 'inherit' });
  if (r.status !== 0) process.exit(r.status);
  console.log('→', OUT, (fs.statSync(OUT).size / 1e6).toFixed(1) + ' MB');
})();
