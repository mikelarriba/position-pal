import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ExternalLink, Building2, Trash2, ChevronDown, ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "./StatusBadge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useUpdateStatus, useDeletePosition } from "@/hooks/usePositions";
import { STATUS_ORDER } from "@/lib/types";
import type { Position, PositionStatus } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";

interface PositionsTableProps {
  positions: Position[];
  onEditPosition: (p: Position) => void;
  activePositionId?: string | null;
}

type SortKey = "role" | "company" | "status" | "updated_at";
type SortDir = "asc" | "desc";

function formatSalary(min: number | null, max: number | null, currency: string | null) {
  const cur = currency || "EUR";
  const fmt = (n: number) => (n >= 1000 ? `${Math.round(n / 1000)}k` : n.toString());
  if (min && max) return `${fmt(min)}-${fmt(max)} ${cur}`;
  if (min) return `${fmt(min)}+ ${cur}`;
  if (max) return `up to ${fmt(max)} ${cur}`;
  return "—";
}

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active) return <ArrowUpDown className="h-3 w-3 text-muted-foreground/50" />;
  return dir === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />;
}

export function PositionsTable({ positions, onEditPosition, activePositionId }: PositionsTableProps) {
  const navigate = useNavigate();
  const updateStatus = useUpdateStatus();
  const deletePos = useDeletePosition();
  const [sortKey, setSortKey] = useState<SortKey>("updated_at");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "updated_at" ? "desc" : "asc");
    }
  };

  const sorted = [...positions].sort((a, b) => {
    let cmp = 0;
    switch (sortKey) {
      case "role":
        cmp = a.role.localeCompare(b.role);
        break;
      case "company":
        cmp = a.company.localeCompare(b.company);
        break;
      case "status":
        cmp = STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status);
        break;
      case "updated_at":
        cmp = new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
        break;
    }
    return sortDir === "asc" ? cmp : -cmp;
  });

  const sortableHeaders: { key: SortKey; label: string }[] = [
    { key: "role", label: "Role" },
    { key: "company", label: "Company" },
    { key: "status", label: "Status" },
  ];

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30">
            <TableHead className="w-[60px]">ID</TableHead>
            {sortableHeaders.map(({ key, label }) => (
              <TableHead key={key}>
                <button
                  className="flex items-center gap-1 hover:text-foreground transition-colors"
                  onClick={() => toggleSort(key)}
                >
                  {label}
                  <SortIcon active={sortKey === key} dir={sortDir} />
                </button>
              </TableHead>
            ))}
            <TableHead>Salary</TableHead>
            <TableHead>
              <button
                className="flex items-center gap-1 hover:text-foreground transition-colors"
                onClick={() => toggleSort("updated_at")}
              >
                Updated
                <SortIcon active={sortKey === "updated_at"} dir={sortDir} />
              </button>
            </TableHead>
            <TableHead className="w-[80px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.map((p) => (
            <TableRow
              key={p.id}
              className={`cursor-pointer transition-colors ${activePositionId === p.id ? "bg-primary/5 border-l-2 border-l-primary" : "hover:bg-muted/50"}`}
              onClick={() => onEditPosition(p)}
            >
              <TableCell className="font-mono text-xs text-muted-foreground">
                {p.short_id ? `#${p.short_id}` : "—"}
              </TableCell>
              <TableCell>
                <div>
                  <span className="font-medium text-sm">{p.role}</span>
                  {p.description && (
                    <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{p.description}</p>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <button
                  className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/companies/${p.company_id}`);
                  }}
                >
                  <Building2 className="h-3 w-3" />
                  {p.company}
                </button>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <button className="flex items-center gap-1">
                      <StatusBadge status={p.status} />
                      <ChevronDown className="h-3 w-3 text-muted-foreground" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    {STATUS_ORDER.map((s) => (
                      <DropdownMenuItem
                        key={s}
                        onClick={(e) => {
                          e.stopPropagation();
                          updateStatus.mutate({ id: p.id, status: s as PositionStatus });
                        }}
                      >
                        <StatusBadge status={s} />
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
              <TableCell className="text-xs">
                {formatSalary(p.salary_min, p.salary_max, p.salary_currency)}
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(p.updated_at), { addSuffix: true })}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  {p.url && (
                    <a
                      href={p.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-primary hover:text-primary/80"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-destructive opacity-0 group-hover:opacity-100 hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      deletePos.mutate(p.id);
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
          {positions.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                No positions found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
