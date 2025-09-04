export type ComboboxPlayer = {
  value: string;
  label: string;
};

export type Stat = {
  name: string;
  value: number;
  type: "basic" | "percentage";
  unit?: string;
  trend?: "up" | "down" | "stable";
  color?: string;
};

export const playerTableStatHeaders = [
  { key: "mp", title: "Minutes Played" },
  { key: "pts", title: "Points" },
  { key: "fg", title: "Field Goals Made" },
  { key: "trb", title: "Total Rebounds" },
  { key: "ast", title: "Assists" },
  { key: "stl", title: "Steals" },
  { key: "blk", title: "Blocks" },
  { key: "tov", title: "Turnovers" },
  { key: "power", title: "Power" },
  { key: "powerRank", title: "Power Rank" },
];

export type PlayerStats = {
  player_id: string;
  name: string;
  stats: Stat[];
  pos?: string;
  team?: string;
};

export type PlayerTableRow = {
  player_id: string;
  name: string;
  mp: number;
  pts: number;
  fg: number;
  trb: number;
  ast: number;
  stl: number;
  blk: number;
  tov: number;
  power: number;
  powerRank: number;
  pos?: string;
  team?: string;
};
