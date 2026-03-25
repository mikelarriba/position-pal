import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { DarkModeToggle } from "@/components/DarkModeToggle";
import { Briefcase, Menu } from "lucide-react";

export function AppLayout() {
  return (
    <SidebarProvider defaultOpen={false}>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="border-b border-border bg-card">
            <div className="flex items-center gap-3 px-4 py-3">
              <SidebarTrigger className="shrink-0">
                <Menu className="h-5 w-5" />
              </SidebarTrigger>
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                  <Briefcase className="h-4 w-4 text-primary-foreground" />
                </div>
                <h1 className="text-lg font-bold text-foreground">Job Tracker</h1>
              </div>
              <div className="ml-auto">
                <DarkModeToggle />
              </div>
            </div>
          </header>
          <main className="flex-1">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
