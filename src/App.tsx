import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Roadmap from "./pages/Roadmap";
import Analytics from "./pages/Analytics";
import Practice from "./pages/Practice";
import Notes from "./pages/Notes";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import Visualise from "./pages/Visualise";
import CyberLab from "./pages/CyberLab";
import BattleMode from "./pages/BattleMode";
import { DashboardLayout } from "./components/DashboardLayout";
import { AnalyticsListener } from "./components/AnalyticsListener";
import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register GSAP plugins globally
gsap.registerPlugin(ScrollTrigger);

// Configure GSAP defaults
gsap.config({
  nullTargetWarn: false,
});

// Set default easing
gsap.defaults({
  ease: "power3.out",
  duration: 0.5,
});

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AnalyticsListener />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/roadmap" element={<Roadmap />} />
              <Route path="/practice" element={<Practice />} />
              <Route path="/visualise" element={<Visualise />} />
              <Route path="/cyber-lab" element={<CyberLab />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/notes" element={<Notes />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/battle" element={<BattleMode />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

