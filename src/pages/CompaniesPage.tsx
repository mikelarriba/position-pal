import { useState, useMemo } from "react";
import { Building2, ExternalLink, Linkedin, Search, Plus, Archive } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CompanyDialog } from "@/components/CompanyDialog";
import { useCompaniesWithPositions } from "@/hooks/usePositions";
import { StatusBadge } from "@/components/StatusBadge";
import type { Company } from "@/lib/types";

const CompaniesPage = () => {
  const { data: companiesWithPositions = [], isLoading } = useCompaniesWithPositions();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editCompany, setEditCompany] = useState<Company | null>(null);

  const filtered = useMemo(() => {
    return companiesWithPositions.filter((c) => {
      if (!showArchived && c.archived) return false;
      if (search) {
        const q = search.toLowerCase();
        return c.name.toLowerCase().includes(q) || c.industry?.toLowerCase().includes(q);
      }
      return true;
    });
  }, [companiesWithPositions, search, showArchived]);

  return (
    <div className="container max-w-6xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">Companies</h2>
        <Button size="sm" onClick={() => { setEditCompany(null); setDialogOpen(true); }}>
          <Plus className="h-4 w-4 mr-1" /> Add Company
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search companies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <button
          onClick={() => setShowArchived(!showArchived)}
          className={`p-2 rounded-lg border border-border transition-colors ${showArchived ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:text-foreground"}`}
          title={showArchived ? "Hide archived" : "Show archived"}
        >
          <Archive className="h-4 w-4" />
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <Building2 className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
          <p className="text-muted-foreground">No companies found</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => {
            const statusCounts = c.positions.reduce((acc, p) => {
              acc[p.status] = (acc[p.status] || 0) + 1;
              return acc;
            }, {} as Record<string, number>);

            return (
              <div
                key={c.id}
                className={`border border-border rounded-lg bg-card p-4 hover:shadow-md transition-all cursor-pointer ${c.archived ? "opacity-60" : ""}`}
                onClick={() => navigate(`/companies/${c.id}`)}
              >
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-card-foreground truncate">{c.name}</h3>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                      {c.industry && <span>{c.industry}</span>}
                      {c.size && <span>· {c.size} employees</span>}
                    </div>
                  </div>
                </div>

                {c.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-3">{c.description}</p>
                )}

                <div className="flex items-center gap-2 mt-3 flex-wrap">
                  {Object.entries(statusCounts).map(([status, count]) => (
                    <span key={status} className="flex items-center gap-1">
                      <StatusBadge status={status as any} className="text-[10px] px-1.5 py-0" />
                      {count > 1 && <span className="text-[10px] text-muted-foreground">×{count}</span>}
                    </span>
                  ))}
                  {c.positions.length === 0 && (
                    <span className="text-xs text-muted-foreground">No positions</span>
                  )}
                </div>

                <div className="flex items-center gap-3 mt-3 text-xs">
                  {c.website && (
                    <a href={c.website} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="inline-flex items-center gap-1 text-primary hover:underline">
                      <ExternalLink className="h-3 w-3" /> Website
                    </a>
                  )}
                  {c.linkedin_url && (
                    <a href={c.linkedin_url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="inline-flex items-center gap-1 text-primary hover:underline">
                      <Linkedin className="h-3 w-3" /> LinkedIn
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <CompanyDialog open={dialogOpen} onOpenChange={setDialogOpen} company={editCompany} />
    </div>
  );
};

export default CompaniesPage;
