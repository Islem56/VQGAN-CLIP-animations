import { describe, expect, it } from "vitest";
import { Box2, Vector2 } from "three";
import { MODULE_IDS, moduleShape } from "./shapes";

const bounds = (id: (typeof MODULE_IDS)[number]) => new Box2().setFromPoints(moduleShape(id).getPoints());

describe("monogram modules as three.js shapes (640 × 300 units, y up)", () => {
  it("keeps the traced outline detail", () => expect(moduleShape("S").getPoints().length).toBeGreaterThanOrEqual(100));
  it("covers exactly the monogram's box with the six modules", () => {
    const all = MODULE_IDS.map(bounds).reduce((a, b) => a.union(b));
    expect(all.min.distanceTo(new Vector2(0, 0))).toBeLessThan(1);
    expect(all.max.distanceTo(new Vector2(640, 300))).toBeLessThan(1);
  });
  it("puts the dome (S) on the top half, between the two legs", () => {
    const s = bounds("S");
    expect(Math.abs(s.min.x - 152)).toBeLessThan(2);
    expect(Math.abs(s.max.x - 455)).toBeLessThan(2);
    expect(Math.abs(s.min.y - 150)).toBeLessThan(2);
    expect(Math.abs(s.max.y - 300)).toBeLessThan(2);
  });
});
