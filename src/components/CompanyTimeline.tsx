import { format } from "date-fns";
import { useCompanyCommunications } from "@/hooks/usePositions";
import { MESSAGE_TYPE_LABELS, MESSAGE_TYPE_ICONS } from "@/lib/types";
import type { MessageType } from "@/lib/types";

interface Props {
  companyId: string;
}

export function CompanyTimeline({ companyId }: Props) {
  const { data: messages = [], isLoading } = useCompanyCommunications(companyId);

  if (isLoading) return <p className="text-xs text-muted-foreground p-3">Loading timeline...</p>;
  if (messages.length === 0) return null;

  return (
    <div className="border-t border-border bg-muted/10 p-3 space-y-2">
      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Company Timeline</h4>
      <div className="space-y-1.5 max-h-48 overflow-y-auto">
        {messages.map((msg: any) => (
          <div key={msg.id} className="flex gap-2 text-xs items-start">
            <span className="shrink-0 mt-0.5">{MESSAGE_TYPE_ICONS[msg.message_type as MessageType] || "📝"}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 text-muted-foreground flex-wrap">
                <span className="font-medium text-foreground">{msg.author}</span>
                <span>→</span>
                <span className="text-primary font-medium">{msg.position_role}</span>
                <span>·</span>
                <span>{MESSAGE_TYPE_LABELS[msg.message_type as MessageType]}</span>
                <span>·</span>
                <span>{format(new Date(msg.occurred_at), "MMM d HH:mm")}</span>
              </div>
              <p className="text-foreground mt-0.5 line-clamp-1">{msg.content}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
