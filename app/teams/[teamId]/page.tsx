import StatsCard from "@/components/ui/stats-card";
import { TypographyH1 } from "@/components/ui/typography";
import { getPastSeasonsTeamSummary } from "@/handlers/team_stats";

export default async function Page({
  params,
}: {
  params: Promise<{ teamId: string }>;
}) {
  const { teamId } = await params;

  const stats = await getPastSeasonsTeamSummary(teamId);

  if (!stats) {
    return <div>No stats found for team {teamId}</div>;
  }

  return (
    <div className="px-4">
      <TypographyH1>{teamId} Stats (2025)</TypographyH1>
      <StatsCard stats={stats} />
    </div>
  );
}

/**
 * what goes on this page?
 *
 * team name
 * team abr
 *
 * similar metrics to players
 * (minus efficiency and shot share)
 * (plus power ranking)
 *
 * just for the current season
 *
 * create trends for past 5 games vs average
 */
