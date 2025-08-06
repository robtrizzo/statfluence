import { config } from "dotenv";
import { playerStatsTable } from "@/db/schema";
import path from "path";
import { eq, and } from "drizzle-orm";

config({ path: path.resolve(process.cwd(), ".env") });

async function deletePlayerYear() {
  const isTest = process.argv[2] === "test";
  if (isTest) {
    console.log("Running in test mode, skipping database operations.");
  }

  let db;
  if (!isTest) {
    db = (await import("@/db")).db;
  }

  const playerId = process.argv[isTest ? 3 : 2];
  const year = parseInt(process.argv[isTest ? 4 : 3], 10);

  if (!playerId || isNaN(year)) {
    throw new Error(
      "Player ID and year are required as command line arguments."
    );
  }

  if (!isTest && db) {
    const result = await db
      .delete(playerStatsTable)
      .where(
        and(
          eq(playerStatsTable.player_id, playerId),
          eq(playerStatsTable.year, year)
        )
      );
    console.log(
      `Deleted ${result.rowsAffected} records for player ${playerId} in year ${year}.`
    );
  } else {
    console.log("Running in test mode, skipping database operations.");
  }
}

deletePlayerYear().catch(console.error);
