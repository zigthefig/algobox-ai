import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { PROBLEMS } from "@/lib/problems/problemLibrary";
import { subDays, format, isSameDay } from "date-fns";

// Local storage based analytics until database tables are set up
interface ProgressItem {
    problem_id: string;
    status: "not_started" | "attempted" | "solved";
    solved_at?: string;
    updated_at: string;
}

export interface AnalyticsData {
    totalProblems: number;
    solvedCount: number;
    attemptedCount: number;
    successRate: number;
    thisWeekCount: number;
    avgTimePerProblem: string;
    currentStreak: number;
    longestStreak: number;
    weeklyActivity: { day: string; problems: number; date: Date }[];
    skillBreakdown: { name: string; level: number; total: number; solved: number }[];
    loading: boolean;
}

export function useAnalytics() {
    const { user } = useAuth();
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }

        const fetchAnalytics = async () => {
            // Use localStorage for now until database tables are created
            const stored = localStorage.getItem(`progress_${user.id}`);
            const progressData: ProgressItem[] = stored ? JSON.parse(stored) : [];

            // 1. Basic Counts
            const totalProblems = progressData.length;
            const solvedProblems = progressData.filter(p => p.status === "solved");
            const solvedCount = solvedProblems.length;
            const attemptedCount = totalProblems - solvedCount;
            const successRate = totalProblems > 0 ? Math.round((solvedCount / totalProblems) * 100) : 0;

            // 2. Weekly Activity (Last 7 days)
            const today = new Date();
            const weeklyActivity = Array.from({ length: 7 }).map((_, i) => {
                const d = subDays(today, 6 - i);
                const dayLabel = format(d, "EEE");
                const count = progressData.filter(p => {
                    const pDate = new Date(p.solved_at || p.updated_at);
                    return isSameDay(pDate, d);
                }).length;

                return { day: dayLabel, problems: count, date: d };
            });

            const thisWeekCount = weeklyActivity.reduce((acc, d) => acc + d.problems, 0);

            // 3. Skill Breakdown
            const allTags = new Set<string>();
            PROBLEMS.forEach(p => {
                p.tags.forEach(t => allTags.add(t));
            });

            const tagTotals: Record<string, number> = {};
            PROBLEMS.forEach(p => {
                p.tags.forEach(t => {
                    tagTotals[t] = (tagTotals[t] || 0) + 1;
                });
            });

            const tagSolved: Record<string, number> = {};
            solvedProblems.forEach(sp => {
                const problem = PROBLEMS.find(p => p.id === sp.problem_id);
                if (problem) {
                    problem.tags.forEach(t => {
                        tagSolved[t] = (tagSolved[t] || 0) + 1;
                    });
                }
            });

            let skillBreakdown = Array.from(allTags).map(tag => {
                const total = tagTotals[tag] || 0;
                const solved = tagSolved[tag] || 0;
                const level = total > 0 ? Math.round((solved / total) * 100) : 0;
                return { name: tag, level, total, solved };
            });

            skillBreakdown.sort((a, b) => b.level - a.level);
            skillBreakdown = skillBreakdown.slice(0, 6);

            // 4. Streaks
            const solvedDates = solvedProblems
                .map(p => new Date(p.solved_at || p.updated_at))
                .filter(d => !isNaN(d.getTime()))
                .sort((a, b) => b.getTime() - a.getTime());

            let currentStreak = 0;
            const uniqueDates = new Set(solvedDates.map(d => format(d, 'yyyy-MM-dd')));

            if (uniqueDates.has(format(today, 'yyyy-MM-dd'))) {
                currentStreak++;
                let d = subDays(today, 1);
                while (uniqueDates.has(format(d, 'yyyy-MM-dd'))) {
                    currentStreak++;
                    d = subDays(d, 1);
                }
            } else {
                let d = subDays(today, 1);
                while (uniqueDates.has(format(d, 'yyyy-MM-dd'))) {
                    currentStreak++;
                    d = subDays(d, 1);
                }
            }

            setData({
                totalProblems,
                solvedCount,
                attemptedCount,
                successRate,
                thisWeekCount,
                avgTimePerProblem: "N/A",
                currentStreak,
                longestStreak: currentStreak,
                weeklyActivity,
                skillBreakdown,
                loading: false
            });
            setLoading(false);
        };

        fetchAnalytics();
    }, [user]);

    return { data, loading };
}
