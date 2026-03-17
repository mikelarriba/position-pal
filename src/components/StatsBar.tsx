import type { Position, PositionStatus } from "@/lib/types";
import { STATUS_LABELS, STATUS_ORDER } from "@/lib/types";

interface Props {
  positions: Position[];
}

export function StatsBar({ positions }: Props) {
  const counts = STATUS_ORDER.reduce((acc, s) => {
    acc[s] = positions.filter((p) => p.status === s).length;
    return acc;
  }, {} as Record<PositionStatus, number>);

  return (
    <div className="flex flex-wrap gap-4">
      {STATUS_ORDER.map((s) => (
        <div key={s} className="flex items-center gap-2">
          <span className={`status-badge status-${s}`}>{counts[s]}</span>
          <span className="text-xs text-muted-foreground">{STATUS_LABELS[s]}</span>
        </div>
      ))}
      <div className="flex items-center gap-2 ml-auto">
        <span className="text-lg font-semibold text-foreground">{positions.length}</span>
        <span className="text-xs text-muted-foreground">Total</span>
      </div>
    </div>
  );
}
