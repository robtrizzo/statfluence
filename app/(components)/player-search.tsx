import { PlayerCombobox } from "@/components/ui/player-combobox";
import { getPlayersForYearWithNames } from "@/handlers/players";
import { ComboboxPlayer } from "@/types/ui";

export default async function PlayerSearch() {
  const players = await getPlayersForYearWithNames(2025);

  if (!players.length) {
    return <div>No players found.</div>;
  }

  return (
    <PlayerCombobox
      players={players.map((p) => ({ value: p.id, label: p.name } as ComboboxPlayer))}
    />
  );
}
