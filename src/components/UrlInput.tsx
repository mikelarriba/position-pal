import { forwardRef } from "react";
import { ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  value?: string;
}

export const UrlInput = forwardRef<HTMLInputElement, Props>(({ value, ...props }, ref) => {
  const hasUrl = value && (value.startsWith("http://") || value.startsWith("https://"));

  return (
    <div className="relative flex items-center">
      <Input ref={ref} value={value} {...props} className={`${hasUrl ? "pr-8" : ""} ${props.className || ""}`} />
      {hasUrl && (
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute right-2 text-primary hover:text-primary/80 transition-colors"
          onClick={(e) => e.stopPropagation()}
          tabIndex={-1}
        >
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      )}
    </div>
  );
});

UrlInput.displayName = "UrlInput";
