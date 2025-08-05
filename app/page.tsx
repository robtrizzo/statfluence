import { columns } from "@/components/ui/player-stats/columns";
import { DataTable } from "@/components/ui/player-stats/data-table";
import { TypographyH1 } from "@/components/ui/typography";
import { playerStats } from "@/types/playerStat";

export default function Home() {
  return (
    <div className="p-8">
      <TypographyH1>Statfluence</TypographyH1>

      <main className="mt-8">
        <DataTable columns={columns} data={playerStats} />
      </main>
    </div>
  );
}
