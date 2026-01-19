import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ALL_CHALLENGES } from "./challengeRegistry";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AnimatedCard, MagneticButton, RevealText } from "@/components/ui/AnimatedComponents";
import { Play, RotateCcw, CheckCircle, XCircle, Lightbulb, Code } from "lucide-react";
import Editor from "@monaco-editor/react";

interface CyberPracticeProps {
    labId?: string;
}

import { useAuth } from "@/contexts/AuthContext";

export function CyberPractice({ labId }: CyberPracticeProps) {
    const { user } = useAuth();
    const [currentChallengeId, setCurrentChallengeId] = useState<string | null>(null);

    // Sync when prop changes
    useEffect(() => {
        if (labId) {
            const match = ALL_CHALLENGES.find(c => c.id === labId);
            if (match) {
                setCurrentChallengeId(match.id);
            } else {
                setCurrentChallengeId(null);
            }
        } else {
            setCurrentChallengeId(ALL_CHALLENGES[0].id);
        }
    }, [labId]);

    const currentChallenge = ALL_CHALLENGES.find(c => c.id === currentChallengeId);

    // State for the editor
    const [code, setCode] = useState("");
    const [results, setResults] = useState<{ name: string; passed: boolean; message?: string }[] | null>(null);
    const [showHints, setShowHints] = useState(false);

    // Reset editor when challenge changes
    useEffect(() => {
        if (currentChallenge) {
            setCode(currentChallenge.vulnerableCode);
            setResults(null);
            setShowHints(false);
        }
    }, [currentChallengeId]);

    const [isSubmitting, setIsSubmitting] = useState(false);

    const runTests = async () => {
        if (!currentChallenge) return;
        const testResults = currentChallenge.verify(code);
        setResults(testResults);

        const allPassed = testResults.every(r => r.passed);

        if (allPassed && user) {
            setIsSubmitting(true);
            try {
                const response = await fetch('/api/go/cyber', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userId: user.id,
                        labId: currentChallenge.id,
                        submissionId: `${currentChallenge.id}-${Date.now()}`,
                        score: 100 // Full points for passing
                    })
                });

                if (response.ok) {
                    toast.success("Security Patch Deployed!", { description: "Analysis queued with AI security auditor." });
                } else {
                    console.error("Failed to record completion");
                }
            } catch (error) {
                console.error("API Error", error);
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    const resetCode = () => {
        if (!currentChallenge) return;
        setCode(currentChallenge.vulnerableCode);
        setResults(null);
    };

    const isSuccess = results?.every(r => r.passed);

    // Handle "Not Found / Coming Soon" State
    if (!currentChallenge) {
        return (
            <div className="h-full flex flex-col items-center justify-center p-6 text-center space-y-4">
                <div className="p-6 rounded-full bg-slate-900/50 border border-slate-800">
                    <Code className="h-12 w-12 text-slate-500" />
                </div>
                <h2 className="text-2xl font-bold text-slate-200">Challenge Under Construction</h2>
                <p className="text-slate-400 max-w-md">
                    The defensive coding challenge for this scenario is currently being developed by our security engineers.
                </p>
                <div className="flex gap-2 mt-4">
                    <p className="text-sm text-slate-500">Try these available challenges instead:</p>
                </div>
                <div className="flex gap-2">
                    {ALL_CHALLENGES.map(c => (
                        <Button
                            key={c.id}
                            variant="secondary"
                            size="sm"
                            onClick={() => setCurrentChallengeId(c.id)}
                        >
                            {c.title}
                        </Button>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col gap-6 p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <RevealText delay={0.1}>{currentChallenge.title}</RevealText>
                        <Badge variant="outline" className="text-yellow-400 border-yellow-400/50 animate-pulse">
                            {currentChallenge.difficulty}
                        </Badge>
                    </h2>
                    <p className="text-slate-400 mt-1">{currentChallenge.description}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0">
                {/* Editor Column */}
                <AnimatedCard className="flex flex-col bg-[#1e1e1e] border-slate-800 overflow-hidden" delay={0.2} glowColor="#3b82f6">
                    <div className="p-2 bg-[#252526] flex justify-between items-center border-b border-slate-700">
                        <span className="text-xs text-slate-400 px-2">vulnerable_app.js</span>
                        <Button size="sm" variant="ghost" onClick={resetCode} title="Reset Code">
                            <RotateCcw className="h-4 w-4" />
                        </Button>
                    </div>
                    <div className="flex-1">
                        <Editor
                            height="100%"
                            defaultLanguage="javascript"
                            theme="vs-dark"
                            value={code}
                            onChange={(val) => setCode(val || "")}
                            options={{
                                minimap: { enabled: false },
                                fontSize: 14,
                                scrollBeyondLastLine: false,
                            }}
                        />
                    </div>
                </AnimatedCard>

                {/* Instructions & Runner Column */}
                <div className="flex flex-col gap-6">
                    <AnimatedCard className="p-6 bg-slate-900/50 border-slate-800" delay={0.3}>
                        <h3 className="font-semibold text-lg mb-4">Mission Instructions</h3>
                        <div className="text-slate-300 text-sm whitespace-pre-line leading-relaxed">
                            {currentChallenge.instructions}
                        </div>

                        <div className="mt-6 flex gap-3">
                            <Button onClick={() => setShowHints(!showHints)} variant="ghost" className="text-blue-400 hover:text-blue-300 hover:bg-blue-400/10">
                                <Lightbulb className="w-4 h-4 mr-2" />
                                {showHints ? "Hide Hints" : "Need a Hint?"}
                            </Button>
                        </div>

                        {showHints && (
                            <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-200 text-sm animate-in fade-in slide-in-from-top-2 duration-300">
                                <ul className="list-disc pl-4 space-y-1">
                                    {currentChallenge.hints.map((hint, i) => (
                                        <li key={i}>{hint}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </AnimatedCard>

                    <div className="flex-1 flex flex-col gap-4">
                        <MagneticButton className="w-full">
                            <Button onClick={runTests} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-6 shadow-lg shadow-green-900/20">
                                <Play className="w-5 h-5 mr-2" />
                                Deploy Fix & Run Tests
                            </Button>
                        </MagneticButton>

                        {results && (
                            <AnimatedCard className="p-6 bg-black/40 border-slate-800 flex-1 overflow-auto" delay={0.1} glowColor={isSuccess ? "#22c55e" : "#ef4444"}>
                                <h3 className="font-semibold mb-4 text-slate-200">Test Results</h3>
                                <div className="space-y-3">
                                    {results.map((result, idx) => (
                                        <div key={idx} className={`p-3 rounded border flex items-start gap-3 ${result.passed ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                                            {result.passed ? <CheckCircle className="w-5 h-5 text-green-500 shrink-0" /> : <XCircle className="w-5 h-5 text-red-500 shrink-0" />}
                                            <div>
                                                <div className={`font-medium ${result.passed ? 'text-green-400' : 'text-red-400'}`}>{result.name}</div>
                                                <div className="text-xs text-slate-400 mt-1">{result.message}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {isSuccess && (
                                    <div className="mt-6 p-4 bg-green-500/20 border border-green-500 rounded text-center animate-bounce">
                                        <p className="text-green-400 font-bold text-lg">🎉 Vulnerability Patched!</p>
                                        <p className="text-sm text-green-300">System is now secure against XSS.</p>
                                    </div>
                                )}
                            </AnimatedCard>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
