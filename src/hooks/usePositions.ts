import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchPositions, createPosition, updatePosition, deletePosition, updatePositionStatus } from "@/lib/positions";
import type { PositionFormData, PositionStatus } from "@/lib/types";
import { toast } from "sonner";

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
      toast.success("Status updated");
    },
    onError: (e) => toast.error(`Failed: ${e.message}`),
  });
}
