// Drawn glass for the flat pages: inside the shape, the scene behind it shifted (refraction) and blurred (frost),
// a white tint, a diagonal sheen and a lit rim; optionally a warm Éclipse rim on the edge facing the point.
import React, { useId } from "react";
import { C } from "./lib";

type Shape = React.ReactElement<React.SVGProps<SVGElement>>;
export const Glass2D: React.FC<{
  shape: Shape; backdrop: string; refract?: [number, number]; frost?: number; tint?: number; warmRim?: number; light?: boolean;
  rimWidth?: number; magnify?: { cx: number; cy: number; k: number };
  /** the page colour behind the backdrop: the glass covers what is behind it before showing it bent */
  base?: string;
}> = ({ shape, backdrop, base, refract = [6, -4], frost = 6, tint = 0.1, warmRim = 0, light = false, rimWidth = 2, magnify }) => {
  const id = useId().replace(/:/g, "");
  const as = (p: React.SVGProps<SVGElement>) => React.cloneElement(shape, p);
  const m = magnify ? `translate(${magnify.cx} ${magnify.cy}) scale(${magnify.k}) translate(${-magnify.cx} ${-magnify.cy}) ` : "";
  return (
    <g>
      <defs>
        <clipPath id={`${id}c`}>{as({})}</clipPath>
        <filter id={`${id}f`} x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation={frost} /></filter>
        <filter id={`${id}g`} x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation={rimWidth * 3} /></filter>
        <linearGradient id={`${id}s`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={C.BLANC} stopOpacity={0.22} /><stop offset="0.35" stopColor={C.BLANC} stopOpacity={0} /><stop offset="1" stopColor={C.BLANC} stopOpacity={0.05} />
        </linearGradient>
        <linearGradient id={`${id}r`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={C.BLANC} stopOpacity={0.95} /><stop offset="0.45" stopColor={C.BRUME} stopOpacity={light ? 0.6 : 0.25} /><stop offset="1" stopColor={C.HALO} stopOpacity={light ? 0.55 : 0.6} />
        </linearGradient>
        <linearGradient id={`${id}o`} x1="1" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={C.ECLIPSE} /><stop offset="0.45" stopColor={C.ECLIPSE} stopOpacity={0.25} /><stop offset="0.7" stopColor={C.ECLIPSE} stopOpacity={0} />
        </linearGradient>
      </defs>
      <g clipPath={`url(#${id}c)`}>
        {as({ fill: base ?? (light ? C.LUNAIRE : C.COSMOS) })}
        <use href={`#${backdrop}`} transform={`${m}translate(${refract[0]} ${refract[1]})`} filter={`url(#${id}f)`} />
        {as({ fill: C.BLANC, opacity: tint })}
        {as({ fill: `url(#${id}s)` })}
      </g>
      {as({ fill: "none", stroke: `url(#${id}r)`, strokeWidth: rimWidth })}
      {warmRim > 0 && <g opacity={warmRim}>
        {as({ fill: "none", stroke: `url(#${id}o)`, strokeWidth: rimWidth * 1.4 })}
        <g opacity={0.35} filter={`url(#${id}g)`}>{as({ fill: "none", stroke: `url(#${id}o)`, strokeWidth: rimWidth * 4 })}</g>
      </g>}
    </g>
  );
};
