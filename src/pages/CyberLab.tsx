import { useState, useEffect, useMemo } from "react";
import { Play, Pause, StepForward, StepBack, Shield, ShieldAlert, BadgeCheck, ChevronDown, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { ALL_LABS } from "@/components/cyber-lab/labRegistry";
import { D3CyberVisualizer } from "@/components/cyber-lab/visualizer/D3CyberVisualizer";

export default function CyberLab() {
    const [currentLabId, setCurrentLabId] = useState<string>(ALL_LABS[0].id);
    const [mode, setMode] = useState<"attack" | "defense">("attack");
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);

    // Find current lab safely
    const currentLab = useMemo(() => ALL_LABS.find(l => l.id === currentLabId) || ALL_LABS[0], [currentLabId]);

    const steps = mode === "attack" ? currentLab.steps : currentLab.fixSteps;
    // Ensure currentStep is valid even if switching labs changes step count
    const currentStep = steps[currentStepIndex] || steps[0];

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isPlaying && currentStepIndex < steps.length - 1) {
            interval = setInterval(() => {
                setCurrentStepIndex(prev => prev + 1);
            }, 2000);
        } else if (currentStepIndex >= steps.length - 1) {
            setIsPlaying(false);
        }
        return () => clearInterval(interval);
    }, [isPlaying, currentStepIndex, steps.length]);

    // Reset when changing lab or mode
    useEffect(() => {
        setIsPlaying(false);
        setCurrentStepIndex(0);
    }, [currentLabId, mode]);

    return (
        <div className="h-full flex flex-col p-6 gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-3">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="text-2xl font-bold p-0 h-auto hover:bg-transparent">
                                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">
                                        {currentLab.title}
                                    </span>
                                    <ChevronDown className="ml-2 h-6 w-6 text-slate-500" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-64">
                                {ALL_LABS.map(lab => (
                                    <DropdownMenuItem key={lab.id} onClick={() => setCurrentLabId(lab.id)}>
                                        <div className="flex flex-col gap-1">
                                            <span className="font-medium">{lab.title}</span>
                                            <span className="text-xs text-muted-foreground">{lab.difficulty}</span>
                                        </div>
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <Badge variant="outline" className={`
                            ${currentLab.difficulty === "Beginner" ? "border-green-500/50 text-green-400" : ""}
                            ${currentLab.difficulty === "Intermediate" ? "border-yellow-500/50 text-yellow-400" : ""}
                            ${currentLab.difficulty === "Advanced" ? "border-red-500/50 text-red-400" : ""}
                        `}>
                            {currentLab.difficulty}
                        </Badge>
                    </div>
                    <p className="text-muted-foreground mt-1">
                        {currentLab.description}
                    </p>
                </div>

                <div className="flex items-center bg-slate-900 rounded-lg p-1 border border-slate-700">
                    <button
                        onClick={() => setMode("attack")}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${mode === "attack" ? "bg-red-500/20 text-red-400" : "text-slate-400 hover:text-slate-200"}`}
                    >
                        <ShieldAlert className="inline-block w-4 h-4 mr-2" />
                        Attack Path
                    </button>
                    <button
                        onClick={() => setMode("defense")}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${mode === "defense" ? "bg-green-500/20 text-green-400" : "text-slate-400 hover:text-slate-200"}`}
                    >
                        <Shield className="inline-block w-4 h-4 mr-2" />
                        Defense Fix
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
                {/* Visualizer Panel */}
                <Card className="lg:col-span-2 bg-[#020617] border-slate-800 flex flex-col overflow-hidden relative shadow-2xl shadow-indigo-500/5">
                    <div className="absolute top-4 left-4 z-10 bg-slate-950/80 backdrop-blur px-3 py-1.5 rounded text-xs text-slate-300 border border-slate-800 flex items-center gap-2">
                        <Monitor className="h-3 w-3 text-indigo-400" />
                        {mode === "attack" ? "Exploitation Simulation" : "Secure Implementation"}
                    </div>

                    <div className="flex-1 w-full h-full relative">
                        {/* Render D3 Visualizer with the current state */}
                        <D3CyberVisualizer state={currentStep.state} />
                    </div>

                    {/* Playback Controls */}
                    <div className="p-4 border-t border-slate-800 bg-slate-900/50 flex items-center gap-4">
                        <Button
                            size="icon"
                            variant="outline"
                            onClick={() => setIsPlaying(!isPlaying)}
                            disabled={currentStepIndex >= steps.length - 1 && !isPlaying}
                            className="bg-slate-800 border-slate-700 hover:bg-slate-700 hover:border-slate-600"
                        >
                            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        </Button>

                        <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setCurrentStepIndex(Math.max(0, currentStepIndex - 1))}
                            disabled={currentStepIndex === 0}
                        >
                            <StepBack className="h-4 w-4" />
                        </Button>
                        <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setCurrentStepIndex(Math.min(steps.length - 1, currentStepIndex + 1))}
                            disabled={currentStepIndex === steps.length - 1}
                        >
                            <StepForward className="h-4 w-4" />
                        </Button>

                        <div className="flex-1 mx-4">
                            <Slider
                                value={[currentStepIndex]}
                                min={0}
                                max={steps.length - 1}
                                step={1}
                                onValueChange={([val]) => { setCurrentStepIndex(val); setIsPlaying(false); }}
                            />
                        </div>

                        <div className="text-xs text-slate-400 w-16 text-right font-mono">
                            Step {currentStepIndex + 1}/{steps.length}
                        </div>
                    </div>
                </Card>

                {/* Info & Mentor Panel */}
                <div className="flex flex-col gap-6">
                    {/* Step Explanation */}
                    <Card className="p-5 border-slate-800 bg-slate-900/50">
                        <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                            {currentStep.explanation?.type === "error" && <ShieldAlert className="text-red-500 h-5 w-5" />}
                            {currentStep.explanation?.type === "success" && <BadgeCheck className="text-green-500 h-5 w-5" />}
                            {currentStep.explanation?.title}
                        </h3>
                        <p className="text-sm text-slate-300 leading-relaxed">
                            {currentStep.explanation?.content}
                        </p>

                        {/* Show data from any active/compromised server node as "Code/Query" */}
                        {currentStep.state.nodes
                            .filter(n => (n.type === "server" || n.type === "database" || n.type === "client") && n.data)
                            .map(node => (
                                <div key={node.id} className="mt-4 p-3 bg-black/50 rounded border border-slate-800 font-mono text-xs text-blue-300 overflow-x-auto">
                                    <div className="text-[10px] text-slate-500 mb-1 uppercase tracking-wider">{node.label} Data:</div>
                                    {node.data}
                                </div>
                            ))
                        }
                    </Card>

                    {/* AI Mentor Placeholder */}
                    <Card className="flex-1 p-5 border-slate-800 bg-slate-900/50 flex flex-col">
                        <div className="flex items-center gap-2 mb-4">
                            <Shield className="h-5 w-5 text-purple-400" />
                            <h3 className="font-semibold text-slate-200">Security Mentor</h3>
                        </div>
                        <div className="flex-1 bg-slate-950/50 rounded-lg p-4 mb-4 text-sm text-slate-400">
                            {mode === "attack"
                                ? "Asking: 'What defensive principle was violated here?'"
                                : "Asking: 'Why does a Prepared Statement prevent this attack?'"
                            }
                            <br /><br />
                            <span className="italic opacity-70">
                                This is where the AI Socratic teaching loop will happen.
                            </span>
                        </div>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Ask about this vulnerability..."
                                className="flex-1 bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-purple-500"
                            />
                            <Button size="sm" variant="secondary">Ask</Button>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
