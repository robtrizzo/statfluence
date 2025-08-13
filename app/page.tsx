import PlayerStatsTable from "./(components)/player-stats-table";
import Link from "next/link";
import Image from "next/image";
import { PlayerTableRow } from "@/types/ui";
import { getAllCurrentSeasonTrajectoryStats } from "@/handlers/player_stats";

export default async function Home() {
  // TODO ignore the error - this is intentional to remind us to fix
  // the handler to shape the data into a PlayerTableRow[]
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
      <PlayerStatsTable rows={rows} />
    </div>
  );
}
