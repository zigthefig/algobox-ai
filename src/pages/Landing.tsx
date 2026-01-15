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
      {/* Animated Background System */}
      <AnimatedBackground variant="default" showLottie={true} />
      <FloatingElements />

      {/* Navigation */}
      <nav className="fixed top-0 z-50 w-full border-b border-border/50 bg-background/60 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Logo size="md" />
          <div className="flex items-center gap-4">
            <Link to="/dashboard">
              <Button variant="ghost" className="backdrop-blur-sm">Dashboard</Button>
            </Link>
            <Link to="/dashboard">
              <Button className="group relative overflow-hidden">
                <span className="relative z-10 flex items-center">
                  Get Started
                  <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/80 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20">
        <div className="container relative mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="mx-auto max-w-4xl text-center"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <Badge variant="info" className="mb-6 backdrop-blur-sm border-primary/30">
                <Zap className="mr-1 h-3 w-3" />
                Now with AI-Powered Learning
              </Badge>
            </motion.div>
            
            <motion.h1 
              className="mb-6 text-5xl font-bold leading-tight tracking-tight md:text-7xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              Master Algorithms with
              <motion.span 
                className="block text-primary"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
              >
                AI-Guided Precision
              </motion.span>
            </motion.h1>
            
            <motion.p 
              className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground md:text-xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              Algobox transforms beginners into industry-ready problem solvers through 
              adaptive roadmaps, real-time AI debugging, and personalized practice.
            </motion.p>

            <motion.div 
              className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.5 }}
            >
              <Link to="/dashboard">
                <Button size="xl" className="group relative overflow-hidden shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-shadow">
                  <span className="relative z-10 flex items-center">
                    Start Your Journey
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </span>
                </Button>
              </Link>
              <Link to="/roadmap">
                <Button variant="outline" size="xl" className="backdrop-blur-sm border-primary/30 hover:bg-primary/10">
                  Explore Roadmaps
                </Button>
              </Link>
            </motion.div>

            {/* Stats */}
            <div className="mt-16 flex items-center justify-center gap-12">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
                  className="text-center group"
                >
                  <motion.div 
                    className="text-3xl font-bold text-primary"
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    {stat.value}
                  </motion.div>
                  <div className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 relative">
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
              <span className="text-gradient bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent"> Level Up</span>
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
                whileHover={{ y: -5, scale: 1.02 }}
                className="group relative rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10"
              >
                <motion.div 
                  className="mb-4 inline-flex rounded-lg bg-primary/10 p-3 text-primary"
                  whileHover={{ rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 0.5 }}
                >
                  {feature.icon}
                </motion.div>
                <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
                <ChevronRight className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-background/80 to-background/80 backdrop-blur-lg p-12 text-center"
          >
            <div className="absolute inset-0 bg-grid opacity-10" />
            <motion.div 
              className="absolute top-0 right-0 h-64 w-64 rounded-full bg-primary/20 blur-[100px]"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.2, 0.4, 0.2],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <motion.div 
              className="absolute bottom-0 left-0 h-48 w-48 rounded-full bg-secondary/30 blur-[80px]"
              animate={{
                scale: [1.2, 1, 1.2],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1,
              }}
            />
            
            <div className="relative">
              <motion.h2 
                className="mb-4 text-3xl font-bold md:text-4xl"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                Ready to Transform Your Coding Skills?
              </motion.h2>
              <p className="mx-auto mb-8 max-w-xl text-muted-foreground">
                Join thousands of developers who are using Algobox to master algorithms and land their dream jobs.
              </p>
              <Link to="/dashboard">
                <Button size="xl" className="shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-shadow">
                  Start Learning Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8 backdrop-blur-sm bg-background/50">
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
