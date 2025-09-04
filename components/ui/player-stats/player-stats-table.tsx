"use client";

import * as React from "react";

import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Input } from "@/components/ui/input";
import { DataTablePagination } from "../data-table-pagination";
import { DataTableColumnToggle } from "../data-table-column-toggle";
import { Stat } from "@/types/ui";
import { TrendingDown, TrendingUp } from "lucide-react";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function PlayerStatsTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  function isStatObject(value: string | Stat): value is Stat {
    return typeof value === "object" && value !== null && "name" in value;
  }

  return (
    <div>
      <div className="flex items-center py-4">
        {/* TODO come back and fix this */}
        {/* <Input
          placeholder="Filter season type..."
          value={
            (table.getColumn("seasonType")?.getFilterValue() as string) ?? ""
          }
          onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
            table.getColumn("SeasonType")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        /> */}
        <DataTableColumnToggle table={table} />
      </div>
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => {
                    const cellValue = cell.getValue();

                    return (
                      <TableCell key={cell.id}>
                        {isStatObject(cellValue as string | Stat)
                          ? // Custom render for Stat objects
                            (() => {
                              const statValue = cellValue as Stat;
                              return (
                                <div className="flex gap-1 items-center">
                                  <span
                                    className={`text-sm ${
                                      statValue.color
                                        ? `text-${statValue.color}-500`
                                        : ""
                                    }`}
                                  >
                                    {statValue.value}
                                  </span>
                                  {statValue.trend && (
                                    <span
                                      className={`text-xs ${
                                        statValue.trend === "up"
                                          ? "text-green-500"
                                          : "text-red-500"
                                      }`}
                                    >
                                      {statValue.trend === "up" ? (
                                        <TrendingUp size={14} />
                                      ) : (
                                        <TrendingDown size={14} />
                                      )}
                                    </span>
                                  )}
                                </div>
                              );
                            })()
                          : // Default render for simple values
                            flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />
    </div>
  );
}
