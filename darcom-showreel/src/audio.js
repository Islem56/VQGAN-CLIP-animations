/* ───────────── soundtrack · Web Audio API (OfflineAudioContext) → WAV ─────────────
   120 BPM · 15 s · stereo 48 kHz. A kick on every beat, a whoosh into every scene change followed by a hit on it,
   a riser through the whole of bar 6 into the drop at 12.0, UI ticks on the toggles, stabs on the words,
   one rising "whoomp" per extruded letter, and a closing bell on the end title. Everything is synthesised, no samples. */
window.renderAudio = async () => {
  const SR = 48000, DUR = 15, BEAT = 0.5;
  const ctx = new OfflineAudioContext(2, SR * DUR, SR);

  /* seeded noise (the render is reproducible) */
  let seed = 20260101; const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
  const nbuf = ctx.createBuffer(1, SR * 3, SR), nd = nbuf.getChannelData(0); for (let i = 0; i < nd.length; i++) nd[i] = rnd() * 2 - 1;
  const noise = () => { const s = ctx.createBufferSource(); s.buffer = nbuf; s.loop = true; return s; };

  /* master chain: music bus (ducked by the kick) + fx bus → compressor → limiter-ish gain → out */
  const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -16; comp.knee.value = 14; comp.ratio.value = 5; comp.attack.value = 0.003; comp.release.value = 0.14;
  const master = ctx.createGain(); master.gain.value = 0.92; comp.connect(master); master.connect(ctx.destination);
  const mus = ctx.createGain(), fx = ctx.createGain(); mus.connect(comp); fx.connect(comp);
  /* a short plate-ish reverb and a dotted-eighth echo */
  const irLen = Math.floor(SR * 1.6), ir = ctx.createBuffer(2, irLen, SR);
  for (let c = 0; c < 2; c++) { const d = ir.getChannelData(c); for (let i = 0; i < irLen; i++) d[i] = (rnd() * 2 - 1) * Math.pow(1 - i / irLen, 3.2) * (i < SR * 0.012 ? i / (SR * 0.012) : 1); }
  const rev = ctx.createConvolver(); rev.buffer = ir; const revG = ctx.createGain(); revG.gain.value = 0.2; rev.connect(revG); revG.connect(comp);
  const dly = ctx.createDelay(1); dly.delayTime.value = 0.375; const dfb = ctx.createGain(); dfb.gain.value = 0.34; const dlp = ctx.createBiquadFilter(); dlp.type = 'lowpass'; dlp.frequency.value = 3200;
  dly.connect(dlp); dlp.connect(dfb); dfb.connect(dly); const dG = ctx.createGain(); dG.gain.value = 0.28; dlp.connect(dG); dG.connect(comp); dG.connect(rev);
  const send = (node, r = 0.2, d = 0) => { const a = ctx.createGain(); a.gain.value = r; node.connect(a); a.connect(rev); if (d) { const b = ctx.createGain(); b.gain.value = d; node.connect(b); b.connect(dly); } };

  /* the kick ducks the music bus (sidechain by automation) */
  mus.gain.setValueAtTime(1, 0);
  for (let k = 0; k < 30; k++) { const t = k * BEAT, down = k % 4 === 0; mus.gain.setValueAtTime(1, Math.max(0, t - 0.002)); mus.gain.linearRampToValueAtTime(down ? 0.28 : 0.4, t + 0.004); mus.gain.linearRampToValueAtTime(1, t + 0.26); }

  const pan = (p) => { const n = ctx.createStereoPanner(); n.pan.value = p; return n; };
  const env = (g, t, a, peak, d) => { g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + a + d); };

  /* ── drums ── */
  const kick = (t, v = 1) => {
    const o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'sine';
    o.frequency.setValueAtTime(170, t); o.frequency.exponentialRampToValueAtTime(44, t + 0.11);
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(v, t + 0.002); g.gain.exponentialRampToValueAtTime(0.001, t + 0.42);
    o.connect(g); g.connect(fx); o.start(t); o.stop(t + 0.45);
    const n = noise(), f = ctx.createBiquadFilter(), ng = ctx.createGain(); f.type = 'highpass'; f.frequency.value = 2400; env(ng, t, 0.001, 0.22 * v, 0.012);
    n.connect(f); f.connect(ng); ng.connect(fx); n.start(t, rnd() * 2); n.stop(t + 0.03);
  };
  const hat = (t, v = 0.12, open = false, p = 0.3) => {
    const n = noise(), f = ctx.createBiquadFilter(), g = ctx.createGain(); f.type = 'highpass'; f.frequency.value = 7500; env(g, t, 0.001, v, open ? 0.16 : 0.035);
    n.connect(f); f.connect(g); g.connect(pan(p)).connect(fx); n.start(t, rnd() * 2); n.stop(t + 0.25);
  };
  const clap = (t, v = 0.32) => {
    for (let i = 0; i < 3; i++) {
      const n = noise(), f = ctx.createBiquadFilter(), g = ctx.createGain(); f.type = 'bandpass'; f.frequency.value = 1700; f.Q.value = 0.9; env(g, t + i * 0.011, 0.001, v * (i === 2 ? 1 : 0.6), i === 2 ? 0.16 : 0.012);
      n.connect(f); f.connect(g); g.connect(fx); send(g, 0.25); n.start(t, rnd() * 2); n.stop(t + 0.3);
    }
  };
  const snare = (t, v = 0.2) => {
    const n = noise(), f = ctx.createBiquadFilter(), g = ctx.createGain(); f.type = 'bandpass'; f.frequency.value = 3200; f.Q.value = 0.7; env(g, t, 0.001, v, 0.09);
    const o = ctx.createOscillator(), og = ctx.createGain(); o.type = 'triangle'; o.frequency.setValueAtTime(220, t); o.frequency.exponentialRampToValueAtTime(150, t + 0.08); env(og, t, 0.001, v * 0.6, 0.08);
    n.connect(f); f.connect(g); g.connect(fx); o.connect(og); og.connect(fx); n.start(t, rnd() * 2); n.stop(t + 0.2); o.start(t); o.stop(t + 0.15);
  };

  /* ── bass, stabs, plucks ── */
  const bass = (t, hz, d = 0.2, v = 0.5) => {
    const o = ctx.createOscillator(), o2 = ctx.createOscillator(), f = ctx.createBiquadFilter(), g = ctx.createGain(); o.type = 'triangle'; o2.type = 'sine'; o.frequency.value = hz; o2.frequency.value = hz / 2;
    f.type = 'lowpass'; f.frequency.value = 220; g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(v, t + 0.006); g.gain.setValueAtTime(v, t + d * 0.6); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    o.connect(f); o2.connect(f); f.connect(g); g.connect(mus); o.start(t); o2.start(t); o.stop(t + d + 0.02); o2.stop(t + d + 0.02);
  };
  const stab = (t, notes, d = 0.16, v = 0.16, p = 0, brightness = 2600) => {
    const g = ctx.createGain(), f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.setValueAtTime(brightness, t); f.frequency.exponentialRampToValueAtTime(500, t + d); env(g, t, 0.003, v, d);
    notes.forEach((m, i) => { const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = 440 * Math.pow(2, (m - 69) / 12); o.detune.value = (i - 1) * 7; o.connect(f); o.start(t); o.stop(t + d + 0.1); });
    f.connect(g); const pn = pan(p); g.connect(pn); pn.connect(mus); send(pn, 0.22, 0.25);
  };
  const pluck = (t, m, v = 0.12, p = 0) => {
    const o = ctx.createOscillator(), o2 = ctx.createOscillator(), f = ctx.createBiquadFilter(), g = ctx.createGain(); o.type = 'square'; o2.type = 'sawtooth'; const hz = 440 * Math.pow(2, (m - 69) / 12); o.frequency.value = hz; o2.frequency.value = hz * 1.004;
    f.type = 'lowpass'; f.frequency.setValueAtTime(4200, t); f.frequency.exponentialRampToValueAtTime(600, t + 0.16); env(g, t, 0.002, v, 0.18);
    o.connect(f); o2.connect(f); f.connect(g); const pn = pan(p); g.connect(pn); pn.connect(mus); send(pn, 0.18, 0.35); o.start(t); o2.start(t); o.stop(t + 0.3); o2.stop(t + 0.3);
  };
  const bell = (t, m, v = 0.1, d = 1.4) => {
    const g = ctx.createGain(); env(g, t, 0.004, v, d);
    [[1, 1], [2.76, 0.4], [5.4, 0.16], [8.9, 0.07]].forEach(([k, a]) => { const o = ctx.createOscillator(), og = ctx.createGain(); o.type = 'sine'; o.frequency.value = 440 * Math.pow(2, (m - 69) / 12) * k; og.gain.value = a; o.connect(og); og.connect(g); o.start(t); o.stop(t + d + 0.1); });
    g.connect(fx); send(g, 0.4, 0.2);
  };

  /* ── whooshes, risers, hits ── */
  const whoosh = (t0, d, f0, f1, v = 0.3, p0 = 0, p1 = 0, up = true) => {
    const n = noise(), f = ctx.createBiquadFilter(), g = ctx.createGain(), pn = pan(p0); f.type = 'bandpass'; f.Q.value = 1.4;
    f.frequency.setValueAtTime(f0, t0); f.frequency.exponentialRampToValueAtTime(f1, t0 + d); pn.pan.setValueAtTime(p0, t0); pn.pan.linearRampToValueAtTime(p1, t0 + d);
    g.gain.setValueAtTime(0.0001, t0); if (up) { g.gain.exponentialRampToValueAtTime(v, t0 + d * 0.92); g.gain.linearRampToValueAtTime(0, t0 + d); } else { g.gain.linearRampToValueAtTime(v, t0 + d * 0.12); g.gain.exponentialRampToValueAtTime(0.0001, t0 + d); }
    n.connect(f); f.connect(g); g.connect(pn); pn.connect(fx); send(pn, 0.25); n.start(t0, rnd() * 2); n.stop(t0 + d + 0.05);
  };
  const hit = (t, v = 1, big = false) => {
    const o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'sine'; o.frequency.setValueAtTime(95, t); o.frequency.exponentialRampToValueAtTime(30, t + (big ? 0.9 : 0.5));
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.8 * v, t + 0.004); g.gain.exponentialRampToValueAtTime(0.0001, t + (big ? 1.4 : 0.8)); o.connect(g); g.connect(fx); o.start(t); o.stop(t + 1.6);
    const n = noise(), f = ctx.createBiquadFilter(), ng = ctx.createGain(); f.type = 'highpass'; f.frequency.value = 1800; env(ng, t, 0.002, 0.34 * v, big ? 1.1 : 0.5);
    n.connect(f); f.connect(ng); ng.connect(fx); send(ng, 0.5); n.start(t, rnd() * 2); n.stop(t + 1.5);
    const n2 = noise(), f2 = ctx.createBiquadFilter(), g2 = ctx.createGain(); f2.type = 'lowpass'; f2.frequency.setValueAtTime(900, t); f2.frequency.exponentialRampToValueAtTime(120, t + 0.6); env(g2, t, 0.001, 0.6 * v, 0.4);
    n2.connect(f2); f2.connect(g2); g2.connect(fx); n2.start(t, rnd() * 2); n2.stop(t + 0.7);
  };
  const riser = (t0, d, v = 0.5) => {
    whoosh(t0, d, 180, 9500, v, -0.5, 0.5, true);
    const o = ctx.createOscillator(), f = ctx.createBiquadFilter(), g = ctx.createGain(); o.type = 'sawtooth'; o.frequency.setValueAtTime(110, t0); o.frequency.exponentialRampToValueAtTime(1100, t0 + d);
    f.type = 'lowpass'; f.frequency.setValueAtTime(300, t0); f.frequency.exponentialRampToValueAtTime(7000, t0 + d); g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(v * 0.32, t0 + d * 0.96); g.gain.linearRampToValueAtTime(0, t0 + d);
    o.connect(f); f.connect(g); g.connect(fx); send(g, 0.2); o.start(t0); o.stop(t0 + d + 0.02);
  };
  const tick = (t, hz, v = 0.2, p = 0) => {
    const o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'sine'; o.frequency.value = hz; env(g, t, 0.0008, v, 0.03);
    const n = noise(), f = ctx.createBiquadFilter(), ng = ctx.createGain(); f.type = 'highpass'; f.frequency.value = 3500; env(ng, t, 0.0005, v * 0.7, 0.012);
    const pn = pan(p); o.connect(g); g.connect(pn); n.connect(f); f.connect(ng); ng.connect(pn); pn.connect(fx); send(pn, 0.15, 0.15); o.start(t); o.stop(t + 0.06); n.start(t, rnd() * 2); n.stop(t + 0.04);
  };
  const bend = (t, f0, f1, v = 0.18, d = 0.2, p = 0) => {
    const o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'sine'; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + d); env(g, t, 0.004, v, d);
    const pn = pan(p); o.connect(g); g.connect(pn); pn.connect(fx); send(pn, 0.3, 0.3); o.start(t); o.stop(t + d + 0.05);
  };
  const whoomp = (t, hz = 60, v = 0.5) => {            // the sub swell of a letter rising out of the ground
    const o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'sine'; o.frequency.setValueAtTime(hz * 0.6, t); o.frequency.exponentialRampToValueAtTime(hz * 1.6, t + 0.34);
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(v, t + 0.06); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.5); o.connect(g); g.connect(fx); o.start(t); o.stop(t + 0.55);
  };

  /* ── the arrangement ── */
  const ROOT = [55, 55, 43.65, 43.65, 65.41, 65.41, 49, 55];                  // A A F F C C G A   (one per bar, 2 s each)
  const ROOTM = [45, 45, 41, 41, 48, 48, 43, 45];                              // the same roots as MIDI notes (for plucks)
  const MIN = (r) => [r, r + 3, r + 7, r + 12];                                // minor-ish arpeggio shape (A C E A)
  for (let k = 0; k < 30; k++) { const t = k * BEAT; kick(t, k % 4 === 0 ? 1 : 0.86); }                // kick on every beat

  /* hits on the scene changes, each preceded by a whoosh; the big drop at 12.0 */
  [2, 4, 6, 8, 10, 14].forEach((t) => hit(t, 0.85));
  hit(12, 1.15, true); hit(0, 0.55);
  [[1.55, 2], [3.55, 4], [5.55, 6], [7.55, 8], [13.55, 14]].forEach(([a, b]) => whoosh(a, b - a, 400, 6500, 0.34, -0.4, 0.4, true));
  whoosh(0.5, 0.5, 300, 5200, 0.3, 0, 0, true); whoosh(1.5, 0.5, 700, 6000, 0.3, 0.3, -0.3, true);       // the vermilion flood, the black flood

  /* bar 1 · hook: bass + sub, a hat on the 8ths from the flood */
  for (let k = 0; k < 4; k++) bass(k * BEAT + 0.25, ROOT[0], 0.2, 0.42);
  for (let k = 1; k < 4; k++) hat(k * BEAT + 0.25, 0.09, k === 3, -0.3);
  bend(1.0, 900, 300, 0.18, 0.3, 0.2); bend(1.5, 200, 800, 0.16, 0.3, -0.2);

  /* bar 2 · kinetic type: a stab on every word (rising), claps, hats */
  [[2.0, 57], [2.5, 60], [3.0, 64], [3.5, 69]].forEach(([t, m], i) => stab(t, [m, m + 7, m + 12], 0.2, 0.2, (i % 2 ? 0.25 : -0.25)));
  for (let k = 4; k < 8; k++) { bass(k * BEAT + 0.25, ROOT[1], 0.2, 0.46); hat(k * BEAT + 0.25, 0.12, k === 7, 0.3); if (k % 2 === 1) clap(k * BEAT, 0.28); }
  whoosh(2.5, 0.32, 3000, 400, 0.22, 0, 0, false); whoosh(3.0, 0.3, 2500, 300, 0.22, 0, 0, false);      // the words are kicked out

  /* bar 3 · shape morph: a pitch-bend per morph, the arp starts */
  [4.5, 5.0, 5.5].forEach((t, i) => bend(t, 280 + i * 60, 900 + i * 200, 0.2, 0.22, (i - 1) * 0.3));
  for (let k = 8; k < 12; k++) { bass(k * BEAT + 0.25, ROOT[2], 0.2, 0.5); hat(k * BEAT + 0.25, 0.13, false, -0.3); hat(k * BEAT + 0.125, 0.06, false, 0.3); if (k % 2 === 1) clap(k * BEAT, 0.3); }
  for (let i = 0; i < 16; i++) pluck(4 + i * 0.125, MIN(ROOTM[2] + 24)[i % 4], 0.07, (i % 2 ? 0.4 : -0.4));

  /* bar 4 · 2D → 3D: extrude, orbit sweeps, the push through the door */
  whoomp(6.0, 52, 0.55); whoosh(6.0, 0.5, 800, 3400, 0.3, -0.6, 0.2, false);
  whoosh(6.55, 0.45, 600, 4200, 0.34, -0.7, 0.7, true); whoosh(7.0, 0.45, 4200, 700, 0.3, 0.7, -0.6, false);
  for (let k = 12; k < 16; k++) { bass(k * BEAT + 0.25, ROOT[3], 0.2, 0.52); hat(k * BEAT + 0.25, 0.14, k === 15, 0.3); hat(k * BEAT + 0.125, 0.06, false, -0.3); if (k % 2 === 1) clap(k * BEAT, 0.32); }
  for (let i = 0; i < 16; i++) pluck(6 + i * 0.125, MIN(ROOTM[3] + 24)[(i * 2) % 4] + (i > 7 ? 5 : 0), 0.08, (i % 2 ? -0.4 : 0.4));

  /* bar 5 · data / UI: ticks on every toggle (rising), the card drops away */
  [8.50, 8.57, 8.64, 9.00, 9.07, 9.14].forEach((t, i) => tick(t, 1500 + i * 180, 0.22, -0.3 + i * 0.12));
  whoosh(8.0, 0.4, 3600, 500, 0.3, 0, 0, false);
  for (let k = 16; k < 20; k++) { bass(k * BEAT + 0.25, ROOT[4], 0.2, 0.55); hat(k * BEAT + 0.25, 0.14, false, -0.3); hat(k * BEAT + 0.125, 0.07, false, 0.3); if (k % 2 === 1) clap(k * BEAT, 0.34); }
  for (let i = 0; i < 16; i++) pluck(8 + i * 0.125, MIN(ROOTM[4] + 24)[i % 4], 0.08, (i % 2 ? 0.4 : -0.4));
  whoosh(9.5, 0.42, 500, 4200, 0.36, 0, 0, true);

  /* bar 6 · the riser (10 → 12): noise + a rising saw, a snare roll that accelerates, 16ths on the hats, then a gap */
  riser(10.0, 1.94, 0.6);
  for (let k = 20; k < 24; k++) { bass(k * BEAT + 0.25, ROOT[5], 0.2, 0.55); if (k % 2 === 1) clap(k * BEAT, 0.3); }
  for (let i = 0; i < 16; i++) hat(10 + i * 0.125, 0.05 + i * 0.008, false, i % 2 ? 0.3 : -0.3);
  [11.0, 11.125, 11.25, 11.375].forEach((t, i) => snare(t, 0.12 + i * 0.03)); for (let i = 0; i < 8; i++) snare(11.5 + i * 0.0625, 0.18 + i * 0.03);
  for (let i = 0; i < 16; i++) pluck(10 + i * 0.125, MIN(ROOTM[5] + 24)[i % 4] + (i > 11 ? 7 : 0), 0.08 + i * 0.004, i % 2 ? -0.4 : 0.4);

  /* bar 7 · the strongest moment: letters rise, bass + arp at 16ths, whooshes on the camera, crash on the drop */
  [[12.0, 57], [12.06, 64], [12.5, 60], [12.56, 67], [13.0, 64], [13.06, 71], [13.12, 76]].forEach(([t, m], i) => { whoomp(t, 50 + i * 6, 0.45); stab(t, [m, m + 7, m + 12], 0.22, 0.2, ((i % 3) - 1) * 0.4, 3600); });
  whoosh(12.0, 0.5, 600, 5200, 0.34, -0.8, 0.2, true); whoosh(12.5, 0.5, 700, 6000, 0.36, -0.4, 0.8, true); whoosh(13.0, 0.5, 5200, 600, 0.34, 0.8, -0.4, false); whoosh(13.5, 0.5, 700, 6500, 0.38, 0.4, 0, true);
  for (let k = 24; k < 28; k++) { bass(k * BEAT + 0.25, ROOT[6], 0.2, 0.6); bass(k * BEAT, ROOT[6], 0.12, 0.45); clap(k * BEAT + (k % 2 ? 0 : 0.5), 0.3); }
  for (let i = 0; i < 32; i++) hat(12 + i * 0.0625 * 2, 0.07 + (i % 2) * 0.05, i % 8 === 7, i % 2 ? 0.3 : -0.3);
  for (let i = 0; i < 32; i++) pluck(12 + i * 0.0625 * 2, MIN(ROOTM[6] + 24)[i % 4] + (i > 15 ? 5 : 0), 0.09, i % 2 ? -0.5 : 0.5);

  /* half bar · end title: the collapse, the last hit, a closing bell */
  whoosh(14.0, 0.5, 6500, 220, 0.4, 0, 0, false); whoomp(14.0, 40, 0.5);
  [14.0, 14.5].forEach((t) => { bass(t + 0.25, ROOT[7], 0.22, 0.5); });
  bell(14.5, 81, 0.13, 1.1); bell(14.52, 76, 0.09, 1.1); bell(14.54, 72, 0.08, 1.1);
  stab(14.5, [57, 64, 69], 0.5, 0.1, 0, 1800);

  /* render, fade the very end (so the loop restarts clean on the kick at t=0), encode */
  const buf = await ctx.startRendering();
  const L = buf.getChannelData(0), R = buf.getChannelData(1), N = L.length, fadeN = Math.floor(SR * 0.22);
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
