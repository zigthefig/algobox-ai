import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle2,
  Circle,
  Lock,
  Play,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Info,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

interface RoadmapNode {
  id: string;
  title: string;
  description: string;
  status: "completed" | "in-progress" | "locked";
  progress: number;
  difficulty: "beginner" | "intermediate" | "advanced";
  estimatedTime: string;
  skills: string[];
  type?: "visual-algorithm";
  algorithmId?: string;
  children?: RoadmapNode[];
}

const roadmapData: RoadmapNode[] = [
  {
    id: "fundamentals",
    title: "Programming Fundamentals",
    description: "Core concepts every developer needs",
    status: "completed",
    progress: 100,
    difficulty: "beginner",
    estimatedTime: "2 weeks",
    skills: ["Variables", "Loops", "Functions", "Conditionals"],
    children: [
      {
        id: "variables",
        title: "Variables & Data Types",
        description: "Understanding how to store and manipulate data",
        status: "completed",
        progress: 100,
        difficulty: "beginner",
        estimatedTime: "2 days",
        skills: ["Primitives", "Objects", "Type Coercion"],
      },
      {
        id: "control-flow",
        title: "Control Flow",
        description: "Conditionals, loops, and program flow",
        status: "completed",
        progress: 100,
        difficulty: "beginner",
        estimatedTime: "3 days",
        skills: ["If/Else", "Switch", "For/While Loops"],
      },
      {
        id: "functions",
        title: "Functions & Scope",
        description: "Writing reusable code blocks",
        status: "completed",
        progress: 100,
        difficulty: "beginner",
        estimatedTime: "4 days",
        skills: ["Parameters", "Return Values", "Closures"],
      },
    ],
  },
  {
    id: "data-structures",
    title: "Data Structures",
    description: "Essential data organization patterns",
    status: "in-progress",
    progress: 65,
    difficulty: "intermediate",
    estimatedTime: "4 weeks",
    skills: ["Arrays", "Linked Lists", "Trees", "Hash Tables"],
    children: [
      {
        id: "arrays",
        title: "Arrays & Strings",
        description: "Sequential data storage and manipulation",
        status: "completed",
        progress: 100,
        difficulty: "beginner",
        estimatedTime: "1 week",
        skills: ["Two Pointers", "Sliding Window", "Prefix Sum"],
      },
      {
        id: "linked-lists",
        title: "Linked Lists",
        description: "Dynamic sequential data structures",
        status: "in-progress",
        progress: 60,
        difficulty: "intermediate",
        estimatedTime: "5 days",
        skills: ["Singly Linked", "Doubly Linked", "Fast/Slow Pointers"],
      },
      {
        id: "trees",
        title: "Trees & Graphs",
        description: "Hierarchical and network data structures",
        status: "locked",
        progress: 0,
        difficulty: "intermediate",
        estimatedTime: "2 weeks",
        skills: ["Binary Trees", "BST", "Graph Traversal"],
      },
      {
        id: "hash",
        title: "Hash Tables",
        description: "Key-value storage for fast lookups",
        status: "locked",
        progress: 0,
        difficulty: "intermediate",
        estimatedTime: "4 days",
        skills: ["Hashing", "Collision Resolution", "Sets/Maps"],
      },
    ],
  },
  {
    id: "algorithms",
    title: "Algorithm Patterns",
    description: "Problem-solving techniques and patterns",
    status: "locked",
    progress: 0,
    difficulty: "advanced",
    estimatedTime: "6 weeks",
    skills: ["Sorting", "Searching", "Dynamic Programming", "Greedy"],
    children: [
      {
        id: "sorting",
        title: "Sorting Algorithms",
        description: "Organize data efficiently",
        status: "locked",
        progress: 0,
        difficulty: "intermediate",
        estimatedTime: "1 week",
        skills: ["QuickSort", "MergeSort", "HeapSort"],
        children: [
          {
            id: "quick-sort",
            title: "Quick Sort",
            description: "Fast divide-and-conquer sorting",
            status: "locked",
            progress: 0,
            difficulty: "intermediate",
            estimatedTime: "2 days",
            skills: ["Partitioning", "Recursion"],
            type: "visual-algorithm",
            algorithmId: "quick-sort",
          },
        ],
      },
      {
        id: "binary-search",
        title: "Binary Search",
        description: "Divide and conquer for sorted data",
        status: "locked",
        progress: 0,
        difficulty: "intermediate",
        estimatedTime: "5 days",
        skills: ["Search Space", "Bounds", "Rotated Arrays"],
      },
      {
        id: "dp",
        title: "Dynamic Programming",
        description: "Optimal substructure solutions",
        status: "locked",
        progress: 0,
        difficulty: "advanced",
        estimatedTime: "3 weeks",
        skills: ["Memoization", "Tabulation", "State Design"],
      },
    ],
  },
];

