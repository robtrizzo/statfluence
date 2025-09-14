import { PlayerTableRow } from "@/types/ui";
import {
  getAllCurrentSeasonTrajectoryStats,
  getTotalPlayerCount,
} from "@/handlers/player_stats";
import PlayerStats from "@/components/ui/player-stats/player-stats";
import Link from "next/link";
import PlayerSearch from "./(components)/player-search";

export default async function Home() {
  const rows = (await getAllCurrentSeasonTrajectoryStats()) as PlayerTableRow[];
  const totalCount = await getTotalPlayerCount();
  return (
    <div className="px-4">
      <PlayerSearch />
      <div className="mt-4">
        <Link
          href="/team-summary"
          className="inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm font-medium shadow-sm hover:shadow transition"
          aria-label="View Team Summary"
        >
          Team Summary
        </Link>
      </div>
      <p className="mt-8 text-sm text-muted-foreground">
        Current season averages. Arrows compare last 5 games vs season average
        (PlusMinus 10%).
      </p>
      <PlayerStats initialData={rows} totalCount={totalCount} />
    </div>
  );
}
