import { useState, useRef } from "react";
import { Upload, FileText, Trash2, Loader2, ExternalLink, Eye } from "lucide-react";
import { DocumentViewer } from "@/components/DocumentViewer";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface PositionCV {
  id: string;
  position_id: string;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: number | null;
  created_at: string;
}

interface Props {
  positionId: string;
}

async function fetchPositionCVs(positionId: string): Promise<PositionCV[]> {
  const { data, error } = await supabase
    .from("position_cvs")
    .select("*")
    .eq("position_id", positionId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as PositionCV[];
}

function formatFileSize(bytes: number | null) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function PositionCVUpload({ positionId }: Props) {
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const qc = useQueryClient();

  const { data: cvs = [] } = useQuery({
    queryKey: ["position-cvs", positionId],
    queryFn: () => fetchPositionCVs(positionId),
  });

  const deleteMutation = useMutation({
    mutationFn: async (cv: PositionCV) => {
      await supabase.storage.from("cv").remove([cv.file_path]);
      const { error } = await supabase.from("position_cvs").delete().eq("id", cv.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["position-cvs", positionId] });
      qc.invalidateQueries({ queryKey: ["all-cvs"] });
      toast.success("CV removed");
    },
    onError: (e: Error) => toast.error(`Failed: ${e.message}`),
  });

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Only PDF and Word documents are allowed");
      return;
    }

    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `positions/${positionId}/${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage.from("cv").upload(path, file);
    if (uploadError) {
      toast.error(`Upload failed: ${uploadError.message}`);
      setUploading(false);
      return;
    }

    const { error: dbError } = await supabase.from("position_cvs").insert({
      position_id: positionId,
      file_name: file.name,
      file_path: path,
      file_type: file.type,
      file_size: file.size,
    });

    if (dbError) {
      toast.error(`Failed to save: ${dbError.message}`);
    } else {
      qc.invalidateQueries({ queryKey: ["position-cvs", positionId] });
      qc.invalidateQueries({ queryKey: ["all-cvs"] });
      toast.success("CV uploaded");
    }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  const getPublicUrl = (path: string) => {
    const { data } = supabase.storage.from("cv").getPublicUrl(path);
    return data.publicUrl;
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-foreground">Attached CVs</h4>
        <div>
          <input ref={fileRef} type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleUpload} />
          <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()} disabled={uploading}>
            {uploading ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : <Upload className="h-3.5 w-3.5 mr-1" />}
            Upload CV
          </Button>
        </div>
      </div>

      {cvs.length === 0 ? (
        <p className="text-xs text-muted-foreground">No CVs attached yet.</p>
      ) : (
        <div className="space-y-2">
          {cvs.map((cv) => (
            <div key={cv.id} className="flex items-center gap-2 p-2 rounded-md bg-muted/50 border border-border text-sm">
              <FileText className="h-4 w-4 text-primary shrink-0" />
              <div className="flex-1 min-w-0">
                <a
                  href={getPublicUrl(cv.file_path)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground hover:text-primary hover:underline truncate block"
                >
                  {cv.file_name}
                </a>
                <span className="text-xs text-muted-foreground">
                  {formatFileSize(cv.file_size)} · {formatDistanceToNow(new Date(cv.created_at), { addSuffix: true })}
                </span>
              </div>
              <DocumentViewer url={getPublicUrl(cv.file_path)} fileName={cv.file_name} />
              <a
                href={getPublicUrl(cv.file_path)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-destructive"
                onClick={() => deleteMutation.mutate(cv)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
