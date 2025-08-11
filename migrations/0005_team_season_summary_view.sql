DROP VIEW IF EXISTS team_season_summary_v;
CREATE VIEW team_season_summary_v AS
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
GROUP BY tm, year, season_type;
