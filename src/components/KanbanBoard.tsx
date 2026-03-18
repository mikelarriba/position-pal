import { useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import { useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { useDraggable } from "@dnd-kit/core";
import { StatusBadge } from "./StatusBadge";
import { useUpdateStatus } from "@/hooks/usePositions";
import { STATUS_ORDER, STATUS_LABELS, type Position, type PositionStatus } from "@/lib/types";

interface KanbanBoardProps {
  positions: Position[];
  onEditPosition: (p: Position) => void;
}

function KanbanCard({ position, onEdit, isDragOverlay }: { position: Position; onEdit: (p: Position) => void; isDragOverlay?: boolean }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: position.id,
    data: { position },
  });

  const style = {
    transform: transform ? `translate(${transform.x}px, ${transform.y}px)` : undefined,
    opacity: isDragging ? 0.3 : 1,
  };

  return (
    <div
      ref={isDragOverlay ? undefined : setNodeRef}
      style={isDragOverlay ? undefined : style}
      {...(isDragOverlay ? {} : { ...listeners, ...attributes })}
      className={`bg-card border border-border rounded-md p-2.5 cursor-grab active:cursor-grabbing hover:shadow-sm transition-shadow ${isDragOverlay ? "shadow-lg ring-2 ring-primary/20" : ""}`}
      onClick={() => !isDragging && onEdit(position)}
    >
      <p className="text-sm font-medium text-card-foreground truncate">{position.role}</p>
      <p className="text-xs text-muted-foreground truncate mt-0.5">{position.company}</p>
      {position.url && (
        <a
          href={position.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="text-[10px] text-primary hover:underline mt-1 inline-block"
        >
          View posting →
        </a>
      )}
    </div>
  );
}

function KanbanColumn({ status, positions, onEdit }: { status: PositionStatus; positions: Position[]; onEdit: (p: Position) => void }) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col min-w-[200px] w-[220px] shrink-0 rounded-lg border transition-colors ${
        isOver ? "border-primary bg-primary/5" : "border-border bg-muted/30"
      }`}
    >
      <div className="p-3 border-b border-border flex items-center justify-between">
        <StatusBadge status={status} />
        <span className="text-xs text-muted-foreground font-medium">{positions.length}</span>
      </div>
      <div className="p-2 space-y-2 flex-1 min-h-[120px] overflow-y-auto max-h-[60vh]">
        {positions.map((p) => (
          <KanbanCard key={p.id} position={p} onEdit={onEdit} />
        ))}
        {positions.length === 0 && (
          <div className="flex items-center justify-center h-20 text-xs text-muted-foreground">
            Drop here
          </div>
        )}
      </div>
    </div>
  );
}

export function KanbanBoard({ positions, onEditPosition }: KanbanBoardProps) {
  const updateStatus = useUpdateStatus();
  const [activePosition, setActivePosition] = useState<Position | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const columns = useMemo(() => {
    const map: Record<PositionStatus, Position[]> = {} as any;
    for (const s of STATUS_ORDER) map[s] = [];
    for (const p of positions) {
      if (map[p.status]) map[p.status].push(p);
    }
    return map;
  }, [positions]);

  const handleDragStart = (event: DragStartEvent) => {
    setActivePosition(event.active.data.current?.position ?? null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActivePosition(null);
    const { active, over } = event;
    if (!over) return;

    const position = active.data.current?.position as Position | undefined;
    const newStatus = over.id as PositionStatus;

    if (position && STATUS_ORDER.includes(newStatus) && position.status !== newStatus) {
      updateStatus.mutate({ id: position.id, status: newStatus });
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-3 overflow-x-auto pb-4">
        {STATUS_ORDER.map((s) => (
          <KanbanColumn key={s} status={s} positions={columns[s]} onEdit={onEditPosition} />
        ))}
      </div>
      <DragOverlay>
        {activePosition ? (
          <KanbanCard position={activePosition} onEdit={() => {}} isDragOverlay />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
