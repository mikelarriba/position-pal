import { STATUS_LABELS, type PositionStatus } from "@/lib/types";

interface StatusBadgeProps {
  status: PositionStatus;
  className?: string;
}

export function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  return (
    <span className={`status-badge status-${status} ${className}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}
