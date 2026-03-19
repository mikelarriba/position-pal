import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CompanySearchInput } from "@/components/CompanySearchInput";
import { STATUS_LABELS, STATUS_ORDER, type Position, type PositionFormData, type Company } from "@/lib/types";
import { useCreatePosition, useUpdatePosition, useCreateCompany } from "@/hooks/usePositions";

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
  const isEdit = !!position;

  const { register, handleSubmit, reset, setValue, watch } = useForm<PositionFormData>({
    defaultValues: {
      company_id: "",
      company: "",
      role: "",
      url: "",
      status: "bookmarked",
      notes: "",
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
        });
      } else {
        reset({
          company_id: preselectedCompanyId || "",
          company: preselectedCompanyName || "",
          role: "",
          url: "",
          status: "bookmarked",
          notes: "",
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

  const onSubmit = (data: PositionFormData) => {
    // Sync company name from selected company
    const selectedCompany = companies.find((c) => c.id === data.company_id);
    if (selectedCompany) data.company = selectedCompany.name;

    if (isEdit) {
      update.mutate({ id: position!.id, data }, { onSuccess: () => onOpenChange(false) });
    } else {
      create.mutate(data, { onSuccess: () => onOpenChange(false) });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Position" : "Add Position"}</DialogTitle>
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
              <Input id="url" {...register("url")} placeholder="https://..." />
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
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" {...register("notes")} rows={4} placeholder="Requirements, contacts, thoughts..." />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={create.isPending || update.isPending}>
              {isEdit ? "Save" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
