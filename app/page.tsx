
import { TypographyH1 } from "@/components/ui/typography";
import { db } from "@/db";
import { playerStatsTable } from "@/db/schema";
import { desc, eq, and, sql } from "drizzle-orm";
import fs from "fs";
import path from "path";
import PlayerStatsTable from "./(components)/player-stats-table";

type SeasonRow = {
  player_id: string;
  pts: number;
  fga: number;
  fg: number;
  fgPct: number;
  trb: number;
  ast: number;
  stl: number;
  blk: number;
  tov: number;
  mp: number;
};

type DebugInfo = {
  chosenYear: number;
  chosenSeasonType: string | null;
  seasonTypeOptions: string[];
  yearOptions: number[];
  rowCount: number;
};

function slugifyName(name: string) {
  return name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9\\s-]/g, "")
    .trim()
    .replace(/\\s+/g, "-")
    .replace(/-+/g, "-");
}

function pctDeltaArrow(latest: number, season: number) {
  // returns "▲" | "▼" | ""
  if (season === 0) return "";
  const delta = (latest - season) / season;
  if (delta >= 0.10) return "▲";
  if (delta <= -0.10) return "▼";
  return "";
}

async function getYearOptions() {
  const rows = await db
    .select({ year: playerStatsTable.year })
    .from(playerStatsTable)
    .groupBy(playerStatsTable.year)
    .orderBy(desc(playerStatsTable.year));
  return rows.map(r => Number(r.year)).filter((v): v is number => typeof v === "number" && !Number.isNaN(v));
}

async function getSeasonTypeOptions(year?: number) {
  const q = db
    .select({ seasonType: playerStatsTable.seasonType })
    .from(playerStatsTable);
  const rows = year
    ? await q.where(eq(playerStatsTable.year, year)).groupBy(playerStatsTable.seasonType)
    : await q.groupBy(playerStatsTable.seasonType);
  return rows.map(r => r.seasonType).filter((v): v is string => !!v);
}

async function getSeasonAverages(year: number, seasonType: string | null) {
  const avgPts = sql<number>`avg(${playerStatsTable.pts})`.as("pts");
  const avgFga = sql<number>`avg(${playerStatsTable.fga})`.as("fga");
  const avgFg = sql<number>`avg(${playerStatsTable.fg})`.as("fg");
  const avgTrb = sql<number>`avg(${playerStatsTable.trb})`.as("trb");
  const avgAst = sql<number>`avg(${playerStatsTable.ast})`.as("ast");
  const avgStl = sql<number>`avg(${playerStatsTable.stl})`.as("stl");
  const avgBlk = sql<number>`avg(${playerStatsTable.blk})`.as("blk");
  const avgTov = sql<number>`avg(${playerStatsTable.tov})`.as("tov");
  const avgMp  = sql<number>`avg(${playerStatsTable.mp})`.as("mp");

  const whereClause = seasonType
    ? and(eq(playerStatsTable.year, year), eq(playerStatsTable.seasonType, seasonType))
    : eq(playerStatsTable.year, year);

  const rows = await db
    .select({
      player_id: playerStatsTable.player_id,
      pts: avgPts,
      fga: avgFga,
      fg: avgFg,
      trb: avgTrb,
      ast: avgAst,
      stl: avgStl,
      blk: avgBlk,
      tov: avgTov,
      mp: avgMp,
    })
    .from(playerStatsTable)
    .where(whereClause)
    .groupBy(playerStatsTable.player_id)
    .orderBy(desc(sql`avg(${playerStatsTable.pts})`));

  const mapped: SeasonRow[] = rows.map((r) => ({
    player_id: r.player_id ?? "",
    pts: Number(r.pts ?? 0),
    fga: Number(r.fga ?? 0),
    fg: Number(r.fg ?? 0),
    fgPct: Number(r.fga ? Number(r.fg ?? 0) / Number(r.fga) : 0),
    trb: Number(r.trb ?? 0),
    ast: Number(r.ast ?? 0),
    stl: Number(r.stl ?? 0),
    blk: Number(r.blk ?? 0),
    tov: Number(r.tov ?? 0),
    mp: Number(r.mp ?? 0),
  }));

  return mapped;
}

async function getLast5AveragesByPlayer(year: number, playerIds: string[], seasonType: string | null) {
  const map = new Map<string, SeasonRow>();

  for (const pid of playerIds) {
    const whereClause = seasonType
      ? and(eq(playerStatsTable.year, year), eq(playerStatsTable.seasonType, seasonType), eq(playerStatsTable.player_id, pid))
      : and(eq(playerStatsTable.year, year), eq(playerStatsTable.player_id, pid));

    const last5 = await db
      .select({
        pts: playerStatsTable.pts,
        fga: playerStatsTable.fga,
        fg: playerStatsTable.fg,
        trb: playerStatsTable.trb,
        ast: playerStatsTable.ast,
        stl: playerStatsTable.stl,
        blk: playerStatsTable.blk,
        tov: playerStatsTable.tov,
        mp: playerStatsTable.mp,
      })
      .from(playerStatsTable)
      .where(whereClause)
      .orderBy(desc(playerStatsTable.date))
      .limit(5);

    if (last5.length === 0) continue;

    const sum = last5.reduce((acc, row) => {
      acc.pts += Number(row.pts ?? 0);
      acc.fga += Number(row.fga ?? 0);
      acc.fg += Number(row.fg ?? 0);
      acc.trb += Number(row.trb ?? 0);
      acc.ast += Number(row.ast ?? 0);
      acc.stl += Number(row.stl ?? 0);
      acc.blk += Number(row.blk ?? 0);
      acc.tov += Number(row.tov ?? 0);
      acc.mp += Number(row.mp ?? 0);
      return acc;
    }, { pts:0, fga:0, fg:0, trb:0, ast:0, stl:0, blk:0, tov:0, mp:0 });

    const n = last5.length;
    map.set(pid, {
      player_id: pid,
      pts: sum.pts / n,
      fga: sum.fga / n,
      fg: sum.fg / n,
      fgPct: (sum.fga > 0 ? (sum.fg / sum.fga) : 0),
      trb: sum.trb / n,
      ast: sum.ast / n,
      stl: sum.stl / n,
      blk: sum.blk / n,
      tov: sum.tov / n,
      mp: sum.mp / n,
    });
  }

  return map;
}

