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

export function PositionCard({ position, onEdit }: PositionCardProps) {
  const updateStatus = useUpdateStatus();
  const deletePos = useDeletePosition();

  return (
    <div
      className="group bg-card border border-border rounded-lg p-4 hover:shadow-md transition-all cursor-pointer animate-fade-in"
      onClick={() => onEdit(position)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-card-foreground truncate">{position.role}</h3>
          <p className="text-sm text-muted-foreground">{position.company}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
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

      <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
        <span>{formatDistanceToNow(new Date(position.updated_at), { addSuffix: true })}</span>
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

      {position.notes && (
        <p className="mt-2 text-xs text-muted-foreground line-clamp-2">{position.notes}</p>
      )}
    </div>
  );
}
