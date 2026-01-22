import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Search,
    Clock,
    Zap,
    FileText,
    ArrowRight,
    ChevronRight,
    BookOpen,
    Play,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CheatSheetItem {
    keyword: string;
    algorithms: {
        name: string;
        patternId?: string;
        complexity: string;
    }[];
}

// Runtime to Algorithm cheat sheet
const runtimeToAlgo: CheatSheetItem[] = [
    {
        keyword: "O(1)",
        algorithms: [
            { name: "Hash Table Lookup", patternId: "two-pointers-opposite", complexity: "O(1)" },
            { name: "Array Index Access", complexity: "O(1)" },
            { name: "Stack Push/Pop", patternId: "stack-parentheses", complexity: "O(1)" },
        ],
    },
    {
        keyword: "O(log n)",
        algorithms: [
            { name: "Binary Search", patternId: "binary-search-basic", complexity: "O(log n)" },
            { name: "Binary Search Tree Operations", complexity: "O(log n)" },
            { name: "Heap Operations", complexity: "O(log n)" },
        ],
    },
    {
        keyword: "O(n)",
        algorithms: [
            { name: "Two Pointers", patternId: "two-pointers-opposite", complexity: "O(n)" },
            { name: "Sliding Window", patternId: "variable-sliding-window", complexity: "O(n)" },
            { name: "Linear Search", complexity: "O(n)" },
            { name: "Hash Table Build", complexity: "O(n)" },
            { name: "Monotonic Stack", patternId: "monotonic-stack", complexity: "O(n)" },
        ],
    },
    {
        keyword: "O(n log n)",
        algorithms: [
            { name: "Merge Sort", complexity: "O(n log n)" },
            { name: "Quick Sort (avg)", complexity: "O(n log n)" },
            { name: "Heap Sort", complexity: "O(n log n)" },
        ],
    },
    {
        keyword: "O(n²)",
        algorithms: [
            { name: "Nested Loops", complexity: "O(n²)" },
            { name: "Bubble Sort", complexity: "O(n²)" },
            { name: "2D DP", patternId: "dp-1d", complexity: "O(n²)" },
        ],
    },
    {
        keyword: "O(2^n)",
        algorithms: [
            { name: "Backtracking (subsets)", patternId: "backtracking-combinations", complexity: "O(2^n)" },
            { name: "Recursive with 2 branches", complexity: "O(2^n)" },
        ],
    },
    {
        keyword: "O(n!)",
        algorithms: [
            { name: "Permutations", patternId: "backtracking-combinations", complexity: "O(n!)" },
            { name: "Brute Force All Orderings", complexity: "O(n!)" },
        ],
    },
];

// Keyword to Algorithm cheat sheet
const keywordToAlgo: CheatSheetItem[] = [
    {
        keyword: "Sorted array",
        algorithms: [
            { name: "Binary Search", patternId: "binary-search-basic", complexity: "O(log n)" },
            { name: "Two Pointers", patternId: "two-pointers-opposite", complexity: "O(n)" },
        ],
    },
    {
        keyword: "Subarray / Substring",
        algorithms: [
            { name: "Sliding Window", patternId: "variable-sliding-window", complexity: "O(n)" },
            { name: "Prefix Sum", complexity: "O(n)" },
            { name: "Kadane's Algorithm", patternId: "dp-1d", complexity: "O(n)" },
        ],
    },
    {
        keyword: "Find pair with sum",
        algorithms: [
            { name: "Hash Table", complexity: "O(n)" },
            { name: "Two Pointers (sorted)", patternId: "two-pointers-opposite", complexity: "O(n)" },
        ],
    },
    {
        keyword: "Next greater/smaller",
        algorithms: [
            { name: "Monotonic Stack", patternId: "monotonic-stack", complexity: "O(n)" },
        ],
    },
    {
        keyword: "Parentheses / Brackets",
        algorithms: [
            { name: "Stack", patternId: "stack-parentheses", complexity: "O(n)" },
        ],
    },
    {
        keyword: "Linked List cycle",
        algorithms: [
            { name: "Fast & Slow Pointers", patternId: "fast-slow-pointers", complexity: "O(n)" },
        ],
    },
    {
        keyword: "Tree traversal",
        algorithms: [
            { name: "DFS (recursion)", patternId: "dfs-tree", complexity: "O(n)" },
            { name: "BFS (queue)", patternId: "bfs-tree", complexity: "O(n)" },
        ],
    },
    {
        keyword: "Level order / Shortest path",
        algorithms: [
            { name: "BFS", patternId: "bfs-tree", complexity: "O(V + E)" },
        ],
    },
    {
        keyword: "Generate all combinations",
        algorithms: [
            { name: "Backtracking", patternId: "backtracking-combinations", complexity: "O(2^n)" },
        ],
    },
    {
        keyword: "Optimal / Maximum / Minimum",
        algorithms: [
            { name: "Dynamic Programming", patternId: "dp-1d", complexity: "varies" },
            { name: "Greedy", complexity: "varies" },
        ],
    },
    {
        keyword: "Find first/last position",
        algorithms: [
            { name: "Binary Search Boundary", patternId: "binary-search-boundary", complexity: "O(log n)" },
        ],
    },
    {
        keyword: "K-th largest/smallest",
        algorithms: [
            { name: "Heap / Priority Queue", complexity: "O(n log k)" },
            { name: "Quick Select", complexity: "O(n) avg" },
        ],
    },
    {
        keyword: "Overlapping intervals",
        algorithms: [
            { name: "Sort + Merge", complexity: "O(n log n)" },
            { name: "Sweep Line", complexity: "O(n log n)" },
        ],
    },
    {
        keyword: "Graph connectivity",
        algorithms: [
            { name: "DFS / BFS", patternId: "dfs-tree", complexity: "O(V + E)" },
            { name: "Union Find", complexity: "O(α(n))" },
        ],
    },
];

