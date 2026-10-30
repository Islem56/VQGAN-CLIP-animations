// Builds the two self-contained HTML files of the film: auraluna-point.html (16:9) and auraluna-point-vertical.html (9:16)
// (template + Montserrat as base64 + the label's outlines + the traced monogram and wordmark + the soundtrack code)
const fs = require('fs'), path = require('path');
const R = (p) => path.join(__dirname, p);
const read = (p, enc) => fs.readFileSync(R(p), enc);
const audio = fs.existsSync(R('src/audio.js')) ? read('src/audio.js', 'utf8') : '';
for (const [format, w, h, out] of [['h', 1920, 1080, 'auraluna-point.html'], ['v', 1080, 1920, 'auraluna-point-vertical.html']]) {
  const html = read('src/film.template.html', 'utf8')
    .replace('__FORMAT__', format).replace(/__W__/g, w).replace(/__H__/g, h)
    .replace('__FONT_B64__', read('assets/montserrat-variable.woff2').toString('base64'))
    .replace('__GLYPHS__', read('assets/glyphs.json', 'utf8').trim())
    .replace('__MONO__', read('assets/monogram.json', 'utf8').trim())
    .replace('__WORDMARK__', read('assets/wordmark.json', 'utf8').trim())
    .replace('__AUDIO__', audio);
  fs.writeFileSync(R(out), html);
  console.log(out, (html.length / 1024).toFixed(0), 'KB');
}
