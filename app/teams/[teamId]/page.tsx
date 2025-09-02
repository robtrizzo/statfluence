export default async function Page({
  params,
}: {
  params: Promise<{ teamId: string }>;
}) {
  const { teamId } = await params;
  return <></>;
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
