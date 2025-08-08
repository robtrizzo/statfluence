import { config } from "dotenv";
import { playerStatsTable } from "@/db/schema";
import path from "path";
import { eq } from "drizzle-orm";

config({ path: path.resolve(process.cwd(), ".env") });

async function deleteYear() {
  const isTest = process.argv[2] === "test";
  if (isTest) {
    console.log("Running in test mode, skipping database operations.");
  }

  let db;
  if (!isTest) {
    db = (await import("@/db")).db;
  }

  const year = parseInt(process.argv[isTest ? 3 : 2], 10);

  if (isNaN(year)) {
    throw new Error("Year is required as a command line argument.");
  }

  if (!isTest && db) {
    const result = await db
      .delete(playerStatsTable)
      .where(eq(playerStatsTable.year, year));
    console.log(`Deleted ${result.rowsAffected} records for year ${year}.`);
  } else {
    console.log("Running in test mode, skipping database operations.");
  }
}

deleteYear().catch(console.error);
