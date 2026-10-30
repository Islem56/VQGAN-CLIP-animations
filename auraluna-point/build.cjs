// Builds the single self-contained HTML file: auraluna-point.html
// (template + Montserrat as base64 + the label's outlines + the traced monogram and wordmark + the soundtrack code)
const fs = require('fs'), path = require('path');
const R = (p) => path.join(__dirname, p);
const read = (p, enc) => fs.readFileSync(R(p), enc);
let html = read('src/film.template.html', 'utf8');
const audio = fs.existsSync(R('src/audio.js')) ? read('src/audio.js', 'utf8') : '';
html = html
  .replace('__FONT_B64__', read('assets/montserrat-variable.woff2').toString('base64'))
  .replace('__GLYPHS__', read('assets/glyphs.json', 'utf8').trim())
  .replace('__MONO__', read('assets/monogram.json', 'utf8').trim())
  .replace('__WORDMARK__', read('assets/wordmark.json', 'utf8').trim())
  .replace('__AUDIO__', audio);
fs.writeFileSync(R('auraluna-point.html'), html);
console.log('auraluna-point.html', (html.length / 1024).toFixed(0), 'KB');
