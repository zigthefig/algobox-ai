import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-lg">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Logo size="md" />
          <div className="flex items-center gap-4">
            <Link to="/dashboard">
              <Button variant="ghost">Dashboard</Button>
            </Link>
            <Link to="/dashboard">
              <Button>
                Get Started
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-20">
        {/* Background effects */}
        <div className="absolute inset-0 bg-grid opacity-20" />
        <div className="absolute top-1/4 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]" />
        
        <div className="container relative mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-4xl text-center"
          >
            <Badge variant="info" className="mb-6">
              <Zap className="mr-1 h-3 w-3" />
              Now with AI-Powered Learning
            </Badge>
            
            <h1 className="mb-6 text-5xl font-bold leading-tight tracking-tight md:text-7xl">
              Master Algorithms with
              <span className="block text-primary">AI-Guided Precision</span>
            </h1>
            
            <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground md:text-xl">
              Algobox transforms beginners into industry-ready problem solvers through 
              adaptive roadmaps, real-time AI debugging, and personalized practice.
            </p>

            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link to="/dashboard">
                <Button size="xl">
                  Start Your Journey
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/roadmap">
                <Button variant="outline" size="xl">
                  Explore Roadmaps
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="mt-16 flex items-center justify-center gap-12">
              {stats.map((stat) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="text-center"
                >
                  <div className="text-3xl font-bold text-primary">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-16 text-center"
          >
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
              Everything You Need to
              <span className="text-gradient"> Level Up</span>
            </h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              A complete learning ecosystem designed to accelerate your coding journey from beginner to expert.
            </p>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="group relative rounded-xl border border-border bg-card p-6 transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5"
              >
                <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3 text-primary">
                  {feature.icon}
                </div>
                <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
                <ChevronRight className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-background to-background p-12 text-center"
          >
            <div className="absolute inset-0 bg-grid opacity-10" />
            <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-primary/20 blur-[100px]" />
            
            <div className="relative">
              <h2 className="mb-4 text-3xl font-bold md:text-4xl">
                Ready to Transform Your Coding Skills?
              </h2>
              <p className="mx-auto mb-8 max-w-xl text-muted-foreground">
                Join thousands of developers who are using Algobox to master algorithms and land their dream jobs.
              </p>
              <Link to="/dashboard">
                <Button size="xl">
                  Start Learning Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto flex items-center justify-between px-4">
          <Logo size="sm" />
          <p className="text-sm text-muted-foreground">
            © 2024 Algobox. Built for developers, by developers.
          </p>
        </div>
      </footer>
    </div>
  );
}