export default function CheatSheets() {
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState("runtime");

    const filteredRuntime = runtimeToAlgo.filter(
        (item) =>
            searchQuery === "" ||
            item.keyword.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.algorithms.some((algo) =>
                algo.name.toLowerCase().includes(searchQuery.toLowerCase())
            )
    );

    const filteredKeyword = keywordToAlgo.filter(
        (item) =>
            searchQuery === "" ||
            item.keyword.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.algorithms.some((algo) =>
                algo.name.toLowerCase().includes(searchQuery.toLowerCase())
            )
    );

    return (
        <div className="p-6 lg:p-8 max-w-5xl mx-auto">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-2xl font-bold lg:text-3xl">Cheat Sheets</h1>
                    <Badge variant="info" className="gap-1">
                        <FileText className="h-3 w-3" />
                        Quick Reference
                    </Badge>
                </div>
                <p className="text-muted-foreground">
                    Quick lookup tables to find the right algorithm based on runtime or problem keywords
                </p>
            </motion.div>

            {/* Search */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mb-6"
            >
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search runtime, keywords, or algorithms..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </motion.div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-6">
                    <TabsTrigger value="runtime" className="gap-2">
                        <Clock className="h-4 w-4" />
                        Runtime → Algorithm
                    </TabsTrigger>
                    <TabsTrigger value="keyword" className="gap-2">
                        <Zap className="h-4 w-4" />
                        Keyword → Algorithm
                    </TabsTrigger>
                </TabsList>

                {/* Runtime to Algorithm */}
                <TabsContent value="runtime">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                    >
                        {filteredRuntime.map((item, idx) => (
                            <CheatSheetCard key={item.keyword} item={item} delay={idx * 0.05} />
                        ))}
                    </motion.div>
                </TabsContent>

                {/* Keyword to Algorithm */}
                <TabsContent value="keyword">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                    >
                        {filteredKeyword.map((item, idx) => (
                            <CheatSheetCard key={item.keyword} item={item} delay={idx * 0.05} />
                        ))}
                    </motion.div>
                </TabsContent>
            </Tabs>

            {/* Empty State */}
            {((activeTab === "runtime" && filteredRuntime.length === 0) ||
                (activeTab === "keyword" && filteredKeyword.length === 0)) && (
                    <div className="text-center py-12 text-muted-foreground">
                        <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No matches found for "{searchQuery}"</p>
                    </div>
                )}

            {/* Link to patterns */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-8 p-6 rounded-xl border bg-gradient-to-r from-primary/5 to-primary/10"
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <BookOpen className="h-6 w-6 text-primary" />
                        <div>
                            <h3 className="font-semibold">Want to learn the patterns in depth?</h3>
                            <p className="text-sm text-muted-foreground">
                                Browse our comprehensive pattern library with templates
                            </p>
                        </div>
                    </div>
                    <Link to="/patterns">
                        <Button className="gap-2">
                            View Patterns
                            <ArrowRight className="h-4 w-4" />
                        </Button>
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}

interface CheatSheetCardProps {
    item: CheatSheetItem;
    delay?: number;
}

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { PatternVisualizer } from "@/components/visualisation/PatternVisualizer";

// ... (existing imports remain, handled by tool context matching)

const SUPPORTED_VISUALIZATIONS = [
    "two-pointers-opposite",
    "binary-search-basic",
    "binary-search-boundary",
    "variable-sliding-window",
    "fast-slow-pointers",
    "bfs-tree",
    "dfs-tree",
    "monotonic-stack",
    "stack-parentheses"
];

function CheatSheetCard({ item, delay = 0 }: CheatSheetCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            className="rounded-xl border bg-card overflow-hidden"
        >
            <div className="flex flex-col sm:flex-row">
                {/* Keyword Section */}
                <div className="sm:w-48 p-4 bg-muted/30 border-b sm:border-b-0 sm:border-r flex items-center justify-center">
                    <code className="text-lg font-mono font-semibold text-primary">
                        {item.keyword}
                    </code>
                </div>

                {/* Algorithms Section */}
                <div className="flex-1 p-4">
                    <div className="flex flex-wrap gap-2">
                        {item.algorithms.map((algo, idx) => (
                            <div key={idx} className="flex items-center">
                                {algo.patternId ? (
                                    <div className="flex items-center gap-1">
                                        <Link to={`/patterns/${algo.patternId}`}>
                                            <div className="group inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/5 border border-primary/20 hover:border-primary/40 hover:bg-primary/10 transition-all">
                                                <span className="text-sm font-medium">{algo.name}</span>
                                                <Badge variant="outline" className="text-[10px] h-5">
                                                    {algo.complexity}
                                                </Badge>
                                                <ChevronRight className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </div>
                                        </Link>

                                        {/* Visualization Trigger */}
                                        {SUPPORTED_VISUALIZATIONS.includes(algo.patternId) && (
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary rounded-full">
                                                        <Play className="h-3 w-3" />
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent className="sm:max-w-2xl">
                                                    <DialogHeader>
                                                        <DialogTitle>{algo.name} Visualization</DialogTitle>
                                                        <DialogDescription>
                                                            Interactive walkthrough of the algorithm logic.
                                                        </DialogDescription>
                                                    </DialogHeader>
                                                    <div className="mt-4">
                                                        <PatternVisualizer patternId={algo.patternId} />
                                                    </div>
                                                </DialogContent>
                                            </Dialog>
                                        )}
                                    </div>
                                ) : (
                                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50 border">
                                        <span className="text-sm">{algo.name}</span>
                                        <Badge variant="outline" className="text-[10px] h-5">
                                            {algo.complexity}
                                        </Badge>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
