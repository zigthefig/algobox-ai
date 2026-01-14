import { useState, useEffect, useCallback } from "react";
import Editor from "@monaco-editor/react";
import { Play, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

import { databases } from "@/lib/sql-lab/databases/sampleData";
import { parseSQL, generateExecutionSteps, ExecutionStep } from "@/lib/sql-lab/engine/sqlParser";
import { DatabaseExplorer } from "./DatabaseExplorer";
import { QueryExecutionVisualizer } from "./QueryExecutionVisualizer";
import { StepController } from "./StepController";
import { QueryPlanPanel } from "./QueryPlanPanel";
import { SqlMentor } from "./SqlMentor";

const SAMPLE_QUERIES = [
    { label: "Basic SELECT", query: "SELECT * FROM users" },
    { label: "WHERE filter", query: "SELECT name, email FROM users WHERE id > 2" },
    { label: "JOIN query", query: "SELECT users.name, orders.amount FROM users JOIN orders ON users.id = orders.user_id" },
    { label: "JOIN + WHERE", query: "SELECT users.name, orders.amount FROM users JOIN orders ON users.id = orders.user_id WHERE orders.amount > 500" },
    { label: "COUNT aggregate", query: "SELECT COUNT(*) AS total FROM orders" },
    { label: "GROUP BY", query: "SELECT user_id, SUM(amount) AS total FROM orders GROUP BY user_id" },
    { label: "ORDER BY", query: "SELECT name, email FROM users ORDER BY name ASC" },
    { label: "LIMIT", query: "SELECT * FROM products ORDER BY price DESC LIMIT 5" },
];

export function SqlLabPlayground() {
    const [selectedDb, setSelectedDb] = useState("ecommerce");
    const [query, setQuery] = useState(SAMPLE_QUERIES[0].query);
    const [executionSteps, setExecutionSteps] = useState<ExecutionStep[]>([]);
    const [currentStep, setCurrentStep] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [speed, setSpeed] = useState(1);
    const [isExecuting, setIsExecuting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const currentDb = databases[selectedDb as keyof typeof databases];

    const [history, setHistory] = useState<{ query: string, timestamp: number }[]>([]);

    const addToHistory = (q: string) => {
        setHistory(prev => [{ query: q, timestamp: Date.now() }, ...prev].slice(0, 50));
    };

    const executeQuery = useCallback(() => {
        setError(null);
        setIsExecuting(true);

        try {
            const parsed = parseSQL(query);
            const steps = generateExecutionSteps(parsed, currentDb);
            setExecutionSteps(steps);
            setCurrentStep(0);
            setIsPlaying(false);
            addToHistory(query);
            toast.success(`Query parsed: ${steps.length} execution steps`);
        } catch (e: any) {
            setError(e.message);
            toast.error(`Parse error: ${e.message}`);
        } finally {
            setIsExecuting(false);
        }
    }, [query, currentDb]);

    const handleExport = () => {
        if (executionSteps.length === 0) return;
        // In this simplified engine, finding the "result" step is tricky as it's execution steps.
        // But usually the last step's result or intermediate result is what we want.
        // Let's assume the executionSteps contain the data.
        // For now, exporting the execution plan/steps as JSON.
        const blob = new Blob([JSON.stringify(executionSteps, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `query_result_${Date.now()}.json`;
        a.click();
        toast.success("Results exported!");
    };

    // Auto-play functionality
    useEffect(() => {
        if (!isPlaying || currentStep >= executionSteps.length - 1) {
            if (isPlaying && currentStep >= executionSteps.length - 1) {
                setIsPlaying(false);
            }
            return;
        }

        const interval = setInterval(() => {
            setCurrentStep((prev) => prev + 1);
        }, 1500 / speed);

        return () => clearInterval(interval);
    }, [isPlaying, currentStep, executionSteps.length, speed]);

    const handlePlayPause = () => {
        if (currentStep >= executionSteps.length - 1) {
            setCurrentStep(0);
        }
        setIsPlaying(!isPlaying);
    };

    return (
        <div className="h-[calc(100vh-200px)] flex gap-4">
            {/* Left Panel: Database Explorer + Query Editor */}
            <div className="w-72 flex flex-col gap-4">
                {/* Database Explorer */}
                <div className="h-1/2">
                    <DatabaseExplorer
                        selectedDb={selectedDb}
                        onSelectDb={setSelectedDb}
                        onTableClick={(table) => setQuery(`SELECT * FROM ${table}`)}
                        history={history}
                        onHistorySelect={setQuery}
                    />
                </div>

                {/* Sample Queries */}
                <Card className="p-3 bg-slate-900/50 border-slate-700">
                    <div className="text-xs text-slate-400 mb-2">Quick Queries</div>
                    <div className="space-y-1">
                        {SAMPLE_QUERIES.map((sq, idx) => (
                            <button
                                key={idx}
                                onClick={() => setQuery(sq.query)}
                                className="w-full text-left px-2 py-1.5 text-xs rounded hover:bg-slate-800 text-slate-300 truncate"
                            >
                                {sq.label}
                            </button>
                        ))}
                    </div>
                </Card>
            </div>

            {/* Center: Editor + Visualization */}
            <div className="flex-1 flex flex-col gap-4">
                {/* SQL Editor */}
                <Card className="p-4 bg-slate-900/50 border-slate-700">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-semibold text-slate-300">SQL Editor</h3>
                        <div className="flex gap-2">
                            <Button onClick={handleExport} disabled={executionSteps.length === 0} size="sm" variant="outline">
                                Export JSON
                            </Button>
                            <Button onClick={executeQuery} disabled={isExecuting} size="sm">
                                {isExecuting ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <Play className="mr-2 h-4 w-4" />
                                )}
                                Execute & Visualize
                            </Button>
                        </div>
                    </div>
                    <div className="h-32 rounded-lg overflow-hidden border border-slate-700">
                        <Editor
                            height="100%"
                            defaultLanguage="sql"
                            value={query}
                            onChange={(val) => setQuery(val || "")}
                            theme="vs-dark"
                            options={{
                                minimap: { enabled: false },
                                fontSize: 13,
                                lineNumbers: "off",
                                folding: false,
                                wordWrap: "on",
                                scrollBeyondLastLine: false,
                                automaticLayout: true,
                            }}
                        />
                    </div>
                    {error && (
                        <div className="mt-2 p-2 bg-red-500/10 border border-red-500/30 rounded text-xs text-red-400">
                            {error}
                        </div>
                    )}
                </Card>

                {/* Step Controller */}
                {executionSteps.length > 0 && (
                    <StepController
                        currentStep={currentStep}
                        totalSteps={executionSteps.length}
                        isPlaying={isPlaying}
                        speed={speed}
                        onStepChange={setCurrentStep}
                        onPlayPause={handlePlayPause}
                        onSpeedChange={setSpeed}
                    />
                )}

                {/* Visualization */}
                <Card className="flex-1 bg-slate-900/50 border-slate-700 overflow-hidden">
                    <QueryExecutionVisualizer
                        step={executionSteps[currentStep] || null}
                        database={currentDb}
                    />
                </Card>
            </div>

            {/* Right Panel: Query Plan + AI Mentor */}
            <div className="w-72 flex flex-col gap-4">
                {/* Query Plan */}
                <Card className="h-1/2 bg-slate-900/50 border-slate-700 overflow-hidden">
                    <QueryPlanPanel
                        steps={executionSteps}
                        currentStep={currentStep}
                        onStepClick={setCurrentStep}
                    />
                </Card>

                {/* AI Mentor */}
                <div className="h-1/2">
                    <SqlMentor query={query} />
                </div>
            </div>
        </div>
    );
}
