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
} from "lucide-react";
import { Link } from "react-router-dom";

// Mock data - would come from API
const currentProgress = {
  completedProblems: 47,
  totalProblems: 150,
  currentStreak: 12,
  longestStreak: 23,
  hoursThisWeek: 8.5,
  skillLevel: "Intermediate",
};

const recentProblems = [
  { id: 1, title: "Two Sum", difficulty: "beginner", status: "completed", time: "5 min ago" },
  { id: 2, title: "Valid Parentheses", difficulty: "beginner", status: "completed", time: "1 hour ago" },
  { id: 3, title: "Merge Two Sorted Lists", difficulty: "intermediate", status: "in-progress", time: "2 hours ago" },
];

const recommendedTopics = [
  { id: 1, name: "Dynamic Programming", progress: 35, problems: 12 },
  { id: 2, name: "Binary Search", progress: 60, problems: 8 },
  { id: 3, name: "Graph Traversal", progress: 15, problems: 15 },
];

const upcomingMilestones = [
  { id: 1, title: "Complete Arrays Module", progress: 85, reward: "Array Master Badge" },
  { id: 2, title: "30-Day Streak", progress: 40, reward: "Consistency Champion" },
];

export default function Dashboard() {
  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl font-bold lg:text-3xl">Welcome back! 👋</h1>
        <p className="text-muted-foreground">Continue your learning journey</p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <StatCard
          icon={<Target className="h-5 w-5" />}
          label="Problems Solved"
          value={currentProgress.completedProblems.toString()}
          subtext={`of ${currentProgress.totalProblems} total`}
          color="primary"
        />
        <StatCard
          icon={<Flame className="h-5 w-5" />}
          label="Current Streak"
          value={`${currentProgress.currentStreak} days`}
          subtext={`Best: ${currentProgress.longestStreak} days`}
          color="warning"
        />
        <StatCard
          icon={<Clock className="h-5 w-5" />}
          label="Hours This Week"
          value={currentProgress.hoursThisWeek.toString()}
          subtext="+2.5 from last week"
          color="success"
        />
        <StatCard
          icon={<TrendingUp className="h-5 w-5" />}
          label="Skill Level"
          value={currentProgress.skillLevel}
          subtext="Keep it up!"
          color="accent"
        />
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Continue Learning */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-xl border border-border bg-card p-6"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Continue Learning</h2>
              <Link to="/practice">
                <Button variant="ghost" size="sm">
                  View All <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>
            
            <div className="space-y-3">
              {recentProblems.map((problem) => (
                <div
                  key={problem.id}
                  className="flex items-center justify-between rounded-lg border border-border bg-background p-4 transition-colors hover:border-primary/50"
                >
                  <div className="flex items-center gap-4">
                    <div className={`rounded-lg p-2 ${
                      problem.status === "completed" 
                        ? "bg-success/10 text-success" 
                        : "bg-warning/10 text-warning"
                    }`}>
                      {problem.status === "completed" ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : (
                        <Play className="h-5 w-5" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium">{problem.title}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Badge variant={problem.difficulty as "beginner" | "intermediate" | "advanced"}>
                          {problem.difficulty}
                        </Badge>
                        <span>•</span>
                        <span>{problem.time}</span>
                      </div>
                    </div>
                  </div>
                  <Link to="/practice">
                    <Button variant="outline" size="sm">
                      {problem.status === "completed" ? "Review" : "Continue"}
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Recommended Topics */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-xl border border-border bg-card p-6"
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold">AI Recommended</h2>
              </div>
              <Link to="/roadmap">
                <Button variant="ghost" size="sm">
                  Full Roadmap <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div className="space-y-4">
              {recommendedTopics.map((topic) => (
                <div key={topic.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{topic.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {topic.problems} problems
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Progress value={topic.progress} className="flex-1" />
                    <span className="text-sm font-medium text-primary">{topic.progress}%</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Practice */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="relative overflow-hidden rounded-xl border border-primary/20 bg-gradient-to-br from-primary/10 to-background p-6"
          >
            <div className="absolute top-0 right-0 h-24 w-24 rounded-full bg-primary/20 blur-[40px]" />
            <div className="relative">
              <Code2 className="mb-4 h-10 w-10 text-primary" />
              <h3 className="mb-2 text-lg font-semibold">Quick Practice</h3>
              <p className="mb-4 text-sm text-muted-foreground">
                AI will select the best problem for you based on your progress.
              </p>
              <Link to="/practice">
                <Button className="w-full">
                  Start Now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Milestones */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="rounded-xl border border-border bg-card p-6"
          >
            <h3 className="mb-4 text-lg font-semibold">Upcoming Milestones</h3>
            <div className="space-y-4">
              {upcomingMilestones.map((milestone) => (
                <div key={milestone.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{milestone.title}</span>
                  </div>
                  <Progress value={milestone.progress} />
                  <p className="text-xs text-muted-foreground">
                    Reward: {milestone.reward}
                  </p>
                </div>
              ))}
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
    <div className="rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/30">
      <div className={`mb-3 inline-flex rounded-lg p-2 ${colorClasses[color]}`}>
        {icon}
      </div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="mt-1 text-xs text-muted-foreground">{subtext}</div>
    </div>
  );
}
