import { describe, expect, it } from "vitest";
import { LAYOUT, pageAt } from "./layout";
import { bar } from "./lib";

describe("page layout", () => {
  const v = LAYOUT.v;
  it("keeps the 9:16 page frame out of the Reels interface", () => {
    expect(v.headerY - v.headerSize).toBeGreaterThanOrEqual(220);
    expect(v.footerY).toBeLessThanOrEqual(1500);
    expect(v.content.y).toBeGreaterThanOrEqual(220);
    expect(v.content.y + v.content.h).toBeLessThanOrEqual(1500);
    expect(v.mono.y).toBeGreaterThanOrEqual(220);
    expect(v.mono.y + (v.mono.w * 300) / 640).toBeLessThanOrEqual(1500);
    expect(v.margin).toBeGreaterThanOrEqual(60);
  });
  it("keeps the small type readable on a phone", () => {
    expect(LAYOUT.v.headerSize).toBeGreaterThanOrEqual(22);
    expect(LAYOUT.h.headerSize).toBeGreaterThanOrEqual(18);
  });
});

describe("the page at each moment", () => {
  it("turns the logo page light after the flash", () => {
    expect(pageAt(bar(8) - 0.1).dark).toBe(true);
    expect(pageAt(bar(8) + 0.1).pageNo).toBe("15");
    expect(pageAt(bar(8) + 0.1).dark).toBe(false);
  });
  it("turns the colour chapter dark on bar 11", () => {
    const p = pageAt(bar(11) + 0.1);
    expect(p.dark).toBe(true);
    expect(p.pageNo).toBe("19");
    expect(p.eyebrow).toBe("LUMIÈRE");
  });
  it("drops the page frame for the signature", () => expect(pageAt(bar(15) + 0.7).frame).toBe(false));
  it("uses the charter's copy verbatim", () => {
    expect(pageAt(0.1).section).toBe("02 · ADN & DIRECTION ARTISTIQUE");
    expect(pageAt(bar(5) + 0.1).section).toBe("03 · LOGO");
    expect(pageAt(bar(9) + 0.1).section).toBe("04 · COULEURS");
    expect(pageAt(bar(13) + 0.1).section).toBe("05 · TYPOGRAPHIE");
    expect(pageAt(0.1).title).toEqual(["Bauhaus et", "géométrie moderne"]);
    expect(pageAt(bar(5) + 0.1).title).toEqual(["Une ligature,", "deux initiales"]);
    expect(pageAt(bar(9) + 0.1).title).toEqual(["De la nuit", "au halo"]);
    expect(pageAt(bar(13) + 0.1).title).toEqual(["Deux voix,", "deux rôles"]);
    expect(pageAt(bar(11) + 0.1).body).toEqual(["Chez Aura Luna, le violet ne se pose pas : il éclaire."]);
  });
});
