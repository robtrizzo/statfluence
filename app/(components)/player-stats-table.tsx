
"use client";

const ALL_SENTINEL = "__ALL__";

const POS_GROUPS = {
  Centers: new Set<string>(["C", "C-F", "F-C"]),
  Forwards: new Set<string>(["F", "C-F", "F-C", "F-G", "G-F"]),
  Guards: new Set<string>(["G", "F-G", "G-F"]),
} as const;

type PosBucket = keyof typeof POS_GROUPS;
const POS_OPTIONS: PosBucket[] = ["Centers", "Forwards", "Guards"];


import { useMemo, useState } from "react";
import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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

type SortKey = "power" | "mp" | "pts" | "fgPct" | "ast" | "stl" | "blk" | "tov";
type SortDir = "asc" | "desc";

function arrowEl(arrow?: string, invert: boolean = false) {
  if (!arrow) return null;
  const up = arrow === "▲";
  const color = invert ? (up ? "text-red-600" : "text-green-600") : (up ? "text-green-600" : "text-red-600");
  return <span className={color}>{arrow}</span>;
}

export default function PlayerStatsTable({
  rows,
  defaultSort = { key: "power", dir: "desc" as SortDir },
}: {
  rows: Row[];
  defaultSort?: { key: SortKey; dir: SortDir };
}) {
  const [sortKey, setSortKey] = useState<SortKey>(defaultSort.key);
  const [sortDir, setSortDir] = useState<SortDir>(defaultSort.dir);
  const [limit, setLimit] = useState<number>(15);

  
  const [team, setTeam] = useState<string>("");
  const [pos, setPos] = useState<string>("");
  const teamOptions = useMemo(() => {
    const s = new Set<string>();
    for (const r of rows) {
      if (r.team) s.add(String(r.team).toUpperCase());
    }
    return Array.from(s).sort();
  }, [rows]);

  const positionOptions = useMemo(() => {
    const s = new Set<string>();
    for (const r of rows) {
      if (r.pos) s.add(String(r.pos).toUpperCase());
    }
    return Array.from(s).sort();
  }, [rows]);


  const filtered = useMemo(() => {
    return rows.filter((r) => {
      const okTeam = team ? (r.team || "").toUpperCase() === team : true;
      const posVal = (r.pos || "").toUpperCase();
      const okPos = pos ? (posVal === pos || posVal.split("-").includes(pos)) : true;
      return okTeam && okPos;
    });
  }, [rows, team, pos]);
const sorted = useMemo(() => {
    const mul = sortDir === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => {
      const av = (a as any)[sortKey] ?? 0;
      const bv = (b as any)[sortKey] ?? 0;
      if (av < bv) return -1 * mul;
      if (av > bv) return 1 * mul;
      return 0;
    });
  }, [filtered, sortKey, sortDir]);

  const pageRows = useMemo(() => sorted.slice(0, limit), [sorted, limit]);

  function onHeaderClick(key: SortKey) {
    if (key === sortKey) {
      setSortDir(sortDir === "desc" ? "asc" : "desc");
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 justify-end">
        <span className="text-sm text-muted-foreground">Team</span>
        <Select value={team || ALL_SENTINEL} onValueChange={(v) => setTeam(v === ALL_SENTINEL ? "" : v)}>
          <SelectTrigger className="w-[120px]"><SelectValue placeholder="All" /></SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_SENTINEL}>All</SelectItem>
            {teamOptions.map((t) => (
              <SelectItem key={t} value={t.toUpperCase()}>{t}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground">Pos</span>
        <Select value={pos || ALL_SENTINEL} onValueChange={(v) => setPos(v === ALL_SENTINEL ? "" : v)}>
          <SelectTrigger className="w-[120px]"><SelectValue placeholder="All" /></SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_SENTINEL}>All</SelectItem>
            {positionOptions.map((p) => (
              <SelectItem key={p} value={p}>{p}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground">Show</span>
        <Select value={String(limit)} onValueChange={(v) => setLimit(parseInt(v))}>
          <SelectTrigger className="w-[100px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="15">15</SelectItem>
            <SelectItem value="25">25</SelectItem>
            <SelectItem value="50">50</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground">players</span>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Player</TableHead>
            <TableHead role="button" onClick={() => onHeaderClick("power")} className="cursor-pointer select-none">Power Rankings {sortKey === "power" ? (sortDir === "desc" ? "▼" : "▲") : ""}</TableHead>
            <TableHead role="button" onClick={() => onHeaderClick("mp")} className="cursor-pointer select-none">
              MP {sortKey === "mp" ? (sortDir === "desc" ? "▼" : "▲") : ""}
            </TableHead>
            <TableHead role="button" onClick={() => onHeaderClick("pts")} className="cursor-pointer select-none">
              PTS {sortKey === "pts" ? (sortDir === "desc" ? "▼" : "▲") : ""}
            </TableHead>
            <TableHead role="button" onClick={() => onHeaderClick("fgPct")} className="cursor-pointer select-none">
              FG% {sortKey === "fgPct" ? (sortDir === "desc" ? "▼" : "▲") : ""}
            </TableHead>
            <TableHead role="button" onClick={() => onHeaderClick("ast")} className="cursor-pointer select-none">
              AST {sortKey === "ast" ? (sortDir === "desc" ? "▼" : "▲") : ""}
            </TableHead>
            <TableHead role="button" onClick={() => onHeaderClick("stl")} className="cursor-pointer select-none">
              STL {sortKey === "stl" ? (sortDir === "desc" ? "▼" : "▲") : ""}
            </TableHead>
            <TableHead role="button" onClick={() => onHeaderClick("blk")} className="cursor-pointer select-none">
              BLK {sortKey === "blk" ? (sortDir === "desc" ? "▼" : "▲") : ""}
            </TableHead>
            <TableHead role="button" onClick={() => onHeaderClick("tov")} className="cursor-pointer select-none">
              TOV {sortKey === "tov" ? (sortDir === "desc" ? "▼" : "▲") : ""}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pageRows.map((r) => (
            <TableRow key={r.player_id}>
              <TableCell className="font-medium">
                <Link href={`/players/${r.slug}`}>{r.name}</Link>
              </TableCell>
              <TableCell>{r.powerRank}</TableCell>
              <TableCell>{r.mp.toFixed(1)} {arrowEl(r.mpArrow)}</TableCell>
              <TableCell>{r.pts.toFixed(1)} {arrowEl(r.ptsArrow)}</TableCell>
              <TableCell>{(r.fgPct * 100).toFixed(1)}% {arrowEl(r.fgPctArrow)}</TableCell>
              <TableCell>{r.ast.toFixed(1)} {arrowEl(r.astArrow)}</TableCell>
              <TableCell>{r.stl.toFixed(1)} {arrowEl(r.stlArrow)}</TableCell>
              <TableCell>{r.blk.toFixed(1)} {arrowEl(r.blkArrow)}</TableCell>
              <TableCell>{r.tov.toFixed(1)} {arrowEl(r.tovArrow, true)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
