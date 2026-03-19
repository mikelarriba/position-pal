import { ExternalLink, Trash2, ChevronDown } from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { Position, PositionStatus } from "@/lib/types";
import { STATUS_LABELS, STATUS_ORDER } from "@/lib/types";
import { useUpdateStatus, useDeletePosition } from "@/hooks/usePositions";
import { formatDistanceToNow } from "date-fns";

interface PositionCardProps {
  position: Position;
  onEdit: (p: Position) => void;
}

function formatSalary(min: number | null, max: number | null, currency: string | null) {
  const cur = currency || "EUR";
  const fmt = (n: number) => {
    if (n >= 1000) return `${Math.round(n / 1000)}k`;
    return n.toString();
  };
  if (min && max) return `${fmt(min)}-${fmt(max)} ${cur}`;
  if (min) return `${fmt(min)}+ ${cur}`;
  if (max) return `up to ${fmt(max)} ${cur}`;
  return null;
}

export function PositionCard({ position, onEdit }: PositionCardProps) {
  const updateStatus = useUpdateStatus();
  const deletePos = useDeletePosition();
  const salary = formatSalary(position.salary_min, position.salary_max, position.salary_currency);

  return (
    <div
      className="group bg-card border border-border rounded-lg p-3 hover:shadow-md transition-all cursor-pointer animate-fade-in"
      onClick={() => onEdit(position)}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm text-card-foreground truncate">{position.role}</h4>
          {position.description && (
            <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{position.description}</p>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <button className="flex items-center gap-1">
                <StatusBadge status={position.status} />
                <ChevronDown className="h-3 w-3 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {STATUS_ORDER.map((s) => (
                <DropdownMenuItem
                  key={s}
                  onClick={(e) => {
                    e.stopPropagation();
                    updateStatus.mutate({ id: position.id, status: s as PositionStatus });
                  }}
                >
                  <StatusBadge status={s} />
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
        <span>{formatDistanceToNow(new Date(position.updated_at), { addSuffix: true })}</span>
        {salary && <span className="text-primary font-medium">{salary}</span>}
        {position.url && (
          <a
            href={position.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 text-primary hover:underline"
          >
            <ExternalLink className="h-3 w-3" /> Link
          </a>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="ml-auto h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
          onClick={(e) => {
            e.stopPropagation();
            deletePos.mutate(position.id);
          }}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}
