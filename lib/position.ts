export type Position = "Center" | "Forward" | "Guard";

const Centers: Set<string> = new Set(["C", "C-F", "F-C"]);
const Forwards: Set<string> = new Set(["F", "C-F", "F-C", "F-G", "G-F"]);
const Guards: Set<string> = new Set(["G", "F-G", "G-F"]);

export function getPositionFromAbbr(abbr: string): Position[] {
  const positions: Position[] = [];
  if (Centers.has(abbr)) positions.push("Center");
  if (Forwards.has(abbr)) positions.push("Forward");
  if (Guards.has(abbr)) positions.push("Guard");
  return positions;
}
