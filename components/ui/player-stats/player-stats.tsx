"use client";

import { PlayerTableRow } from "@/types/ui";
import { PlayerStatsTable } from "./player-stats-table";
import { playerStatColumns } from "@/components/ui/player-stats/columns";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function PlayerStats({
  initialData,
  totalCount,
}: {
  initialData: PlayerTableRow[];
  totalCount: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [limit, setLimit] = useState(Number(searchParams.get("limit")) || 10);
  const [offset, setOffset] = useState(Number(searchParams.get("offset")) || 0);
  const [tableData, setTableData] = useState(initialData);

  const { data, isError, error, isLoading } = useQuery({
    queryKey: ["player-stats", limit, offset], // This will trigger refetch when limit/offset change
    queryFn: async () => {
      const res = await fetch(`/api/players?limit=${limit}&offset=${offset}`);
      if (!res.ok) throw new Error("Failed to fetch player stats");
      const rowData = await res.json();
      setTableData(rowData);
      return "success";
    },
    // initialData: undefined, // Don't use initialData or make it conditional
    // placeholderData: offset === 0 && limit === 10 ? initialData : undefined, // Use placeholderData instead
  });

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setOffset(0); // Reset to first page
    updateURL(0, newLimit);
  };

  const handleOffsetChange = (newOffset: number) => {
    setOffset(newOffset);
    updateURL(offset, limit);
  };

  const handlePageChange = (newPage: number) => {
    const newOffset = (newPage - 1) * limit;
    handleOffsetChange(newOffset);
  };

  const updateURL = (offset: number, limit: number) => {
    const params = new URLSearchParams();
    params.set("offset", offset.toString());
    params.set("limit", limit.toString());
    router.push(`?${params.toString()}`);
  };

  if (isError) {
    return <span>{error.message}</span>;
  }

  return (
    <PlayerStatsTable
      data={tableData}
      columns={playerStatColumns}
      totalCount={totalCount}
      currentPage={Math.floor(offset / limit) + 1}
      pageSize={limit}
      onPageSizeChange={handleLimitChange}
      onPageChange={handlePageChange}
    />
  );
}
