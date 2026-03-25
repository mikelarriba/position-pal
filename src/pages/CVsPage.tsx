import { FileText } from "lucide-react";
import { CVLog } from "@/components/CVLog";
import { CVManager } from "@/components/CVManager";
import { useCompaniesWithPositions, usePositions } from "@/hooks/usePositions";

const CVsPage = () => {
  const { data: companiesWithPositions = [] } = useCompaniesWithPositions();
  const { data: allPositions = [] } = usePositions();

  return (
    <div className="container max-w-6xl mx-auto px-4 py-6 space-y-6">
      <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
        <FileText className="h-5 w-5" /> CV Tracking
      </h2>

      <section>
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Base CV</h3>
        <CVManager positions={allPositions} />
      </section>

      <section className="border-t border-border pt-6">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">CV Log</h3>
        <CVLog companies={companiesWithPositions} />
      </section>
    </div>
  );
};

export default CVsPage;
