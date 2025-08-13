export function powerScore(p: {
  pts: number;
  ast: number;
  stl: number;
  blk: number;
  tov: number;
}) {
  return p.pts + p.ast * 1.1 + p.stl * 1.2 + p.blk * 1.0 - p.tov * 1.3;
}
