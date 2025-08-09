import { db } from "@/db";
import { playerStatsTable } from "@/db/schema";
import { unstable_cache } from "next/cache";

// Calculate seconds until next May 1st
function getSecondsUntilNextMay1st(): number {
  const now = new Date();
  const currentYear = now.getFullYear();

  // Try this year's May 1st first
  let nextMay1 = new Date(currentYear, 4, 1, 0, 0, 0); // May 1st this year (month is 0-indexed)

  // If we're already past May 1st this year, target next year's May 1st
  if (now >= nextMay1) {
    nextMay1 = new Date(currentYear + 1, 4, 1, 0, 0, 0); // May 1st next year
  }

  const secondsUntilNextMay1 = Math.floor(
    (nextMay1.getTime() - now.getTime()) / 1000
  );

  return secondsUntilNextMay1;
}

export const getPlayerIds = unstable_cache(
  async () => {
    const players = await db
      .selectDistinct({ player_id: playerStatsTable.player_id })
      .from(playerStatsTable);
    return players.map((player) => player.player_id);
  },
  [`player-ids-${new Date().getFullYear()}`], // cache key includes year
  {
    revalidate: getSecondsUntilNextMay1st(), // Revalidate on May 1st
    tags: ["player-ids"], // optional: for manual cache invalidation
  }
);


import fs from "fs";
import path from "path";
import { eq } from "drizzle-orm";

type PlayerEntry = { id: string; name: string };

function loadIdToNameMap(): Record<string, string> {
  const idToName: Record<string, string> = {};
  try {
    const csvPath = path.join(process.cwd(), "Data", "wnba_player_ids_master.csv");
    const raw = fs.readFileSync(csvPath, "utf-8");
    const lines = raw.split(/\r?\n/).filter(Boolean);
    if (lines.length) lines.shift(); // drop header
    for (const line of lines) {
      const [name, pid] = line.split(",");
      if (!name || !pid) continue;
      idToName[pid.trim()] = name.trim();
    }
  } catch (e) {
    console.error("Failed to load wnba_player_ids_master.csv", e);
  }
  return idToName;
}

export const getPlayersForYearWithNames = unstable_cache(
  async (year: number) => {
    const rows = await db
      .selectDistinct({ player_id: playerStatsTable.player_id })
      .from(playerStatsTable)
      .where(eq(playerStatsTable.year, year));

    const ids = rows.map((r) => r.player_id).filter((v): v is string => !!v);
    const idToName = loadIdToNameMap();

    const entries: PlayerEntry[] = ids.map((id) => ({
      id,
      name: idToName[id] ?? id,
    }));

    // Sort by name for nicer UX
    entries.sort((a, b) => a.name.localeCompare(b.name));
    return entries;
  },
  // Cache key includes the target year
  [(typeof process !== "undefined" ? process.env.NODE_ENV : "prod") === "development" ? `dev-players-${new Date().toISOString()}` : "players-by-year-2025"],
  {
    // Revalidate daily; underlying stats might update frequently
    revalidate: 60 * 60 * 24,
    tags: ["players-by-year"],
  }
);
