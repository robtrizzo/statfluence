import { playerStatsTable } from "@/db/schema";
import { and, eq, gte, lte, asc, inArray, desc } from "drizzle-orm";
import { db } from "@/db";
import { Stat } from "@/types/stat";
import { PlayerTableRow } from "@/types/ui";

export async function getAllPlayerStats(limit?: number, offset?: number) {
  const stats = await db
    .select()
    .from(playerStatsTable)
    .offset(offset ?? 0)
    .limit(limit ?? 10);

  return stats;
}

export async function getPlayerNamesByYear(
  year: number,
  limit?: number,
  offset?: number
) {
  const uniquePlayerNames = await db
    .selectDistinct({ name: playerStatsTable.name })
    .from(playerStatsTable)
    .where(eq(playerStatsTable.year, year))
    .orderBy(asc(playerStatsTable.name))
    .offset(offset ?? 0)
    .limit(limit ?? 10);

  const filteredUniquePlayerNames: string[] = uniquePlayerNames
    .map((obj) => obj.name)
    .filter((name): name is string => name !== null);

  return filteredUniquePlayerNames;
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
  player_id?: string | null;
  name?: string | null;
  team?: string | null;
  pos?: string | null;
  power?: number | null;
  powerRank?: number | null;
};

export async function getAllCurrentSeasonStatsForPlayers(
  year: number,
  playerNames: string[]
) {
  // get all stats for these player names
  const currentSeasonStats = await db
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
      player_id: playerStatsTable.player_id,
      name: playerStatsTable.name,
      team: playerStatsTable.team,
      pos: playerStatsTable.pos,
    })
    .from(playerStatsTable)
    .where(
      and(
        eq(playerStatsTable.year, year),
        inArray(playerStatsTable.name, playerNames)
      )
    )
    .orderBy(desc(playerStatsTable.date));

  return currentSeasonStats;
}

export async function getAllCurrentSeasonTrajectoryStats(
  limit?: number,
  offset?: number
): Promise<PlayerTableRow[]> {
  // get current year
  const currentYear = new Date().getFullYear();
  // get limit,offset player names for this season
  // TODO later this isn't necessary, we'll go off of power ranking
  const playerNames = await getPlayerNamesByYear(currentYear, limit, offset);
  // get all stats for these players and this season
  const allCurrentSeasonStats = await getAllCurrentSeasonStatsForPlayers(
    currentYear,
    playerNames
  );
  // construct a map by player name which will have an array of the last 5 games they played in
  const playerGameMaps = new Map<string, PlayerStat[]>();

  allCurrentSeasonStats.forEach((stat) => {
    if (!playerGameMaps.has(stat.name || "Unknown")) {
      playerGameMaps.set(stat.name || "Unknown", []);
    }
    playerGameMaps.get(stat.name || "Unknown")?.push(stat);
  });

  const playerGameMapsLast5 = new Map<string, PlayerStat[]>();

  // limit each player's games to the last 5
  playerGameMaps.forEach((games, playerName) => {
    playerGameMapsLast5.set(playerName, games.slice(0, 5));
  });

  const playerStatAverages = new Map<string, Stat[]>();

  playerGameMaps.forEach((games, playerName) => {
    const averages = getPlayerStatsAverages(games);
    playerStatAverages.set(playerName, averages);
  });

  const MARGIN = 0.1; // 10% margin to consider stable

  // for each of the player stat averages, compare them to the average of
  // their last five games
  playerStatAverages.forEach((averages, playerName) => {
    const lastFiveAverages = getPlayerStatsAverages(
      playerGameMapsLast5.get(playerName) || []
    );
    // Compare averages
    for (let i = 0; i < averages.length; i++) {
      const current = averages[i];
      const lastFive = lastFiveAverages[i];
      if (current && lastFive) {
        // Compare the current average to the last five games average
        // if the stat type is basic, we need to compute a % difference
        // and compare to margin
        if (current.type === "basic" && lastFive.type === "basic") {
          const diff =
            Math.abs(current.value - lastFive.value) / lastFive.value;
          if (diff > MARGIN) {
            current.trend = current.value > lastFive.value ? "up" : "down";
            current.color = current.value > lastFive.value ? "green" : "red";
          }
        } else if (
          current.type === "percentage" &&
          lastFive.type === "percentage"
        ) {
          // directly compare percentages
          const diff = Math.abs(current.value - lastFive.value);
          if (diff > MARGIN) {
            current.trend = current.value > lastFive.value ? "up" : "down";
            current.color = current.value > lastFive.value ? "green" : "red";
          }
        }
      }
    }
  });

  const playerTableRows: PlayerTableRow[] = [];

  playerStatAverages.forEach((averages, playerName) => {
    const playerGames = playerGameMapsLast5.get(playerName) || [];
    if (playerGames.length === 0) return;

    // console.log(`PlayerGames[0]: ${JSON.stringify(playerGames[0])}`);
    const { player_id, team, pos } = playerGames[0]; // Assuming all games have the same player info

    playerTableRows.push({
      player_id: player_id || "Unknown",
      name: playerName,
      team: team || "Unknown",
      pos: pos || "Unknown",
      stats: averages,
    });
  });

  return playerTableRows;
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

function getPlayerStatsAverages(stats: PlayerStat[]) {
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
