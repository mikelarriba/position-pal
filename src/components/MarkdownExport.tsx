import { Download, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { positionToMarkdown, parseMarkdownPosition } from "@/lib/positions";
import type { Position } from "@/lib/types";
import { useCreatePosition, useUpdatePosition } from "@/hooks/usePositions";
import { toast } from "sonner";

interface Props {
  positions: Position[];
}

export function MarkdownExport({ positions }: Props) {
  const [importOpen, setImportOpen] = useState(false);
  const [importText, setImportText] = useState("");
  const create = useCreatePosition();
  const update = useUpdatePosition();

  const handleExport = () => {
    const markdown = positions.map(positionToMarkdown).join("\n---\n\n");
    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "positions.md";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Exported positions.md");
  };

  const handleImport = () => {
    const blocks = importText.split(/\n---\n/).filter((b) => b.trim());
    let created = 0;
    let updated = 0;

    for (const block of blocks) {
      const parsed = parseMarkdownPosition(block.trim());
      if (!parsed.company || !parsed.role) continue;

      const existing = positions.find((p) => p.id === parsed.id);
      if (existing) {
        const { id, ...data } = parsed;
        update.mutate({ id: existing.id, data: data as any });
        updated++;
      } else {
        const { id, ...data } = parsed;
        create.mutate(data as any);
        created++;
      }
    }

    toast.success(`Imported: ${created} new, ${updated} updated`);
    setImportOpen(false);
    setImportText("");
  };

  return (
    <>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="h-4 w-4 mr-1" /> Export .md
        </Button>
        <Button variant="outline" size="sm" onClick={() => setImportOpen(true)}>
          <Upload className="h-4 w-4 mr-1" /> Import .md
        </Button>
      </div>

      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Import Markdown</DialogTitle>
            <DialogDescription>
              Paste your positions markdown file. Positions with matching IDs will be updated, new ones will be created.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            rows={15}
            placeholder="Paste your positions.md content here..."
            className="font-mono text-sm"
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setImportOpen(false)}>Cancel</Button>
            <Button onClick={handleImport}>Import</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
