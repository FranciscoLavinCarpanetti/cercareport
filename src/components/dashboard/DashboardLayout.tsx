import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import { WorkforceProvider } from "@/contexts/WorkforceContext";
import { Outlet } from "react-router-dom";
import { Menu } from "lucide-react";

export default function DashboardLayout() {
  return (
    <WorkforceProvider>
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AppSidebar />
          <div className="flex-1 flex flex-col min-w-0">
            <header className="h-11 flex items-center border-b border-border bg-navy-deep px-3 lg:hidden">
              <SidebarTrigger>
                <Menu className="w-4 h-4 text-muted-foreground" />
              </SidebarTrigger>
            </header>
            <main className="flex-1 overflow-auto">
              <Outlet />
            </main>
          </div>
        </div>
      </SidebarProvider>
    </WorkforceProvider>
  );
}
