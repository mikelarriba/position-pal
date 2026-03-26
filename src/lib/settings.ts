import { supabase } from "@/integrations/supabase/client";

export interface AppSettings {
  folder_path: string;
  github_repo: string;
}

export async function fetchSettings(): Promise<AppSettings> {
  const { data, error } = await supabase
    .from("app_settings")
    .select("key, value");
  if (error) throw error;

  const map = Object.fromEntries((data ?? []).map((r: any) => [r.key, r.value]));
  return {
    folder_path: map.folder_path || "",
    github_repo: map.github_repo || "",
  };
}

export async function saveSetting(key: string, value: string): Promise<void> {
  const { error } = await supabase
    .from("app_settings")
    .upsert({ key, value }, { onConflict: "key" });
  if (error) throw error;
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  await Promise.all([
    saveSetting("folder_path", settings.folder_path),
    saveSetting("github_repo", settings.github_repo),
  ]);
}
