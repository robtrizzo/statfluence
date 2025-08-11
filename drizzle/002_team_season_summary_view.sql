DROP VIEW IF EXISTS team_season_summary_v;
CREATE VIEW team_season_summary_v AS
SELECT
  p.team_id,
  p.team_name,
  p.year,
  p.season_type,
  SUM(p.gp) AS gp,
  COUNT(DISTINCT p.player_id) AS roster_size,
  SUM(p.fgm) AS fgm,
  SUM(p.fga) AS fga,
  SUM(p.tpm) AS tpm,
  SUM(p.tpa) AS tpa,
  SUM(p.ftm) AS ftm,
  SUM(p.fta) AS fta,
  SUM(p.oreb) AS oreb,
  SUM(p.dreb) AS dreb,
  SUM(p.reb)  AS reb,
  SUM(p.ast)  AS ast,
  SUM(p.stl)  AS stl,
  SUM(p.blk)  AS blk,
  SUM(p.tov)  AS tov,
  SUM(p.pts)  AS pts,
  CASE WHEN SUM(p.fga) > 0 THEN CAST(SUM(p.fgm) AS REAL) / SUM(p.fga) ELSE 0 END AS fg_pct,
  CASE WHEN SUM(p.tpa) > 0 THEN CAST(SUM(p.tpm) AS REAL) / SUM(p.tpa) ELSE 0 END AS tp_pct,
  CASE WHEN SUM(p.fta) > 0 THEN CAST(SUM(p.ftm) AS REAL) / SUM(p.fta) ELSE 0 END AS ft_pct,
  CASE WHEN (SUM(p.fga) + 0.44*SUM(p.fta)) > 0 
       THEN CAST(SUM(p.pts) AS REAL) / (2.0*(SUM(p.fga) + 0.44*SUM(p.fta))) 
       ELSE 0 END AS ts_pct
FROM player_season_stats p
GROUP BY p.team_id, p.team_name, p.year, p.season_type;
