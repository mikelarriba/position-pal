import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UrlInput } from "@/components/UrlInput";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useCreateCompany, useUpdateCompany } from "@/hooks/usePositions";
import type { Company, CompanyFormData } from "@/lib/types";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  company?: Company | null;
}

export function CompanyDialog({ open, onOpenChange, company }: Props) {
  const create = useCreateCompany();
  const update = useUpdateCompany();
  const isEdit = !!company;

  const { register, handleSubmit, reset } = useForm<CompanyFormData>({
    defaultValues: { name: "", website: "", linkedin_url: "", description: "", size: "", industry: "" },
  });

  useEffect(() => {
    if (open) {
      if (company) {
        reset({
          name: company.name,
          website: company.website || "",
          linkedin_url: company.linkedin_url || "",
          description: company.description || "",
          size: company.size || "",
          industry: company.industry || "",
        });
      } else {
        reset({ name: "", website: "", linkedin_url: "", description: "", size: "", industry: "" });
      }
    }
  }, [open, company, reset]);

  const onSubmit = (data: CompanyFormData) => {
    if (isEdit) {
      update.mutate({ id: company!.id, data }, { onSuccess: () => onOpenChange(false) });
    } else {
      create.mutate(data, { onSuccess: () => onOpenChange(false) });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Company" : "Add Company"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Company Name</Label>
              <Input id="name" {...register("name", { required: true })} placeholder="Acme Inc." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <Input id="industry" {...register("industry")} placeholder="Technology" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <UrlInput id="website" {...register("website")} value={watch("website") || ""} placeholder="https://acme.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="linkedin_url">LinkedIn URL</Label>
              <UrlInput id="linkedin_url" {...register("linkedin_url")} value={watch("linkedin_url") || ""} placeholder="https://linkedin.com/company/acme" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="size">Company Size</Label>
              <Input id="size" {...register("size")} placeholder="51-200" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" {...register("description")} rows={3} placeholder="What does this company do..." />
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
