/* ───────────── soundtrack · Web Audio API (OfflineAudioContext) → WAV ─────────────
   120 BPM · 15 s · stereo 48 kHz, in F major. Every sound belongs to something on screen: the cursor's click, the
   toggle draining into the dot, the letters letting go, each landing of the dot, a tone that follows the spring as it is
   drawn (its pitch is the same spring function), the six poles (one hit each), the violet light, the shape's thud and
   stretch, the halftone riser, the end card's chord, the full stop, and a rewind back into the toggle. Synthesised. */
window.renderAudio = async () => {
  const SR = 48000, DUR = 15, BEAT = 0.5;
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
  const pip = (t, f0, f1, d = 0.16, v = 0.07, p = 0) => glide(t, d, f0, f1, v, p);                    // the dot takes off
  const tok = (t, m, v = 0.1, p = 0) => { wood(t, m, v, p); thump(t, v * 2.2, 140); };                 // the dot lands
  const click = (t, v = 0.12) => { tick(t, 3800, v, 0.2); tick(t + 0.06, 2600, v * 0.6, 0.2); thump(t, 0.12, 180); };
  const CH = { F: [53, 57, 60, 64, 67], Dm: [50, 53, 57, 60, 64], Bb: [46, 50, 53, 57, 62], C: [48, 52, 55, 60, 62], Am: [45, 52, 55, 60, 64] };

  /* 0–3 · the toggle, the click, « Imagination » */
  pad(0.0, 2.0, CH.F, 0.026, 1100); pad(2.0, 2.0, CH.Dm, 0.03, 1300);
  for (let i = 0; i < 4; i++) tick(0.15 + i * 0.2, 5200 - i * 300, 0.012, 0.3);                       // the cursor glides in
  click(1.0); pip(1.02, 900, 380, 0.22, 0.06, 0.2);                                                   // off: the orange drains into the dot
  whoosh(1.45, 0.45, 3200, 500, 0.14, -0.3, 0.3, false); [60, 64, 67, 72].forEach((m, i) => pluck(1.5 + i * 0.025, m + 12, 0.055, (i - 1.5) / 3));
  for (let i = 0; i < 6; i++) tick(1.55 + i * 0.05, 1600 - i * 120, 0.03, -0.4);                       // « Limit » falls
  kick(2.0, 0.8); pip(2.0, 420, 1500, 0.3, 0.07, 0.1); tok(2.36, 84, 0.1, 0.1);                        // onto the i
  bass(2.0, 38, 0.4, 0.38); hat(2.25, 0.06, 0.3); kick(2.5, 0.85); bass(2.5, 38, 0.3, 0.34); hat(2.75, 0.06, 0.3);

  /* 3–5.5 · the spring */
  kick(3.0, 0.9); whoosh(2.98, 0.32, 2400, 400, 0.12, 0.2, -0.3, false); pip(3.0, 500, 1300, 0.4, 0.06, -0.2); tok(3.5, 72, 0.09, -0.4);
  { const o = ctx.createOscillator(), g = ctx.createGain(), pn = pan(-0.5); o.type = 'triangle';     // the tone that draws the curve
    const spr = (tau) => { const z = 0.45, w = 7.04, wd = w * Math.sqrt(1 - z * z); return 6 * (1 - Math.exp(-z * w * tau) * (Math.cos(wd * tau) + (z / Math.sqrt(1 - z * z)) * Math.sin(wd * tau))); };
    for (let i = 0; i <= 125; i++) { const tau = i / 100; o.frequency.setValueAtTime(hz(65 + 2.4 * spr(tau)), 3.5 + tau); pn.pan.setValueAtTime(-0.5 + tau * 0.8, 3.5 + tau); }
    g.gain.setValueAtTime(0.0001, 3.5); g.gain.linearRampToValueAtTime(0.055, 3.55); g.gain.setValueAtTime(0.055, 4.6); g.gain.exponentialRampToValueAtTime(0.0001, 4.95);
    o.connect(g); g.connect(pn); pn.connect(fx); send(pn, 0.25, 0.2); o.start(3.5); o.stop(5.0); }
  glass(4.0, 86, 0.05, 1.2, 0.2);                                                                      // the peak, on the beat
  for (let k = 7; k < 11; k++) { kick(k * BEAT, 0.9); bass(k * BEAT, k < 9 ? 38 : 46, 0.3, 0.38); hat(k * BEAT + 0.25, 0.06, 0.3); }
  pad(4.0, 2.0, CH.Bb, 0.03, 1400);
  for (let i = 0; i < 6; i++) tick(4.5 + i * 0.053, 2200 + i * 260, 0.04, 0.5); glass(4.82, 81, 0.05, 1.4, 0.5);   // 1 · 2 · 3 · 4 · 5 · 6 pôles
  kick(5.0, 0.85); bass(5.0, 46, 0.3, 0.36); hat(5.25, 0.07, 0.3);

  /* 5.5–7.5 · the shot, the light, the square, the pill, the night */
  whoosh(5.48, 0.42, 900, 6000, 0.2, -0.6, 0.8, false); riser(5.55, 0.45, 0.25); swell(6.0, 0.45, 0.16);
  impact(6.0, 0.95, true); kick(6.0, 1); [77, 81, 84, 88].forEach((m, i) => glass(6.0 + i * 0.02, m, 0.05, 1.8, (i - 1.5) / 2)); pad(6.0, 2.0, [41, 53, 57, 60, 64, 67], 0.05, 2400);
  thump(6.5, 0.45, 90); whoosh(6.5, 0.45, 600, 2400, 0.1, 0.6, -0.2, false); kick(6.5, 0.8);                      // the square grows and turns
  { const o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'sine'; o.frequency.setValueAtTime(220, 7.0); o.frequency.exponentialRampToValueAtTime(110, 7.3); env(g, 7.0, 0.01, 0.16, 0.3); o.connect(g); g.connect(fx); o.start(7.0); o.stop(7.35); }   // stretched into a pill
  kick(7.0, 0.85); whoosh(7.2, 0.3, 300, 3000, 0.16, 0, 0, true); swell(7.5, 0.3, 0.12);
  impact(7.5, 0.5); kick(7.5, 0.9); tok(7.52, 77, 0.08, 0);                                            // one dot on the night

  /* 7.5–11.5 · the six poles, the halftone */
  [[8.0, 69], [8.5, 72], [9.0, 74], [9.5, 76], [10.0, 79], [10.25, 81]].forEach(([t, m], i) => { pluck(t, m, 0.08, (i % 2 ? 0.5 : -0.5)); glass(t + 0.01, m + 12, 0.035, 0.8, (i % 2 ? 0.5 : -0.5)); whoosh(t - 0.12, 0.2, 2000, 700, 0.05, (i % 2 ? 0.7 : -0.7), 0, false); });
  for (let k = 16; k < 21; k++) { kick(k * BEAT, 0.95); bass(k * BEAT, k < 18 ? 45 : 50, 0.28, 0.4); bass(k * BEAT + 0.25, k < 18 ? 57 : 62, 0.16, 0.2); hat(k * BEAT + 0.25, 0.07, 0.3); hat(k * BEAT + 0.125, 0.03, -0.4); }
  pad(8.0, 2.0, CH.Am, 0.03, 1500); pad(10.0, 1.5, CH.Bb, 0.03, 1700);
  for (let i = 0; i < 16; i++) shaker(8.0 + i * 0.125, 0.025 + 0.001 * i, i % 2 ? 0.4 : -0.4);
  whoosh(10.45, 0.5, 400, 3400, 0.16, 0, 0, false); riser(10.55, 0.93, 0.36);                          // the ring opens, the field grows
  for (let i = 0; i < 8; i++) snap(11.0 + i * 0.0625, 0.05 + i * 0.018); swell(11.5, 0.5, 0.18);

  /* 11.5–13.5 · the end card */
  impact(11.5, 1.05, true); kick(11.5, 1); pad(11.5, 2.2, [41, 53, 57, 60, 64, 67, 72], 0.05, 2600); bass(11.5, 41, 1.2, 0.4);
  for (let i = 0; i < 6; i++) wood(11.52 + 0.045 * i, [72, 74, 77, 79, 81, 84][i], 0.06, (i - 2.5) / 3);   // the modules
  pip(11.5, 1200, 500, 0.42, 0.05, 0.3);                                                               // the dot flies down to the full stop
  [65, 69, 72, 76, 77, 81, 84, 88].forEach((m, i) => pluck(12.0 + 0.035 * i, m, 0.05, (i - 3.5) / 5)); kick(12.0, 0.8);   // AURA LUNA
  shimmer(12.5, 0.6, 0.04); kick(12.5, 0.7);
  for (let i = 0; i < 9; i++) tick(13.0 + i * 0.045, 3400 + (i % 3) * 300, 0.02, -0.2 + i * 0.05); tok(13.42, 89, 0.07, 0.4); glass(13.42, 89, 0.05, 1.6, 0.4); kick(13.0, 0.7);

  /* 13.5–15 · the return: halftone → graph → toggle */
  { const o = ctx.createOscillator(), g = ctx.createGain(), pn = pan(0.4); o.type = 'triangle';     // the rewind: the spring tone, backwards
    const spr = (tau) => { const z = 0.45, w = 7.04, wd = w * Math.sqrt(1 - z * z); return 6 * (1 - Math.exp(-z * w * tau) * (Math.cos(wd * tau) + (z / Math.sqrt(1 - z * z)) * Math.sin(wd * tau))); };
    for (let i = 0; i <= 40; i++) { const u = i / 40, tau = 1.25 * (1 - (Math.exp(2 * u) - 1) / (Math.exp(2) - 1)); o.frequency.setValueAtTime(hz(65 + 2.4 * spr(tau)), 13.85 + 0.4 * u); }
    g.gain.setValueAtTime(0.0001, 13.85); g.gain.linearRampToValueAtTime(0.045, 13.9); g.gain.exponentialRampToValueAtTime(0.0001, 14.3); o.connect(g); g.connect(pn); pn.connect(fx); send(pn, 0.2); o.start(13.85); o.stop(14.35); }
  whoosh(13.5, 0.36, 6000, 700, 0.14, 0, 0, false); pip(13.5, 1400, 600, 0.3, 0.05, 0);
  pip(14.25, 600, 1100, 0.25, 0.05, 0.2); click(14.5, 0.1); pip(14.52, 380, 900, 0.22, 0.05, 0.2);          // back into the toggle: on
  pad(13.5, 1.5, CH.F, 0.022, 1000);

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
