import { useState } from "react";
import { format } from "date-fns";
import { Trash2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCommunications, useCreateCommunication, useDeleteCommunication } from "@/hooks/usePositions";
import { MESSAGE_TYPE_LABELS, MESSAGE_TYPE_ICONS } from "@/lib/types";
import type { MessageType } from "@/lib/types";

interface Props {
  positionId: string;
}

export function CommunicationThread({ positionId }: Props) {
  const { data: messages = [], isLoading } = useCommunications(positionId);
  const create = useCreateCommunication();
  const remove = useDeleteCommunication();

  const [content, setContent] = useState("");
  const [messageType, setMessageType] = useState<MessageType>("note");
  const [author, setAuthor] = useState("Me");

  const handleSend = () => {
    if (!content.trim()) return;
    create.mutate({
      position_id: positionId,
      message_type: messageType,
      author: author.trim() || "Me",
      content: content.trim(),
    }, {
      onSuccess: () => {
        setContent("");
      },
    });
  };

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-foreground">Communications</h4>

      {/* Message list */}
      <div className="max-h-60 overflow-y-auto space-y-2">
        {isLoading && <p className="text-xs text-muted-foreground">Loading...</p>}
        {!isLoading && messages.length === 0 && (
          <p className="text-xs text-muted-foreground py-2">No messages yet</p>
        )}
        {messages.map((msg) => (
          <div key={msg.id} className="group flex gap-2 p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
            <span className="text-base shrink-0 mt-0.5">{MESSAGE_TYPE_ICONS[msg.message_type as MessageType] || "📝"}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="font-medium text-foreground">{msg.author}</span>
                <span>·</span>
                <span>{MESSAGE_TYPE_LABELS[msg.message_type as MessageType]}</span>
                <span>·</span>
                <span>{format(new Date(msg.occurred_at), "MMM d, yyyy HH:mm")}</span>
              </div>
              <p className="text-sm text-foreground mt-0.5 whitespace-pre-wrap">{msg.content}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 opacity-0 group-hover:opacity-100 text-destructive shrink-0"
              onClick={() => remove.mutate(msg.id)}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        ))}
      </div>

      {/* Compose */}
      <div className="border border-border rounded-lg p-2 space-y-2 bg-card">
        <div className="flex items-center gap-2">
          <Select value={messageType} onValueChange={(v) => setMessageType(v as MessageType)}>
            <SelectTrigger className="w-28 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(MESSAGE_TYPE_LABELS) as MessageType[]).map((t) => (
                <SelectItem key={t} value={t}>
                  {MESSAGE_TYPE_ICONS[t]} {MESSAGE_TYPE_LABELS[t]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="Author"
            className="w-24 h-8 text-xs"
          />
        </div>
        <div className="flex gap-2">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write a message..."
            rows={2}
            className="text-sm resize-none"
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSend();
            }}
          />
          <Button
            size="icon"
            className="h-full min-h-[3rem] shrink-0"
            disabled={!content.trim() || create.isPending}
            onClick={handleSend}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
