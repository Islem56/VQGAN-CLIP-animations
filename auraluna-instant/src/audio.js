/* ───────────── soundtrack · Web Audio API (OfflineAudioContext) → WAV ─────────────
   96 BPM · 17.5 s · stereo 48 kHz, in D major. Cinematic first, then rhythmic: the lock-up is sucked into the spark,
   a sub drone and a heartbeat under the hands, one glass note per word of the concept line, a bright impact on the touch;
   then the crafts (digital stutter, a pencil drawing, a REC beep), wood clicks on the grid of phases, a riser into the
   drop at 10.0 (the moon lights up), the filter closing on the eclipse, UI ticks on the guidelines page, one lock per
   module of the mark, a last bell on the signature. Everything is synthesised, no samples. */
window.renderAudio = async () => {
  const SR = 48000, DUR = 17.5, BEAT = 0.625;
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

  /* extra voices for this film */
  const drone = (t, d, m, v = 0.1) => {                                  // a sub and its fifth, slowly opening
    const f = ctx.createBiquadFilter(), g = ctx.createGain(); f.type = 'lowpass'; f.frequency.setValueAtTime(120, t); f.frequency.exponentialRampToValueAtTime(600, t + d);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + d * 0.5); g.gain.setValueAtTime(v, t + d - 0.2); g.gain.exponentialRampToValueAtTime(0.0001, t + d + 0.3);
    [[m, 'sine'], [m + 7, 'sine'], [m + 12, 'triangle']].forEach(([n, ty], i) => { const o = ctx.createOscillator(); o.type = ty; o.frequency.value = hz(n); o.detune.value = i * 3; const og = ctx.createGain(); og.gain.value = [1, 0.5, 0.25][i]; o.connect(og); og.connect(f); o.start(t); o.stop(t + d + 0.4); });
    f.connect(g); g.connect(mus); send(g, 0.3);
  };
  const thump = (t, v = 0.5, f0 = 70) => { const o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'sine'; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(38, t + 0.16); env(g, t, 0.004, v, 0.26); o.connect(g); g.connect(fx); o.start(t); o.stop(t + 0.32); };
  const suck = (t1, d, v = 0.25) => {                                     // a reversed rush into t1, pitch falling
    swell(t1, d, v);
    const o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'sine'; o.frequency.setValueAtTime(900, t1 - d); o.frequency.exponentialRampToValueAtTime(120, t1);
    g.gain.setValueAtTime(0.0001, t1 - d); g.gain.exponentialRampToValueAtTime(v * 0.3, t1 - 0.01); g.gain.linearRampToValueAtTime(0, t1); o.connect(g); g.connect(fx); o.start(t1 - d); o.stop(t1 + 0.02);
  };
  const shimmer = (t, d = 1.6, v = 0.06) => { const n = noise(), f = ctx.createBiquadFilter(), g = ctx.createGain(); f.type = 'highpass'; f.frequency.value = 7000; env(g, t, 0.01, v, d); n.connect(f); f.connect(g); g.connect(fx); send(g, 0.6, 0.3); n.start(t, rnd() * 2); n.stop(t + d + 0.1); };
  const scribble = (t, d = 0.32, v = 0.12) => {                           // a pencil drawing the outlines
    const n = noise(), f = ctx.createBiquadFilter(), g = ctx.createGain(), pn = pan(-0.4); f.type = 'bandpass'; f.Q.value = 3;
    for (let i = 0; i <= 12; i++) { const tt = t + d * i / 12; f.frequency.setValueAtTime(2200 + 1800 * Math.sin(i * 2.1) ** 2, tt); pn.pan.setValueAtTime(-0.5 + i / 12, tt); }
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(v, t + 0.03); g.gain.setValueAtTime(v, t + d - 0.05); g.gain.linearRampToValueAtTime(0, t + d);
    n.connect(f); f.connect(g); g.connect(pn); pn.connect(fx); send(pn, 0.15); n.start(t, rnd() * 2); n.stop(t + d + 0.02);
  };
  const beep = (t, f0 = 1000, v = 0.08) => { const o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'sine'; o.frequency.value = f0; g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(v, t + 0.004); g.gain.setValueAtTime(v, t + 0.055); g.gain.linearRampToValueAtTime(0, t + 0.062); o.connect(g); g.connect(fx); send(g, 0.1); o.start(t); o.stop(t + 0.08); };
  const blip = (t, f0, v = 0.05, p = 0) => { const o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'square'; o.frequency.value = f0; env(g, t, 0.0005, v, 0.02); const pn = pan(p); o.connect(g); g.connect(pn); pn.connect(fx); o.start(t); o.stop(t + 0.04); };

  /* ── the arrangement ── */
  const CH = [[62, 64, 69, 74, 76], [59, 62, 66, 69, 73], [55, 62, 66, 69, 71], [52, 55, 59, 62, 66], [50, 57, 61, 64, 66, 69], [47, 54, 57, 62, 64], [43, 50, 54, 57, 62]];   // Dadd9 · Bm9 · Gmaj9 · Em9 · Dmaj9 (open) · Bm11 · Gmaj9 → D
  const ROOT = [38, 35, 31, 40, 38, 35, 43];

  /* bar 1 · the lock-up falls into the spark; the hands come in */
  suck(0.6, 0.56, 0.2); impact(0.62, 0.55); thump(0.62, 0.5);
  [86, 93, 98].forEach((m, i) => glass(0.62 + i * 0.025, m, 0.06 - i * 0.012, 2.2, (i - 1) * 0.5)); shimmer(0.62, 2.0, 0.05);
  drone(0.6, 4.4, 26, 0.16); pad(0.62, 1.9, CH[0], 0.03, 1100); pad(2.5, 2.5, CH[1], 0.034, 1300);
  whoosh(0.72, 0.95, 600, 2400, 0.12, -0.9, -0.2, false); whoosh(0.88, 0.95, 600, 2600, 0.12, 0.9, 0.2, false);
  thump(1.25, 0.3); glass(1.25, 81, 0.04, 1.4, -0.3); thump(1.875, 0.32); glass(1.875, 85, 0.04, 1.4, 0.3);

  /* bar 2 · « L'instant où une idée devient image. »: a heartbeat, one glass note per word, the touch */
  [[2.5, 74], [3.125, 78], [3.75, 81], [4.375, 86]].forEach(([t, m], i) => { thump(t, 0.38 + i * 0.07); glass(t, m, 0.065, 1.8, (i % 2 ? 0.3 : -0.3)); pluck(t, m - 12, 0.05, 0); });
  [2.8125, 3.4375, 4.0625].forEach((t) => thump(t, 0.16, 60));
  whoosh(3.75, 0.9, 5000, 500, 0.13, 0, 0, false); impact(3.75, 0.35);                                            // the Éclipse ring
  riser(4.0, 0.44, 0.22); impact(4.44, 0.85); [93, 98, 100].forEach((m, i) => glass(4.44 + i * 0.02, m, 0.055, 1.6, (i - 1) * 0.6)); shimmer(4.44, 1.2, 0.08);
  swell(5.0, 0.52, 0.2);

  /* bar 3 · the crafts */
  impact(5.0, 0.6);
  for (let k = 8; k < 12; k++) { kick(k * BEAT, 0.95); bass(k * BEAT, ROOT[2], 0.28, 0.42); bass(k * BEAT + 0.3125, ROOT[2] + 12, 0.2, 0.22); hat(k * BEAT + 0.3125, 0.07, 0.3); hat(k * BEAT + 0.156, 0.03, -0.3); }
  pad(5.0, 2.5, CH[2], 0.034, 1600);
  for (let i = 0; i < 9; i++) blip(5.0 + i * 0.029, 1200 + 180 * i, 0.045, (i % 2 ? 0.5 : -0.5));             // DIGITAL, in steps
  for (let i = 0; i < 5; i++) blip(5.02 + i * 0.06, 300 + 120 * i, 0.04, 0);
  scribble(5.625, 0.3, 0.13); thump(5.9, 0.3, 90); [66, 69, 73].forEach((m, i) => pluck(5.92 + i * 0.03, m + 12, 0.06, (i - 1) * 0.4));   // DESIGN: drawn, then filled
  beep(6.25, 1000, 0.09); beep(6.35, 1000, 0.09); shutter(6.25, 0.26, false); impact(6.25, 0.4);                  // PRODUCTION: REC
  for (let i = 0; i < 10; i++) tick(6.3 + i * 0.05, 2600, 0.025, 0.6);                                             // the timecode
  [62, 66, 69, 74].forEach((m, i) => pluck(6.875 + i * 0.012, m, 0.07, (i - 1.5) * 0.3)); [6.95, 7.0, 7.05].forEach((t) => tick(t, 3400, 0.05, 0));   // the descriptor line
  whoosh(7.04, 0.46, 250, 6500, 0.3, 0, 0, true); swell(7.5, 0.42, 0.16);                                          // the eclipse closes the frame

  /* bar 4 · the grid of phases, the riser into the drop */
  impact(7.5, 0.5); kick(7.5, 0.85); kick(8.75, 0.8);
  const LYD = [67, 69, 71, 73, 74, 76, 78, 79];
  for (let i = 0; i < 12; i++) wood(7.5 + i * 0.022, LYD[(i * 3) % 8] + 12, 0.07, (i % 2 ? 0.5 : -0.5));
  [8.125, 8.75, 9.375].forEach((t, b) => { for (let i = 0; i < 10; i++) wood(t + i * (0.022 + 0.008 * b), LYD[(i * (b + 2)) % 8] + (b === 2 ? 12 : 0) + 12, 0.075, ((i % 3) - 1) * 0.6); pluck(t, CH[3][b + 1] + 12, 0.06, 0); });
  for (let k = 12; k < 16; k++) { bass(k * BEAT, ROOT[3], 0.3, 0.36); hat(k * BEAT + 0.3125, 0.06, -0.3); }
  pad(7.5, 2.4, CH[3], 0.034, 1500);
  for (let i = 0; i < 16; i++) shaker(7.5 + i * 0.15625, 0.03 + i * 0.002, i % 2 ? 0.4 : -0.4);
  riser(8.1, 1.82, 0.42);
  for (let i = 0; i < 8; i++) snap(9.375 + i * 0.066, 0.05 + i * 0.016);
  for (let i = 0; i < 10; i++) tick(9.6 + i * 0.034, 3000 - i * 120, 0.05, ((i % 2) - 0.5));

  /* bar 5 · the drop: the moon lights up in six violets, then the eclipse, then the full moon */
  impact(10.0, 1.15, true); [86, 81, 93].forEach((m, i) => glass(10.0 + i * 0.02, m, 0.065, 2.4, (i - 1) * 0.5)); shimmer(10.0, 1.4, 0.06);
  for (let k = 16; k < 20; k++) { kick(k * BEAT, 1); bass(k * BEAT, ROOT[4], 0.3, 0.5); bass(k * BEAT + 0.3125, ROOT[4] + 12, 0.18, 0.28); hat(k * BEAT + 0.3125, 0.09, 0.25, k === 19); hat(k * BEAT + 0.156, 0.035, -0.4); }
  snap(10.625, 0.18); snap(11.875, 0.18);
  { const f = ctx.createBiquadFilter(), g = ctx.createGain(); f.type = 'lowpass'; f.frequency.setValueAtTime(2800, 10.0); f.frequency.setValueAtTime(2800, 11.2); f.frequency.exponentialRampToValueAtTime(260, 11.5); f.frequency.setValueAtTime(260, 11.85); f.frequency.exponentialRampToValueAtTime(3200, 12.0);
    g.gain.setValueAtTime(0.0001, 10.0); g.gain.linearRampToValueAtTime(0.06, 10.3); g.gain.setValueAtTime(0.06, 12.2); g.gain.exponentialRampToValueAtTime(0.0001, 12.8);
    CH[4].forEach((m, i) => [-6, 6].forEach((dt) => { const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = hz(m); o.detune.value = dt + (i % 2 ? 2 : -2); o.connect(f); o.start(10.0); o.stop(12.9); }));
    f.connect(g); g.connect(mus); send(g, 0.45); }                                                                // the pad, its filter closing on the eclipse
  whoosh(10.55, 0.4, 4000, 800, 0.15, -0.6, 0.6, false); glass(10.625, 81, 0.05, 1.4, 0.5);
  whoosh(11.2, 0.5, 2600, 300, 0.16, 0.6, -0.6, false); thump(11.25, 0.5, 55); glass(11.25, 69, 0.045, 2.0, 0);   // the eclipse
  glass(11.875, 86, 0.06, 1.6, 0); glass(11.9, 90, 0.04, 1.6, 0.4); shimmer(11.875, 0.8, 0.05);                  // the full moon
  for (let i = 0; i < 8; i++) pluck(10.0 + i * 0.3125, [74, 78, 81, 85][i % 4], 0.05, i % 2 ? 0.45 : -0.45);
  whoosh(11.98, 0.5, 300, 8000, 0.3, 0, 0, true); swell(12.5, 0.48, 0.15);

  /* bar 6 · the guidelines page */
  impact(12.5, 0.45); kick(12.5, 0.8); kick(13.75, 0.75); snap(13.125, 0.14); snap(14.375, 0.14);
  for (let k = 20; k < 24; k++) { bass(k * BEAT, ROOT[5], 0.28, 0.32); hat(k * BEAT + 0.3125, 0.05, 0.3); }
  pad(12.5, 2.0, CH[5], 0.03, 1500);
  for (let i = 0; i < 5; i++) tick(12.5 + 0.05 * i, 2000 + 200 * i, 0.03, (i % 2 ? 0.4 : -0.4));                // the header, the title
  for (let i = 0; i < 6; i++) glide(13.125 + 0.06 * i, 0.3, 260 + 40 * i, 780 + 90 * i, 0.03, (i - 2.5) / 3);  // the swatches rise
  for (let i = 0; i < 26; i++) tick(13.75 + i * 0.024, 2600 + (i % 4) * 340, 0.026, ((i % 3) - 1) * 0.5);      // hex codes, percentages
  glass(13.75, 78, 0.045, 1.2, 0.3);
  whoosh(14.4, 0.52, 220, 5200, 0.28, 0.2, -0.2, true); swell(15.0, 0.5, 0.15);                                // the Cosmos swatch floods

  /* bar 7 · the mark is rebuilt, the wordmark rises, the signature */
  impact(15.0, 0.5); kick(15.0, 0.7);
  [[15.0, 74, -0.6], [15.06, 78, 0], [15.12, 81, 0.6], [15.625, 69, -0.6], [15.685, 73, 0], [15.745, 76, 0.6]].forEach(([t0, m, p]) => {
    whoosh(t0, 0.28, 2600, 600, 0.09, p, p * 0.3, false); thump(t0 + 0.27, 0.32, 110); glass(t0 + 0.27, m, 0.05, 1.2, p); wood(t0 + 0.27, m - 12, 0.06, p);
  });
  pad(15.3, 2.2, CH[6], 0.04, 1800); bass(15.0, ROOT[6], 0.6, 0.3); bass(15.625, ROOT[6], 0.6, 0.28);
  [62, 66, 69, 73, 74, 78, 81, 85].forEach((m, i) => pluck(16.25 + 0.04 * i, m, 0.055, (i - 3.5) / 5));          // AURA LUNA rises
  [16.62, 16.68, 16.74].forEach((t, i) => tick(t, 3000 + i * 400, 0.04, (i - 1) * 0.5));                         // the descriptor's Éclipse dots
  pad(16.25, 1.25, [50, 57, 61, 64, 66], 0.035, 2000); bass(16.25, 38, 1.0, 0.3);
  glass(16.875, 86, 0.06, 1.8, 0); glass(16.9, 81, 0.045, 1.8, -0.3); glass(16.92, 74, 0.04, 1.8, 0.3);      // the signature

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
