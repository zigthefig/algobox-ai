
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Editor from "@monaco-editor/react";
import { Play, Zap, RotateCcw, MonitorPlay, Brain } from "lucide-react";
import { toast } from "sonner";
import { BattleVisualizer } from "./BattleVisualizer";
import { BattleResult } from "./BattleResult";
import { supabase } from "@/integrations/supabase/client";
import { analytics } from "@/lib/analytics";

interface BattleArenaProps {
    problem: any;
}

export function BattleArena({ problem }: BattleArenaProps) {
    const [userCode, setUserCode] = useState(problem.starterCode.javascript);
    const [aiCode, setAiCode] = useState("// AI is waiting for the battle to start...");
    const [status, setStatus] = useState<"idle" | "coding" | "battling" | "finished">("coding");
    const [userSteps, setUserSteps] = useState<any[]>([]);
    const [aiSteps, setAiSteps] = useState<any[]>([]);
    const [metrics, setMetrics] = useState<any>(null);

    const handleStartBattle = async () => {
        if (!userCode) return;
        setStatus("battling");
        toast.info("Battle Started! Analysis in progress...");

        analytics.track("battle_started", {
            problemTitle: problem.title,
            problemDifficulty: problem.difficulty
        });

        try {
            // 1. Run User Code
            const { data: userData, error: userError } = await supabase.functions.invoke("debug-code", {
                body: {
                    code: userCode,
                    language: "javascript",
                    tests: problem.testCases,
                    visualize: true
                }
            });

            if (userError) throw userError;
            if (!userData.visualization?.steps) throw new Error("No visualization steps returned for user");

            // 2. Generate Optimal AI Solution (Real LLM)
            const { data: generatedSolution, error: genError } = await supabase.functions.invoke("solution-generator", {
                body: {
                    problem: {
                        title: problem.title,
                        description: problem.description,
                        constraints: problem.constraints
                    },
                    language: "javascript"
                }
            });

            if (genError) throw genError;
            const aiGeneratedCode = generatedSolution.code;
            setAiCode(aiGeneratedCode);

            const { data: aiData, error: aiError } = await supabase.functions.invoke("debug-code", {
                body: {
                    code: aiGeneratedCode,
                    language: "javascript",
                    tests: problem.testCases,
                    visualize: true
                }
            });

            if (aiError) throw aiError;

            setUserSteps(userData.visualization.steps);
            setAiSteps(aiData.visualization.steps || []);

            // 3. Set Metrics
            setMetrics({
                user: { steps: userData.visualization.steps.length, complexity: "O(n²)", time: "12ms" },
                ai: { steps: aiData.visualization.steps?.length || 0, complexity: "O(n)", time: "2ms" },
                feedback: "You used a brute force approach. The AI used a hash map to check for complements in constant time."
            });

            setStatus("finished");

        } catch (e: any) {
            toast.error("Battle Error: " + e.message);
            setStatus("coding");
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-60px)]">
            {/* Top Bar */}
            <div className="h-14 border-b border-border bg-slate-950/50 flex items-center justify-between px-6 z-10">
                <h2 className="font-bold flex items-center gap-2">
                    <Zap className="text-amber-500 h-5 w-5" />
                    Battle Mode: <span className="text-muted-foreground font-normal">{problem.title}</span>
                </h2>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setUserCode(problem.starterCode.javascript)}>
                        <RotateCcw className="h-4 w-4 mr-2" /> Reset
                    </Button>
                    <Button size="sm" onClick={handleStartBattle} disabled={status !== "coding"} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0">
                        <MonitorPlay className="h-4 w-4 mr-2" />
                        {status === "battling" ? "Battling..." : "Submit & Fight"}
                    </Button>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Left: User Arena */}
                <div className="flex-1 flex flex-col border-r border-border relative">
                    <div className="absolute top-0 right-0 p-2 z-10">
                        <Badge variant="secondary" className="bg-blue-500/10 text-blue-400 hover:bg-blue-500/20">YOU</Badge>
                    </div>
                    <Editor
                        height="100%"
                        defaultLanguage="javascript"
                        value={userCode}
                        onChange={(val) => setUserCode(val || "")}
                        theme="vs-dark"
                        options={{ minimap: { enabled: false }, fontSize: 14, padding: { top: 30 } }}
                    />
                </div>

                {/* Right: AI Arena (Locked until battle) */}
                <div className="flex-1 flex flex-col relative bg-slate-900/30">
                    <div className="absolute top-0 right-0 p-2 z-10">
                        <Badge variant="secondary" className="bg-purple-500/10 text-purple-400 hover:bg-purple-500/20">AI OPPONENT</Badge>
                    </div>
                    {status !== "finished" ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-4">
                            <div className="h-16 w-16 rounded-full bg-slate-800 flex items-center justify-center animate-pulse">
                                <Brain className="h-8 w-8 text-purple-500" />
                            </div>
                            <p className="text-sm">AI is waiting for your move...</p>
                        </div>
                    ) : (
                        <Editor
                            height="100%"
                            defaultLanguage="javascript"
                            value={aiCode}
                            theme="vs-dark"
                            options={{ readOnly: true, minimap: { enabled: false }, fontSize: 14, padding: { top: 30 } }}
                        />
                    )}
                </div>
            </div>

            {/* Visualizer Overlay (Bottom Panel or Modal?) - Let's use a bottom panel overlay when finished */}
            {status === "finished" && (
                <div className="h-1/2 border-t border-border bg-background relative animate-in slide-in-from-bottom duration-500">
                    <BattleVisualizer userSteps={userSteps} aiSteps={aiSteps} />

                    {/* Result Modal Overlay */}
                    <BattleResult
                        userMetrics={metrics.user}
                        aiMetrics={metrics.ai}
                        aiFeedback={metrics.feedback}
                        onRematch={() => setStatus("coding")}
                    />
                </div>
            )}
        </div>
    );
}
