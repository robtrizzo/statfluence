
"use server";

import { db } from "@/db";

export type SeasonType = "Regular" | "Playoffs";

function getClient() {
  const anyDb = db as any;
  const client = anyDb.client ?? anyDb.$client ?? anyDb._client;
  if (!client || typeof client.execute !== "function") {
    throw new Error("LibSQL client not available on db instance");
  }
  return client as { execute: (sql: string) => Promise<{ rows: any[] }> };
}

// Ensure the team view exists (idempotent)
async function ensureTeamView() {
  const client = getClient();
  await client.execute(`CREATE VIEW IF NOT EXISTS team_season_summary_v AS
SELECT
  tm AS team_id,
  tm AS team_name,
  year,
  season_type,
  SUM(fg)  AS fgm,
  SUM(fga) AS fga,
  SUM(ft)  AS ftm,
  SUM(fta) AS fta,
  SUM(orb) AS oreb,
  SUM(drb) AS dreb,
  SUM(trb) AS reb,
  SUM(ast) AS ast,
  SUM(stl) AS stl,
  SUM(blk) AS blk,
  SUM(tov) AS tov,
  SUM(pts) AS pts,
  CASE WHEN SUM(fga) > 0 THEN CAST(SUM(fg) AS REAL) / SUM(fga) ELSE 0 END AS fg_pct,
  CASE WHEN SUM(fta) > 0 THEN CAST(SUM(ft) AS REAL) / SUM(fta) ELSE 0 END AS ft_pct,
  CASE WHEN (SUM(fga) + 0.44 * SUM(fta)) > 0
       THEN CAST(SUM(pts) AS REAL) / (2.0 * (SUM(fga) + 0.44 * SUM(fta)))
       ELSE 0 END AS ts_pct
FROM player_stats
GROUP BY tm, year, season_type;`);
}

export async function getTeamFilters() {
  await ensureTeamView();
  const client = getClient();
  const res = await client.execute(
    "SELECT year, season_type FROM team_season_summary_v"
  );
  const years = Array.from(new Set(res.rows.map((r: any) => Number(r.year)))).sort((a,b)=>b-a);
  const seasonTypes = Array.from(new Set(res.rows.map((r: any) => String(r.season_type))));
  return { years, seasonTypes };
}

export async function getTeamSummary(params: {
  year?: number;
  seasonType?: SeasonType;
  teamIds?: string[];
}) {
  await ensureTeamView();
  const client = getClient();
  const { year, seasonType, teamIds } = params;

  const clauses: string[] = [];
  if (typeof year === "number") clauses.push(`year = ${Number(year)}`);
  if (seasonType) clauses.push(`season_type = '${String(seasonType).replace(/'/g, "''")}'`);
  if (teamIds && teamIds.length) {
    const list = teamIds
      .map((t) => `'${String(t).replace(/'/g, "''")}'`)
      .join(",");
    clauses.push(`team_id IN (${list})`);
  }
  const whereSql = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";

  const sql = `
    SELECT
      team_id, team_name, year, season_type,
      pts, reb, oreb, dreb, ast, stl, blk, tov,
      fgm, fga, ftm, fta,
      fg_pct, ft_pct, ts_pct
    FROM team_season_summary_v
    ${whereSql}
  `;

  const res = await client.execute(sql);

  const rows = (res.rows as any[]).map((r) => ({
    teamId: r.team_id,
    teamName: r.team_name,
    year: Number(r.year),
    seasonType: r.season_type,
    pts: Number(r.pts ?? 0),
    reb: Number(r.reb ?? 0),
    oreb: Number(r.oreb ?? 0),
    dreb: Number(r.dreb ?? 0),
    ast: Number(r.ast ?? 0),
    stl: Number(r.stl ?? 0),
    blk: Number(r.blk ?? 0),
    tov: Number(r.tov ?? 0),
    fgm: Number(r.fgm ?? 0),
    fga: Number(r.fga ?? 0),
    ftm: Number(r.ftm ?? 0),
    fta: Number(r.fta ?? 0),
    fgPct: Number(r.fg_pct ?? 0),
    ftPct: Number(r.ft_pct ?? 0),
    tsPct: Number(r.ts_pct ?? 0),
  }));

  return rows;
}
