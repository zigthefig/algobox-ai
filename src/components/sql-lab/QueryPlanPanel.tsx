import { ExecutionStep } from "@/lib/sql-lab/engine/sqlParser";
import { motion } from "framer-motion";
import { Database, ArrowRight, Filter, Columns, GitMerge } from "lucide-react";
import { cn } from "@/lib/utils";

interface QueryPlanPanelProps {
    steps: ExecutionStep[];
    currentStep: number;
    onStepClick: (step: number) => void;
}

const OPERATION_ICONS: Record<string, any> = {
    TABLE_SCAN: Database,
    JOIN: GitMerge,
    FILTER: Filter,
    PROJECTION: Columns,
};

const OPERATION_COLORS: Record<string, string> = {
    TABLE_SCAN: "text-blue-400 bg-blue-500/10 border-blue-500/30",
    JOIN: "text-green-400 bg-green-500/10 border-green-500/30",
    FILTER: "text-amber-400 bg-amber-500/10 border-amber-500/30",
    PROJECTION: "text-purple-400 bg-purple-500/10 border-purple-500/30",
};

export function QueryPlanPanel({ steps, currentStep, onStepClick }: QueryPlanPanelProps) {
    if (steps.length === 0) {
        return (
            <div className="h-full flex items-center justify-center text-slate-500 text-sm">
                Run a query to see execution plan
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col">
            <div className="p-3 border-b border-slate-700">
                <h3 className="text-sm font-semibold text-slate-300">Execution Plan</h3>
                <p className="text-xs text-slate-500 mt-0.5">Click any step to jump</p>
            </div>

            <div className="flex-1 overflow-auto p-3">
                <div className="relative">
                    {/* Vertical line connecting steps */}
                    <div className="absolute left-5 top-4 bottom-4 w-0.5 bg-slate-700" />

                    {steps.map((step, idx) => {
                        const Icon = OPERATION_ICONS[step.operation] || Database;
                        const colorClass = OPERATION_COLORS[step.operation] || "text-slate-400 bg-slate-500/10 border-slate-500/30";
                        const isActive = idx === currentStep;
                        const isPast = idx < currentStep;

                        return (
                            <motion.div
                                key={step.index}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="relative mb-3"
                            >
                                <button
                                    onClick={() => onStepClick(idx)}
                                    className={cn(
                                        "w-full flex items-start gap-3 p-2 rounded-lg text-left transition-all",
                                        "hover:bg-slate-800/50",
                                        isActive && "bg-slate-800 ring-1 ring-blue-500/50"
                                    )}
                                >
                                    {/* Step indicator */}
                                    <div
                                        className={cn(
                                            "relative z-10 flex items-center justify-center w-10 h-10 rounded-lg border",
                                            colorClass,
                                            isPast && "opacity-60"
                                        )}
                                    >
                                        <Icon className="h-5 w-5" />
                                    </div>

                                    {/* Step content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span
                                                className={cn(
                                                    "text-xs font-semibold uppercase tracking-wider",
                                                    isActive ? "text-blue-400" : isPast ? "text-slate-500" : "text-slate-400"
                                                )}
                                            >
                                                {step.operation.replace("_", " ")}
                                            </span>
                                            {step.tables.length > 0 && (
                                                <span className="text-xs text-slate-500">
                                                    ({step.tables.join(", ")})
                                                </span>
                                            )}
                                        </div>
                                        <p
                                            className={cn(
                                                "text-xs mt-0.5 line-clamp-2",
                                                isActive ? "text-slate-300" : "text-slate-500"
                                            )}
                                        >
                                            {step.description}
                                        </p>
                                    </div>

                                    {/* Step number */}
                                    <div
                                        className={cn(
                                            "text-xs font-mono",
                                            isActive ? "text-blue-400" : "text-slate-600"
                                        )}
                                    >
                                        #{idx + 1}
                                    </div>
                                </button>
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* Complexity info */}
            <div className="p-3 border-t border-slate-700 bg-slate-900/50">
                <div className="text-xs text-slate-500 space-y-1">
                    <div className="flex justify-between">
                        <span>Total Steps:</span>
                        <span className="text-slate-400">{steps.length}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Tables Scanned:</span>
                        <span className="text-slate-400">
                            {new Set(steps.flatMap(s => s.tables)).size}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
