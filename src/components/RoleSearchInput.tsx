import { useState, useRef, useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Search, Plus, Briefcase } from "lucide-react";

interface Props {
  roles: string[];
  value: string;
  onChange: (value: string) => void;
}

export function RoleSearchInput({ roles, value, onChange }: Props) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const displayValue = isFocused ? query : value;

  const filtered = useMemo(() => {
    if (query.length < 3) return [];
    return [...new Set(roles)].filter((r) => r.toLowerCase().includes(query.toLowerCase()));
  }, [roles, query]);

  const exactMatch = query.length >= 3 && filtered.some((r) => r.toLowerCase() === query.toLowerCase());

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleFocus = () => {
    setIsFocused(true);
    setQuery(value || "");
    if (value.length >= 3) setIsOpen(true);
  };

  const handleChange = (val: string) => {
    setQuery(val);
    setIsOpen(val.length >= 3);
    onChange(val);
  };

  const handleSelect = (role: string) => {
    onChange(role);
    setQuery(role);
    setIsOpen(false);
    setIsFocused(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <Input
          value={displayValue}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={handleFocus}
          placeholder="Search role (3+ chars)..."
          className="pl-8"
        />
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-border bg-popover shadow-md max-h-48 overflow-y-auto">
          {filtered.length > 0 ? (
            filtered.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => handleSelect(r)}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-left hover:bg-accent transition-colors"
              >
                <Briefcase className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <span className="truncate">{r}</span>
              </button>
            ))
          ) : query.length >= 3 ? (
            <div className="px-3 py-2 text-sm text-muted-foreground">No matching roles</div>
          ) : null}

          {query.length >= 3 && !exactMatch && (
            <button
              type="button"
              onClick={() => handleSelect(query.trim())}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-left border-t border-border hover:bg-accent text-primary transition-colors"
            >
              <Plus className="h-3.5 w-3.5 shrink-0" />
              <span>Use "{query.trim()}"</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
