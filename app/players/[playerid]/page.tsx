
import StatsCard from "@/components/ui/stats-card";
import {
  TypographyH1,
  TypographyH3,
  TypographyH4,
  TypographyP,
  TypographyUnorderedList,
} from "@/components/ui/typography";
import {
  getCurrentSeasonPlayerSummary,
  getPastSeasonsPlayerSummary,
} from "@/handlers/player_stats";
import { Loader } from "lucide-react";
import { Suspense } from "react";
import fs from "fs";
import path from "path";

type Entry = { id: string; name: string };
type Maps = {
  idToName: Record<string, string>;
  slugToEntry: Record<string, Entry>;
  compactSlugToEntry: Record<string, Entry>;
};

function slugifyName(name: string) {
  return name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}
function compactSlug(s: string) {
  return slugifyName(s).replace(/-/g, "");
}

function loadMaps(): Maps {
  const idToName: Record<string, string> = {};
  const slugToEntry: Record<string, Entry> = {};
  const compactSlugToEntry: Record<string, Entry> = {};
  try {
    const csvPath = path.join(process.cwd(), "Data", "wnba_player_ids_master.csv");
    const raw = fs.readFileSync(csvPath, "utf-8");
    const lines = raw.split(/\r?\n/).filter(Boolean);
    if (lines.length) lines.shift(); // header
    for (const line of lines) {
      const [name, pid] = line.split(",");
      if (!name || !pid) continue;
      const id = pid.trim();
      const nm = name.trim();
      idToName[id] = nm;
      const slug = slugifyName(nm);
      slugToEntry[slug] = { id, name: nm };
      compactSlugToEntry[compactSlug(nm)] = { id, name: nm };
    }
  } catch (e) {
    console.error("Failed to load player maps:", e);
  }
  return { idToName, slugToEntry, compactSlugToEntry };
}

export default async function Page({
  params,
}: {
  params: { playerid: string };
}) {
  const { idToName, slugToEntry, compactSlugToEntry } = loadMaps();
  const rawParam = decodeURIComponent(params.playerid || "").trim();
  const rawLower = rawParam.toLowerCase();

  // Resolve to canonical player ID + display name
  let playerId: string | null = null;
  let displayName: string | null = null;

  if (rawParam in idToName) {
    playerId = rawParam;
    displayName = idToName[rawParam];
  } else {
    const hyphenSlug = slugifyName(rawParam);
    if (hyphenSlug in slugToEntry) {
      playerId = slugToEntry[hyphenSlug].id;
      displayName = slugToEntry[hyphenSlug].name;
    } else {
      const compact = rawLower.replace(/[^a-z0-9]/g, "");
      if (compact in compactSlugToEntry) {
        playerId = compactSlugToEntry[compact].id;
        displayName = compactSlugToEntry[compact].name;
      }
    }
  }

  if (!playerId || !displayName) {
    return (
      <div className="p-8">
        <div className="w-full flex items-center justify-center my-4">
  <a href="/" aria-label="Home">
    <img src="/logo-statfluence.svg" alt="Statfluence" className="h-12 md:h-14 w-auto hover:opacity-90 transition-opacity" />
  </a>
</div>
<TypographyH1>Player not found</TypographyH1>
        <TypographyP className="mt-2">
          We couldn&apos;t find a player for &quot;{rawParam}&quot;.
        </TypographyP>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="w-full flex items-center justify-center my-4">
  <a href="/" aria-label="Home">
    <img src="/logo-statfluence.svg" alt="Statfluence" className="h-12 md:h-14 w-auto hover:opacity-90 transition-opacity" />
  </a>
</div>
<TypographyH1>{displayName}</TypographyH1>

      <Suspense fallback={<Loader className="animate-spin" />}>
        {/* pass the resolved canonical playerId */}
        <PlayerStats playerid={playerId} />
      </Suspense>

      <TypographyH3>TODO</TypographyH3>
      <TypographyH4>Code</TypographyH4>
      <TypographyUnorderedList>
        <li>✅fetch player data</li>
        <li>perform data transforms for the desired stats</li>
        <li>display data as per page spec</li>
        <li>cache transforms (by date range)</li>
        <li>use cached transforms when calculating new transforms</li>
      </TypographyUnorderedList>
      <TypographyH4>Page features</TypographyH4>
      <TypographyUnorderedList>
        <li>general stats per game</li>
        <li>overall power ranking by position power rank</li>
        <li>✅ average for 2025 stats (mp, pts, fg%, trb, ast, stl, blk, tov)</li>
        <li>✅ past 3 years of stats (exclude current season)</li>
        <li>slicers for whether they started or came from bench</li>
        <li>upcoming match schedule</li>
        <li>forcasted performance</li>
        <li>
          radar graph (3y, include current season): scoring/3p
          shoot/steals/blocks/rebounding/playmaking. guidelines for lg avg, std
          dev
        </li>
      </TypographyUnorderedList>
    </div>
  );
}

async function PlayerStats({ playerid }: { playerid: string }) {
  try {
    const [currentSeasonStats, pastThreeSeasonsStats] = await Promise.all([
      getCurrentSeasonPlayerSummary(playerid),
      getPastSeasonsPlayerSummary(playerid),
    ]);

    // detect trends (compare current season vs past seasons average)
    currentSeasonStats.forEach((stat) => {
      const pastStat = pastThreeSeasonsStats.find((s) => s.name === stat.name);
      if (pastStat && typeof pastStat.value === "number" && pastStat.value !== 0) {
        const percentageChange = ((stat.value - pastStat.value) / pastStat.value) * 100;
        if (Math.abs(percentageChange) <= 5) {
          stat.trend = "stable";
          stat.color = undefined;
        } else {
          stat.trend = percentageChange > 0 ? "up" : "down";
          stat.color = percentageChange > 0 ? "green" : "red";
        }
      }
    });

    return (
      <div>
        <StatsCard title="Current Season Stats" stats={currentSeasonStats} />
        <StatsCard title="Past Three Seasons Stats" stats={pastThreeSeasonsStats} />
      </div>
    );
  } catch (error) {
    console.error("Error fetching player stats:", error);
    return (
      <div className="p-4 border border-red-200 rounded-lg bg-red-50">
        <TypographyP className="text-red-800">
          Failed to load player statistics:{" "}
          {error instanceof Error ? error.message : "Unknown error"}
        </TypographyP>
      </div>
    );
  }
}
