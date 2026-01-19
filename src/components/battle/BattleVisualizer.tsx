
import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface VisualizationStep {
    line: number;
    variables: Record<string, any>;
    event?: string;
}

interface DualVisualizerProps {
    userSteps: VisualizationStep[];
    aiSteps: VisualizationStep[];
}

export function BattleVisualizer({ userSteps, aiSteps }: DualVisualizerProps) {
    const [currentStep, setCurrentStep] = useState(0);
    const maxSteps = Math.max(userSteps.length, aiSteps.length);

    // Sync steps logic: percentage based or direct step index?
    // Direct index is better for "who finished faster" comparison.
    // But if AI has 10 steps and User has 100, synced by index means AI finishes instantly.
    // Let's stick to index to show valid efficiency gap.

    const userStepData = userSteps[Math.min(currentStep, userSteps.length - 1)];
    const aiStepData = aiSteps[Math.min(currentStep, aiSteps.length - 1)];

    return (
        <div className="flex flex-col h-full bg-black/40 rounded-lg border border-border overflow-hidden">
            {/* Metrics Header */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/20">
                <div className="flex items-center gap-4 text-xs font-mono">
                    <Badge variant="outline" className="border-blue-500/50 text-blue-400">
                        User Steps: {currentStep < userSteps.length ? currentStep + 1 : userSteps.length}
                    </Badge>
                    <Badge variant="outline" className="border-purple-500/50 text-purple-400">
                        AI Steps: {currentStep < aiSteps.length ? currentStep + 1 : aiSteps.length}
                    </Badge>
                </div>
                <div className="w-1/3">
                    <Slider
                        value={[currentStep]}
                        max={maxSteps - 1}
                        step={1}
                        onValueChange={(v) => setCurrentStep(v[0])}
                        className="cursor-pointer"
                    />
                </div>
            </div>

            {/* Split Viz */}
            <div className="flex-1 flex divide-x divide-border">
                {/* LEFT: User */}
                <div className="flex-1 p-4 relative overflow-hidden">
                    <div className="absolute top-2 left-2 text-xs font-bold text-blue-500 uppercase tracking-widest opacity-50">You</div>
                    <VisualizationPanel data={userStepData} color="blue" />
                </div>

                {/* RIGHT: AI */}
                <div className="flex-1 p-4 relative overflow-hidden bg-purple-500/5">
                    <div className="absolute top-2 right-2 text-xs font-bold text-purple-500 uppercase tracking-widest opacity-50">AI Opponent</div>
                    <VisualizationPanel data={aiStepData} color="purple" />
                </div>
            </div>
        </div>
    );
}

function VisualizationPanel({ data, color }: { data: VisualizationStep; color: "blue" | "purple" }) {
    if (!data) return <div className="text-muted-foreground text-xs p-4">Waiting for execution...</div>;

    return (
        <div className="space-y-4 mt-6">
            {/* Variable View (Simple Tree for now) */}
            <div className="space-y-2">
                {Object.entries(data.variables || {}).map(([key, val]) => (
                    <div key={key} className="flex justify-between items-center text-xs font-mono border-b border-border/50 pb-1">
                        <span className="text-muted-foreground">{key}</span>
                        <span className={cn(
                            "font-semibold",
                            color === "blue" ? "text-blue-300" : "text-purple-300"
                        )}>
                            {JSON.stringify(val)}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
