export type PlayerStat = {
  Rk: number;
  Date: string;
  Age: string;
  Tm: string;
  Away: boolean;
  Opp: string;
  WDiff: string;
  GS: number;
  MP: string;
  FG: number;
  FGA: number;
  "FG%": number | null;
  "3P": number;
  "3PA": number;
  "3P%": number | null;
  FT: number;
  FTA: number;
  "FT%": number | null;
  ORB: number;
  DRB: number;
  TRB: number;
  AST: number;
  STL: number;
  BLK: number;
  TOV: number;
  PF: number;
  PTS: number;
  GmSc: number;
  SeasonType: string;
};

export const playerStatHeaders = [
  "Rk", // Rank / Game number
  "Date", // Date of the game
  "Age", // Age of the player (format: "YY-DDD")
  "Tm", // Team
  "Away", // Away game (1 for away, 0 for home)
  "Opp", // Opponent
  "WDiff", // Win Difference (W/L margin)
  "GS", // Games Started (1 for started, 0 for not)
  "MP", // Minutes Played
  "FG", // Field Goals Made (all shots except free throws)
  "FGA", // Field Goals Attempted
  "FG%", // Field Goal Percentage
  "3P", // Three-Point Field Goals Made
  "3PA", // Three-Point Field Goals Attempted
  "3P%", // Three-Point Field Goal Percentage
  "FT", // Free Throws Made
  "FTA", // Free Throws Attempted
  "FT%", // Free Throw Percentage
  "ORB", // Offensive Rebounds
  "DRB", // Defensive Rebounds
  "TRB", // Total Rebounds
  "AST", // Assists
  "STL", // Steals
  "BLK", // Blocks
  "TOV", // Turnovers
  "PF", // Personal Fouls
  "PTS", // Points
  "GmSc", // Game Score (advanced metric)
  "SeasonType", // Season Type
];

export const playerStats: PlayerStat[] = [
  {
    Rk: 1,
    Date: "2022-08-18",
    Age: "22-024",
    Tm: "WAS",
    Away: true,
    Opp: "SEA",
    WDiff: "L (-3)",
    GS: 1,
    MP: "25:25",
    FG: 6,
    FGA: 10,
    "FG%": 0.6,
    "3P": 0,
    "3PA": 0,
    "3P%": null,
    FT: 0,
    FTA: 2,
    "FT%": 0.0,
    ORB: 3,
    DRB: 4,
    TRB: 7,
    AST: 0,
    STL: 1,
    BLK: 1,
    TOV: 2,
    PF: 2,
    PTS: 12,
    GmSc: 8.8,
    SeasonType: "Regular",
  },
  {
    Rk: 22,
    Date: "2022-06-28",
    Age: "21-338",
    Tm: "WAS",
    Away: false,
    Opp: "ATL",
    WDiff: "W (+18)",
    GS: 1,
    MP: "22:18",
    FG: 3,
    FGA: 5,
    "FG%": 0.6,
    "3P": 0,
    "3PA": 0,
    "3P%": null,
    FT: 3,
    FTA: 5,
    "FT%": 0.6,
    ORB: 1,
    DRB: 6,
    TRB: 7,
    AST: 2,
    STL: 1,
    BLK: 1,
    TOV: 2,
    PF: 2,
    PTS: 9,
    GmSc: 8.7,
    SeasonType: "Regular",
  },
  {
    Rk: 23,
    Date: "2022-07-03",
    Age: "21-343",
    Tm: "WAS",
    Away: true,
    Opp: "CON",
    WDiff: "L (-2)",
    GS: 1,
    MP: "29:16",
    FG: 4,
    FGA: 6,
    "FG%": 0.667,
    "3P": 0,
    "3PA": 0,
    "3P%": null,
    FT: 5,
    FTA: 8,
    "FT%": 0.625,
    ORB: 1,
    DRB: 2,
    TRB: 3,
    AST: 2,
    STL: 0,
    BLK: 1,
    TOV: 2,
    PF: 2,
    PTS: 13,
    GmSc: 9.8,
    SeasonType: "Regular",
  },
];
