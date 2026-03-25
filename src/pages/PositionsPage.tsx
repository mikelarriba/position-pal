import { useState, useMemo } from "react";
import { Plus, Briefcase, Search, Building2, LayoutList, Columns3, Archive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CompanyCard } from "@/components/CompanyCard";
import { CompanyDialog } from "@/components/CompanyDialog";
import { PositionDialog } from "@/components/PositionDialog";
import { MarkdownExport } from "@/components/MarkdownExport";
import { KanbanBoard } from "@/components/KanbanBoard";
import { useCompaniesWithPositions, usePositions } from "@/hooks/usePositions";
import { STATUS_ORDER, STATUS_LABELS } from "@/lib/types";
import type { Position, Company, CompanyWithPositions } from "@/lib/types";

type ViewMode = "list" | "kanban";

const PositionsPage = () => {
  const { data: companiesWithPositions = [], isLoading } = useCompaniesWithPositions();
  const { data: allPositions = [] } = usePositions();

  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [companyDialogOpen, setCompanyDialogOpen] = useState(false);
  const [editCompany, setEditCompany] = useState<Company | null>(null);
  const [positionDialogOpen, setPositionDialogOpen] = useState(false);
  const [editPosition, setEditPosition] = useState<Position | null>(null);
  const [preselectedCompanyId, setPreselectedCompanyId] = useState<string | null>(null);
  const [preselectedCompanyName, setPreselectedCompanyName] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [showArchived, setShowArchived] = useState(false);

  const filtered = useMemo(() => {
    return companiesWithPositions
      .map((c) => {
        const filteredPositions = c.positions.filter((p) => {
          const matchesSearch =
            !search ||
            c.name.toLowerCase().includes(search.toLowerCase()) ||
            p.role.toLowerCase().includes(search.toLowerCase());
          const matchesTab = activeTab === "all" || p.status === activeTab;
          return matchesSearch && matchesTab;
        });
        return { ...c, positions: filteredPositions };
      })
      .filter((c) => {
        if (!showArchived && c.archived) return false;
        if (activeTab !== "all") return c.positions.length > 0;
        if (!search) return true;
        return c.positions.length > 0 || c.name.toLowerCase().includes(search.toLowerCase());
      });
  }, [companiesWithPositions, search, activeTab, showArchived]);

  const filteredPositions = useMemo(() => {
    return allPositions.filter((p) => {
      const matchesSearch =
        !search ||
        p.company.toLowerCase().includes(search.toLowerCase()) ||
        p.role.toLowerCase().includes(search.toLowerCase());
      return matchesSearch;
    });
  }, [allPositions, search]);

  const companies = useMemo(() => companiesWithPositions.map(({ positions, ...c }) => c), [companiesWithPositions]);
  const existingRoles = useMemo(() => allPositions.map((p) => p.role), [allPositions]);

  const handleEditCompany = (c: CompanyWithPositions) => {
    setEditCompany(c);
    setCompanyDialogOpen(true);
  };

  const handleNewCompany = () => {
    setEditCompany(null);
    setCompanyDialogOpen(true);
  };

  const handleEditPosition = (p: Position) => {
    setEditPosition(p);
    setPreselectedCompanyId(null);
    setPreselectedCompanyName(null);
    setPositionDialogOpen(true);
  };

  const handleAddPosition = (companyId: string, companyName: string) => {
    setEditPosition(null);
    setPreselectedCompanyId(companyId);
    setPreselectedCompanyName(companyName);
    setPositionDialogOpen(true);
  };

  return (
    <div className="container max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Header actions */}
      <div className="flex items-center justify-end gap-2">
        <MarkdownExport positions={allPositions} />
        <Button onClick={handleNewCompany} variant="outline" size="sm">
          <Building2 className="h-4 w-4 mr-1" /> Company
        </Button>
        <Button onClick={() => handleAddPosition("", "")} size="sm">
          <Plus className="h-4 w-4 mr-1" /> Position
        </Button>
      </div>

      {/* Search + View toggle */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search companies or roles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center border border-border rounded-lg overflow-hidden">
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 transition-colors ${viewMode === "list" ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:text-foreground"}`}
          >
            <LayoutList className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode("kanban")}
            className={`p-2 transition-colors ${viewMode === "kanban" ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:text-foreground"}`}
          >
            <Columns3 className="h-4 w-4" />
          </button>
        </div>
        <button
          onClick={() => setShowArchived(!showArchived)}
          className={`p-2 rounded-lg border border-border transition-colors ${showArchived ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:text-foreground"}`}
          title={showArchived ? "Hide archived" : "Show archived"}
        >
          <Archive className="h-4 w-4" />
        </button>
      </div>

      {viewMode === "kanban" ? (
        isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Loading...</div>
        ) : (
          <KanbanBoard positions={filteredPositions} onEditPosition={handleEditPosition} />
        )
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All ({allPositions.length})</TabsTrigger>
            {STATUS_ORDER.map((s) => {
              const count = allPositions.filter((p) => p.status === s).length;
              return (
                <TabsTrigger key={s} value={s}>{STATUS_LABELS[s]} ({count})</TabsTrigger>
              );
            })}
          </TabsList>

          <TabsContent value={activeTab} className="mt-4">
            {isLoading ? (
              <div className="text-center py-12 text-muted-foreground">Loading...</div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12">
                <Building2 className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                <p className="text-muted-foreground">No companies found</p>
                <Button variant="outline" size="sm" className="mt-3" onClick={handleNewCompany}>
                  <Plus className="h-4 w-4 mr-1" /> Add your first company
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {filtered.map((c) => (
                  <CompanyCard
                    key={c.id}
                    company={c}
                    onEditCompany={handleEditCompany}
                    onEditPosition={handleEditPosition}
                    onAddPosition={handleAddPosition}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}

      <CompanyDialog open={companyDialogOpen} onOpenChange={setCompanyDialogOpen} company={editCompany} />
      <PositionDialog
        open={positionDialogOpen}
        onOpenChange={setPositionDialogOpen}
        position={editPosition}
        companies={companies}
        existingRoles={existingRoles}
        preselectedCompanyId={preselectedCompanyId}
        preselectedCompanyName={preselectedCompanyName}
      />
    </div>
  );
};

export default PositionsPage;
