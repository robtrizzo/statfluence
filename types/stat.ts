export type Stat = {
  name: string;
  value: number;
  type: "basic" | "percentage";
  unit?: string;
  trend?: "up" | "down" | "stable";
  color?: string;
};
