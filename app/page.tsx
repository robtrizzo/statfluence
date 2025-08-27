import Link from "next/link";
import Image from "next/image";
import { PlayerTableRow } from "@/types/ui";
import { getAllCurrentSeasonTrajectoryStats } from "@/handlers/player_stats";
import { PlayerStatsTable } from "@/components/ui/player-stats/player-stats-table";
import { playerStatColumns } from "@/components/ui/player-stats/columns";

export default async function Home() {
  const rows = (await getAllCurrentSeasonTrajectoryStats()) as PlayerTableRow[];

  return (
    <div className="p-8">
      <div className="mb-6 text-center">
        <Link href="/">
          <Image
            src="/logo-statfluence.svg"
            alt="Statfluence"
            width={180}
            height={40}
            priority
          />
        </Link>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        Current season averages. Arrows compare last 5 games vs season average
        (PlusMinus 10%).
      </p>
      <PlayerStatsTable columns={playerStatColumns} data={rows} />
    </div>
  );
}
