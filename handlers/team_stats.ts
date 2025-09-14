import { db } from "@/db";
import { playerStatsTable } from "@/db/schema";
import { Stat } from "@/types/stat";
import { and, eq, gte, lte, asc, inArray, desc } from "drizzle-orm";

export async function getPastSeasonsTeamSummary(
  teamid: string,
  pastSeasons: number = 1
) {
  const currentYear = new Date().getFullYear();
  if (!teamid || teamid.trim().length === 0) {
    throw new Error("Team ID is required");
  }

  const startYear = currentYear - pastSeasons;
  const endYear = currentYear;

  const stats = await db
    .select({
      mp: playerStatsTable.mp,
      pts: playerStatsTable.pts,
      fg: playerStatsTable.fg,
      fga: playerStatsTable.fga,
      trb: playerStatsTable.trb,
      ast: playerStatsTable.ast,
      stl: playerStatsTable.stl,
      blk: playerStatsTable.blk,
      tov: playerStatsTable.tov,
      date: playerStatsTable.date,
    })
    .from(playerStatsTable)
    .where(
      and(
        eq(playerStatsTable.team, teamid),
        gte(playerStatsTable.year, startYear),
        lte(playerStatsTable.year, endYear)
      )
    );

  if (stats.length === 0) {
    console.warn(
      `No stats found for team ${teamid} in years ${startYear}-${endYear}`
    );
    return null;
  }

  // todo use the below comment as a reference to filter for the past 5 games

  //   export function getLastFiveGameDates(playerStats: PlayerStat[]) {
  //   // Get unique dates and sort them descending
  //   const uniqueDates = [...new Set(playerStats.map(stat => stat.date))]
  //     .filter(date => date !== null)
  //     .sort((a, b) => new Date(b!).getTime() - new Date(a!).getTime())
  //     .slice(0, 5);

  //   return uniqueDates;
  // }

  // export function filterStatsToLastFiveGames(playerStats: PlayerStat[]) {
  //   const lastFiveDates = getLastFiveGameDates(playerStats);

  //   return playerStats.filter(stat =>
  //     stat.date && lastFiveDates.includes(stat.date)
  //   );
  // }
  // todo pass last 5 games into getTeamStatsSummary to get averages

  const summary = getTeamStatsSummary(stats);
  return summary;
}

type PlayerStat = {
  mp: number | null;
  pts: number | null;
  fg: number | null;
  fga: number | null;
  trb: number | null;
  ast: number | null;
  stl: number | null;
  blk: number | null;
  tov: number | null;
  date?: string | null;
  playerId?: string | null;
  name?: string | null;
  team?: string | null;
  pos?: string | null;
  power?: number | null;
  powerRank?: number | null;
};

function getTeamStatsSummary(stats: PlayerStat[]) {
  const formattedStats: Stat[] = [
    {
      name: "Minutes Played",
      value: 0,
      type: "basic",
    },
    {
      name: "Points",
      value: 0,
      type: "basic",
    },
    {
      name: "Field Goals",
      value: 0,
      type: "basic",
    },
    {
      name: "Field Goal Attempted",
      value: 0,
      type: "basic",
    },
    {
      name: "Total Rebounds",
      value: 0,
      type: "basic",
    },
    {
      name: "Assists",
      value: 0,
      type: "basic",
    },
    {
      name: "Steals",
      value: 0,
      type: "basic",
    },
    {
      name: "Blocks",
      value: 0,
      type: "basic",
    },
    { name: "Turnovers", value: 0, type: "basic" },
  ];

  for (let i = 0; i < stats.length; i++) {
    formattedStats[0].value += stats[i].mp || 0;
    formattedStats[1].value += stats[i].pts || 0;
    formattedStats[2].value += stats[i].fg || 0;
    formattedStats[3].value += stats[i].fga || 0;
    formattedStats[4].value += stats[i].trb || 0;
    formattedStats[5].value += stats[i].ast || 0;
    formattedStats[6].value += stats[i].stl || 0;
    formattedStats[7].value += stats[i].blk || 0;
    formattedStats[8].value += stats[i].tov || 0;
  }

  formattedStats.forEach((stat) => {
    stat.value = parseFloat((stat.value / stats.length).toFixed(1));
  });

  return formattedStats;

  // how to get the totals of the last 5 games?
}
