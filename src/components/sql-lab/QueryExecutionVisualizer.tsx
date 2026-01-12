import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { motion, AnimatePresence } from "framer-motion";
import { ExecutionStep } from "@/lib/sql-lab/engine/sqlParser";

interface QueryExecutionVisualizerProps {
    step: ExecutionStep | null;
    database: any;
}

const COLORS = {
    scan: "#3b82f6",      // Blue
    match: "#22c55e",     // Green
    filter: "#f59e0b",    // Amber
    filtered: "#64748b",  // Gray (filtered out)
    result: "#8b5cf6",    // Purple
    text: "#e2e8f0",
    textMuted: "#94a3b8",
    background: "#0f172a",
    cardBg: "#1e293b",
    border: "#334155",
};

export function QueryExecutionVisualizer({ step, database }: QueryExecutionVisualizerProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    if (!step) {
        return (
            <div className="h-full flex items-center justify-center text-slate-500">
                <p>Run a query to see step-by-step execution</p>
            </div>
        );
    }

    return (
        <div ref={containerRef} className="h-full flex flex-col">
            {/* Operation Header */}
            <motion.div
                key={step.index}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-gradient-to-r from-slate-800 to-slate-900 border-b border-slate-700"
            >
                <div className="flex items-center gap-3">
                    <div className={`
            px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider
            ${step.operation === "TABLE_SCAN" ? "bg-blue-500/20 text-blue-400" : ""}
            ${step.operation === "JOIN" ? "bg-green-500/20 text-green-400" : ""}
            ${step.operation === "FILTER" ? "bg-amber-500/20 text-amber-400" : ""}
            ${step.operation === "PROJECTION" ? "bg-purple-500/20 text-purple-400" : ""}
          `}>
                        {step.operation.replace("_", " ")}
                    </div>
                    <p className="text-slate-300 text-sm">{step.description}</p>
                </div>
            </motion.div>

            {/* Tables Visualization */}
            <div className="flex-1 p-4 overflow-auto">
                <div className="flex gap-6 flex-wrap">
                    {step.highlights.map((highlight, idx) => {
                        const table = database.tables[highlight.table.toLowerCase()];
                        if (!table && highlight.table !== "result") return null;

                        const data = highlight.table === "result"
                            ? step.intermediateResult
                            : table?.data;

                        if (!data) return null;

                        return (
                            <motion.div
                                key={`${highlight.table}-${idx}`}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.1 }}
                                className="flex-shrink-0"
                            >
                                <div className="text-sm font-semibold text-slate-400 mb-2 flex items-center gap-2">
                                    <span>{highlight.table}</span>
                                    <span className="text-xs text-slate-500">
                                        ({data.length} rows)
                                    </span>
                                </div>
                                <div className="rounded-lg border border-slate-700 overflow-hidden bg-slate-900/50">
                                    <table className="text-xs">
                                        <thead>
                                            <tr className="bg-slate-800">
                                                {Object.keys(data[0] || {}).slice(0, 5).map((col) => (
                                                    <th key={col} className="px-3 py-2 text-slate-400 font-medium text-left">
                                                        {col}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {data.slice(0, 10).map((row: any, rowIdx: number) => {
                                                const isHighlighted = highlight.rows.includes(rowIdx);
                                                const highlightColor =
                                                    highlight.type === "scan" ? "bg-blue-500/10 border-l-2 border-l-blue-500" :
                                                        highlight.type === "match" ? "bg-green-500/10 border-l-2 border-l-green-500" :
                                                            highlight.type === "filter" ? "bg-amber-500/10 border-l-2 border-l-amber-500" :
                                                                highlight.type === "result" ? "bg-purple-500/10 border-l-2 border-l-purple-500" :
                                                                    "";

                                                return (
                                                    <motion.tr
                                                        key={rowIdx}
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: rowIdx * 0.03 }}
                                                        className={`
                              border-t border-slate-800 transition-colors
                              ${isHighlighted ? highlightColor : "opacity-40"}
                            `}
                                                    >
                                                        {Object.values(row).slice(0, 5).map((val: any, colIdx: number) => (
                                                            <td key={colIdx} className="px-3 py-2 text-slate-300">
                                                                {String(val)}
                                                            </td>
                                                        ))}
                                                    </motion.tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                    {data.length > 10 && (
                                        <div className="px-3 py-1 text-xs text-slate-500 bg-slate-800/50">
                                            ... and {data.length - 10} more rows
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* Intermediate Result */}
            {step.intermediateResult && step.operation !== "PROJECTION" && (
                <div className="p-4 border-t border-slate-700 bg-slate-900/30">
                    <div className="text-xs text-slate-400 mb-2">
                        Intermediate Result ({step.intermediateResult.length} rows)
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-2">
                        {step.intermediateResult.slice(0, 5).map((row, idx) => (
                            <div
                                key={idx}
                                className="flex-shrink-0 px-3 py-2 bg-slate-800 rounded-lg text-xs text-slate-300"
                            >
                                {Object.entries(row).slice(0, 3).map(([k, v]) => (
                                    <div key={k}>
                                        <span className="text-slate-500">{k}:</span> {String(v)}
                                    </div>
                                ))}
                            </div>
                        ))}
                        {step.intermediateResult.length > 5 && (
                            <div className="flex-shrink-0 px-3 py-2 bg-slate-800/50 rounded-lg text-xs text-slate-500 flex items-center">
                                +{step.intermediateResult.length - 5} more
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
