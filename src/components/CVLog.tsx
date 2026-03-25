import { useState, useMemo } from "react";
import { FileText, ExternalLink, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import type { CompanyWithPositions } from "@/lib/types";

interface CVRecord {
  id: string;
  position_id: string;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: number | null;
  created_at: string;
}

interface CVWithContext extends CVRecord {
  company_name: string;
  company_id: string;
  role: string;
}

interface Props {
  companies: CompanyWithPositions[];
}

function formatFileSize(bytes: number | null) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function CVLog({ companies }: Props) {
  const [companyFilter, setCompanyFilter] = useState<string>("all");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: allCvs = [] } = useQuery({
    queryKey: ["all-cvs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("position_cvs")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as CVRecord[];
    },
  });

  // Build position → company/role lookup from companies data
  const positionMap = useMemo(() => {
    const map = new Map<string, { company_name: string; company_id: string; role: string }>();
    companies.forEach((c) => {
      c.positions.forEach((p) => {
        map.set(p.id, { company_name: c.name, company_id: c.id, role: p.role });
      });
    });
    return map;
  }, [companies]);

  const cvsWithContext: CVWithContext[] = useMemo(() => {
    return allCvs
      .map((cv) => {
        const ctx = positionMap.get(cv.position_id);
        if (!ctx) return null;
        return { ...cv, ...ctx };
      })
      .filter(Boolean) as CVWithContext[];
  }, [allCvs, positionMap]);

  const uniqueCompanies = useMemo(() => {
    const names = new Set(cvsWithContext.map((c) => c.company_name));
    return Array.from(names).sort();
  }, [cvsWithContext]);

  const uniqueRoles = useMemo(() => {
    const roles = new Set(cvsWithContext.map((c) => c.role));
    return Array.from(roles).sort();
  }, [cvsWithContext]);

  const filtered = useMemo(() => {
    return cvsWithContext.filter((cv) => {
      if (companyFilter !== "all" && cv.company_name !== companyFilter) return false;
      if (roleFilter !== "all" && cv.role !== roleFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          cv.file_name.toLowerCase().includes(q) ||
          cv.company_name.toLowerCase().includes(q) ||
          cv.role.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [cvsWithContext, companyFilter, roleFilter, searchQuery]);

  const getPublicUrl = (path: string) => {
    const { data } = supabase.storage.from("cv").getPublicUrl(path);
    return data.publicUrl;
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search CVs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-8 text-sm"
          />
        </div>
        <Select value={companyFilter} onValueChange={setCompanyFilter}>
          <SelectTrigger className="w-[180px] h-8 text-sm">
            <SelectValue placeholder="All companies" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All companies</SelectItem>
            {uniqueCompanies.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[180px] h-8 text-sm">
            <SelectValue placeholder="All roles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All roles</SelectItem>
            {uniqueRoles.map((r) => (
              <SelectItem key={r} value={r}>{r}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* CV list */}
      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4 text-center">No CVs found.</p>
      ) : (
        <div className="space-y-2">
          {filtered.map((cv) => (
            <div key={cv.id} className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border hover:shadow-sm transition-shadow">
              <FileText className="h-5 w-5 text-primary shrink-0" />
              <div className="flex-1 min-w-0">
                <a
                  href={getPublicUrl(cv.file_path)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-foreground hover:text-primary hover:underline truncate block"
                >
                  {cv.file_name}
                </a>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                  <span className="font-medium text-foreground/70">{cv.company_name}</span>
                  <span>·</span>
                  <span>{cv.role}</span>
                  <span>·</span>
                  <span>{formatFileSize(cv.file_size)}</span>
                  <span>·</span>
                  <span>{formatDistanceToNow(new Date(cv.created_at), { addSuffix: true })}</span>
                </div>
              </div>
              <a
                href={getPublicUrl(cv.file_path)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary shrink-0"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
