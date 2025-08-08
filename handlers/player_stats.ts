import { playerStatsTable } from "@/db/schema";
import { and, eq, gte, lte } from "drizzle-orm";
import { db } from "@/db";
import { Stat } from "@/types/stat";

export async function getAllPlayerStats(limit?: number, offset?: number) {
  const stats = await db
    .select()
    .from(playerStatsTable)
    .offset(offset ?? 0)
    .limit(limit ?? 10);

  return stats;
}

export async function getPlayerStatsById(
  playerid: string,
  limit?: number,
  offset?: number
) {
  if (!playerid || playerid.trim().length === 0) {
    throw new Error("Player ID is required");
  }

  if (limit && (limit < 1 || limit > 1000)) {
    throw new Error("Limit must be between 1 and 1000");
  }

  if (offset && offset < 0) {
    throw new Error("Offset must be non-negative");
  }

  const stats = await db
    .select()
    .from(playerStatsTable)
    .where(eq(playerStatsTable.player_id, playerid))
    .offset(offset ?? 0)
    .limit(limit ?? 10);

  return stats;
}

export async function getCurrentSeasonPlayerSummary(playerid: string) {
  const currentYear = new Date().getFullYear();
  if (!playerid || playerid.trim().length === 0) {
    throw new Error("Player ID is required");
  }
  console.log(
    `Fetching current season (${currentYear}) summary for player: ${playerid}`
  );

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
    })
    .from(playerStatsTable)
    .where(
      and(
        eq(playerStatsTable.player_id, playerid),
        eq(playerStatsTable.year, currentYear)
      )
    );
  console.log(`Fetched ${stats.length} stats for player: ${playerid}`);

  if (stats.length === 0) {
    console.warn(
      `No stats found for player ${playerid} in year ${currentYear}`
    );
    return [];
  }

  const summary = getPlayerStatsAverages(stats);

  return summary;
}

export async function getPastSeasonsPlayerSummary(
  playerid: string,
  pastSeasons: number = 3
) {
  const currentYear = new Date().getFullYear();
  if (!playerid || playerid.trim().length === 0) {
    throw new Error("Player ID is required");
  }

  const startYear = currentYear - pastSeasons;
  const endYear = currentYear - 1; // Exclude current year

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
    })
    .from(playerStatsTable)
    .where(
      and(
        eq(playerStatsTable.player_id, playerid),
        gte(playerStatsTable.year, startYear),
        lte(playerStatsTable.year, endYear)
      )
    );

  if (stats.length === 0) {
    console.warn(
      `No stats found for player ${playerid} in years ${startYear}-${endYear}`
    );
    return [];
  }

  const summary = getPlayerStatsAverages(stats);

  return summary;
}

function getPlayerStatsAverages(
  stats: {
    mp: number | null;
    pts: number | null;
    fg: number | null;
    fga: number | null;
    trb: number | null;
    ast: number | null;
    stl: number | null;
    blk: number | null;
    tov: number | null;
  }[]
) {
  const summary: Stat[] = [
    {
      name: "Average Minutes Played",
      value: 0,
      type: "basic",
    },
    {
      name: "Average Points",
      value: 0,
      type: "basic",
    },
    {
      name: "Field Goal %",
      value: 0,
      type: "percentage",
    },
    {
      name: "Average Total Rebounds",
      value: 0,
      type: "basic",
    },
    {
      name: "Average Assists",
      value: 0,
      type: "basic",
    },
    {
      name: "Average Steals",
      value: 0,
      type: "basic",
    },
    {
      name: "Average Blocks",
      value: 0,
      type: "basic",
    },
    {
      name: "Average Turnovers",
      value: 0,
      type: "basic",
    },
  ];

  let fg = 0;
  let fga = 0;

  stats.forEach((stat) => {
    summary[0].value += stat.mp || 0;
    summary[1].value += stat.pts || 0;
    summary[3].value += stat.trb || 0;
    summary[4].value += stat.ast || 0;
    summary[5].value += stat.stl || 0;
    summary[6].value += stat.blk || 0;
    summary[7].value += stat.tov || 0;
    fg += stat.fg || 0;
    fga += stat.fga || 0;
  });

  // calculate averages
  summary[0].value = parseFloat((summary[0].value / stats.length).toFixed(1));
  summary[1].value = parseFloat((summary[1].value / stats.length).toFixed(1));
  summary[3].value = parseFloat((summary[3].value / stats.length).toFixed(1));
  summary[4].value = parseFloat((summary[4].value / stats.length).toFixed(1));
  summary[5].value = parseFloat((summary[5].value / stats.length).toFixed(1));
  summary[6].value = parseFloat((summary[6].value / stats.length).toFixed(1));
  summary[7].value = parseFloat((summary[7].value / stats.length).toFixed(1));

  // calculate fgPct
  summary[2].value = fga > 0 ? Number((fg / fga).toFixed(3)) : 0;
  return summary;
}