export default function Roadmap() {
  const [expandedNodes, setExpandedNodes] = useState<string[]>(["fundamentals", "data-structures"]);

  const toggleNode = (nodeId: string) => {
    setExpandedNodes((prev) =>
      prev.includes(nodeId) ? prev.filter((id) => id !== nodeId) : [...prev, nodeId]
    );
  };

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-2xl font-bold lg:text-3xl">Your Learning Roadmap</h1>
          <Badge variant="info">
            <Sparkles className="mr-1 h-3 w-3" />
            AI Personalized
          </Badge>
        </div>
        <p className="text-muted-foreground">
          A tailored path to mastery based on your goals and skill level
        </p>
      </motion.div>

      {/* Progress Overview */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8 rounded-xl border border-border bg-card p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Overall Progress</h2>
          <span className="text-sm text-muted-foreground">3 of 10 modules completed</span>
        </div>
        <Progress value={35} className="h-3" />
        <div className="mt-4 grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-success">3</div>
            <div className="text-sm text-muted-foreground">Completed</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-warning">2</div>
            <div className="text-sm text-muted-foreground">In Progress</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-muted-foreground">5</div>
            <div className="text-sm text-muted-foreground">Locked</div>
          </div>
        </div>
      </motion.div>

      {/* Roadmap Tree */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-4"
      >
        {roadmapData.map((node, index) => (
          <RoadmapNodeCard
            key={node.id}
            node={node}
            isExpanded={expandedNodes.includes(node.id)}
            onToggle={() => toggleNode(node.id)}
            delay={index * 0.1}
          />
        ))}
      </motion.div>
    </div>
  );
}

interface RoadmapNodeCardProps {
  node: RoadmapNode;
  isExpanded: boolean;
  onToggle: () => void;
  delay?: number;
  isChild?: boolean;
}

function RoadmapNodeCard({ node, isExpanded, onToggle, delay = 0, isChild = false }: RoadmapNodeCardProps) {
  const statusIcon = {
    completed: <CheckCircle2 className="h-5 w-5 text-success" />,
    "in-progress": <Play className="h-5 w-5 text-warning" />,
    locked: <Lock className="h-5 w-5 text-muted-foreground" />,
  };

  const statusColors = {
    completed: "border-success/30 bg-success/5",
    "in-progress": "border-warning/30 bg-warning/5",
    locked: "border-border bg-muted/20",
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: isChild ? 20 : 0, y: isChild ? 0 : 10 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ delay }}
      className={cn(
        "rounded-xl border transition-all duration-300",
        statusColors[node.status],
        isChild ? "ml-6 mt-3" : ""
      )}
    >
      <div
        className={cn(
          "flex items-center justify-between p-4 cursor-pointer",
          node.children && "hover:bg-accent/5"
        )}
        onClick={node.children ? onToggle : undefined}
      >
        <div className="flex items-center gap-4">
          {/* Status Icon */}
          <div className="flex-shrink-0">
            {statusIcon[node.status]}
          </div>

          {/* Content */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className={cn(
                "font-semibold",
                node.status === "locked" && "text-muted-foreground"
              )}>
                {node.title}
              </h3>
              <Badge variant={node.difficulty}>{node.difficulty}</Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-2">{node.description}</p>
            
            {/* Progress */}
            {node.status !== "locked" && (
              <div className="flex items-center gap-3">
                <Progress value={node.progress} className="w-32 h-1.5" />
                <span className="text-xs text-muted-foreground">{node.progress}%</span>
              </div>
            )}
            
            {/* Skills */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {node.skills.slice(0, 4).map((skill) => (
                <span
                  key={skill}
                  className={cn(
                    "text-xs px-2 py-0.5 rounded-full",
                    node.status === "locked"
                      ? "bg-muted text-muted-foreground"
                      : "bg-primary/10 text-primary"
                  )}
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <div className="text-xs text-muted-foreground">{node.estimatedTime}</div>
          </div>
          
          {node.status !== "locked" && !node.children && (
            <Link to={node.type === "visual-algorithm" ? `/visualise/${node.algorithmId}` : "/practice"}>
              <Button variant="outline" size="sm">
                {node.status === "completed" ? "Review" : "Continue"}
              </Button>
            </Link>
          )}
          
          {node.children && (
            <div className="text-muted-foreground">
              {isExpanded ? (
                <ChevronDown className="h-5 w-5" />
              ) : (
                <ChevronRight className="h-5 w-5" />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Children */}
      {node.children && isExpanded && (
        <div className="pb-4 pr-4">
          {node.children.map((child, index) => (
            <RoadmapNodeCard
              key={child.id}
              node={child}
              isExpanded={false}
              onToggle={() => {}}
              delay={index * 0.05}
              isChild
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}
