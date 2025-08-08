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
