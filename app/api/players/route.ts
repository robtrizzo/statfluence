import { getAllCurrentSeasonTrajectoryStats } from "@/handlers/player_stats";
import { PlayerTableRow } from "@/types/ui";
import { NextRequest, NextResponse } from "next/server";

export async function GET(requests: NextRequest) {
  try {
    const { searchParams } = new URL(requests.url);
    const limit = searchParams.get("limit")
      ? parseInt(searchParams.get("limit") as string, 10)
      : undefined;
    const offset = searchParams.get("offset")
      ? parseInt(searchParams.get("offset") as string, 10)
      : undefined;

    console.log(
      "Fetching player stats with limit:",
      limit,
      "and offset:",
      offset
    );
    const rows = (await getAllCurrentSeasonTrajectoryStats(
      limit,
      offset
    )) as PlayerTableRow[];
    return NextResponse.json(rows);
  } catch (error) {
    console.error("Error fetching player stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch player stats" },
      { status: 500 }
    );
  }
}
