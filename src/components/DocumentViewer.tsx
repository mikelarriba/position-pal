import { useState } from "react";
import { Eye, ExternalLink, FileText } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface Props {
  url: string;
  fileName: string;
  trigger?: React.ReactNode;
}

export function DocumentViewer({ url, fileName, trigger }: Props) {
  const [open, setOpen] = useState(false);

  const isPdf = fileName.toLowerCase().endsWith(".pdf");
  const isDocx = fileName.toLowerCase().endsWith(".docx") || fileName.toLowerCase().endsWith(".doc");

  // For DOCX, use Microsoft Office Online viewer; for PDF, use iframe directly
  const viewerUrl = isDocx
    ? `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`
    : url;

  return (
    <>
      {trigger ? (
        <span onClick={() => setOpen(true)} className="cursor-pointer">
          {trigger}
        </span>
      ) : (
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setOpen(true)} title="View document">
          <Eye className="h-3.5 w-3.5" />
        </Button>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl w-[90vw] h-[85vh] flex flex-col p-0">
          <DialogHeader className="px-6 pt-6 pb-2 shrink-0">
            <div className="flex items-center justify-between gap-2">
              <DialogTitle className="flex items-center gap-2 text-sm truncate">
                <FileText className="h-4 w-4 shrink-0" />
                <span className="truncate">{fileName}</span>
              </DialogTitle>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary shrink-0"
                title="Open in new tab"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </DialogHeader>
          <div className="flex-1 min-h-0 px-6 pb-6">
            {isPdf || isDocx ? (
              <iframe
                src={viewerUrl}
                className="w-full h-full rounded-md border border-border"
                title={fileName}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                Preview not available for this file type.{" "}
                <a href={url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline ml-1">
                  Download instead
                </a>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
