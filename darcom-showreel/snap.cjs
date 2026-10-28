// Screenshots moments of the film:  node snap.cjs <outDir> <t1> <t2> …      (t in seconds)
//   node snap.cjs beats        → one frame per beat (30 frames, at beat + 0.12 s), into out/beats/
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
(async () => {
  const [outDir, ...args] = process.argv.slice(2);
  fs.mkdirSync(outDir, { recursive: true });
  const times = args[0] === 'beats' ? Array.from({ length: 30 }, (_, i) => i * 0.5 + (+args[1] || 0.12)) : args.map(Number);
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') console.log('[page]', m.type(), m.text()); });
  page.on('pageerror', (e) => console.log('[pageerror]', e.message));
  await page.goto('file://' + path.join(__dirname, 'darcom-showreel.html'));
  await page.evaluate(() => window.__ready);
  for (const t of times) {
    const t0 = Date.now();
    await page.evaluate((tt) => window.seek(tt), t);
    await page.screenshot({ path: path.join(outDir, `t${t.toFixed(3).padStart(7, '0')}.png`) });
    console.log('t=' + t.toFixed(3), (Date.now() - t0) + ' ms');
  }
  await browser.close();
})();
