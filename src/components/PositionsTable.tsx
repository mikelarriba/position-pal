import { useNavigate } from "react-router-dom";
import { ExternalLink, Building2, Trash2, ChevronDown } from "lucide-react";
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

function formatSalary(min: number | null, max: number | null, currency: string | null) {
  const cur = currency || "EUR";
  const fmt = (n: number) => (n >= 1000 ? `${Math.round(n / 1000)}k` : n.toString());
  if (min && max) return `${fmt(min)}-${fmt(max)} ${cur}`;
  if (min) return `${fmt(min)}+ ${cur}`;
  if (max) return `up to ${fmt(max)} ${cur}`;
  return "—";
}

export function PositionsTable({ positions, onEditPosition, activePositionId }: PositionsTableProps) {
  const navigate = useNavigate();
  const updateStatus = useUpdateStatus();
  const deletePos = useDeletePosition();

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30">
            <TableHead className="w-[60px]">ID</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Company</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Salary</TableHead>
            <TableHead>Updated</TableHead>
            <TableHead className="w-[80px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {positions.map((p) => (
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
