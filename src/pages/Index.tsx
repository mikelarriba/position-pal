import { useState } from "react";
import { Plus, Briefcase, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PositionCard } from "@/components/PositionCard";
import { PositionDialog } from "@/components/PositionDialog";
import { MarkdownExport } from "@/components/MarkdownExport";
import { CVManager } from "@/components/CVManager";
import { StatsBar } from "@/components/StatsBar";
import { usePositions } from "@/hooks/usePositions";
import { STATUS_ORDER, STATUS_LABELS } from "@/lib/types";
import type { Position } from "@/lib/types";

const Index = () => {
  const { data: positions = [], isLoading } = usePositions();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editPosition, setEditPosition] = useState<Position | null>(null);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const filtered = positions.filter((p) => {
    const matchesSearch =
      !search ||
      p.company.toLowerCase().includes(search.toLowerCase()) ||
      p.role.toLowerCase().includes(search.toLowerCase());
    const matchesTab = activeTab === "all" || p.status === activeTab;
    return matchesSearch && matchesTab;
  });

  const handleEdit = (p: Position) => {
    setEditPosition(p);
    setDialogOpen(true);
  };

  const handleNew = () => {
    setEditPosition(null);
    setDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container max-w-5xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
                <Briefcase className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Job Tracker</h1>
                <p className="text-xs text-muted-foreground">Track positions & manage applications</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <MarkdownExport positions={positions} />
              <Button onClick={handleNew} size="sm">
                <Plus className="h-4 w-4 mr-1" /> Add
              </Button>
            </div>
          </div>
          <StatsBar positions={positions} />
        </div>
      </header>

      {/* Main */}
      <main className="container max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Search + Filter */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search positions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            {STATUS_ORDER.map((s) => (
              <TabsTrigger key={s} value={s}>{STATUS_LABELS[s]}</TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={activeTab} className="mt-4">
            {isLoading ? (
              <div className="text-center py-12 text-muted-foreground">Loading...</div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12">
                <Briefcase className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                <p className="text-muted-foreground">No positions found</p>
                <Button variant="outline" size="sm" className="mt-3" onClick={handleNew}>
                  <Plus className="h-4 w-4 mr-1" /> Add your first position
                </Button>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {filtered.map((p) => (
                  <PositionCard key={p.id} position={p} onEdit={handleEdit} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* CV Section */}
        <section className="border-t border-border pt-6">
          <h2 className="text-lg font-semibold mb-4 text-foreground">CV Management</h2>
          <CVManager positions={positions} />
        </section>
      </main>

      <PositionDialog open={dialogOpen} onOpenChange={setDialogOpen} position={editPosition} />
    </div>
  );
};

export default Index;
