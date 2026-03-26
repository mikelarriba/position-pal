import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Settings, FolderOpen, Github, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useSettings, useSaveSettings } from "@/hooks/useSettings";
import type { AppSettings } from "@/lib/settings";

const SettingsPage = () => {
  const { data: settings, isLoading } = useSettings();
  const save = useSaveSettings();

  const { register, handleSubmit, reset } = useForm<AppSettings>({
    defaultValues: { folder_path: "", github_repo: "" },
  });

  useEffect(() => {
    if (settings) reset(settings);
  }, [settings, reset]);

  const onSubmit = (data: AppSettings) => {
    save.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="container max-w-2xl mx-auto px-4 py-6">
        <div className="text-center py-12 text-muted-foreground">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center gap-2">
        <Settings className="h-5 w-5 text-muted-foreground" />
        <h1 className="text-xl font-semibold text-foreground">Settings</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">File Export Configuration</CardTitle>
            <CardDescription>
              Configure where position markdown files are generated. A file named <code className="text-xs bg-muted px-1 py-0.5 rounded">posXXXX.md</code> will be created for each position.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="folder_path" className="flex items-center gap-2">
                <FolderOpen className="h-4 w-4" /> Folder Path
              </Label>
              <Input
                id="folder_path"
                {...register("folder_path")}
                placeholder="/home/user/job-search/positions"
              />
              <p className="text-xs text-muted-foreground">
                Local folder path where position markdown files will be stored.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="github_repo" className="flex items-center gap-2">
                <Github className="h-4 w-4" /> GitHub Repository
              </Label>
              <Input
                id="github_repo"
                {...register("github_repo")}
                placeholder="username/job-tracker"
              />
              <p className="text-xs text-muted-foreground">
                GitHub repository to sync position files (e.g. <code className="bg-muted px-1 py-0.5 rounded">username/repo</code>).
              </p>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={save.isPending}>
                <Save className="h-4 w-4 mr-1" />
                {save.isPending ? "Saving..." : "Save Settings"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};

export default SettingsPage;
