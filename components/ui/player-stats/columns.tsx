"use client";

import { Column, ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { DataTableColumnHeader } from "../data-table-column-header";
import { PlayerTableRow, playerTableStatHeaders } from "@/types/ui";

const playerTableStatColumns = playerTableStatHeaders.map((stat) => ({
  accessorKey: stat.key,
  header: ({ column }: { column: Column<PlayerTableRow, unknown> }) => (
    <DataTableColumnHeader column={column} title={stat.title} />
  ),
}));

export const playerStatColumns: ColumnDef<PlayerTableRow>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "player_id",
    header: ({ column }: { column: Column<PlayerTableRow, unknown> }) => (
      <DataTableColumnHeader column={column} title="Player ID" />
    ),
  },
  {
    accessorKey: "name",
    header: ({ column }: { column: Column<PlayerTableRow, unknown> }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
  },
  {
    accessorKey: "team",
    header: ({ column }: { column: Column<PlayerTableRow, unknown> }) => (
      <DataTableColumnHeader column={column} title="Team" />
    ),
  },
  {
    accessorKey: "pos",
    header: ({ column }: { column: Column<PlayerTableRow, unknown> }) => (
      <DataTableColumnHeader column={column} title="Position" />
    ),
  },
  ...playerTableStatColumns,
  {
    id: "actions",
    cell: ({ row }) => {
      const playerStat = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => {
                // const rk = playerStat.rk?.toString();
                // if (rk) {
                //   navigator.clipboard.writeText(rk);
                // }
              }}
            >
              Copy Rk
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View player</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
