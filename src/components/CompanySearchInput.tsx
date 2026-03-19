import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Search, Building2 } from "lucide-react";
import type { Company } from "@/lib/types";

interface Props {
  companies: Company[];
  selectedCompanyId: string;
  selectedCompanyName: string;
  onSelect: (companyId: string, companyName: string) => void;
  onCreate: (name: string) => void;
  isCreating?: boolean;
}

export function CompanySearchInput({ companies, selectedCompanyId, selectedCompanyName, onSelect, onCreate, isCreating }: Props) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const displayValue = isFocused ? query : selectedCompanyName;

  const filtered = query.length >= 3
    ? companies.filter((c) => c.name.toLowerCase().includes(query.toLowerCase()))
    : [];

  const exactMatch = query.length >= 3 && filtered.some((c) => c.name.toLowerCase() === query.toLowerCase());

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setIsFocused(false);
        if (!selectedCompanyId) setQuery("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [selectedCompanyId]);

  const handleFocus = () => {
    setIsFocused(true);
    setQuery(selectedCompanyName || "");
    if (selectedCompanyName.length >= 3) setIsOpen(true);
  };

  const handleChange = (value: string) => {
    setQuery(value);
    setIsOpen(value.length >= 3);
    // Clear selection if user changes the text
    if (selectedCompanyId) {
      onSelect("", "");
    }
  };

  const handleSelect = (company: Company) => {
    onSelect(company.id, company.name);
    setQuery(company.name);
    setIsOpen(false);
    setIsFocused(false);
  };

  const handleCreate = () => {
    onCreate(query.trim());
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <Input
          value={displayValue}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={handleFocus}
          placeholder="Search company (3+ chars)..."
          className="pl-8"
        />
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-border bg-popover shadow-md max-h-48 overflow-y-auto">
          {filtered.length > 0 ? (
            filtered.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => handleSelect(c)}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-left hover:bg-accent transition-colors"
              >
                <Building2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <span className="truncate">{c.name}</span>
                {c.industry && <span className="text-xs text-muted-foreground ml-auto shrink-0">{c.industry}</span>}
              </button>
            ))
          ) : query.length >= 3 ? (
            <div className="px-3 py-2 text-sm text-muted-foreground">No companies found</div>
          ) : null}

          {query.length >= 3 && !exactMatch && (
            <button
              type="button"
              onClick={handleCreate}
              disabled={isCreating}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-left border-t border-border hover:bg-accent text-primary transition-colors"
            >
              <Plus className="h-3.5 w-3.5 shrink-0" />
              <span>Create "{query.trim()}"</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
