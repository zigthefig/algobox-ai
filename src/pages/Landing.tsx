import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AnimatedBackground } from "@/components/ui/AnimatedBackground";
import { FloatingElements } from "@/components/ui/FloatingElements";
import {
  ArrowRight,
  Code2,
  Brain,
  Map,
  BarChart3,
  Sparkles,
  Zap,
  Target,
  ChevronRight,
} from "lucide-react";

const features = [
  {
    icon: <Brain className="h-6 w-6" />,
    title: "AI-Personalized Roadmap",
    description: "Dynamic learning paths that adapt to your skill level, goals, and progress in real-time.",
  },
  {
    icon: <Code2 className="h-6 w-6" />,
    title: "In-Browser Code Editor",
    description: "Write, run, and test code in Python, JavaScript, and C++ without leaving the platform.",
  },
  {
    icon: <Sparkles className="h-6 w-6" />,
    title: "AI Debugging Assistant",
    description: "Get instant explanations for your mistakes with actionable suggestions to improve.",
  },
  {
    icon: <Target className="h-6 w-6" />,
    title: "Smart Practice System",
    description: "Problems selected based on your weak areas, past mistakes, and confidence scores.",
  },
  {
    icon: <Map className="h-6 w-6" />,
    title: "Interactive Cheat Sheets",
    description: "Auto-generated notes from your solved problems, linked to concepts in your roadmap.",
  },
  {
    icon: <BarChart3 className="h-6 w-6" />,
    title: "Progress Analytics",
    description: "Skill heatmaps, mistake patterns, and consistency tracking to optimize your learning.",
  },
];

const stats = [
  { value: "50+", label: "Algorithm Patterns" },
  { value: "500+", label: "Curated Problems" },
  { value: "AI", label: "Powered Learning" },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Subtle Animated Background */}
      <AnimatedBackground variant="default" intensity="low" />
      <FloatingElements count={8} />

      {/* Navigation */}
      <nav className="fixed top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <Logo size="md" />
          <div className="flex items-center gap-3">
            <Link to="/dashboard">
              <Button variant="ghost" size="sm">Dashboard</Button>
            </Link>
            <Link to="/dashboard">
              <Button size="sm" className="group">
                Get Started
                <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-28 pb-16">
        <div className="container relative mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="mx-auto max-w-3xl text-center"
          >
            <Badge variant="outline" className="mb-5 text-xs font-medium">
              <Zap className="mr-1.5 h-3 w-3" />
              AI-Powered Learning Platform
            </Badge>
            
            <h1 className="mb-5 text-4xl font-bold leading-tight tracking-tight md:text-6xl">
              Master Algorithms with
              <span className="block text-primary mt-1">
                AI-Guided Precision
              </span>
            </h1>
            
            <p className="mx-auto mb-8 max-w-xl text-base text-muted-foreground md:text-lg">
              Transform into an industry-ready problem solver through 
              adaptive roadmaps, real-time AI debugging, and personalized practice.
            </p>

            <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link to="/dashboard">
                <Button size="lg" className="group">
                  Start Your Journey
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link to="/roadmap">
                <Button variant="outline" size="lg">
                  Explore Roadmaps
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <motion.div 
              className="mt-12 flex items-center justify-center gap-8 md:gap-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-2xl font-semibold text-primary md:text-3xl">
                    {stat.value}
                  </div>
                  <div className="text-xs text-muted-foreground md:text-sm">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 relative">
        <div className="container mx-auto px-4">
          <div className="mb-10 text-center">
            <h2 className="mb-3 text-2xl font-bold md:text-3xl">
              Everything You Need to Level Up
            </h2>
            <p className="mx-auto max-w-xl text-sm text-muted-foreground md:text-base">
              A complete learning ecosystem designed to accelerate your coding journey.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="group relative rounded-lg border border-border bg-card p-5 transition-colors hover:border-primary/40"
              >
                <div className="mb-3 inline-flex rounded-md bg-primary/10 p-2.5 text-primary">
                  {feature.icon}
                </div>
                <h3 className="mb-1.5 font-semibold">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                <ChevronRight className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 relative">
        <div className="container mx-auto px-4">
          <div className="relative overflow-hidden rounded-xl border border-border bg-card p-8 md:p-10 text-center">
            <h2 className="mb-3 text-2xl font-bold md:text-3xl">
              Ready to Transform Your Coding Skills?
            </h2>
            <p className="mx-auto mb-6 max-w-lg text-sm text-muted-foreground md:text-base">
              Join developers who are using Algobox to master algorithms and land their dream jobs.
            </p>
            <Link to="/dashboard">
              <Button size="lg">
                Start Learning Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-6">
        <div className="container mx-auto flex items-center justify-between px-4">
          <Logo size="sm" />
          <p className="text-xs text-muted-foreground">
            © 2024 Algobox. Built for developers, by developers.
          </p>
        </div>
      </footer>
    </div>
  );
}
