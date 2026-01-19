
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap, Brain, Code, CheckCircle2 } from "lucide-react";

interface BattleResultProps {
    userMetrics: { steps: number; time: string; complexity: string };
    aiMetrics: { steps: number; time: string; complexity: string };
    aiFeedback: string;
    onRematch: () => void;
}

export function BattleResult({ userMetrics, aiMetrics, aiFeedback, onRematch }: BattleResultProps) {
    const winner = userMetrics.steps <= aiMetrics.steps ? "User" : "AI";

    return (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-4xl border-purple-500/30 shadow-2xl bg-slate-950/90 animate-in fade-in zoom-in duration-300">
                <CardHeader className="text-center pb-2">
                    <Badge variant="outline" className="w-fit mx-auto mb-4 border-amber-500 text-amber-500">
                        Battle Completed
                    </Badge>
                    <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                        {winner === "User" ? "Victory! Your Logic Prevailed" : "AI Found a More Optimal Path"}
                    </CardTitle>
                    <p className="text-muted-foreground text-sm mt-2">
                        Comparison is meant to teach, not judge. See where the difference lies.
                    </p>
                </CardHeader>

                <CardContent className="grid md:grid-cols-2 gap-8 pt-6">
                    {/* Stats Comparison */}
                    <div className="space-y-6">
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                            <Zap className="h-4 w-4" /> Performance Metrics
                        </h3>

                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div className="p-3 bg-slate-900 rounded-lg">
                                <div className="text-xs text-muted-foreground mb-1">Steps</div>
                                <div className="text-xl font-bold text-blue-400">{userMetrics.steps}</div>
                                <div className="text-xs text-muted-foreground mt-1">You</div>
                            </div>
                            <div className="flex items-center justify-center text-muted-foreground text-xs font-mono">VS</div>
                            <div className="p-3 bg-slate-900 rounded-lg">
                                <div className="text-xs text-muted-foreground mb-1">Steps</div>
                                <div className="text-xl font-bold text-purple-400">{aiMetrics.steps}</div>
                                <div className="text-xs text-muted-foreground mt-1">AI</div>
                            </div>

                            {/* Complexity Row */}
                            <div className="p-3 bg-slate-900 rounded-lg">
                                <div className="text-xs text-muted-foreground mb-1">Complexity</div>
                                <div className="text-sm font-bold text-blue-400">{userMetrics.complexity}</div>
                            </div>
                            <div className="flex items-center justify-center text-muted-foreground text-xs font-mono">VS</div>
                            <div className="p-3 bg-slate-900 rounded-lg">
                                <div className="text-xs text-muted-foreground mb-1">Complexity</div>
                                <div className="text-sm font-bold text-purple-400">{aiMetrics.complexity}</div>
                            </div>
                        </div>
                    </div>

                    {/* AI Feedback */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                            <Brain className="h-4 w-4" /> AI Coach Verification
                        </h3>
                        <div className="bg-slate-900/50 p-4 rounded-lg border border-border text-sm leading-relaxed text-slate-300">
                            {aiFeedback || "Analyzing your code structure... Great job handling the base cases! To optimize further, consider using a hash map to reduce lookups from O(n) to O(1)."}
                        </div>
                        <Button className="w-full bg-emerald-600 hover:bg-emerald-700" onClick={onRematch}>
                            <CheckCircle2 className="mr-2 h-4 w-4" /> Start Next Battle
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
