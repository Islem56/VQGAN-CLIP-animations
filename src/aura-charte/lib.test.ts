import { describe, expect, it } from "vitest";
import { bar, CHAPTERS, chapterAt, FRAMES } from "./lib";

describe("tempo map (121 BPM, 16 bars)", () => {
  it("starts bar 1 at zero", () => expect(bar(1)).toBe(0));
  it("puts the alignment on bar 7 and the flash on bar 8", () => {
    expect(Math.abs(bar(7) - 11.901)).toBeLessThan(0.001);
    expect(Math.abs(bar(8) - 13.884)).toBeLessThan(0.001);
  });
  it("lasts 1904 frames at 60 fps", () => expect(FRAMES).toBe(1904));
  it("starts every chapter on a bar downbeat", () => {
    for (const c of CHAPTERS) {
      const k = Math.round(c.from / bar(2)) + 1;
      expect(Math.abs(c.from - bar(k))).toBeLessThan(1e-9);
    }
  });
  it("knows which chapter a time belongs to", () => {
    expect(chapterAt(bar(9))).toBe("couleurs");
    expect(chapterAt(bar(15) + 0.01)).toBe("signature");
  });
});
