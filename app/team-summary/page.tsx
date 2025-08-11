import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import TeamStatsTable from "@/components/ui/team-stats-table";
import { getTeamFilters, getTeamSummary } from "@/handlers/team_stats";
import { TypographyH1 } from "@/components/ui/typography";
import { Loader } from "lucide-react";

export default async function TeamSummaryPage(){ return <div className='p-8'></div>; }
