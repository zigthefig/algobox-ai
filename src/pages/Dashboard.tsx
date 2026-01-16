import { useMemo } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ArrowRight,
  Code2,
  Target,
  Flame,
  TrendingUp,
  Clock,
  CheckCircle2,
  Play,
  Sparkles,
  Loader2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useProgress } from "@/hooks/useProgress";
import { PROBLEMS, getCategories } from "@/lib/problems/problemLibrary";
import { formatDistanceToNow } from "date-fns";

export default function Dashboard() {
  const { progress, loading, getSolvedCount } = useProgress();

  // 1. Stats Calculation
  const totalProblems = PROBLEMS.length;
  const completedProblems = getSolvedCount();

  // Calculate Streak (Simplified: count unique days with solved problems)
  const streak = useMemo(() => {
    const solvedDates = Object.values(progress)
      .filter(p => p.status === "solved" && p.solved_at)
      .map(p => p.solved_at!.split('T')[0]); // YYYY-MM-DD
    const uniqueDays = new Set(solvedDates);
    return uniqueDays.size;
  }, [progress]);

  // Skill Level based on solved count
  const skillLevel = useMemo(() => {
    if (completedProblems < 5) return "Beginner";
    if (completedProblems < 20) return "Intermediate";
    return "Advanced";
  }, [completedProblems]);

  // 2. Recent Activity
  const recentProblems = useMemo(() => {
    // Get all started/solved problems
    const active = Object.values(progress).filter(p => p.status !== "not_started");
    // Sort by solved_at (newest first) - fallback to nothing if no date (though attempted usually implies interaction)
    // Since we don't strictly track "last attempted" date for "attempted" status in this simple hook version,
    // we'll prioritize solved ones or just list them. 
    // Ideally we'd add 'last_updated' to the hook, but for now let's show solved/attempted.
    return active
      .sort((a, b) => {
        const dateA = a.solved_at ? new Date(a.solved_at).getTime() : 0;
        const dateB = b.solved_at ? new Date(b.solved_at).getTime() : 0;
        return dateB - dateA;
      })
      .slice(0, 3)
      .map(p => {
        const problem = PROBLEMS.find(prob => prob.id === p.problem_id);
        if (!problem) return null;
        return {
          id: problem.id,
          title: problem.title,
          difficulty: problem.difficulty,
          status: p.status === "solved" ? "completed" : "in-progress",
          time: p.solved_at ? formatDistanceToNow(new Date(p.solved_at), { addSuffix: true }) : "Recently",
        };
      })
      .filter(Boolean); // Remove nulls
  }, [progress]);

  // 3. Recommended Topics / Category Progress
  const categoryStats = useMemo(() => {
    const categories = getCategories();
    return categories.map(cat => {
      const catProblems = PROBLEMS.filter(p => p.category === cat);
      const solvedInCat = catProblems.filter(p => progress[p.id]?.status === "solved").length;
      const percent = catProblems.length > 0 ? Math.round((solvedInCat / catProblems.length) * 100) : 0;
      return {
        id: cat,
        name: cat,
        progress: percent,
        problems: catProblems.length,
        solved: solvedInCat
      };
    })
      .sort((a, b) => b.progress - a.progress) // Show most progressed first? Or least? Let's show most active.
      .slice(0, 3);
  }, [progress]);


  if (loading) {
    return <div className="flex items-center justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-2xl font-bold">Welcome back! 👋</h1>
        <p className="text-sm text-muted-foreground">Continue your learning journey</p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
      >
        <StatCard
          icon={<Target className="h-4 w-4" />}
          label="Problems Solved"
          value={completedProblems.toString()}
          subtext={`of ${totalProblems} total`}
          color="primary"
        />
        <StatCard
          icon={<Flame className="h-4 w-4" />}
          label="Total Activity"
          value={`${streak} days`}
          subtext="Keep grinding!"
          color="warning"
        />
        <StatCard
          icon={<Clock className="h-4 w-4" />}
          label="Est. Hours"
          value={(completedProblems * 0.5).toFixed(1)}
          subtext="Based on solved count"
          color="success"
        />
        <StatCard
          icon={<TrendingUp className="h-4 w-4" />}
          label="Skill Level"
          value={skillLevel}
          subtext="Keep it up!"
          color="accent"
        />
      </motion.div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-4 lg:col-span-2">
          {/* Continue Learning */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-lg border border-border bg-card p-5"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold">Recent Activity</h2>
              <Link to="/practice">
                <Button variant="ghost" size="sm" className="text-xs">
                  View All <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              </Link>
            </div>

            <div className="space-y-2">
              {recentProblems.length > 0 ? recentProblems.map((problem: any) => (
                <div
                  key={problem.id}
                  className="flex items-center justify-between rounded-md border border-border bg-background p-3 transition-colors hover:border-primary/40"
                >
                  <div className="flex items-center gap-3">
                    <div className={`rounded-md p-1.5 ${problem.status === "completed"
                        ? "bg-success/10 text-success"
                        : "bg-warning/10 text-warning"
                      }`}>
                      {problem.status === "completed" ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-sm font-medium">{problem.title}</h3>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant={problem.difficulty as "beginner" | "intermediate" | "advanced"} className="text-[10px] px-1.5 py-0">
                          {problem.difficulty}
                        </Badge>
                        <span>•</span>
                        <span>{problem.time}</span>
                      </div>
                    </div>
                  </div>
                  <Link to={`/practice?id=${problem.id}`}>
                    <Button variant="ghost" size="sm" className="text-xs">
                      {problem.status === "completed" ? "Review" : "Continue"}
                    </Button>
                  </Link>
                </div>
              )) : (
                <div className="text-center py-6 text-muted-foreground">
                  <p className="text-sm">No recent activity.</p>
                  <Link to="/practice">
                    <Button variant="link" size="sm" className="mt-1 text-xs">Start your first problem!</Button>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>

          {/* Recommended Topics */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-lg border border-border bg-card p-5"
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <h2 className="font-semibold">Topic Progress</h2>
              </div>
              <Link to="/roadmap">
                <Button variant="ghost" size="sm" className="text-xs">
                  Full Roadmap <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              </Link>
            </div>

            <div className="space-y-3">
              {categoryStats.map((topic) => (
                <div key={topic.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{topic.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {topic.solved} / {topic.problems}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={topic.progress} className="flex-1 h-1.5" />
                    <span className="text-xs font-medium text-primary w-8">{topic.progress}%</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Quick Practice */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-lg border border-border bg-card p-5"
          >
            <Code2 className="mb-3 h-8 w-8 text-primary" />
            <h3 className="mb-1.5 font-semibold">Quick Practice</h3>
            <p className="mb-4 text-xs text-muted-foreground">
              AI will select the best problem for you based on your progress.
            </p>
            <Link to="/practice">
              <Button size="sm" className="w-full">
                Start Now
                <ArrowRight className="ml-2 h-3 w-3" />
              </Button>
            </Link>
          </motion.div>

          {/* Milestones */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="rounded-lg border border-border bg-card p-5"
          >
            <h3 className="mb-3 font-semibold">Next Milestone</h3>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Solve 10 Problems</span>
                </div>
                <Progress value={Math.min((completedProblems / 10) * 100, 100)} className="h-1.5" />
                <p className="text-[10px] text-muted-foreground">
                  Problem Solver Badge
                </p>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Solve 50 Problems</span>
                </div>
                <Progress value={Math.min((completedProblems / 50) * 100, 100)} className="h-1.5" />
                <p className="text-[10px] text-muted-foreground">
                  Master Coder Badge
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtext: string;
  color: "primary" | "success" | "warning" | "accent";
}

function StatCard({ icon, label, value, subtext, color }: StatCardProps) {
  const colorClasses = {
    primary: "bg-primary/10 text-primary",
    success: "bg-success/10 text-success",
    warning: "bg-warning/10 text-warning",
    accent: "bg-accent/10 text-accent",
  };

  return (
    <div className="rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/30">
      <div className={`mb-2 inline-flex rounded-md p-1.5 ${colorClasses[color]}`}>
        {icon}
      </div>
      <div className="text-xl font-bold">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-0.5 text-[10px] text-muted-foreground">{subtext}</div>
    </div>
  );
}
