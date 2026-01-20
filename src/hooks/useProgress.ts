import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

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

    // Fetch user's progress from Supabase and sync with localStorage
    useEffect(() => {
        if (!user) {
            setProgress({});
            setLoading(false);
            return;
        }

        const fetchAndSyncProgress = async () => {
            try {
                // 1. Get local storage data
                const localStored = localStorage.getItem(`progress_${user.id}`);
                const localItems: ProblemProgress[] = localStored ? JSON.parse(localStored) : [];
                const localMap: Record<string, ProblemProgress> = {};
                localItems.forEach(item => localMap[item.problem_id] = item);

                // 2. Get Supabase data
                const { data: dbData, error } = await supabase
                    .from('problem_progress')
                    .select('*');

                if (error) {
                    console.error("Error fetching progress from DB:", error);
                    // Fallback to local
                    setProgress(localMap);
                    setLoading(false);
                    return;
                }

                const dbMap: Record<string, ProblemProgress> = {};
                if (dbData) {
                    dbData.forEach((item: any) => {
                        dbMap[item.problem_id] = {
                            problem_id: item.problem_id,
                            status: item.status as any,
                            code: item.code,
                            language: item.language,
                            solved_at: item.solved_at
                        };
                    });
                }

                // 3. Sync: If local has data but DB doesn't, push local to DB (Migration for existing users)
                const updatesToPush: ProblemProgress[] = [];
                Object.values(localMap).forEach(localItem => {
                    const dbItem = dbMap[localItem.problem_id];
                    // If problem exists locally but not in DB, OR local is 'solved' but DB is not
                    if (!dbItem || (localItem.status === 'solved' && dbItem.status !== 'solved')) {
                        updatesToPush.push(localItem);
                        // Update our 'current' view to match local (since it's newer)
                        dbMap[localItem.problem_id] = localItem;
                    }
                });

                if (updatesToPush.length > 0) {
                    console.log("Syncing local progress to Supabase...", updatesToPush);
                    for (const item of updatesToPush) {
                        await supabase.from('problem_progress').upsert({
                            user_id: user.id,
                            problem_id: item.problem_id,
                            status: item.status,
                            code: item.code,
                            language: item.language,
                            solved_at: item.solved_at
                        });
                    }
                }

                // 4. Set state to the merged/DB version (DB is now source of truth + synced local)
                setProgress(dbMap);

                // 5. Update localStorage to match DB (consistency)
                localStorage.setItem(`progress_${user.id}`, JSON.stringify(Object.values(dbMap)));

            } catch (err) {
                console.error("Sync error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchAndSyncProgress();
    }, [user]);

    // Update progress for a problem (Local + DB)
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
            solved_at: updates.status === "solved" ? (updates.status === existingProgress?.status ? existingProgress.solved_at : now) : existingProgress?.solved_at,
        };

        const newState = {
            ...progress,
            [problemId]: newProgress
        };

        // 1. Optimistic UI update
        setProgress(newState);
        localStorage.setItem(`progress_${user.id}`, JSON.stringify(Object.values(newState)));

        // 2. Write to Supabase
        try {
            const { error } = await supabase.from('problem_progress').upsert({
                user_id: user.id,
                problem_id: problemId,
                status: newProgress.status,
                code: newProgress.code,
                language: newProgress.language,
                solved_at: newProgress.solved_at
            });

            if (error) throw error;

            // 3. Emit Inngest event when problem is newly solved
            const wasPreviouslySolved = existingProgress?.status === "solved";
            if (updates.status === "solved" && !wasPreviouslySolved) {
                import("@/lib/inngest/client").then(({ inngestClient }) => {
                    inngestClient.send({
                        name: "user.completed.lab",
                        data: {
                            userId: user.id,
                            labId: problemId,
                            score: 100, // Base score for solving
                            labType: "algo"
                        }
                    }).catch(() => { }); // Non-blocking, don't fail progress tracking
                });
            }
        } catch (err) {
            console.error("Error saving progress to Supabase:", err);
        }
    };

    const getProgress = (problemId: string): ProblemProgress | null => {
        return progress[problemId] || null;
    };

    const getSolvedCount = (): number => {
        return Object.values(progress).filter(p => p.status === "solved").length;
    };

    return { progress, loading, updateProgress, getProgress, getSolvedCount };
}
