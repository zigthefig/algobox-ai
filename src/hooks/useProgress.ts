import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

export interface ProblemProgress {
    problem_id: string;
    status: "not_started" | "attempted" | "solved";
    code?: string;
    language?: string;
    solved_at?: string;
}

export function useProgress() {
    const { user } = useAuth();
    const [progress, setProgress] = useState<Record<string, ProblemProgress>>({});
    const [loading, setLoading] = useState(true);

    // Fetch user's progress from localStorage
    useEffect(() => {
        if (!user) {
            setProgress({});
            setLoading(false);
            return;
        }

        const stored = localStorage.getItem(`progress_${user.id}`);
        if (stored) {
            const items: ProblemProgress[] = JSON.parse(stored);
            const progressMap: Record<string, ProblemProgress> = {};
            items.forEach(item => {
                progressMap[item.problem_id] = item;
            });
            setProgress(progressMap);
        }
        setLoading(false);
    }, [user]);

    // Update progress for a problem
    const updateProgress = async (
        problemId: string,
        updates: Partial<Omit<ProblemProgress, "problem_id">>
    ) => {
        if (!user) return;

        const existingProgress = progress[problemId];
        const now = new Date().toISOString();

        const newProgress: ProblemProgress = {
            problem_id: problemId,
            status: updates.status || existingProgress?.status || "attempted",
            code: updates.code || existingProgress?.code,
            language: updates.language || existingProgress?.language,
            solved_at: updates.status === "solved" ? now : existingProgress?.solved_at,
        };

        const newState = {
            ...progress,
            [problemId]: newProgress
        };

        setProgress(newState);
        localStorage.setItem(`progress_${user.id}`, JSON.stringify(Object.values(newState)));
    };

    const getProgress = (problemId: string): ProblemProgress | null => {
        return progress[problemId] || null;
    };

    const getSolvedCount = (): number => {
        return Object.values(progress).filter(p => p.status === "solved").length;
    };

    return { progress, loading, updateProgress, getProgress, getSolvedCount };
}
