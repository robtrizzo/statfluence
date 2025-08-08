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

export default async function Page({
  params,
}: {
  params: Promise<{ playerid: string }>;
}) {
  const { playerid } = await params;

  return (
    <div className="p-8">
      <TypographyH1>{playerid}</TypographyH1>

      <Suspense fallback={<Loader className="animate-spin" />}>
        <PlayerStats playerid={playerid} />
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
        <li>
          ✅ average for 2025 stats (mp, pts, fg%, trb, ast, stl, blk, tov)
        </li>
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

    // detect trends
    currentSeasonStats.forEach((stat) => {
      const pastStat = pastThreeSeasonsStats.find((s) => s.name === stat.name);
      if (pastStat) {
        stat.compareTo = pastStat;
        const percentageChange =
          ((stat.value - pastStat.value) / pastStat.value) * 100;
        stat.percentDiff = percentageChange;
        if (Math.abs(percentageChange) <= 5) {
          stat.trend = "stable";
        } else {
          stat.trend = percentageChange > 0 ? "up" : "down";
          stat.color = percentageChange > 0 ? "green" : "red";
        }
      }
    });

    return (
      <div>
        <StatsCard
          title="Current Season Stats"
          stats={currentSeasonStats}
          hover
        />
        <StatsCard
          title="Past Three Seasons Stats"
          stats={pastThreeSeasonsStats}
        />
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
