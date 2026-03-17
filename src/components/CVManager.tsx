import { useState, useRef } from "react";
import { Upload, FileText, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import type { Position } from "@/lib/types";
import { toast } from "sonner";

interface Props {
  positions: Position[];
}

export function CVManager({ positions }: Props) {
  const [cvUrl, setCvUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [tweaks, setTweaks] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const checkExistingCV = async () => {
    const { data } = await supabase.storage.from("cv").list("", { limit: 1, search: "base-cv" });
    if (data && data.length > 0) {
      const { data: urlData } = supabase.storage.from("cv").getPublicUrl(data[0].name);
      setCvUrl(urlData.publicUrl);
    }
  };

  useState(() => {
    checkExistingCV();
  });

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `base-cv.${ext}`;

    // Remove old CV first
    await supabase.storage.from("cv").remove([path]);

    const { error } = await supabase.storage.from("cv").upload(path, file, { upsert: true });
    if (error) {
      toast.error(`Upload failed: ${error.message}`);
    } else {
      const { data } = supabase.storage.from("cv").getPublicUrl(path);
      setCvUrl(data.publicUrl);
      toast.success("CV uploaded");
    }
    setUploading(false);
  };

  const openExportDialog = (position: Position) => {
    setSelectedPosition(position);
    setTweaks(`Tailored for: ${position.role} at ${position.company}\n\nKey adjustments:\n- `);
    setExportOpen(true);
  };

  const handleExportCV = () => {
    if (!selectedPosition) return;
    // Generate a markdown-based tailored CV summary
    const content = `# Tailored CV - ${selectedPosition.role} @ ${selectedPosition.company}

## Position Details
- **Company:** ${selectedPosition.company}
- **Role:** ${selectedPosition.role}
${selectedPosition.url ? `- **URL:** ${selectedPosition.url}` : ""}

## CV Adjustments
${tweaks}

## Base CV
${cvUrl ? `[Download base CV](${cvUrl})` : "No base CV uploaded yet."}

---
Generated: ${new Date().toISOString()}
`;

    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cv-${selectedPosition.company.toLowerCase().replace(/\s+/g, "-")}-${selectedPosition.role.toLowerCase().replace(/\s+/g, "-")}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Tailored CV exported");
    setExportOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <input ref={fileRef} type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleUpload} />
        <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()} disabled={uploading}>
          {uploading ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Upload className="h-4 w-4 mr-1" />}
          {cvUrl ? "Replace CV" : "Upload CV"}
        </Button>
        {cvUrl && (
          <a href={cvUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline inline-flex items-center gap-1">
            <FileText className="h-3 w-3" /> View base CV
          </a>
        )}
      </div>

      {positions.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm text-muted-foreground">Export tailored CV for:</Label>
          <div className="flex flex-wrap gap-2">
            {positions
              .filter((p) => p.status === "applied" || p.status === "interviewing" || p.status === "bookmarked")
              .slice(0, 8)
              .map((p) => (
                <Button key={p.id} variant="outline" size="sm" onClick={() => openExportDialog(p)}>
                  <Download className="h-3 w-3 mr-1" />
                  {p.company}
                </Button>
              ))}
          </div>
        </div>
      )}

      <Dialog open={exportOpen} onOpenChange={setExportOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Export Tailored CV</DialogTitle>
            <DialogDescription>
              {selectedPosition && `${selectedPosition.role} @ ${selectedPosition.company}`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>CV Adjustments & Notes</Label>
              <Textarea
                value={tweaks}
                onChange={(e) => setTweaks(e.target.value)}
                rows={8}
                className="font-mono text-sm"
                placeholder="What to emphasize, tweak, or change for this position..."
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setExportOpen(false)}>Cancel</Button>
              <Button onClick={handleExportCV}>
                <Download className="h-4 w-4 mr-1" /> Export
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
