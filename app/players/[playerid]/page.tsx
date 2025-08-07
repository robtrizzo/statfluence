import {
  TypographyH1,
  TypographyH3,
  TypographyH4,
  TypographyP,
  TypographyUnorderedList,
} from "@/components/ui/typography";
import { getCurrentSeasonPlayerSummary } from "@/handlers/player_stats";
import { Loader } from "lucide-react";
import { Suspense } from "react";

export default async function Page({
  params,
}: {
  params: Promise<{ playerid: string }>;
}) {
  const { playerid } = await params;

  // fetch player data from db

  return (
    <div className="p-8">
      <TypographyH1>{playerid}</TypographyH1>

      <TypographyH3>TODO</TypographyH3>
      <Suspense fallback={<Loader className="animate-spin" />}>
        <PlayerSummary playerid={playerid} />
      </Suspense>

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
        <li>average for 2025 stats (mp, pts, fg%, trb, ast, stl, blk, tov)</li>
        <li>past 3 years of stats (exclude current season)</li>
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

async function PlayerSummary({ playerid }: { playerid: string }) {
  const playerStats = await getCurrentSeasonPlayerSummary(playerid);
  return <TypographyP>{JSON.stringify(playerStats)}</TypographyP>;
}
