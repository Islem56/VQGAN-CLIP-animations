/* ───────────── soundtrack · Web Audio API (OfflineAudioContext) → WAV ─────────────
   80 BPM · 13.5 s · stereo 48 kHz, in D major. One shot, scored like a film: three heartbeats in the dark, the spark
   (glass and a rising zing), a long breath under the pull-back, the line typed in ticks, the eclipse (the drone sinks,
   the filter closes, near-silence at totality), the diamond ring, a swell into the ring of light (the impact), one lock
   per module, the violet light, the white light and the wordmark's sweep, three dots, a last bell. Synthesised. */
window.renderAudio = async () => {
  const SR = 48000, DUR = 13.5, BEAT = 0.75;
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
  const heart = (t, v = 0.45) => { thump(t, v, 66); thump(t + 0.2, v * 0.6, 58); };
  /* the dark: three heartbeats, a drone opening */
  drone(0.0, 6.0, 26, 0.17); shimmer(0.0, 2.2, 0.025);
  [0, 0.75, 1.5].forEach((t, i) => heart(t, 0.32 + i * 0.07));
  /* 2.25 · the spark */
  impact(2.25, 0.55); [86, 93, 98].forEach((m, i) => glass(2.25 + i * 0.025, m, 0.06 - i * 0.012, 2.4, (i - 1) * 0.5)); shimmer(2.25, 2.0, 0.06);
  glide(2.25, 0.5, 700, 2600, 0.03, 0);                                                                                   // the streak runs out
  /* 3.0 → 5.4 · the pull-back */
  whoosh(3.0, 2.4, 180, 2200, 0.16, 0, 0, false); pad(3.0, 3.0, [62, 64, 69, 74, 76], 0.034, 1300);
  [3.0, 3.75, 4.5, 5.25].forEach((t, i) => heart(t, 0.26 + i * 0.03)); glass(3.75, 81, 0.04, 1.6, -0.3); glass(5.25, 78, 0.04, 1.6, 0.3);
  for (let i = 0; i < 17; i++) tick(4.5 + i * 0.044, 3200 + (i % 3) * 300, 0.018, ((i % 2) - 0.5) * 0.6);         // the line types itself
  /* 6.0 · the eclipse: the drone sinks, the filter closes; near-silence at totality; the diamond ring */
  whoosh(6.0, 0.5, 2600, 400, 0.08, 0, 0, false); drone(6.0, 3.0, 23, 0.15);
  { const o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'sine'; o.frequency.setValueAtTime(110, 6.0); o.frequency.exponentialRampToValueAtTime(62, 8.4); g.gain.setValueAtTime(0.0001, 6.0); g.gain.exponentialRampToValueAtTime(0.12, 7.0); g.gain.exponentialRampToValueAtTime(0.0001, 8.6); o.connect(g); g.connect(mus); o.start(6.0); o.stop(8.7); }
  heart(6.0, 0.24); heart(7.5, 0.2); pad(6.0, 2.2, [59, 62, 66, 69], 0.026, 700);
  glass(8.25, 98, 0.07, 1.8, -0.4); shimmer(8.25, 0.5, 0.07); glass(8.27, 93, 0.04, 1.6, 0.3);                           // the diamond ring
  riser(8.35, 0.65, 0.3); swell(9.0, 0.6, 0.22);
  /* 9.0 · the ring of light, the mark */
  impact(9.0, 1.15, true); kick(9.0, 0.9); [74, 81, 86, 90].forEach((m, i) => glass(9.0 + i * 0.02, m, 0.055, 2.4, (i - 1.5) * 0.4));
  whoosh(9.0, 0.85, 6500, 300, 0.24, 0, 0, false); pad(9.0, 4.5, [50, 57, 61, 64, 66, 69], 0.05, 2200); bass(9.0, 38, 1.4, 0.4);
  [[9.2, 74, -0.7], [9.24, 78, 0.7], [9.28, 69, -0.5]].forEach(([t0, m, p]) => { whoosh(t0, 0.3, 2800, 700, 0.1, p, p * 0.3, false); thump(t0 + 0.3, 0.3, 110); wood(t0 + 0.3, m, 0.06, p); });
  thump(9.62, 0.34, 100); wood(9.62, 62, 0.07, 0);                                                                        // the moon has opened
  /* 9.75 violet · 10.5 white and the wordmark · 11.25 the descriptor · 12.0 the signature */
  kick(9.75, 0.7); shimmer(9.75, 0.8, 0.05); [66, 69, 73, 76].forEach((m, i) => pluck(9.75 + i * 0.05, m + 12, 0.05, (i - 1.5) / 3));
  kick(10.5, 0.75); [81, 86].forEach((m, i) => glass(10.5 + i * 0.03, m, 0.055, 1.8, (i - 0.5) * 0.6));
  { const n = noise(), f = ctx.createBiquadFilter(), g = ctx.createGain(), pn = pan(-0.8); f.type = 'bandpass'; f.Q.value = 2; f.frequency.setValueAtTime(3000, 10.5); f.frequency.exponentialRampToValueAtTime(7500, 11.25); pn.pan.setValueAtTime(-0.8, 10.5); pn.pan.linearRampToValueAtTime(0.8, 11.25); g.gain.setValueAtTime(0.0001, 10.5); g.gain.linearRampToValueAtTime(0.07, 10.75); g.gain.exponentialRampToValueAtTime(0.0001, 11.3); n.connect(f); f.connect(g); g.connect(pn); pn.connect(fx); send(pn, 0.3); n.start(10.5, rnd() * 2); n.stop(11.35); }
  kick(11.25, 0.6); [11.3, 11.36, 11.42].forEach((t, i) => tick(t, 3000 + i * 400, 0.045, (i - 1) * 0.5)); [62, 66, 69, 74].forEach((m, i) => pluck(11.25 + i * 0.04, m + 12, 0.045, (i - 1.5) / 3));
  kick(12.0, 0.55); glass(12.0, 86, 0.06, 2.2, 0); glass(12.03, 81, 0.045, 2.2, -0.3); glass(12.06, 74, 0.04, 2.2, 0.3); bass(12.0, 38, 1.4, 0.3);

  /* the kick ducks the music bus (sidechain by automation) */
  mus.gain.setValueAtTime(1, 0);
  KICKS.sort((a, b) => a[0] - b[0]).forEach(([t, v]) => { mus.gain.setValueAtTime(1, Math.max(0, t - 0.002)); mus.gain.linearRampToValueAtTime(1 - 0.55 * v, t + 0.005); mus.gain.linearRampToValueAtTime(1, t + 0.3); });

  /* render, fade the very end (the loop restarts clean), encode */
  const buf = await ctx.startRendering();
  const L = buf.getChannelData(0), R = buf.getChannelData(1), N = L.length, fadeN = Math.floor(SR * 0.6);
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
