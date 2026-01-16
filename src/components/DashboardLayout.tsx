import { Outlet } from "react-router-dom";
import { AppSidebar } from "@/components/AppSidebar";
import { PageTransition } from "@/components/ui/PageTransition";

export function DashboardLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Subtle dot pattern background */}
      <div className="fixed inset-0 bg-dots opacity-[0.015] pointer-events-none" />
      
      <AppSidebar />
      <main className="flex-1 overflow-auto relative">
        <PageTransition>
          <Outlet />
        </PageTransition>
      </main>
    </div>
  );
}
