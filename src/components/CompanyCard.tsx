import { Building2, ExternalLink, Linkedin, ChevronDown, ChevronRight, Trash2, Sparkles, Loader2, Plus, Pencil, Archive, MoreHorizontal } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { PositionCard } from "./PositionCard";
import { StatusBadge } from "./StatusBadge";
import { useDeleteCompany, useEnrichCompany, useArchiveCompany } from "@/hooks/usePositions";
import type { CompanyWithPositions, Position } from "@/lib/types";

interface Props {
  company: CompanyWithPositions;
  onEditCompany: (c: CompanyWithPositions) => void;
  onEditPosition: (p: Position) => void;
  onAddPosition: (companyId: string, companyName: string) => void;
}

export function CompanyCard({ company, onEditCompany, onEditPosition, onAddPosition }: Props) {
  const [expanded, setExpanded] = useState(true);
  const deleteCompany = useDeleteCompany();
  const enrich = useEnrichCompany();
  const archive = useArchiveCompany();

  const statusCounts = company.positions.reduce((acc, p) => {
    acc[p.status] = (acc[p.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className={`border border-border rounded-lg bg-card overflow-hidden animate-fade-in ${company.archived ? "opacity-60" : ""}`}>
      {/* Company Header */}
      <div
        className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Building2 className="h-4 w-4 text-primary" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3
                  className="font-semibold text-card-foreground truncate cursor-pointer hover:text-primary transition-colors"
                  onClick={(e) => { e.stopPropagation(); onEditCompany(company); }}
                >
                  {company.name}
                </h3>
                {company.archived && (
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">Archived</span>
                )}
                {company.industry && (
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full hidden sm:inline">
                    {company.industry}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                {company.size && <span>{company.size} employees</span>}
                {company.website && (
                  <a href={company.website} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="inline-flex items-center gap-1 text-primary hover:underline">
                    <ExternalLink className="h-3 w-3" /> Website
                  </a>
                )}
                {company.linkedin_url && (
                  <a href={company.linkedin_url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="inline-flex items-center gap-1 text-primary hover:underline">
                    <Linkedin className="h-3 w-3" /> LinkedIn
                  </a>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="hidden sm:flex items-center gap-1">
              {Object.entries(statusCounts).map(([status, count]) => (
                <span key={status} className="flex items-center gap-1">
                  <StatusBadge status={status as any} className="text-[10px] px-1.5 py-0" />
                  {count > 1 && <span className="text-[10px] text-muted-foreground">×{count}</span>}
                </span>
              ))}
            </div>

            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); onAddPosition(company.id, company.name); }}>
              <Plus className="h-3.5 w-3.5" />
            </Button>

            {company.linkedin_url && (
              <Button variant="ghost" size="icon" className="h-7 w-7" disabled={enrich.isPending} onClick={(e) => { e.stopPropagation(); enrich.mutate({ id: company.id, linkedin_url: company.linkedin_url!, name: company.name }); }}>
                {enrich.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
              </Button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => e.stopPropagation()}>
                  <MoreHorizontal className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                <DropdownMenuItem onClick={() => onEditCompany(company)}>
                  <Pencil className="h-3.5 w-3.5 mr-2" /> Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => archive.mutate({ id: company.id, archived: !company.archived })}>
                  <Archive className="h-3.5 w-3.5 mr-2" /> {company.archived ? "Unarchive" : "Archive"}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => {
                    if (confirm(`Delete ${company.name} and all its positions?`)) {
                      deleteCompany.mutate(company.id);
                    }
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {expanded ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
          </div>
        </div>

        {company.description && (
          <p className="mt-2 text-xs text-muted-foreground line-clamp-2 ml-12">{company.description}</p>
        )}
      </div>

      {expanded && company.positions.length > 0 && (
        <div className="border-t border-border bg-muted/20 p-3 grid gap-2 sm:grid-cols-2">
          {company.positions.map((p) => (
            <PositionCard key={p.id} position={p} onEdit={onEditPosition} />
          ))}
        </div>
      )}

      {expanded && company.positions.length === 0 && (
        <div className="border-t border-border bg-muted/20 p-4 text-center">
          <p className="text-sm text-muted-foreground">No positions yet</p>
          <Button variant="outline" size="sm" className="mt-2" onClick={() => onAddPosition(company.id, company.name)}>
            <Plus className="h-3 w-3 mr-1" /> Add position
          </Button>
        </div>
      )}
    </div>
  );
}
