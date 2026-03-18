import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchPositions, createPosition, updatePosition, deletePosition, updatePositionStatus,
  fetchCompaniesWithPositions, createCompany, updateCompany, deleteCompany, enrichCompanyData,
} from "@/lib/positions";
import type { PositionFormData, PositionStatus, CompanyFormData } from "@/lib/types";
import { toast } from "sonner";

// ─── Companies ───

export function useCompaniesWithPositions() {
  return useQuery({
    queryKey: ["companies-with-positions"],
    queryFn: fetchCompaniesWithPositions,
  });
}

export function useCreateCompany() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (form: CompanyFormData) => createCompany(form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["companies-with-positions"] });
      qc.invalidateQueries({ queryKey: ["positions"] });
      toast.success("Company created");
    },
    onError: (e) => toast.error(`Failed: ${e.message}`),
  });
}

export function useUpdateCompany() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CompanyFormData> }) => updateCompany(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["companies-with-positions"] });
      toast.success("Company updated");
    },
    onError: (e) => toast.error(`Failed: ${e.message}`),
  });
}

export function useDeleteCompany() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteCompany(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["companies-with-positions"] });
      qc.invalidateQueries({ queryKey: ["positions"] });
      toast.success("Company deleted");
    },
    onError: (e) => toast.error(`Failed: ${e.message}`),
  });
}

export function useEnrichCompany() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, linkedin_url, name }: { id: string; linkedin_url: string; name: string }) =>
      enrichCompanyData(linkedin_url, name).then(async (result) => {
        if (result.success && result.data) {
          await updateCompany(id, result.data);
        }
        return result;
      }),
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: ["companies-with-positions"] });
      if (result.success) toast.success("Company enriched with AI data");
      else toast.error(result.error || "Enrichment failed");
    },
    onError: (e) => toast.error(`Enrichment failed: ${e.message}`),
  });
}

// ─── Positions ───

export function usePositions() {
  return useQuery({
    queryKey: ["positions"],
    queryFn: fetchPositions,
  });
}

export function useCreatePosition() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (form: PositionFormData) => createPosition(form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["positions"] });
      qc.invalidateQueries({ queryKey: ["companies-with-positions"] });
      toast.success("Position created");
    },
    onError: (e) => toast.error(`Failed: ${e.message}`),
  });
}

export function useUpdatePosition() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<PositionFormData> }) => updatePosition(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["positions"] });
      qc.invalidateQueries({ queryKey: ["companies-with-positions"] });
      toast.success("Position updated");
    },
    onError: (e) => toast.error(`Failed: ${e.message}`),
  });
}

export function useDeletePosition() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deletePosition(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["positions"] });
      qc.invalidateQueries({ queryKey: ["companies-with-positions"] });
      toast.success("Position deleted");
    },
    onError: (e) => toast.error(`Failed: ${e.message}`),
  });
}

export function useUpdateStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: PositionStatus }) => updatePositionStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["positions"] });
      qc.invalidateQueries({ queryKey: ["companies-with-positions"] });
      toast.success("Status updated");
    },
    onError: (e) => toast.error(`Failed: ${e.message}`),
  });
}
