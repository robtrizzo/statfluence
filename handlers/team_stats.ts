import { db } from "@/db";
import { playerStatsTable } from "@/db/schema";
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
    return [];
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
  const totals = stats.reduce(
    (acc, stat) => {
      acc.mp += stat.mp || 0;
      acc.pts += stat.pts || 0;
      acc.fg += stat.fg || 0;
      acc.fga += stat.fga || 0;
      acc.trb += stat.trb || 0;
      acc.ast += stat.ast || 0;
      acc.stl += stat.stl || 0;
      acc.blk += stat.blk || 0;
      acc.tov += stat.tov || 0;
      return acc;
    },
    {
      mp: 0,
      pts: 0,
      fg: 0,
      fga: 0,
      trb: 0,
      ast: 0,
      stl: 0,
      blk: 0,
      tov: 0,
    } as {
      mp: number;
      pts: number;
      fg: number;
      fga: number;
      trb: number;
      ast: number;
      stl: number;
      blk: number;
      tov: number;
    }
  );
  const averages = {
    mp: totals.mp / stats.length || 0,
    pts: totals.pts / stats.length || 0,
    fg: totals.fg / stats.length || 0,
    fga: totals.fga / stats.length || 0,
    trb: totals.trb / stats.length || 0,
    ast: totals.ast / stats.length || 0,
    stl: totals.stl / stats.length || 0,
    blk: totals.blk / stats.length || 0,
    tov: totals.tov / stats.length || 0,
  };

  // how to get the totals of the last 5 games?

  return averages;
}
