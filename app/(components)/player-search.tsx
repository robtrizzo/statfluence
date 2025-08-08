import { PlayerCombobox } from "@/components/ui/player-combobox";
import { getPlayerIds } from "@/handlers/players";
import { ComboboxPlayer } from "@/types/ui";

export default async function PlayerSearch() {
  const playerIds = await getPlayerIds();

  if (!playerIds.length) {
    return <div>No players found.</div>;
  }

  return (
    <PlayerCombobox
      players={playerIds.map(
        (pid) => ({ value: pid, label: pid } as ComboboxPlayer)
      )}
    />
  );
}
