import { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Building2, ExternalLink, Linkedin, Plus, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PositionCard } from "@/components/PositionCard";
import { PositionDialog } from "@/components/PositionDialog";
import { CompanyDialog } from "@/components/CompanyDialog";
import { CompanyTimeline } from "@/components/CompanyTimeline";
import { CVLog } from "@/components/CVLog";
import { useCompaniesWithPositions, usePositions } from "@/hooks/usePositions";
import type { Position, Company, CompanyWithPositions } from "@/lib/types";
import { STATUS_LABELS } from "@/lib/types";

const CompanyDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: companiesWithPositions = [], isLoading } = useCompaniesWithPositions();
  const { data: allPositions = [] } = usePositions();

  const [positionDialogOpen, setPositionDialogOpen] = useState(false);
  const [editPosition, setEditPosition] = useState<Position | null>(null);
  const [companyDialogOpen, setCompanyDialogOpen] = useState(false);

  const company = useMemo(() => companiesWithPositions.find((c) => c.id === id), [companiesWithPositions, id]);
  const companies = useMemo(() => companiesWithPositions.map(({ positions, ...c }) => c), [companiesWithPositions]);
  const existingRoles = useMemo(() => allPositions.map((p) => p.role), [allPositions]);

  // For CV log, filter to just this company
  const companyForCvLog = useMemo(() => company ? [company] : [], [company]);

  const handleEditPosition = (p: Position) => {
    setEditPosition(p);
    setPositionDialogOpen(true);
  };

  const handleAddPosition = () => {
    setEditPosition(null);
    setPositionDialogOpen(true);
  };

  if (isLoading) {
    return <div className="text-center py-12 text-muted-foreground">Loading...</div>;
  }

  if (!company) {
    return (
      <div className="container max-w-6xl mx-auto px-4 py-12 text-center">
        <p className="text-muted-foreground">Company not found</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate("/companies")}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Companies
        </Button>
      </div>
    );
  }

  // Group positions by status
  const positionsByStatus = company.positions.reduce((acc, p) => {
    acc[p.status] = acc[p.status] || [];
    acc[p.status].push(p);
    return acc;
  }, {} as Record<string, Position[]>);

  return (
    <div className="container max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Back + Company header */}
      <div>
        <Button variant="ghost" size="sm" onClick={() => navigate("/companies")} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" /> Companies
        </Button>

        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Building2 className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{company.name}</h1>
              <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                {company.industry && <span>{company.industry}</span>}
                {company.size && <span>· {company.size} employees</span>}
                {company.website && (
                  <a href={company.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">
                    <ExternalLink className="h-3 w-3" /> Website
                  </a>
                )}
                {company.linkedin_url && (
                  <a href={company.linkedin_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">
                    <Linkedin className="h-3 w-3" /> LinkedIn
                  </a>
                )}
              </div>
              {company.description && (
                <p className="text-sm text-muted-foreground mt-2 max-w-2xl">{company.description}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button variant="outline" size="sm" onClick={() => setCompanyDialogOpen(true)}>
              <Pencil className="h-4 w-4 mr-1" /> Edit
            </Button>
            <Button size="sm" onClick={handleAddPosition}>
              <Plus className="h-4 w-4 mr-1" /> Position
            </Button>
          </div>
        </div>
      </div>

      {/* Positions */}
      <section>
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Positions ({company.positions.length})
        </h2>
        {company.positions.length === 0 ? (
          <div className="text-center py-8 border border-border rounded-lg bg-card">
            <p className="text-muted-foreground">No positions yet</p>
            <Button variant="outline" size="sm" className="mt-3" onClick={handleAddPosition}>
              <Plus className="h-4 w-4 mr-1" /> Add position
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(positionsByStatus).map(([status, positions]) => (
              <div key={status}>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">
                  {STATUS_LABELS[status as keyof typeof STATUS_LABELS] || status} ({positions.length})
                </h3>
                <div className="grid gap-2 sm:grid-cols-2">
                  {positions.map((p) => (
                    <PositionCard key={p.id} position={p} onEdit={handleEditPosition} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Timeline */}
      <section className="border border-border rounded-lg bg-card overflow-hidden">
        <CompanyTimeline companyId={company.id} />
      </section>

      {/* CVs for this company */}
      <section>
        <h2 className="text-lg font-semibold text-foreground mb-4">CVs</h2>
        <CVLog companies={companyForCvLog} />
      </section>

      <CompanyDialog open={companyDialogOpen} onOpenChange={setCompanyDialogOpen} company={company} />
      <PositionDialog
        open={positionDialogOpen}
        onOpenChange={setPositionDialogOpen}
        position={editPosition}
        companies={companies}
        existingRoles={existingRoles}
        preselectedCompanyId={company.id}
        preselectedCompanyName={company.name}
      />
    </div>
  );
};

export default CompanyDetailPage;
