/* ───────────── soundtrack · Web Audio API (OfflineAudioContext) → WAV ─────────────
   96 BPM · 15 s · stereo 48 kHz, in D major (lydian colour). Softer and glassier than a club track: a felt kick,
   FM glass bells, a warm pad that changes chord every bar, wood clicks for the grid of phases, a camera shutter on IMAGE,
   a riser through bar 3 into the drop at 7.5 (the moon lights up), UI ticks and a weight-slider glide on the brand
   board, one lock per module when the mark is rebuilt, and a last bell on the signature. Everything is synthesised. */
window.renderAudio = async () => {
  const SR = 48000, DUR = 15, BEAT = 0.625;
  const ctx = new OfflineAudioContext(2, SR * DUR, SR);
  let seed = 19960505; const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
  const nbuf = ctx.createBuffer(1, SR * 3, SR), nd = nbuf.getChannelData(0); for (let i = 0; i < nd.length; i++) nd[i] = rnd() * 2 - 1;
  const noise = () => { const s = ctx.createBufferSource(); s.buffer = nbuf; s.loop = true; return s; };
  const hz = (m) => 440 * Math.pow(2, (m - 69) / 12);

  /* master: music bus (ducked by the kick) + fx bus → compressor → out; a long soft hall and a dotted-eighth echo */
  const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -18; comp.knee.value = 16; comp.ratio.value = 4; comp.attack.value = 0.004; comp.release.value = 0.2;
  const master = ctx.createGain(); master.gain.value = 0.9; comp.connect(master); master.connect(ctx.destination);
  const mus = ctx.createGain(), fx = ctx.createGain(); mus.connect(comp); fx.connect(comp);
  const irLen = Math.floor(SR * 2.6), ir = ctx.createBuffer(2, irLen, SR);
  for (let c = 0; c < 2; c++) { const d = ir.getChannelData(c); for (let i = 0; i < irLen; i++) d[i] = (rnd() * 2 - 1) * Math.pow(1 - i / irLen, 2.6) * (i < SR * 0.02 ? i / (SR * 0.02) : 1); }
  const rev = ctx.createConvolver(); rev.buffer = ir; const revLP = ctx.createBiquadFilter(); revLP.type = 'lowpass'; revLP.frequency.value = 6500; const revG = ctx.createGain(); revG.gain.value = 0.32; rev.connect(revLP); revLP.connect(revG); revG.connect(comp);
  const dly = ctx.createDelay(1); dly.delayTime.value = BEAT * 0.75; const dfb = ctx.createGain(); dfb.gain.value = 0.36; const dlp = ctx.createBiquadFilter(); dlp.type = 'lowpass'; dlp.frequency.value = 3000;
  dly.connect(dlp); dlp.connect(dfb); dfb.connect(dly); const dG = ctx.createGain(); dG.gain.value = 0.26; dlp.connect(dG); dG.connect(comp); dG.connect(rev);
  const send = (node, r = 0.2, d = 0) => { const a = ctx.createGain(); a.gain.value = r; node.connect(a); a.connect(rev); if (d) { const b = ctx.createGain(); b.gain.value = d; node.connect(b); b.connect(dly); } };
  const pan = (p) => { const n = ctx.createStereoPanner(); n.pan.value = p; return n; };
  const env = (g, t, a, peak, d) => { g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + a + d); };

  /* ── percussion ── */
  const KICKS = [];
  const kick = (t, v = 1) => {
    KICKS.push([t, v]);
    const o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'sine';
    o.frequency.setValueAtTime(128, t); o.frequency.exponentialRampToValueAtTime(42, t + 0.13);
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.95 * v, t + 0.003); g.gain.exponentialRampToValueAtTime(0.001, t + 0.48);
    o.connect(g); g.connect(fx); o.start(t); o.stop(t + 0.5);
    const n = noise(), f = ctx.createBiquadFilter(), ng = ctx.createGain(); f.type = 'bandpass'; f.frequency.value = 1400; f.Q.value = 0.8; env(ng, t, 0.001, 0.08 * v, 0.02);
    n.connect(f); f.connect(ng); ng.connect(fx); n.start(t, rnd() * 2); n.stop(t + 0.04);
  };
  const hat = (t, v = 0.08, p = 0.3, open = false) => {
    const n = noise(), f = ctx.createBiquadFilter(), g = ctx.createGain(); f.type = 'highpass'; f.frequency.value = 8200; env(g, t, 0.001, v, open ? 0.2 : 0.03);
    n.connect(f); f.connect(g); g.connect(pan(p)).connect(fx); n.start(t, rnd() * 2); n.stop(t + 0.3);
  };
  const shaker = (t, v = 0.05, p = 0) => {
    const n = noise(), f = ctx.createBiquadFilter(), g = ctx.createGain(); f.type = 'bandpass'; f.frequency.value = 6000; f.Q.value = 1.2;
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(v, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.09);
    n.connect(f); f.connect(g); g.connect(pan(p)).connect(fx); n.start(t, rnd() * 2); n.stop(t + 0.12);
  };
  const snap = (t, v = 0.2) => {
    const n = noise(), f = ctx.createBiquadFilter(), g = ctx.createGain(); f.type = 'bandpass'; f.frequency.value = 2200; f.Q.value = 1.1; env(g, t, 0.001, v, 0.12);
    n.connect(f); f.connect(g); g.connect(fx); send(g, 0.35); n.start(t, rnd() * 2); n.stop(t + 0.2);
  };
  const shutter = (t, v = 0.3, close = true) => {                       // a camera shutter: two clicks and a small mechanical thunk
    [0, close ? 0.018 : 0.026].forEach((dt, i) => {
      const n = noise(), f = ctx.createBiquadFilter(), g = ctx.createGain(); f.type = 'bandpass'; f.frequency.value = i ? 2600 : 4200; f.Q.value = 2.2; env(g, t + dt, 0.0005, v * (i ? 0.8 : 1), 0.016);
      n.connect(f); f.connect(g); g.connect(fx); send(g, 0.12); n.start(t + dt, rnd() * 2); n.stop(t + dt + 0.04);
    });
    const o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'sine'; o.frequency.setValueAtTime(220, t); o.frequency.exponentialRampToValueAtTime(90, t + 0.05); env(g, t, 0.001, v * 0.5, 0.05);
    o.connect(g); g.connect(fx); o.start(t); o.stop(t + 0.08);
  };

  /* ── tonal ── */
  const bass = (t, m, d = 0.3, v = 0.42) => {
    const o = ctx.createOscillator(), o2 = ctx.createOscillator(), f = ctx.createBiquadFilter(), g = ctx.createGain(); o.type = 'triangle'; o2.type = 'sine'; o.frequency.value = hz(m); o2.frequency.value = hz(m) / 2;
    f.type = 'lowpass'; f.frequency.value = 260; g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(v, t + 0.01); g.gain.setValueAtTime(v, t + d * 0.6); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    o.connect(f); o2.connect(f); f.connect(g); g.connect(mus); o.start(t); o2.start(t); o.stop(t + d + 0.02); o2.stop(t + d + 0.02);
  };
  const pad = (t, d, notes, v = 0.05, open = 1400) => {
    const f = ctx.createBiquadFilter(), g = ctx.createGain(); f.type = 'lowpass'; f.Q.value = 0.6; f.frequency.setValueAtTime(500, t); f.frequency.exponentialRampToValueAtTime(open, t + d * 0.6);
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(v, t + Math.min(0.35, d * 0.3)); g.gain.setValueAtTime(v, t + d - 0.3); g.gain.exponentialRampToValueAtTime(0.0001, t + d + 0.5);
    notes.forEach((m, i) => [-6, 6].forEach((dt) => { const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = hz(m); o.detune.value = dt + (i % 2 ? 2 : -2); o.connect(f); o.start(t); o.stop(t + d + 0.6); }));
    f.connect(g); g.connect(mus); send(g, 0.5);
  };
  const glass = (t, m, v = 0.1, d = 1.6, p = 0) => {                     // FM bell: a sine modulated at 3.5×, its brightness decays first
    const c = ctx.createOscillator(), mo = ctx.createOscillator(), mg = ctx.createGain(), g = ctx.createGain(), f0 = hz(m);
    c.frequency.value = f0; mo.frequency.value = f0 * 3.5; mg.gain.setValueAtTime(f0 * 2.2, t); mg.gain.exponentialRampToValueAtTime(f0 * 0.05, t + d * 0.5);
    mo.connect(mg); mg.connect(c.frequency); env(g, t, 0.003, v, d);
    const pn = pan(p); c.connect(g); g.connect(pn); pn.connect(fx); send(pn, 0.45, 0.25); c.start(t); mo.start(t); c.stop(t + d + 0.1); mo.stop(t + d + 0.1);
  };
  const wood = (t, m, v = 0.12, p = 0) => {                              // a marimba-ish click: fundamental + a fast 4th partial
    const g = ctx.createGain(); env(g, t, 0.001, v, 0.22);
    [[1, 1, 0.22], [3.93, 0.35, 0.05], [9.4, 0.12, 0.015]].forEach(([k, a, dd]) => { const o = ctx.createOscillator(), og = ctx.createGain(); o.type = 'sine'; o.frequency.value = hz(m) * k; env(og, t, 0.001, a, dd); o.connect(og); og.connect(g); o.start(t); o.stop(t + 0.3); });
    const pn = pan(p); g.connect(pn); pn.connect(fx); send(pn, 0.25, 0.2);
  };
  const pluck = (t, m, v = 0.08, p = 0) => {
    const o = ctx.createOscillator(), f = ctx.createBiquadFilter(), g = ctx.createGain(); o.type = 'triangle'; o.frequency.value = hz(m);
    f.type = 'lowpass'; f.frequency.setValueAtTime(5000, t); f.frequency.exponentialRampToValueAtTime(700, t + 0.2); env(g, t, 0.002, v, 0.3);
    o.connect(f); f.connect(g); const pn = pan(p); g.connect(pn); pn.connect(mus); send(pn, 0.3, 0.35); o.start(t); o.stop(t + 0.4);
  };
  const tick = (t, f0, v = 0.08, p = 0) => {
    const o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'sine'; o.frequency.value = f0; env(g, t, 0.0006, v, 0.025);
    const pn = pan(p); o.connect(g); g.connect(pn); pn.connect(fx); send(pn, 0.1); o.start(t); o.stop(t + 0.05);
  };
  const glide = (t, d, f0, f1, v = 0.06, p = 0) => {                   // the weight slider
    const o = ctx.createOscillator(), f = ctx.createBiquadFilter(), g = ctx.createGain(); o.type = 'triangle'; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + d);
    f.type = 'lowpass'; f.frequency.value = 2400; g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(v, t + 0.04); g.gain.setValueAtTime(v, t + d - 0.06); g.gain.exponentialRampToValueAtTime(0.0001, t + d + 0.06);
    const pn = pan(p); o.connect(f); f.connect(g); g.connect(pn); pn.connect(fx); send(pn, 0.25, 0.2); o.start(t); o.stop(t + d + 0.1);
  };

  /* ── air: whooshes, swells, risers, impacts ── */
  const whoosh = (t0, d, f0, f1, v = 0.22, p0 = 0, p1 = 0, up = true) => {
    const n = noise(), f = ctx.createBiquadFilter(), g = ctx.createGain(), pn = pan(p0); f.type = 'bandpass'; f.Q.value = 1.1;
    f.frequency.setValueAtTime(f0, t0); f.frequency.exponentialRampToValueAtTime(f1, t0 + d); pn.pan.setValueAtTime(p0, t0); pn.pan.linearRampToValueAtTime(p1, t0 + d);
    g.gain.setValueAtTime(0.0001, t0); if (up) { g.gain.exponentialRampToValueAtTime(v, t0 + d * 0.94); g.gain.linearRampToValueAtTime(0, t0 + d); } else { g.gain.linearRampToValueAtTime(v, t0 + d * 0.15); g.gain.exponentialRampToValueAtTime(0.0001, t0 + d); }
    n.connect(f); f.connect(g); g.connect(pn); pn.connect(fx); send(pn, 0.3); n.start(t0, rnd() * 2); n.stop(t0 + d + 0.05);
  };
  const riser = (t0, d, v = 0.4) => {
    whoosh(t0, d, 200, 10000, v, -0.6, 0.6, true);
    [0, 7].forEach((iv) => {
      const o = ctx.createOscillator(), f = ctx.createBiquadFilter(), g = ctx.createGain(); o.type = 'sawtooth'; o.frequency.setValueAtTime(hz(50 + iv), t0); o.frequency.exponentialRampToValueAtTime(hz(74 + iv), t0 + d);
      f.type = 'lowpass'; f.frequency.setValueAtTime(400, t0); f.frequency.exponentialRampToValueAtTime(6000, t0 + d); g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(v * 0.16, t0 + d * 0.97); g.gain.linearRampToValueAtTime(0, t0 + d);
      o.connect(f); f.connect(g); g.connect(fx); send(g, 0.25); o.start(t0); o.stop(t0 + d + 0.02);
    });
  };
  const impact = (t, v = 1, big = false) => {
    const o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'sine'; o.frequency.setValueAtTime(big ? 80 : 95, t); o.frequency.exponentialRampToValueAtTime(32, t + (big ? 1.0 : 0.45));
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.85 * v, t + 0.005); g.gain.exponentialRampToValueAtTime(0.0001, t + (big ? 1.8 : 0.7)); o.connect(g); g.connect(fx); o.start(t); o.stop(t + 2);
    const n = noise(), f = ctx.createBiquadFilter(), ng = ctx.createGain(); f.type = 'highpass'; f.frequency.value = 2400; env(ng, t, 0.002, (big ? 0.2 : 0.1) * v, big ? 1.6 : 0.4);
    n.connect(f); f.connect(ng); ng.connect(fx); send(ng, 0.6); n.start(t, rnd() * 2); n.stop(t + 2);
  };
  const swell = (t1, d, v = 0.2) => {                                   // a reversed breath that stops dead on t1
    const n = noise(), f = ctx.createBiquadFilter(), g = ctx.createGain(); f.type = 'lowpass'; f.frequency.setValueAtTime(600, t1 - d); f.frequency.exponentialRampToValueAtTime(9000, t1);
    g.gain.setValueAtTime(0.0001, t1 - d); g.gain.exponentialRampToValueAtTime(v, t1 - 0.005); g.gain.linearRampToValueAtTime(0, t1);
    n.connect(f); f.connect(g); g.connect(fx); n.start(t1 - d, rnd() * 2); n.stop(t1 + 0.02);
  };

  /* ── the arrangement: one chord per bar ── */
  const CH = [[50, 54, 57, 61, 64], [47, 50, 54, 57, 61], [43, 50, 54, 57, 61], [50, 57, 61, 64, 66, 69], [52, 55, 59, 62, 66], [43, 50, 54, 57, 62]];   // Dmaj9 · Bm9 · Gmaj9 · Dmaj9 (open) · Em9 · Gmaj7 → D
  const ROOT = [38, 35, 31, 38, 40, 43];
  CH.forEach((c, b) => pad(b * 2.5, b === 5 ? 2.2 : 2.5, c, b === 3 ? 0.06 : 0.042, b === 3 ? 2600 : 1500));

  /* bar 1 · the mark comes apart and closes into a moon */
  whoosh(0.04, 0.4, 2600, 500, 0.12, 0, 0, false);
  [[0.06, -0.7], [0.08, 0.7], [0.11, -0.5]].forEach(([t, p]) => whoosh(t, 0.36, 3200, 700, 0.14, p * 0.4, p, false));
  impact(0.625, 0.55); kick(0.625, 0.7); [74, 81, 88].forEach((m, i) => glass(0.625 + i * 0.02, m, 0.075 - i * 0.015, 2.0, (i - 1) * 0.4));
  whoosh(1.25, 0.7, 6000, 900, 0.16, 0.6, -0.4, false); glass(1.25, 83, 0.06, 1.6, 0.4);                      // the terminator sweeps across
  pluck(1.875, 73, 0.08, -0.3); tick(1.875, 2400, 0.06, 0.3); glass(1.875, 78, 0.05, 1.2, -0.3);              // the ring tilts
  whoosh(1.95, 0.55, 300, 7000, 0.3, 0, 0, true); swell(2.5, 0.6, 0.16);                                        // the dive into the crescent
  for (let k = 1; k < 4; k++) bass(k * BEAT, ROOT[0], 0.5, 0.3);

  /* bar 2 · the words */
  impact(2.5, 0.7);
  for (let k = 4; k < 8; k++) { kick(k * BEAT, 0.9); bass(k * BEAT, ROOT[1], 0.28, 0.42); bass(k * BEAT + 0.3125, ROOT[1] + 12, 0.2, 0.22); hat(k * BEAT + 0.3125, 0.07, 0.3); }
  [59, 62, 66, 69, 73, 74].forEach((m, i) => pluck(2.5 + i * 0.07, m, 0.07, (i % 2 ? 0.35 : -0.35)));             // IDENTITÉ is lit letter by letter
  whoosh(2.5, 0.42, 900, 4500, 0.1, -0.6, 0.6, false);
  shutter(3.0, 0.32, true); shutter(3.125, 0.28, false); glass(3.125, 81, 0.05, 1.0, 0.2);                       // IMAGE: the shutter
  shutter(3.62, 0.3, true); shutter(3.75, 0.26, false);
  [62, 64, 66, 69, 71, 73].forEach((m, i) => wood(3.75 + 0.045 * i, m + 12, 0.1, (i - 2.5) / 3));             // MOTION: one flip per letter
  whoosh(4.24, 0.32, 5000, 700, 0.2, 0.7, -0.7, false); glass(4.375, 78, 0.07, 1.4, -0.2); snap(4.375, 0.16);   // UNIVERS pushes in
  whoosh(4.6, 0.4, 250, 6000, 0.3, -0.6, 0.4, true); swell(5.0, 0.4, 0.14);                                     // the quarter disc sweeps the frame

  /* bar 3 · the grid of phases: wood clicks on every turn, the riser into the drop */
  impact(5.0, 0.5); kick(5.0, 0.85); kick(6.25, 0.8);
  const LYD = [67, 69, 71, 73, 74, 76, 78, 79];
  for (let i = 0; i < 12; i++) wood(5.0 + i * 0.022, LYD[(i * 3) % 8] + 12, 0.07, (i % 2 ? 0.5 : -0.5));
  [5.625, 6.25, 6.875].forEach((t, b) => { for (let i = 0; i < 10; i++) wood(t + i * (0.022 + 0.008 * b), LYD[(i * (b + 2)) % 8] + (b === 2 ? 12 : 0) + 12, 0.075, ((i % 3) - 1) * 0.6); pluck(t, CH[2][b + 1] + 12, 0.07, 0); });
  for (let k = 8; k < 12; k++) { bass(k * BEAT, ROOT[2], 0.3, 0.38); hat(k * BEAT + 0.3125, 0.06, -0.3); }
  for (let i = 0; i < 16; i++) shaker(5.0 + i * 0.15625, 0.03 + i * 0.002, i % 2 ? 0.4 : -0.4);
  riser(5.6, 1.82, 0.42);
  for (let i = 0; i < 8; i++) snap(6.875 + i * 0.066, 0.05 + i * 0.016);
  for (let i = 0; i < 10; i++) tick(7.08 + i * 0.034, 3000 - i * 120, 0.05, ((i % 2) - 0.5));                   // the grid collapses

  /* bar 4 · the drop: the moon lights up */
  impact(7.5, 1.15, true); glass(7.5, 86, 0.07, 2.4, 0.3); glass(7.52, 81, 0.06, 2.4, -0.3);
  for (let k = 12; k < 16; k++) { kick(k * BEAT, 1); bass(k * BEAT, ROOT[3], 0.3, 0.5); bass(k * BEAT + 0.3125, ROOT[3] + 12, 0.18, 0.28); hat(k * BEAT + 0.3125, 0.09, 0.25, k === 15); hat(k * BEAT + 0.156, 0.035, -0.4); }
  snap(8.125, 0.18); snap(9.375, 0.18);
  whoosh(8.05, 0.4, 4000, 800, 0.16, -0.6, 0.6, false); glass(8.125, 81, 0.055, 1.4, 0.5);                      // the light swings
  whoosh(8.68, 0.4, 3500, 600, 0.16, 0.6, -0.6, false); glass(8.75, 78, 0.055, 1.4, -0.5);
  whoosh(9.3, 0.3, 900, 3000, 0.12, 0, 0, false); glass(9.375, 74, 0.06, 1.4, 0);
  for (let i = 0; i < 8; i++) pluck(7.5 + i * 0.3125, [74, 78, 81, 85][i % 4], 0.05, i % 2 ? 0.45 : -0.45);
  whoosh(9.45, 0.55, 300, 8000, 0.3, 0, 0, true); swell(10.0, 0.5, 0.15);                                       // the dive into the light

  /* bar 5 · the brand board */
  impact(10.0, 0.45); kick(10.0, 0.8); kick(11.25, 0.75); snap(10.625, 0.14); snap(11.875, 0.14);
  for (let k = 16; k < 20; k++) { bass(k * BEAT, ROOT[4], 0.28, 0.32); hat(k * BEAT + 0.3125, 0.05, 0.3); }
  for (let i = 0; i < 14; i++) tick(10.02 + 0.035 * i, 1800 + i * 90, 0.03, (i % 2 ? 0.4 : -0.4));              // the construction lines draw
  for (let i = 0; i < 6; i++) wood(10.625 + 0.05 * i + 0.1, [64, 66, 69, 71, 74, 76][i] + 12, 0.08, (i - 2.5) / 3);   // the modules fill in
  for (let i = 0; i < 3; i++) glide(10.625 + 0.07 * i, 0.22, 300, 900, 0.035, (i - 1) * 0.5);                  // the swatches rise
  for (let i = 0; i < 22; i++) tick(11.25 + i * 0.026, 2600 + (i % 4) * 340, 0.028, ((i % 3) - 1) * 0.5);       // the hex codes decode
  glass(11.25, 76, 0.05, 1.2, 0.3); glide(11.25, 0.47, 220, 880, 0.05, 0.4); glide(11.72, 0.38, 880, 330, 0.045, 0.4);   // the weight axis
  whoosh(12.0, 0.5, 220, 5200, 0.28, 0.2, -0.2, true); swell(12.5, 0.45, 0.14);                                // the ink floods

  /* bar 6 · the mark is rebuilt, the wordmark rises, the signature */
  impact(12.5, 0.5); kick(12.5, 0.7);
  [[12.5, 74, -0.6], [12.56, 78, 0], [12.62, 81, 0.6], [13.125, 69, -0.6], [13.185, 73, 0], [13.245, 76, 0.6]].forEach(([t0, m, p]) => {
    whoosh(t0, 0.28, 2600, 600, 0.09, p, p * 0.3, false);
    const t = t0 + 0.27, o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'sine'; o.frequency.setValueAtTime(110, t); o.frequency.exponentialRampToValueAtTime(52, t + 0.12); env(g, t, 0.002, 0.32, 0.16); o.connect(g); g.connect(fx); o.start(t); o.stop(t + 0.2);
    glass(t, m, 0.05, 1.2, p); wood(t, m - 12, 0.06, p);
  });
  bass(12.5, ROOT[5], 0.6, 0.3); bass(13.125, ROOT[5], 0.6, 0.28);
  [62, 66, 69, 73, 74, 78, 81, 85].forEach((m, i) => pluck(13.75 + 0.035 * i, m, 0.055, (i - 3.5) / 5));           // AURA LUNA rises
  pad(13.75, 1.25, [50, 57, 61, 64, 66], 0.04, 2000); bass(13.75, 38, 1.0, 0.32);
  glass(14.375, 86, 0.06, 1.8, 0); glass(14.4, 81, 0.045, 1.8, -0.3); glass(14.42, 74, 0.04, 1.8, 0.3);       // the signature

  /* the kick ducks the music bus (sidechain by automation) */
  mus.gain.setValueAtTime(1, 0);
  KICKS.sort((a, b) => a[0] - b[0]).forEach(([t, v]) => { mus.gain.setValueAtTime(1, Math.max(0, t - 0.002)); mus.gain.linearRampToValueAtTime(1 - 0.55 * v, t + 0.005); mus.gain.linearRampToValueAtTime(1, t + 0.3); });

  /* render, fade the very end (the loop restarts clean), encode */
  const buf = await ctx.startRendering();
  const L = buf.getChannelData(0), R = buf.getChannelData(1), N = L.length, fadeN = Math.floor(SR * 0.3);
  let peak = 0; for (let i = 0; i < N; i++) peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
  const g = 0.89 / (peak || 1);
  const pcm = new Int16Array(N * 2);
  for (let i = 0; i < N; i++) { const fade = i > N - fadeN ? (N - i) / fadeN : 1; pcm[2 * i] = Math.max(-1, Math.min(1, L[i] * g * fade)) * 32767; pcm[2 * i + 1] = Math.max(-1, Math.min(1, R[i] * g * fade)) * 32767; }
  const wav = new DataView(new ArrayBuffer(44 + pcm.length * 2)); const w4 = (o, s) => { for (let i = 0; i < 4; i++) wav.setUint8(o + i, s.charCodeAt(i)); };
  w4(0, 'RIFF'); wav.setUint32(4, 36 + pcm.length * 2, true); w4(8, 'WAVE'); w4(12, 'fmt '); wav.setUint32(16, 16, true); wav.setUint16(20, 1, true); wav.setUint16(22, 2, true);
  wav.setUint32(24, SR, true); wav.setUint32(28, SR * 4, true); wav.setUint16(32, 4, true); wav.setUint16(34, 16, true); w4(36, 'data'); wav.setUint32(40, pcm.length * 2, true);
  for (let i = 0; i < pcm.length; i++) wav.setInt16(44 + i * 2, pcm[i], true);
  const bytes = new Uint8Array(wav.buffer); let bin = ''; for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
  return btoa(bin);
};