function loadNameMap(): Record<string, string> {
  try {
    const csvPath = path.join(process.cwd(), "Data", "wnba_player_ids_master.csv");
    const raw = fs.readFileSync(csvPath, "utf-8");
    const lines = raw.split(/\r?\n/).filter(Boolean);
    if (lines.length) lines.shift(); // header
    const map: Record<string, string> = {};
    for (const line of lines) {
      const [name, pid] = line.split(",");
      if (name && pid) map[pid.trim()] = name.trim();
    }
    return map;
  } catch (e) {
    console.error("Failed to load player id map:", e);
    return {};
  }
}

export default async function Home() {
  // Determine usable year/season type
  const years = await getYearOptions();
  const seasonTypeAll = await getSeasonTypeOptions();
  const normalized = seasonTypeAll.map(s => (s ?? "").trim().toLowerCase());
  const rsIndex = normalized.findIndex(s => s.startsWith("regular season"));
  const preferredSeasonType = rsIndex >= 0 ? seasonTypeAll[rsIndex]! : null;

  let chosenYear = years[0] ?? new Date().getFullYear();
  let chosenSeasonType: string | null = preferredSeasonType;
  let season = await getSeasonAverages(chosenYear, chosenSeasonType);
  if (season.length === 0 && chosenSeasonType) {
    chosenSeasonType = null;
    season = await getSeasonAverages(chosenYear, chosenSeasonType);
  }
  if (season.length === 0) {
    for (const y of years.slice(1)) {
      const attempt = await getSeasonAverages(y, preferredSeasonType);
      if (attempt.length > 0) {
        chosenYear = y;
        chosenSeasonType = preferredSeasonType;
        season = attempt;
        break;
      }
      const attempt2 = await getSeasonAverages(y, null);
      if (attempt2.length > 0) {
        chosenYear = y;
        chosenSeasonType = null;
        season = attempt2;
        break;
      }
    }
  }

  const last5Map = await getLast5AveragesByPlayer(chosenYear, season.map(s => s.player_id), chosenSeasonType);
  const nameMap = loadNameMap();

  const rows = season.map((s) => {
    const r5 = last5Map.get(s.player_id);
    const latest = r5 ?? { ...s };
    const name = nameMap[s.player_id] ?? s.player_id;
    // arrows based on ±10% vs season average; TOV inverted in client
    function pctDeltaArrow(latest: number, season: number) {
      if (season === 0) return "";
      const delta = (latest - season) / season;
      if (delta >= 0.10) return "▲";
      if (delta <= -0.10) return "▼";
      return "";
    }
    return {
      player_id: s.player_id,
      name,
      slug: (name || "").toLowerCase().normalize("NFKD").replace(/[^a-z0-9\\s-]/g, "").trim().replace(/\\s+/g, "-").replace(/-+/g, "-"),
      pts: s.pts,
      ptsArrow: r5 ? pctDeltaArrow(latest.pts, s.pts) : "",
      fgPct: s.fgPct,
      fgPctArrow: r5 ? pctDeltaArrow(latest.fgPct, s.fgPct) : "",
      trb: s.trb,
      trbArrow: r5 ? pctDeltaArrow(latest.trb, s.trb) : "",
      ast: s.ast,
      astArrow: r5 ? pctDeltaArrow(latest.ast, s.ast) : "",
      stl: s.stl,
      stlArrow: r5 ? pctDeltaArrow(latest.stl, s.stl) : "",
      blk: s.blk,
      blkArrow: r5 ? pctDeltaArrow(latest.blk, s.blk) : "",
      tov: s.tov,
      tovArrow: r5 ? pctDeltaArrow(latest.tov, s.tov) : "",
      mp: s.mp,
      mpArrow: r5 ? pctDeltaArrow(latest.mp, s.mp) : "",
    };
  });

  const debug: DebugInfo = {
    chosenYear,
    chosenSeasonType,
    seasonTypeOptions: seasonTypeAll,
    yearOptions: years,
    rowCount: rows.length,
  };

  return (
    <div className="p-8">
      <TypographyH1>Statfluence</TypographyH1>
      <main className="mt-8 space-y-4">
        <div className="text-muted-foreground">
          Current season averages (year {debug.chosenYear}{debug.chosenSeasonType ? `, ${debug.chosenSeasonType}` : ""}), ranked by PTS. Arrows compare last 5 games vs season average (±10%).
        </div>
        <PlayerStatsTable rows={rows as any} />
        <div className="text-xs text-muted-foreground">
          Loaded {debug.rowCount} players. Years in DB: {debug.yearOptions.join(", ") || "none"} | season_type values seen: {debug.seasonTypeOptions.join(" | ") || "none"}.
        </div>
      </main>
    </div>
  );
}
