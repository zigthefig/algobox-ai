"use client";
import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/Logo";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/aceternity-sidebar";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard,
  Map,
  Code2,
  BarChart3,
  FileText,
  Sparkles,
  PlayCircle,
  LogOut,
  Shield,
  Swords,
  Trophy,
  BookOpen,
  Target,
  Zap,
  GraduationCap,
  Gamepad2,
  LineChart,
  Users,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    title: "Overview",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: <LayoutDashboard className="h-5 w-5 shrink-0" /> },
      { label: "Roadmap", href: "/roadmap", icon: <Map className="h-5 w-5 shrink-0" /> },
    ],
  },
  {
    title: "Learn",
    items: [
      { label: "Patterns", href: "/patterns", icon: <BookOpen className="h-5 w-5 shrink-0" /> },
      { label: "Algorithm Picker", href: "/algorithm-picker", icon: <Target className="h-5 w-5 shrink-0" /> },
      { label: "Cheat Sheets", href: "/cheat-sheets", icon: <Zap className="h-5 w-5 shrink-0" /> },
      { label: "Visualize", href: "/visualise", icon: <PlayCircle className="h-5 w-5 shrink-0" /> },
    ],
  },
  {
    title: "Practice",
    items: [
      { label: "Problems", href: "/practice", icon: <Code2 className="h-5 w-5 shrink-0" /> },
      { label: "Cyber Lab", href: "/cyber-lab", icon: <Shield className="h-5 w-5 shrink-0" /> },
    ],
  },
  {
    title: "Compete",
    items: [
      { label: "Battle Arena", href: "/battle", icon: <Swords className="h-5 w-5 shrink-0" /> },
      { label: "Leaderboard", href: "/leaderboard", icon: <Trophy className="h-5 w-5 shrink-0" /> },
    ],
  },
  {
    title: "Track",
    items: [
      { label: "Analytics", href: "/analytics", icon: <LineChart className="h-5 w-5 shrink-0" /> },
      { label: "Notes", href: "/notes", icon: <FileText className="h-5 w-5 shrink-0" /> },
    ],
  },
  {
    title: "Connect",
    items: [
      { label: "Community", href: "/community", icon: <Users className="h-5 w-5 shrink-0" /> },
    ],
  },
];

export function AppSidebar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const userInitials = user?.email?.slice(0, 2).toUpperCase() || "U";
  const userName = user?.user_metadata?.username || user?.email?.split("@")[0] || "User";

  return (
    <Sidebar open={open} setOpen={setOpen}>
      <SidebarBody className="justify-between gap-6 bg-sidebar border-r border-sidebar-border">
        {/* Scrollable content with custom thin scrollbar */}
        <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-sidebar-accent [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-sidebar-border">
          {open ? <Logo /> : <LogoIcon />}

          <div className="mt-6 flex flex-col gap-4">
            {navSections.map((section, sectionIdx) => (
              <div key={section.title}>
                {/* Section Title - Only show when sidebar is open */}
                {open && (
                  <div className="px-3 mb-2">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/50">
                      {section.title}
                    </span>
                  </div>
                )}

                {/* Section Items */}
                <div className="flex flex-col gap-1">
                  {section.items.map((item, idx) => (
                    <div key={idx} className="relative group">
                      <SidebarLink
                        link={item}
                        className={cn(
                          "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-lg transition-all duration-200",
                          location.pathname === item.href && "bg-sidebar-accent text-sidebar-primary shadow-sm font-medium",
                          location.pathname.startsWith(item.href) && item.href !== "/dashboard" && "bg-sidebar-accent/50 text-sidebar-primary"
                        )}
                      />
                      {/* NEW Badge - Premium Style */}
                      {item.badge && open && (
                        <div className="absolute right-2 top-1/2 -translate-y-1/2">
                          <span className="relative flex h-5 min-w-[34px] items-center justify-center rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-1.5 text-[9px] font-bold text-white shadow-sm ring-1 ring-white/20">
                            {item.badge}
                            <span className="absolute -right-0.5 -top-0.5 flex h-2 w-2">
                              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75"></span>
                              <span className="relative inline-flex h-2 w-2 rounded-full bg-indigo-500"></span>
                            </span>
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Divider between sections (not after last section) */}
                {sectionIdx < navSections.length - 1 && (
                  <div className="mx-3 mt-3 border-b border-sidebar-border/50" />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2 border-t border-sidebar-border pt-4">
          {/* AI Assistant Quick Link */}
          <SidebarLink
            link={{
              label: "AI Assistant",
              href: "/practice",
              icon: <Sparkles className="h-5 w-5 text-primary shrink-0" />,
            }}
            className="hover:bg-primary/10"
          />

          {/* User Profile / Settings */}
          <SidebarLink
            link={{
              label: userName,
              href: "/settings",
              icon: (
                <div className="h-6 w-6 shrink-0 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-[10px] font-bold text-primary-foreground shadow-sm">
                  {userInitials}
                </div>
              ),
            }}
            className="hover:bg-sidebar-accent"
          />

          {/* Logout */}
          <div onClick={handleSignOut} className="cursor-pointer">
            <SidebarLink
              link={{
                label: "Logout",
                href: "#",
                icon: <LogOut className="h-5 w-5 text-destructive shrink-0" />,
              }}
              className="hover:bg-destructive/10"
            />
          </div>
        </div>
      </SidebarBody>
    </Sidebar>
  );
}

export const LogoIcon = () => {
  return (
    <Link
      to="/dashboard"
      className="font-normal flex space-x-2 items-center text-sm py-1 relative z-20"
    >
      <div className="h-7 w-7 bg-gradient-to-br from-primary to-primary/70 rounded-lg flex-shrink-0 flex items-center justify-center shadow-md">
        <span className="text-white font-bold text-sm">A</span>
      </div>
    </Link>
  );
};
