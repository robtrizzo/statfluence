import { db } from "@/db";
import { teamsTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { unstable_cache } from "next/cache";

export const getTeamNameByAbr = unstable_cache(
  async (teamAbr: string): Promise<string | null> => {
    const team = await db
      .select({ full: teamsTable.full })
      .from(teamsTable)
      .where(eq(teamsTable.abr, teamAbr))
      .limit(1);
    return team.length > 0 ? team[0].full : null;
  },
  [],
  {}
);
