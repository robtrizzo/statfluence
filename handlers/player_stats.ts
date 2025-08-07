import { playerStatsTable } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";

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
    throw new Error(
      `No stats found for player ${playerid} in year ${currentYear}`
    );
  }

  const summary = {
    mp: 0,
    pts: 0,
    fg: 0,
    fga: 0,
    fgPct: 0,
    trb: 0,
    ast: 0,
    stl: 0,
    blk: 0,
    tov: 0,
  };

  stats.forEach((stat) => {
    summary.mp += stat.mp || 0;
    summary.pts += stat.pts || 0;
    summary.fg += stat.fg || 0;
    summary.fga += stat.fga || 0;
    summary.trb += stat.trb || 0;
    summary.ast += stat.ast || 0;
    summary.stl += stat.stl || 0;
    summary.blk += stat.blk || 0;
    summary.tov += stat.tov || 0;
  });

  // calculate averages
  summary.mp = parseFloat((summary.mp / stats.length).toFixed(1));
  summary.pts = parseFloat((summary.pts / stats.length).toFixed(1));
  summary.trb = parseFloat((summary.trb / stats.length).toFixed(1));
  summary.ast = parseFloat((summary.ast / stats.length).toFixed(1));
  summary.stl = parseFloat((summary.stl / stats.length).toFixed(1));
  summary.blk = parseFloat((summary.blk / stats.length).toFixed(1));
  summary.tov = parseFloat((summary.tov / stats.length).toFixed(1));

  // calculate fgPct
  summary.fgPct =
    summary.fga > 0 ? Number((summary.fg / summary.fga).toFixed(3)) : 0;

  return summary;
}
