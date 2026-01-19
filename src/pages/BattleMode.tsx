
import { useState } from "react";
import { BattleArena } from "@/components/battle/BattleArena";
import { PROBLEMS } from "@/lib/problems/problemLibrary";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Swords } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function BattleMode() {
    const navigate = useNavigate();
    const [selectedProblem, setSelectedProblem] = useState<any>(null);

    // Simple problem selector for beta
    if (!selectedProblem) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
                <div className="text-center space-y-4 mb-12">
                    <div className="h-20 w-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mx-auto flex items-center justify-center shadow-2xl shadow-purple-500/20">
                        <Swords className="h-10 w-10 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                        Algorithm Battle Arena
                    </h1>
                    <p className="text-muted-foreground max-w-md mx-auto">
                        Enter the ring. Solve algorithms side-by-side with our AI.
                        Learn optimization by observing a master.
                    </p>
                </div>

                <div className="grid gap-4 w-full max-w-md">
                    {PROBLEMS.slice(0, 3).map(p => (
                        <Button
                            key={p.id}
                            variant="outline"
                            className="h-14 justify-between px-6 hover:border-purple-500/50 hover:bg-purple-500/5 transition-all group"
                            onClick={() => setSelectedProblem(p)}
                        >
                            <span className="font-medium">{p.title}</span>
                            <span className="text-xs text-muted-foreground group-hover:text-purple-400 uppercase tracking-widest">
                                {p.difficulty}
                            </span>
                        </Button>
                    ))}
                </div>

                <Button variant="ghost" className="mt-8 text-muted-foreground hover:text-white" onClick={() => navigate('/')}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
                </Button>
            </div>
        );
    }

    return (
        <div className="h-screen bg-background flex flex-col">
            <div className="p-2 border-b border-border">
                <Button variant="ghost" size="sm" onClick={() => setSelectedProblem(null)}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Arena Lobby
                </Button>
            </div>
            <BattleArena problem={selectedProblem} />
        </div>
    );
}
