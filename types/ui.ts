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

export type PlayerTableRow = {
  player_id: string;
  name: string;
  stats: Stat[];
  // power: number;
  // powerRank: number;
  pos?: string;
  team?: string;
};
