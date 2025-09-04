import Link from "next/link";
import Image from "next/image";
import { PlayerTableRow } from "@/types/ui";
import {
  getAllCurrentSeasonTrajectoryStats,
  getTotalPlayerCount,
} from "@/handlers/player_stats";
import PlayerStats from "@/components/ui/player-stats/player-stats";

export default async function Home() {
  const rows = (await getAllCurrentSeasonTrajectoryStats()) as PlayerTableRow[];
  const totalCount = await getTotalPlayerCount();
  console.log("total count", totalCount);
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
      <PlayerStats initialData={rows} totalCount={totalCount} />
    </div>
  );
}
