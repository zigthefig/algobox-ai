import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
    getPatternById,
    PATTERNS,
    PATTERN_CATEGORIES,
} from "@/lib/patterns/patternLibrary";
import { PROBLEMS } from "@/lib/problems/problemLibrary";
import {
    ArrowLeft,
    Clock,
    TrendingUp,
    Building2,
    Copy,
    Check,
    BookOpen,
    Code2,
    Lightbulb,
    ChevronRight,
    Play,
    Sparkles,
    AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { PatternVisualizer } from "@/components/visualisation/PatternVisualizer";

export default function PatternDetail() {
    const { patternId } = useParams<{ patternId: string }>();
    const navigate = useNavigate();
    const [copiedLang, setCopiedLang] = useState<string | null>(null);
    const [selectedLang, setSelectedLang] = useState<"python" | "javascript" | "cpp">(
        "python"
    );

    const pattern = getPatternById(patternId || "");

    useEffect(() => {
        if (!pattern) {
            // Pattern not found, redirect or show error
        }
    }, [pattern]);

    if (!pattern) {
        return (
            <div className="p-6 lg:p-8">
                <div className="text-center py-12">
                    <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h2 className="text-xl font-semibold mb-2">Pattern Not Found</h2>
                    <p className="text-muted-foreground mb-4">
                        The pattern you're looking for doesn't exist.
                    </p>
                    <Link to="/patterns">
                        <Button>Back to Patterns</Button>
                    </Link>
                </div>
            </div>
        );
    }

    const categoryInfo = PATTERN_CATEGORIES.find((c) => c.id === pattern.category);
    const relatedProblems = PROBLEMS.filter((p) =>
        pattern.relatedProblems.includes(p.id)
    );
    const prerequisitePatterns = PATTERNS.filter((p) =>
        pattern.prerequisites.includes(p.id)
    );

    const copyCode = async (lang: string, code: string) => {
        await navigator.clipboard.writeText(code);
        setCopiedLang(lang);
        setTimeout(() => setCopiedLang(null), 2000);
    };

    const difficultyColors = {
        beginner: "bg-success/10 text-success border-success/20",
        intermediate: "bg-warning/10 text-warning border-warning/20",
        advanced: "bg-destructive/10 text-destructive border-destructive/20",
    };

    return (
        <div className="p-6 lg:p-8 max-w-5xl mx-auto">
            {/* Breadcrumb */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 text-sm text-muted-foreground mb-6"
            >
                <Link to="/patterns" className="hover:text-foreground transition-colors">
                    Patterns
                </Link>
                <ChevronRight className="h-4 w-4" />
                <span className="flex items-center gap-1">
                    {categoryInfo?.icon} {categoryInfo?.name}
                </span>
                <ChevronRight className="h-4 w-4" />
                <span className="text-foreground font-medium">{pattern.name}</span>
            </motion.div>

            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mb-8"
            >
                <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                        <h1 className="text-2xl lg:text-3xl font-bold mb-2">{pattern.name}</h1>
                        <div className="flex flex-wrap items-center gap-2">
                            <Badge
                                variant="outline"
                                className={cn(difficultyColors[pattern.difficulty])}
                            >
                                {pattern.difficulty}
                            </Badge>
                            <Badge variant="outline" className="gap-1">
                                <Clock className="h-3 w-3" />
                                {pattern.timeToLearn}
                            </Badge>
                            <Badge variant="info" className="gap-1">
                                <TrendingUp className="h-3 w-3" />
                                {pattern.interviewFrequency}% interview rate
                            </Badge>
                        </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                    </Button>
                </div>

                {/* Interview Frequency Bar */}
                <div className="bg-card rounded-lg border p-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Interview ROI Score</span>
                        <span className="font-semibold text-primary">
                            {pattern.interviewFrequency}/100
                        </span>
                    </div>
                    <Progress value={pattern.interviewFrequency} className="h-2" />
                    <div className="flex flex-wrap gap-2 mt-3">
                        {pattern.companies.map((company) => (
                            <span
                                key={company}
                                className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-muted"
                            >
                                <Building2 className="h-3 w-3" />
                                {company}
                            </span>
                        ))}
                    </div>
                </div>
            </motion.div>

            {/* Main Content */}
            <div className="grid gap-8 lg:grid-cols-3">
                {/* Left Column - Description and Template */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Description */}
                    <motion.section
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                            <BookOpen className="h-5 w-5 text-primary" />
                            Overview
                        </h2>
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                            <p className="text-muted-foreground leading-relaxed">
                                {pattern.description}
                            </p>
                        </div>
                    </motion.section>

                    {/* When To Use */}
                    <motion.section
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                            <Lightbulb className="h-5 w-5 text-warning" />
                            When To Use
                        </h2>
                        <ul className="space-y-2">
                            {pattern.whenToUse.map((use, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-sm">
                                    <Check className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                                    <span>{use}</span>
                                </li>
                            ))}
                        </ul>
                    </motion.section>



                    {/* Key Indicators */}
                    <motion.section
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-primary" />
                            Problem Indicators
                        </h2>
                        <div className="flex flex-wrap gap-2">
                            {pattern.keyIndicators.map((indicator, idx) => (
                                <Badge key={idx} variant="outline" className="text-sm py-1">
                                    {indicator}
                                </Badge>
                            ))}
                        </div>
                    </motion.section>

                    {/* Algorithm Visualization */}
                    {["two-pointers-opposite", "binary-search-basic", "binary-search-boundary", "variable-sliding-window", "fast-slow-pointers", "bfs-tree", "dfs-tree", "monotonic-stack", "stack-parentheses"].includes(pattern.id) && (
                        <motion.section
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.45 }}
                        >
                            <PatternVisualizer patternId={pattern.id} />
                        </motion.section>
                    )}

                    {/* Template Code */}
                    <motion.section
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-lg font-semibold flex items-center gap-2">
                                <Code2 className="h-5 w-5 text-primary" />
                                Template Code
                            </h2>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span>Time: {pattern.complexity.time}</span>
                                <span>•</span>
                                <span>Space: {pattern.complexity.space}</span>
                            </div>
                        </div>

                        <Tabs
                            value={selectedLang}
                            onValueChange={(v) =>
                                setSelectedLang(v as "python" | "javascript" | "cpp")
                            }
                        >
                            <div className="flex items-center justify-between mb-2">
                                <TabsList>
                                    <TabsTrigger value="python">Python</TabsTrigger>
                                    <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                                    <TabsTrigger value="cpp">C++</TabsTrigger>
                                </TabsList>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        copyCode(selectedLang, pattern.template[selectedLang])
                                    }
                                    className="gap-1"
                                >
                                    {copiedLang === selectedLang ? (
                                        <>
                                            <Check className="h-3 w-3" />
                                            Copied!
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="h-3 w-3" />
                                            Copy
                                        </>
                                    )}
                                </Button>
                            </div>

                            {(["python", "javascript", "cpp"] as const).map((lang) => (
                                <TabsContent key={lang} value={lang} className="mt-0">
                                    <div className="rounded-lg overflow-hidden border">
                                        <SyntaxHighlighter
                                            language={lang === "cpp" ? "cpp" : lang}
                                            style={oneDark}
                                            customStyle={{
                                                margin: 0,
                                                padding: "1rem",
                                                fontSize: "0.875rem",
                                                lineHeight: "1.5",
                                            }}
                                            showLineNumbers
                                        >
                                            {pattern.template[lang]}
                                        </SyntaxHighlighter>
                                    </div>
                                </TabsContent>
                            ))}
                        </Tabs>
                    </motion.section>
                </div>

                {/* Right Column - Sidebar */}
                <div className="space-y-6">
                    {/* Prerequisites */}
                    {prerequisitePatterns.length > 0 && (
                        <motion.section
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            className="rounded-xl border bg-card p-4"
                        >
                            <h3 className="font-semibold mb-3">Prerequisites</h3>
                            <div className="space-y-2">
                                {prerequisitePatterns.map((prereq) => (
                                    <Link key={prereq.id} to={`/patterns/${prereq.id}`}>
                                        <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted transition-colors">
                                            <div className="w-2 h-2 rounded-full bg-warning" />
                                            <span className="text-sm">{prereq.name}</span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </motion.section>
                    )}

                    {/* Related Problems */}
                    <motion.section
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className="rounded-xl border bg-card p-4"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold">Practice Problems</h3>
                            <Badge variant="outline">{relatedProblems.length}</Badge>
                        </div>
                        {relatedProblems.length > 0 ? (
                            <div className="space-y-2">
                                {relatedProblems.map((problem) => (
                                    <Link key={problem.id} to={`/practice?search=${problem.title}`}>
                                        <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted transition-colors group">
                                            <div className="flex items-center gap-2">
                                                <Play className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors" />
                                                <span className="text-sm">{problem.title}</span>
                                            </div>
                                            <Badge
                                                variant={problem.difficulty}
                                                className="text-[10px] h-5"
                                            >
                                                {problem.difficulty}
                                            </Badge>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">
                                No practice problems linked yet.
                            </p>
                        )}

                        <Link
                            to={`/practice?tags=${categoryInfo?.name || pattern.category}`}
                            className="block mt-3"
                        >
                            <Button variant="outline" size="sm" className="w-full gap-2">
                                View All {categoryInfo?.name} Problems
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </Link>
                    </motion.section>

                    {/* Quick Stats */}
                    <motion.section
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                        className="rounded-xl border bg-gradient-to-br from-primary/5 to-primary/10 p-4"
                    >
                        <h3 className="font-semibold mb-3">Quick Stats</h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Time Complexity</span>
                                <code className="bg-muted px-2 py-0.5 rounded text-xs">
                                    {pattern.complexity.time}
                                </code>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Space Complexity</span>
                                <code className="bg-muted px-2 py-0.5 rounded text-xs">
                                    {pattern.complexity.space}
                                </code>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Category</span>
                                <span className="flex items-center gap-1">
                                    {categoryInfo?.icon} {categoryInfo?.name}
                                </span>
                            </div>
                        </div>
                    </motion.section>
                </div>
            </div>
        </div>
    );
}
