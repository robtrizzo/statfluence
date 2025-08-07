export type PlayerStat = {
  id: number;
  rk: number | null;
  date: string | null;
  age: string | null;
  tm: string | null;
  away: boolean | null;
  opp: string | null;
  wdiff: string | null;
  gs: boolean | null;
  mp: number | null;
  fg: number | null;
  fga: number | null;
  fgPct: string | null;
  threeP: number | null;
  threePA: number | null;
  threePPct: string | null;
  ft: number | null;
  fta: number | null;
  ftPct: string | null;
  orb: number | null;
  drb: number | null;
  trb: number | null;
  ast: number | null;
  stl: number | null;
  blk: number | null;
  tov: number | null;
  pf: number | null;
  pts: number | null;
  gmSc: string | null;
  seasonType: string | null;
};

export const playerStatHeaders = [
  "rk", // Rank / Game number
  "date", // Date of the game
  "age", // Age of the player (format: "YY-DDD")
  "tm", // Team
  "away", // Away game (1 for away, 0 for home)
  "opp", // Opponent
  "wDiff", // Win Difference (W/L margin)
  "gs", // Games Started (1 for started, 0 for not)
  "mp", // Minutes Played
  "fg", // Field Goals Made (all shots except free throws)
  "fga", // Field Goals Attempted
  "fgPct", // Field Goal Percentage
  "threeP", // Three-Point Field Goals Made
  "threePA", // Three-Point Field Goals Attempted
  "threePPct", // Three-Point Field Goal Percentage
  "ft", // Free Throws Made
  "fta", // Free Throws Attempted
  "ftPct", // Free Throw Percentage
  "orb", // Offensive Rebounds
  "drb", // Defensive Rebounds
  "trb", // Total Rebounds
  "ast", // Assists
  "stl", // Steals
  "blk", // Blocks
  "tov", // Turnovers
  "pf", // Personal Fouls
  "pts", // Points
  "gmSc", // Game Score (advanced metric)
  "seasonType", // Season Type
  "player_id", // Player ID (not displayed in the table)
  "year", // Year of the stats (not displayed in the table)
];
