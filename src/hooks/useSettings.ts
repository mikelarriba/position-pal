import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchSettings, saveSettings, type AppSettings } from "@/lib/settings";
import { toast } from "sonner";

export function useSettings() {
  return useQuery({
    queryKey: ["app-settings"],
    queryFn: fetchSettings,
  });
}

export function useSaveSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (settings: AppSettings) => saveSettings(settings),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["app-settings"] });
      toast.success("Settings saved");
    },
    onError: (e) => toast.error(`Failed: ${e.message}`),
  });
}
