"use client";
import * as React from "react";

type TeamRow = {
  teamId: string;
  teamName: string;
  year: number;
  seasonType: string;
  pts: number;
  reb: number;
  oreb: number;
  dreb: number;
  ast: number;
  stl: number;
  blk: number;
  tov: number;
  fgm: number;
  fga: number;
  tpm: number;
  tpa: number;
  ftm: number;
  fta: number;
  fgPct: number;
  tpPct: number;
  ftPct: number;
  tsPct: number;
};

export default function TeamStatsTable({ rows }: { rows: TeamRow[] }) {
  const [sortKey, setSortKey] = React.useState<keyof TeamRow>("pts");
  const [asc, setAsc] = React.useState(false);
  const [query, setQuery] = React.useState("");

  const headers: { key: keyof TeamRow; label: string }[] = [
    { key: "teamName", label: "Team" },
    { key: "pts", label: "PTS" },
    { key: "reb", label: "REB" },
    { key: "oreb", label: "ORB" },
    { key: "dreb", label: "DRB" },
    { key: "ast", label: "AST" },
    { key: "stl", label: "STL" },
    { key: "blk", label: "BLK" },
    { key: "tov", label: "TOV" },
    { key: "fgPct", label: "FG%" },
    { key: "tpPct", label: "3P%" },
    { key: "ftPct", label: "FT%" },
    { key: "tsPct", label: "TS%" },
  ];

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter(r =>
      !q || r.teamName.toLowerCase().includes(q) || r.teamId.toLowerCase().includes(q)
    );
  }, [rows, query]);

  const sorted = React.useMemo(() => {
    return [...filtered].sort((a, b) => {
      const A = a[sortKey] as any;
      const B = b[sortKey] as any;
      if (A === B) return 0;
      if (A == null) return 1;
      if (B == null) return -1;
      if (typeof A === "string") {
        return asc ? String(A).localeCompare(String(B)) : String(B).localeCompare(String(A));
      }
      return asc ? (A - B) : (B - A);
    });
  }, [filtered, sortKey, asc]);

  function onHeaderClick(k: keyof TeamRow) {
    if (k === sortKey) setAsc(a => !a);
    else {
      setSortKey(k);
      setAsc(false);
    }
  }

  function pct(n: number) {
    return (n * 100).toFixed(1) + "%";
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <input
          className="border rounded px-3 py-2 w-full max-w-xs"
          placeholder="Search teams…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="overflow-x-auto rounded border">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              {headers.map(h => (
                <th
                  key={String(h.key)}
                  className="text-left px-3 py-2 cursor-pointer select-none"
                  onClick={() => onHeaderClick(h.key)}
                  title="Click to sort"
                >
                  {h.label}{sortKey === h.key ? (asc ? " ▲" : " ▼") : ""}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map(r => (
              <tr key={`${r.year}-${r.seasonType}-${r.teamId}`} className="border-t">
                <td className="px-3 py-2">{r.teamName}</td>
                <td className="px-3 py-2">{r.pts}</td>
                <td className="px-3 py-2">{r.reb}</td>
                <td className="px-3 py-2">{r.oreb}</td>
                <td className="px-3 py-2">{r.dreb}</td>
                <td className="px-3 py-2">{r.ast}</td>
                <td className="px-3 py-2">{r.stl}</td>
                <td className="px-3 py-2">{r.blk}</td>
                <td className="px-3 py-2">{r.tov}</td>
                <td className="px-3 py-2">{pct(r.fgPct)}</td>
                <td className="px-3 py-2">{pct(r.tpPct)}</td>
                <td className="px-3 py-2">{pct(r.ftPct)}</td>
                <td className="px-3 py-2">{pct(r.tsPct)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
