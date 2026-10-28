// Builds the single self-contained HTML file: darcom-showreel.html
// (template + the Montserrat variable font as base64 + the glyph outlines + the Web Audio soundtrack code)
const fs = require('fs'), path = require('path');
const R = (p) => path.join(__dirname, p);
const read = (p, enc) => fs.readFileSync(R(p), enc);
let html = read('src/showreel.template.html', 'utf8');
const audio = fs.existsSync(R('src/audio.js')) ? read('src/audio.js', 'utf8') : '';
html = html
  .replace('__FONT_B64__', read('assets/montserrat-variable.woff2').toString('base64'))
  .replace('__GLYPHS__', read('assets/glyphs.json', 'utf8').trim())
  .replace('__AUDIO__', audio);
fs.writeFileSync(R('darcom-showreel.html'), html);
console.log('darcom-showreel.html', (html.length / 1024).toFixed(0), 'KB');
