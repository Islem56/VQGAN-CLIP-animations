// The construction grid of chapter 02, drawn as a page grid: square modules set from the page margins, every line
// exactly one pixel on the pixel grid (crisp edges), drawing on from the centre; it leaves before the camera moves.
import React from "react";
import { C, ease, lin, prog, TL } from "./lib";
import { Format, LAYOUT } from "./layout";

/** the modular grid of each format: first line, module, number of modules (columns, rows) */
export const GRID: Record<Format, { x0: number; y0: number; step: number; cols: number; rows: number }> = {
  v: { x0: 80, y0: 230, step: 46, cols: 20, rows: 27 },   // 80 → 1000 (the margins), 230 → 1472 (inside the Reels zone)
  h: { x0: 96, y0: 60, step: 48, cols: 36, rows: 20 },    // 96 → 1824 (the margins), 60 → 1020
};

export const ConstructionGrid: React.FC<{ t: number; format: Format }> = ({ t, format }) => {
  const o = 1 - ease.inOut(lin(t, TL.volume, 0.8));
  if (o <= 0) return null;
  const { W, H } = LAYOUT[format], { x0, y0, step, cols, rows } = GRID[format], x1 = x0 + cols * step, y1 = y0 + rows * step;
  const g = prog(t, 0, 0.6), cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, hw = ((x1 - x0) / 2) * g, hh = ((y1 - y0) / 2) * g;
  const px = (v: number) => Math.round(v) + 0.5;     // the centre of a pixel: a 1-px line covers exactly one pixel
  const lines: React.ReactNode[] = [];
  for (let i = 0; i <= cols; i++) { const x = px(x0 + i * step); lines.push(<line key={`v${i}`} x1={x} x2={x} y1={Math.round(cy - hh)} y2={Math.round(cy + hh)} />); }
  for (let j = 0; j <= rows; j++) { const y = px(y0 + j * step); lines.push(<line key={`h${j}`} y1={y} y2={y} x1={Math.round(cx - hw)} x2={Math.round(cx + hw)} />); }
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }} shapeRendering="crispEdges">
      <g stroke={C.BRUME} strokeWidth={1} opacity={0.12 * o}>{lines}</g>
    </svg>
  );
};
