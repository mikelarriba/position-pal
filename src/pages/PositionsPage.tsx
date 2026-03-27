import { useState, useMemo } from "react";
import { Search, LayoutList, Columns3, TableProperties, Archive } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PositionCard } from "@/components/PositionCard";
import { PositionsTable } from "@/components/PositionsTable";
import { CompanyDialog } from "@/components/CompanyDialog";
import { PositionDetailPanel } from "@/components/PositionDetailPanel";
import { KanbanBoard } from "@/components/KanbanBoard";
import { useCompaniesWithPositions, usePositions } from "@/hooks/usePositions";
import { STATUS_ORDER, STATUS_LABELS } from "@/lib/types";
import type { Position, Company } from "@/lib/types";

type ViewMode = "cards" | "table" | "kanban";

const PositionsPage = () => {
  const { data: companiesWithPositions = [], isLoading } = useCompaniesWithPositions();
  const { data: allPositions = [] } = usePositions();

  const [viewMode, setViewMode] = useState<ViewMode>("cards");
  const [companyDialogOpen, setCompanyDialogOpen] = useState(false);
  const [editCompany, setEditCompany] = useState<Company | null>(null);
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [preselectedCompanyId, setPreselectedCompanyId] = useState<string | null>(null);
  const [preselectedCompanyName, setPreselectedCompanyName] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [showArchived, setShowArchived] = useState(false);

  const panelOpen = !!selectedPosition || isCreating;

  const companies = useMemo(() => companiesWithPositions.map(({ positions, ...c }) => c), [companiesWithPositions]);
  const existingRoles = useMemo(() => allPositions.map((p) => p.role), [allPositions]);

  // Flat filtered positions
  const filteredPositions = useMemo(() => {
    return allPositions.filter((p) => {
      // Archive filter: find matching company
      if (!showArchived) {
        const company = companiesWithPositions.find((c) => c.id === p.company_id);
        if (company?.archived) return false;
      }
      const matchesSearch =
        !search ||
        p.company.toLowerCase().includes(search.toLowerCase()) ||
        p.role.toLowerCase().includes(search.toLowerCase());
      const matchesTab = activeTab === "all" || p.status === activeTab;
      return matchesSearch && matchesTab;
    });
  }, [allPositions, companiesWithPositions, search, activeTab, showArchived]);

  const handleEditPosition = (p: Position) => {
    setSelectedPosition(p);
    setIsCreating(false);
  };

  const handleClosePanel = () => {
    setSelectedPosition(null);
    setIsCreating(false);
    setPreselectedCompanyId(null);
    setPreselectedCompanyName(null);
  };

  const viewButtons: { mode: ViewMode; icon: typeof LayoutList; label: string }[] = [
    { mode: "cards", icon: LayoutList, label: "Cards" },
    { mode: "table", icon: TableProperties, label: "Table" },
    { mode: "kanban", icon: Columns3, label: "Kanban" },
  ];

  return (
    <div className="flex h-[calc(100vh-3rem)] overflow-hidden">
      {/* Master list */}
      <div className={`flex-1 overflow-y-auto transition-all duration-300`}>
        <div className="container max-w-6xl mx-auto px-4 py-6 space-y-6">
          {/* Search + View toggle */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search roles or companies..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex items-center border border-border rounded-lg overflow-hidden">
              {viewButtons.map(({ mode, icon: Icon }) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`p-2 transition-colors ${viewMode === mode ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:text-foreground"}`}
                >
                  <Icon className="h-4 w-4" />
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowArchived(!showArchived)}
              className={`p-2 rounded-lg border border-border transition-colors ${showArchived ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:text-foreground"}`}
              title={showArchived ? "Hide archived" : "Show archived"}
            >
              <Archive className="h-4 w-4" />
            </button>
          </div>

          {/* Status tabs - shown for cards and table views */}
          {viewMode !== "kanban" ? (
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
                ) : filteredPositions.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">No positions found</p>
                  </div>
                ) : viewMode === "table" ? (
                  <PositionsTable
                    positions={filteredPositions}
                    onEditPosition={handleEditPosition}
                    activePositionId={selectedPosition?.id}
                  />
                ) : (
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredPositions.map((p) => (
                      <PositionCard
                        key={p.id}
                        position={p}
                        onEdit={handleEditPosition}
                        isActive={selectedPosition?.id === p.id}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          ) : (
            isLoading ? (
              <div className="text-center py-12 text-muted-foreground">Loading...</div>
            ) : (
              <KanbanBoard positions={filteredPositions} onEditPosition={handleEditPosition} />
            )
          )}
        </div>
      </div>

      {/* Detail panel */}
      {panelOpen && (
        <div className="w-[420px] shrink-0 h-full animate-fade-in">
          <PositionDetailPanel
            position={selectedPosition}
            companies={companies}
            existingRoles={existingRoles}
            preselectedCompanyId={preselectedCompanyId}
            preselectedCompanyName={preselectedCompanyName}
            onClose={handleClosePanel}
          />
        </div>
      )}

      <CompanyDialog open={companyDialogOpen} onOpenChange={setCompanyDialogOpen} company={editCompany} />
    </div>
  );
};

export default PositionsPage;
