import "server-only";
import { db } from "@/db";
import PlayerStatsTable from "./(components)/player-stats-table";
import Link from "next/link";
import Image from "next/image";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ---- Lazy server-only requires to keep Turbopack happy ----
let __fs: any | null = null;
let __path: any | null = null;
function getFs() { if (!__fs) __fs = require("fs"); return __fs; }
function getPath() { if (!__path) __path = require("path"); return __path; }

type Row = {
  player_id: string;
  name: string;
  slug: string;
  mp: number;
  pts: number;
  fgPct: number;
  ast: number;
  stl: number;
  blk: number;
  tov: number;
  power: number;
  powerRank: number;
  pos?: string;
  team?: string;
  mpArrow?: string;
  ptsArrow?: string;
  fgPctArrow?: string;
  astArrow?: string;
  stlArrow?: string;
  blkArrow?: string;
  tovArrow?: string;
};

function slugifyName(name: string) {
  return (name || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-") || "unknown";
}

function loadNameMap(): Record<string, string> {
  try {
    const csvPath = getPath().join(process.cwd(), "Data", "wnba_player_ids_master.csv");
    if (!getFs().existsSync(csvPath)) return {};
    const raw = getFs().readFileSync(csvPath, "utf-8");
    const lines = raw.split(/\r?\n/).filter(Boolean);
    if (lines.length) lines.shift();
    const map: Record<string, string> = {};
    for (const line of lines) {
      const [name, pid] = line.split(",");
      if (name && pid) map[pid.trim()] = name.trim();
    }
    return map;
  } catch {
    return {};
  }
}

function loadPosMap(year: number): Record<string, string> {
  try {
    const idToName = loadNameMap();
    const csvPath = getPath().join(process.cwd(), "Data", `wnba_player_per_game_${year}.csv`);
    if (!getFs().existsSync(csvPath)) return {};
    const raw = getFs().readFileSync(csvPath, "utf-8");
    const lines = raw.split(/\r?\n/).filter(Boolean);
    if (lines.length <= 1) return {};
    const header = lines.shift()!;
    const headers = header.split(",");
    const idxPlayer = headers.findIndex((h) => h.trim().toLowerCase() === "player");
    const idxPos = headers.findIndex((h) => h.trim().toLowerCase() === "pos");
    const idxTeam = headers.findIndex((h) => h.trim().toLowerCase() === "team");
    if (idxPlayer < 0) return {};
    const nameToPos = new Map<string, string>();
    const nameToTeam = new Map<string, string>();
    for (const line of lines) {
      const cols = line.split(",");
      const nm = (cols[idxPlayer] ?? "").trim();
      if (!nm) continue;
      if (idxPos >= 0) {
        const pos = (cols[idxPos] ?? "").trim();
        if (pos) nameToPos.set(nm, pos);
      }
      if (idxTeam >= 0) {
        const tm = (cols[idxTeam] ?? "").trim();
        if (tm) nameToTeam.set(nm, tm);
      }
    }
    const idToPos: Record<string, string> = {};
    const idToTeam: Record<string, string> = {};
    for (const [id, nm] of Object.entries(idToName ?? {})) {
      if (nameToPos.has(nm)) idToPos[id] = nameToPos.get(nm)!;
      if (nameToTeam.has(nm)) idToTeam[id] = nameToTeam.get(nm)!;
    }
    (loadPosMap as any).__team = idToTeam;
    return idToPos;
  } catch {
    return {};
  }
}
function getTeamFromPosMap(playerId: string): string | undefined {
  const t = (loadPosMap as any).__team as Record<string,string> | undefined;
  return t ? t[playerId] : undefined;
}

function mapPosToBucket(raw?: string) {
  const r = (raw || "").toUpperCase();
  if (["C", "C-F", "F-C"].includes(r)) return "Centers";
  if (["F", "C-F", "F-C", "F-G", "G-F"].includes(r)) return "Forwards";
  if (["G", "F-G", "G-F"].includes(r)) return "Guards";
  return "";
}

function powerScore(p: { pts:number; ast:number; stl:number; blk:number; tov:number }) {
  return p.pts + p.ast*1.1 + p.stl*1.2 + p.blk*1.0 - p.tov*1.3;
}

function arrow(delta: number): "▲" | "▼" | undefined {
  if (!isFinite(delta) || Math.abs(delta) < 1e-6) return undefined;
  return delta > 0 ? "▲" : "▼";
}

export default async function Home() {
  const anyDb: any = db as any;
  const client = anyDb.client ?? anyDb.$client ?? anyDb._client;
  if (!client) throw new Error("DB client unavailable");

  const yrs = await client.execute("SELECT DISTINCT year FROM player_stats ORDER BY year DESC");
  const chosenYear = Number(yrs.rows?.[0]?.year ?? new Date().getFullYear());
  const st = await client.execute("SELECT DISTINCT season_type FROM player_stats WHERE year = ? ORDER BY season_type", [chosenYear]);
  const stVals = st.rows.map((r: any) => String(r.season_type || ""));
  const chosenSeason = stVals.find((s: string) => s.toLowerCase().startsWith("regular")) || stVals[0] || null;

  const where = chosenSeason ? "WHERE year = ? AND season_type = ?" : "WHERE year = ?";
  const params = chosenSeason ? [chosenYear, chosenSeason] : [chosenYear];

  const baseSql = `
    SELECT player_id, tm, date, mp, pts, fg, fga, ast, stl, blk, tov
    FROM player_stats
    ${where}
  `;
  const baseRes = await client.execute(baseSql, params as any);
  const base = (baseRes.rows as any[]).map(r => ({
    player_id: String(r.player_id),
    tm: r.tm ? String(r.tm).toUpperCase() : "",
    date: String(r.date || ""),
    mp: Number(r.mp ?? 0),
    pts: Number(r.pts ?? 0),
    fg: Number(r.fg ?? 0),
    fga: Number(r.fga ?? 0),
    ast: Number(r.ast ?? 0),
    stl: Number(r.stl ?? 0),
    blk: Number(r.blk ?? 0),
    tov: Number(r.tov ?? 0),
  }));

  const byPlayer = new Map<string, typeof base>();
  for (const g of base) {
    if (!byPlayer.has(g.player_id)) byPlayer.set(g.player_id, [] as any);
    byPlayer.get(g.player_id)!.push(g as any);
  }

  const nameMap = loadNameMap();
  const posMap = loadPosMap(chosenYear);

  const rows: Row[] = [];
  for (const [pid, games] of byPlayer.entries()) {
    const sorted = [...games].sort((a,b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
    const last5 = sorted.slice(-5);

    const sum = (arr: any[], k: keyof typeof games[number]) => arr.reduce((acc, x) => acc + Number((x as any)[k] ?? 0), 0);

    const mpSeason = sum(games, "mp") / Math.max(1, games.length);
    const ptsSeason = sum(games, "pts") / Math.max(1, games.length);
    const fgSeason = sum(games, "fg");
    const fgaSeason = sum(games, "fga");
    const fgPctSeason = fgaSeason > 0 ? fgSeason / fgaSeason : 0;
    const astSeason = sum(games, "ast") / Math.max(1, games.length);
    const stlSeason = sum(games, "stl") / Math.max(1, games.length);
    const blkSeason = sum(games, "blk") / Math.max(1, games.length);
    const tovSeason = sum(games, "tov") / Math.max(1, games.length);

    const mp5 = sum(last5, "mp") / Math.max(1, last5.length);
    const pts5 = sum(last5, "pts") / Math.max(1, last5.length);
    const fg5 = sum(last5, "fg");
    const fga5 = sum(last5, "fga");
    const fgPct5 = fga5 > 0 ? fg5 / fga5 : 0;
    const ast5 = sum(last5, "ast") / Math.max(1, last5.length);
    const stl5 = sum(last5, "stl") / Math.max(1, last5.length);
    const blk5 = sum(last5, "blk") / Math.max(1, last5.length);
    const tov5 = sum(last5, "tov") / Math.max(1, last5.length);

    const name = nameMap[pid] || pid.toUpperCase();
    const posRaw = posMap[pid] || "";
    const team = (sorted.at(-1)?.tm || getTeamFromPosMap(pid) || "").toUpperCase();
    const fgPct = fgPctSeason;

    const power = powerScore({ pts: ptsSeason, ast: astSeason, stl: stlSeason, blk: blkSeason, tov: tovSeason });

    rows.push({
      player_id: pid,
      name,
      slug: slugifyName(name),
      mp: Number(mpSeason.toFixed(3)),
      pts: Number(ptsSeason.toFixed(3)),
      fgPct: Number(fgPct.toFixed(5)),
      ast: Number(astSeason.toFixed(3)),
      stl: Number(stlSeason.toFixed(3)),
      blk: Number(blkSeason.toFixed(3)),
      tov: Number(tovSeason.toFixed(3)),
      power,
      powerRank: 0,
      pos: mapPosToBucket(posRaw),
      team,
      mpArrow: arrow(mp5 - mpSeason),
      ptsArrow: arrow(pts5 - ptsSeason),
      fgPctArrow: arrow(fgPct5 - fgPctSeason),
      astArrow: arrow(ast5 - astSeason),
      stlArrow: arrow(stl5 - stlSeason),
      blkArrow: arrow(blk5 - blkSeason),
      tovArrow: arrow(tov5 - tovSeason),
    });
  }

  const byPower = [...rows].sort((a, b) => b.power - a.power);
  const rankById = new Map<string, number>();
  byPower.forEach((r, i) => rankById.set(r.player_id, i + 1));
  rows.forEach((r) => (r.powerRank = rankById.get(r.player_id) || rows.length));

  return (
    <div className="p-8">
      <div className="mb-6 text-center">
        <Link href="/">
          <Image src="/logo-statfluence.svg" alt="Statfluence" width={180} height={40} priority />
        </Link>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        Current season averages. Arrows compare last 5 games vs season average (PlusMinus 10%).
      </p>
      <PlayerStatsTable rows={rows as any} />
    </div>
  );
}
