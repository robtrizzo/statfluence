import { config } from "dotenv";
import { playerStatsTable } from "@/db/schema";
import fs from "fs";
import path from "path";
import { LibSQLDatabase } from "drizzle-orm/libsql";
import { Client } from "@libsql/client";

// Load environment variables from the project root
config({ path: path.resolve(process.cwd(), ".env") });

async function seedPlayerStats() {
  // take a command line flag of --test
  const isTest = process.argv[2] === "test";
  if (isTest) {
    console.log("Running in test mode, skipping database operations.");
  }

  let db;
  if (!isTest) {
    // Dynamically import db after environment variables are loaded
    db = (await import("@/db")).db;
  }

  // take file path from command line flag --file
  const filePath = process.argv[isTest ? 3 : 2];

  if (!filePath) {
    throw new Error("File path is required as a command line argument.");
  }

  // detect if the path is directory
  if (fs.lstatSync(filePath).isDirectory()) {
    // If it's a directory, read all CSV files in that directory
    const files = fs
      .readdirSync(filePath)
      .filter((file) => file.endsWith(".csv"));
    for (const file of files) {
      await seedPlayerStatsFile(path.join(filePath, file), isTest, db);
    }
    return;
  }

  await seedPlayerStatsFile(filePath, isTest, db);
}

async function seedPlayerStatsFile(
  filePath: string,
  isTest: boolean,
  db:
    | (LibSQLDatabase<Record<string, never>> & {
        $client: Client;
      })
    | undefined
) {
  // validate this is a csv file
  if (!filePath.endsWith(".csv")) {
    throw new Error("File path must point to a CSV file.");
  }

  // read the file content
  const fileContent = fs.readFileSync(filePath, "utf-8");

  const fileName = path.basename(filePath).replace(".csv", "");
  console.log(`Seeding player stats from file: ${fileName}`);

  const fileNameParts = fileName.split("_");
  if (fileNameParts.length < 4) {
    throw new Error(
      `Invalid file name format: ${fileName}. Expected format is "playerId_game_log_year.csv".`
    );
  }

  const playerId = fileNameParts[0];
  const year = parseInt(fileNameParts[3], 10);

  // ignore the first line (header)
  const lines = fileContent.split("\n").slice(1);

  // parse the CSV content
  const rows = [];
  for (const line of lines) {
    if (!line.trim()) continue; // Skip empty lines

    const [
      rk,
      date,
      age,
      tm,
      awayRaw,
      opp,
      wdiff,
      gs,
      mp,
      fg,
      fga,
      fgPct,
      threeP,
      threePA,
      threePPct,
      ft,
      fta,
      ftPct,
      orb,
      drb,
      trb,
      ast,
      stl,
      blk,
      tov,
      pf,
      pts,
      gmSc,
      seasonType,
    ] = line.split(",");

    let away = false;
    if (awayRaw === "@") {
      away = true;
    }

    rows.push({
      rk: parseInt(rk, 10),
      player_id: playerId,
      year,
      date,
      age,
      tm,
      away,
      opp,
      wdiff,
      gs: gs === "1" ? true : false,
      mp: parseInt(mp, 10),
      fg: parseInt(fg, 10),
      fga: parseInt(fga, 10),
      fgPct: fgPct || null,
      threeP: parseInt(threeP, 10),
      threePA: parseInt(threePA, 10),
      threePPct: threePPct || null,
      ft: parseInt(ft, 10),
      fta: parseInt(fta, 10),
      ftPct: ftPct || null,
      orb: parseInt(orb, 10),
      drb: parseInt(drb, 10),
      trb: parseInt(trb, 10),
      ast: parseInt(ast, 10),
      stl: parseInt(stl, 10),
      blk: parseInt(blk, 10),
      tov: parseInt(tov, 10),
      pf: parseInt(pf, 10),
      pts: parseInt(pts, 10),
      gmSc: gmSc || null,
      seasonType,
    });
  }

  console.log(
    `Parsed ${rows.length} rows for ${playerId}:${year}, inserting into database...`
  );

  // Bulk insert all rows at once
  if (rows.length > 0) {
    if (!isTest && db) {
      await db.insert(playerStatsTable).values(rows);
      console.log(
        `Successfully inserted ${rows.length} records for ${playerId}:${year} into the database.`
      );
    } else {
      console.log("Running in test mode, skipping database operations.");
    }
  } else {
    console.log("No rows to insert.");
  }
}

seedPlayerStats().catch(console.error);
