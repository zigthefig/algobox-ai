"use client";
import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { animate } from "animejs";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/Logo";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/aceternity-sidebar";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard,
  Map,
  Code2,
  BarChart3,
  FileText,
  Settings,
  Sparkles,
  PlayCircle,
  LogOut,
  User,
  Shield,
  Menu,
  Swords,
} from "lucide-react";
import { motion } from "framer-motion";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: <LayoutDashboard className="h-5 w-5 shrink-0" /> },
  { label: "Roadmap", href: "/roadmap", icon: <Map className="h-5 w-5 shrink-0" /> },
  { label: "Practice", href: "/practice", icon: <Code2 className="h-5 w-5 shrink-0" /> },
  { label: "Battle Arena", href: "/battle", icon: <Swords className="h-5 w-5 shrink-0" /> },
  { label: "Visualize", href: "/visualise", icon: <PlayCircle className="h-5 w-5 shrink-0" /> },
  { label: "Cyber Lab", href: "/cyber-lab", icon: <Shield className="h-5 w-5 shrink-0" /> },
  { label: "Analytics", href: "/analytics", icon: <BarChart3 className="h-5 w-5 shrink-0" /> },
  { label: "Notes", href: "/notes", icon: <FileText className="h-5 w-5 shrink-0" /> },
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
      <SidebarBody className="justify-between gap-10 bg-sidebar border-r border-sidebar-border">
        <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
          {open ? <Logo /> : <LogoIcon />}
          <div className="mt-8 flex flex-col gap-2">
            {navItems.map((item, idx) => (
              <SidebarLink
                key={idx}
                link={item}
                className={cn(
                  "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-lg transition-colors",
                  location.pathname === item.href && "bg-sidebar-accent text-sidebar-primary shadow-sm"
                )}
              />
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2 border-t border-sidebar-border pt-4">
          {/* AI Assistant Quick Link (only when open to save space, or use icon) */}
          <SidebarLink
            link={{
              label: "Ask AI Assistant",
              href: "/practice",
              icon: <Sparkles className="h-5 w-5 text-primary shrink-0" />,
            }}
          />

          {/* User Profile / Settings */}
          <SidebarLink
            link={{
              label: userName,
              href: "/settings",
              icon: (
                <div className="h-6 w-6 shrink-0 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">
                  {userInitials}
                </div>
              ),
            }}
          />

          {/* Logout */}
          <div onClick={handleSignOut} className="cursor-pointer">
            <SidebarLink
              link={{
                label: "Logout",
                href: "#", // Dummy href, onClick handles it
                icon: <LogOut className="h-5 w-5 text-red-500 shrink-0" />,
              }}
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
      className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
    >
      <div className="h-6 w-6 bg-primary rounded-lg flex-shrink-0 flex items-center justify-center">
        <span className="text-white font-bold text-xs">A</span>
      </div>
    </Link>
  );
};

