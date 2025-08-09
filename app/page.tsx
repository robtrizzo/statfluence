import { TypographyH1 } from "@/components/ui/typography";
import { db } from "@/db";
import { playerStatsTable } from "@/db/schema";
import { desc, eq, and, sql } from "drizzle-orm";
import fs from "fs";
import path from "path";
import PlayerStatsTable from "./(components)/player-stats-table";

function mapPosToBucket(raw) {
  const r = (raw || "").toUpperCase();
  if (["C", "C-F", "F-C"].includes(r)) return "Centers";
  if (["F", "C-F", "F-C", "F-G", "G-F"].includes(r)) return "Forwards";
  if (["G", "F-G", "G-F"].includes(r)) return "Guards";
  return "";
}


const MAX_PLAYERS = 120;

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
  if (delta >= 0.1) return "▲";
  if (delta <= -0.1) return "▼";
  return "";
}

async function getYearOptions() {
  const rows = await db
    .select({ year: playerStatsTable.year })
    .from(playerStatsTable)
    .groupBy(playerStatsTable.year)
    .orderBy(desc(playerStatsTable.year));
  return rows
    .map((r) => Number(r.year))
    .filter((v): v is number => typeof v === "number" && !Number.isNaN(v));
}

async function getSeasonTypeOptions(year?: number) {
  const q = db
    .select({ seasonType: playerStatsTable.seasonType })
    .from(playerStatsTable);
  const rows = year
    ? await q
        .where(eq(playerStatsTable.year, year))
        .groupBy(playerStatsTable.seasonType)
    : await q.groupBy(playerStatsTable.seasonType);
  return rows.map((r) => r.seasonType).filter((v): v is string => !!v);
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
  const avgMp = sql<number>`avg(${playerStatsTable.mp})`.as("mp");

  const whereClause = seasonType
    ? and(
        eq(playerStatsTable.year, year),
        eq(playerStatsTable.seasonType, seasonType)
      )
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

async function getLast5AveragesByPlayer(
  year: number,
  playerIds: string[],
  seasonType: string | null
) {
  const map = new Map<string, SeasonRow>();

  for (const pid of playerIds) {
    const whereClause = seasonType
      ? and(
          eq(playerStatsTable.year, year),
          eq(playerStatsTable.seasonType, seasonType),
          eq(playerStatsTable.player_id, pid)
        )
      : and(
          eq(playerStatsTable.year, year),
          eq(playerStatsTable.player_id, pid)
        );

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

    const sum = last5.reduce(
      (acc, row) => {
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
      },
      { pts: 0, fga: 0, fg: 0, trb: 0, ast: 0, stl: 0, blk: 0, tov: 0, mp: 0 }
    );

    const n = last5.length;
    map.set(pid, {
      player_id: pid,
      pts: sum.pts / n,
      fga: sum.fga / n,
      fg: sum.fg / n,
      fgPct: sum.fga > 0 ? sum.fg / sum.fga : 0,
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
    const csvPath = path.join(
      process.cwd(),
      "Data",
      "wnba_player_ids_master.csv"
    );
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

export default async function Home({ searchParams }: { searchParams?: { team?: string; pos?: string } }) {
  // Determine usable year/season type
  const years = await getYearOptions();
  const seasonTypeAll = await getSeasonTypeOptions();
  const normalized = seasonTypeAll.map((s) => (s ?? "").trim().toLowerCase());
  const rsIndex = normalized.findIndex((s) => s.startsWith("regular season"));
  const preferredSeasonType = rsIndex >= 0 ? seasonTypeAll[rsIndex]! : null;

  let chosenYear = years[0] ?? new Date().getFullYear();
  let chosenSeasonType: string | null = preferredSeasonType;
  let season = await getSeasonAverages(chosenYear, chosenSeasonType);
  if (season.length === 0 && chosenSeasonType) {
    chosenSeasonType = null;
    season = await getSeasonAverages(chosenYear, chosenSeasonType);
  }
  
  const selectedTeam = (searchParams?.team ?? "").toUpperCase();
  const selectedPos = (searchParams?.pos ?? "").toUpperCase();

  const teamOptions = await getTeamOptions(chosenYear, chosenSeasonType);
  const positionOptions = await getPositionOptions(chosenYear);


  // Filter by team if provided
  let teamEligibleIds: string[] | null = null;
  if (selectedTeam && teamOptions.includes(selectedTeam)) {
    teamEligibleIds = await getTeamEligiblePlayerIds(chosenYear, chosenSeasonType, selectedTeam);
    season = season.filter((s) => teamEligibleIds!.includes(s.player_id));
  }

  // Filter by position if provided
  if (selectedPos) {
    season = season.filter((s) => {
      const pos = (idToPos[s.player_id] ?? "").toUpperCase();
      if (!pos) return false;
      // match exact or hybrid containing the selection (e.g., "F-G" matches "F" or "G")
      if (pos === selectedPos) return true;
      return pos.split("-").includes(selectedPos);
    });
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

  const last5Map = await getLast5AveragesByPlayer(
    chosenYear,
    season.map((s) => s.player_id),
    chosenSeasonType
  );
  const nameMap = loadNameMap();

  const rows = season.map((s) => {
    const r5 = last5Map.get(s.player_id);

    const latest = r5 ?? { ...s };
    const name = nameMap[s.player_id] ?? s.player_id;
    const seasonPR = (s.pts ?? 0) + (10/12.5)*(s.trb ?? 0) + (10/6.5)*(s.ast ?? 0) + (10/3)*(s.stl ?? 0) + (10/3)*(s.blk ?? 0);
    const last5PR = r5 ? ((r5.pts ?? 0) + (10/12.5)*(r5.trb ?? 0) + (10/6.5)*(r5.ast ?? 0) + (10/3)*(r5.stl ?? 0) + (10/3)*(r5.blk ?? 0)) : seasonPR;
    const power = 0.75 * seasonPR + 0.25 * last5PR;

    // arrows based on ±10% vs season average; TOV inverted in client
    function pctDeltaArrow(latest: number, season: number) {
      if (season === 0) return "";
      const delta = (latest - season) / season;
      if (delta >= 0.1) return "▲";
      if (delta <= -0.1) return "▼";
      return "";
    }
    return {
      player_id: s.player_id,
      name,
      slug: (name || "")
        .toLowerCase()
        .normalize("NFKD")
        .replace(/[^a-z0-9\\s-]/g, "")
        .trim()
        .replace(/\\s+/g, "-")
        .replace(/-+/g, "-"),
      power: power,
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
  
  // === Power Rankings (rank numbers) ===
  const rankById = new Map<string, number>();
  [...rows]
    .sort((a, b) => (b.power ?? 0) - (a.power ?? 0))
    .forEach((r, i) => rankById.set(r.player_id, i + 1));

  const rowsWithRank = rows.map(r => ({
    ...r,
    powerRank: rankById.get(r.player_id) || rows.length,
  }));

const posMap = loadPositionMap(chosenYear);
  const teamMap = loadTeamMap(chosenYear);

  
  const teamOptionsLocal = await getTeamOptions(chosenYear, chosenSeasonType);
  const positionOptionsLocal = await getPositionOptions(chosenYear);
const enrichedRows = rowsWithRank.map((r) => ({ ...r, pos: mapPosToBucket(posMap[r.player_id] ?? ''), team: teamMap[r.player_id] ?? '' }));


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
          Current season averages
          {debug.chosenSeasonType ? `, ${debug.chosenSeasonType}` : ""}. Arrows
          compare last 5 games vs season average (±10%).
        </div>
        <PlayerStatsTable rows={enrichedRows as any} />
        <div className="text-xs text-muted-foreground">
          Loaded {debug.rowCount} players.
        </div>
      </main>
    </div>
  );
}


async function getTeamOptions(year: number, seasonType: string | null) {
  const whereClause = seasonType
    ? and(eq(playerStatsTable.year, year), eq(playerStatsTable.seasonType, seasonType))
    : eq(playerStatsTable.year, year);

  const rows = await db
    .select({ tm: playerStatsTable.tm })
    .from(playerStatsTable)
    .where(whereClause)
    .groupBy(playerStatsTable.tm);

  return rows
    .map((r) => r.tm)
    .filter((v): v is string => !!v)
    .sort();
}

function loadPositionMap(year: number): Record<string, string> {
  const idToPos: Record<string, string> = {};
  try {
    const idToName = loadNameMap();
    const csvCandidate = path.join(process.cwd(), "Data", `wnba_player_per_game_${year}.csv`);
    if (fs.existsSync(csvCandidate)) {
      const raw = fs.readFileSync(csvCandidate, "utf-8");
      const lines = raw.split(/\r?\n/).filter(Boolean);
      if (lines.length <= 1) return idToPos;
      const header = lines.shift()!; // discard header
      // crude CSV split by comma; the file seems simple
      const idxPlayer = header.split(",").findIndex((h) => h.trim().toLowerCase() === "player");
      const idxPos = header.split(",").findIndex((h) => h.trim().toLowerCase() === "pos");
      const idxTeam = header.split(",").findIndex((h) => h.trim().toLowerCase() === "team");
      const nameToPos = new Map<string, string>();
      for (const line of lines) {
        const cols = line.split(",");
        const nm = (cols[idxPlayer] ?? "").trim();
        const pos = (cols[idxPos] ?? "").trim();
        // prefer the latest occurrence
        if (nm) nameToPos.set(nm, pos);
      }
      for (const [id, nm] of Object.entries(idToName)) {
        if (nameToPos.has(nm)) {
          idToPos[id] = nameToPos.get(nm)!;
        }
      }
    }
  } catch (e) {
    console.error("Failed to load position map:", e);
  }
  return idToPos;
}

async function getTeamEligiblePlayerIds(year: number, seasonType: string | null, team: string) {
  const whereClause = seasonType
    ? and(eq(playerStatsTable.year, year), eq(playerStatsTable.seasonType, seasonType), eq(playerStatsTable.tm, team))
    : and(eq(playerStatsTable.year, year), eq(playerStatsTable.tm, team));

  const rows = await db
    .select({ player_id: playerStatsTable.player_id })
    .from(playerStatsTable)
    .where(whereClause)
    .groupBy(playerStatsTable.player_id);

  return rows.map((r) => r.player_id).filter((v): v is string => !!v);
}

async function getPositionOptions(year: number) {
  const csvCandidate = path.join(process.cwd(), "Data", `wnba_player_per_game_${year}.csv`);
  if (!fs.existsSync(csvCandidate)) return [];
  const raw = fs.readFileSync(csvCandidate, "utf-8");
  const lines = raw.split(/\r?\n/).filter(Boolean);
  if (lines.length <= 1) return [];
  const header = lines.shift()!;
  const idxPos = header.split(",").findIndex((h) => h.trim().toLowerCase() === "pos");
  const idxPlayer = header.split(",").findIndex((h) => h.trim().toLowerCase() === "player");
  const seen = new Set<string>();
  for (const line of lines) {
    const cols = line.split(",");
    const pos = (cols[idxPos] ?? "").trim();
    const nm = (cols[idxPlayer] ?? "").trim();
    if (!nm) continue;
    if (pos) seen.add(pos);
  }
  return Array.from(seen).sort();
}


function loadTeamMap(year: number): Record<string, string> {
  const idToTeam: Record<string, string> = {};
  try {
    const idToName = loadNameMap();
    const csvCandidate = path.join(process.cwd(), "Data", `wnba_player_per_game_${year}.csv`);
    if (fs.existsSync(csvCandidate)) {
      const raw = fs.readFileSync(csvCandidate, "utf-8");
      const lines = raw.split(/\r?\n/).filter(Boolean);
      if (lines.length > 1) {
        const header = lines.shift()!;
        const headers = header.split(",");
        const idxPlayer = headers.findIndex((h) => h.trim().toLowerCase() === "player");
        const idxTeam = headers.findIndex((h) => h.trim().toLowerCase() === "team");
        const nameToTeam = new Map<string, string>();
        for (const line of lines) {
          const cols = line.split(",");
          const nm = (cols[idxPlayer] ?? "").trim();
          const tm = (cols[idxTeam] ?? "").trim();
          if (nm) nameToTeam.set(nm, tm);
        }
        for (const [id, nm] of Object.entries(idToName)) {
          if (nameToTeam.has(nm)) idToTeam[id] = nameToTeam.get(nm)!;
        }
      }
    }
  } catch (e) {
    console.error("Failed to load team map:", e);
  }
  return idToTeam;
}