import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Loader2 } from "lucide-react";
import { CompanySearchInput } from "@/components/CompanySearchInput";
import { RoleSearchInput } from "@/components/RoleSearchInput";
import { CommunicationThread } from "@/components/CommunicationThread";
import { STATUS_LABELS, STATUS_ORDER, type Position, type PositionFormData, type Company } from "@/lib/types";
import { useCreatePosition, useUpdatePosition, useCreateCompany, useEnrichPosition } from "@/hooks/usePositions";
import { formatDistanceToNow } from "date-fns";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  position?: Position | null;
  companies: Company[];
  preselectedCompanyId?: string | null;
  preselectedCompanyName?: string | null;
}

export function PositionDialog({ open, onOpenChange, position, companies, preselectedCompanyId, preselectedCompanyName }: Props) {
  const create = useCreatePosition();
  const update = useUpdatePosition();
  const createCompany = useCreateCompany();
  const enrich = useEnrichPosition();
  const isEdit = !!position;

  const { register, handleSubmit, reset, setValue, watch } = useForm<PositionFormData>({
    defaultValues: {
      company_id: "",
      company: "",
      role: "",
      url: "",
      status: "bookmarked",
      notes: "",
      description: "",
      salary_min: null,
      salary_max: null,
      salary_currency: "EUR",
    },
  });

  useEffect(() => {
    if (open) {
      if (position) {
        reset({
          company_id: position.company_id,
          company: position.company,
          role: position.role,
          url: position.url || "",
          status: position.status,
          notes: position.notes || "",
          description: position.description || "",
          salary_min: position.salary_min,
          salary_max: position.salary_max,
          salary_currency: position.salary_currency || "EUR",
        });
      } else {
        reset({
          company_id: preselectedCompanyId || "",
          company: preselectedCompanyName || "",
          role: "",
          url: "",
          status: "bookmarked",
          notes: "",
          description: "",
          salary_min: null,
          salary_max: null,
          salary_currency: "EUR",
        });
      }
    }
  }, [open, position, reset, preselectedCompanyId, preselectedCompanyName]);

  const handleCompanySelect = (companyId: string, companyName: string) => {
    setValue("company_id", companyId);
    setValue("company", companyName);
  };

  const handleCreateCompany = (name: string) => {
    createCompany.mutate({ name }, {
      onSuccess: (newCompany) => {
        setValue("company_id", newCompany.id);
        setValue("company", newCompany.name);
      },
    });
  };

  const handleEnrich = () => {
    const url = watch("url");
    const role = watch("role");
    if (!url || !position) return;
    enrich.mutate({ id: position.id, url, role });
  };

  const onSubmit = (data: PositionFormData) => {
    const selectedCompany = companies.find((c) => c.id === data.company_id);
    if (selectedCompany) data.company = selectedCompany.name;

    // Clean salary values
    if (!data.salary_min) data.salary_min = null;
    if (!data.salary_max) data.salary_max = null;

    if (isEdit) {
      update.mutate({ id: position!.id, data }, { onSuccess: () => onOpenChange(false) });
    } else {
      create.mutate(data, { onSuccess: () => onOpenChange(false) });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{isEdit ? "Edit Position" : "Add Position"}</span>
            {isEdit && position && (
              <span className="text-xs font-normal text-muted-foreground">
                Created {formatDistanceToNow(new Date(position.created_at), { addSuffix: true })}
              </span>
            )}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Company</Label>
              <CompanySearchInput
                companies={companies}
                selectedCompanyId={watch("company_id")}
                selectedCompanyName={watch("company")}
                onSelect={handleCompanySelect}
                onCreate={handleCreateCompany}
                isCreating={createCompany.isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Input id="role" {...register("role", { required: true })} placeholder="Senior Engineer" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="url">URL</Label>
              <div className="flex gap-1">
                <Input id="url" {...register("url")} placeholder="https://..." className="flex-1" />
                {isEdit && watch("url") && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="shrink-0"
                    disabled={enrich.isPending}
                    onClick={handleEnrich}
                    title="Enrich from URL with AI"
                  >
                    {enrich.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  </Button>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={watch("status")} onValueChange={(v) => setValue("status", v as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_ORDER.map((s) => (
                    <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" {...register("description")} rows={3} placeholder="Job description, requirements..." />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="salary_min">Salary Min</Label>
              <Input id="salary_min" type="number" {...register("salary_min", { valueAsNumber: true })} placeholder="40000" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="salary_max">Salary Max</Label>
              <Input id="salary_max" type="number" {...register("salary_max", { valueAsNumber: true })} placeholder="60000" />
            </div>
            <div className="space-y-2">
              <Label>Currency</Label>
              <Select value={watch("salary_currency") || "EUR"} onValueChange={(v) => setValue("salary_currency", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                  <SelectItem value="CHF">CHF</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" {...register("notes")} rows={3} placeholder="Requirements, contacts, thoughts..." />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={create.isPending || update.isPending}>
              {isEdit ? "Save" : "Create"}
            </Button>
          </div>
        </form>

        {/* Communications thread - only show for existing positions */}
        {isEdit && position && (
          <div className="border-t border-border pt-4">
            <CommunicationThread positionId={position.id} />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
