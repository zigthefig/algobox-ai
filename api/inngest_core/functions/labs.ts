import { inngest } from "../client.js";
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const getSupabase = () => {
    const url = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
    if (!url || !key) return null;
    return createClient(url, key);
};

const supabase = getSupabase();

// 1. Handle Successful Lab Completion
export const userCompletedLab = inngest.createFunction(
    { id: "user-completed-lab" },
    { event: "user.completed.lab" },
    async ({ event, step }) => {
        const { userId, labId, score, labType } = event.data;

        // Step 1: Fetch current user stats from Supabase
        const stats = await step.run("calculate-stats", async () => {
            if (!supabase) {
                return { xpAttempt: score * 10, totalScore: 0, error: "No DB" };
            }

            const { data: profile } = await supabase
                .from('profiles')
                .select('score')
                .eq('id', userId)
                .single();

            return {
                xpAttempt: score * 10,
                totalScore: profile?.score || 0,
            };
        });

        // Step 2: Send congratulatory email if score is high
        if (score >= 90) {
            await step.sendEvent("send-congrats-email", {
                name: "app/send.email",
                data: {
                    to: userId, // Assuming userId maps to email in email handler
                    subject: "High Score Alert! 🚀",
                    template: "high_score_v1",
                    vars: { labId, score: stats.xpAttempt },
                },
            });
        }

        return { success: true, stats };
    }
);

// 2. Handle Cyber Practice Submission (Deep Analysis)
export const cyberPracticeSubmitted = inngest.createFunction(
    {
        id: "cyber-practice-submitted",
        concurrency: { limit: 5 } // Match Inngest free tier limit
    },
    { event: "cyber.practice.submitted" },
    async ({ event, step }) => {
        const { submissionContent, challengeId } = event.data;

        // Step 1: Preliminary Security Scan (Fast)
        const scanResult = await step.run("security-scan", async () => {
            // Simulate RegEx or basic checks
            const hasBasicVuln = /password/i.test(submissionContent);
            return { safe: !hasBasicVuln, issues: hasBasicVuln ? ["Plaintext password detected"] : [] };
        });

        // Step 2: Deep AI Analysis (Slow)
        const aiAnalysis = await step.run("ai-analysis", async () => {
            // Simulate LLM Call
            await new Promise((r) => setTimeout(r, 2000));
            return {
                feedback: "Good attempt, but consider using hashed values for sensitive data.",
                score: scanResult.safe ? 85 : 40,
            };
        });

        // Step 3: Notify User
        await step.sendEvent("notify-result", {
            name: "app/send.email",
            data: {
                to: event.data.userId,
                subject: `Analysis Complete for ${challengeId}`,
                template: "cyber_analysis_v1",
                vars: { analysis: aiAnalysis },
            },
        });

        return { challengeId, analysis: aiAnalysis };
    }
);

// 3. Handle SQL Practice Submission
export const sqlPracticeSubmitted = inngest.createFunction(
    { id: "sql-practice-submitted" },
    { event: "sql.practice.submitted" },
    async ({ event, step }) => {
        // Similar pattern: Validate query -> execution metrics -> store result
        await step.run("record-query-metrics", async () => {
            console.log(`Recorded SQL metric: ${event.data.executionTimeMs}ms`);
        });
        return { status: "recorded" };
    }
);

// 4. Handle AI Mistake Analysis (Triggered on 'user.failed.lab')
export const aiMistakeAnalysis = inngest.createFunction(
    {
        id: "ai-mistake-analysis",
        concurrency: { limit: 3 }, // Rate limit AI calls
        throttle: { limit: 5, period: "1m" } // Stay within free tier
    },
    { event: "user.failed.lab" },
    async ({ event, step }) => {
        const { userId, labId, error, attemptCount } = event.data;

        // Only analyze after 3 failed attempts to save cost
        if (attemptCount < 3) return { skipped: true };

        const analysis = await step.run("analyze-failure-pattern", async () => {
            // Call AI to analyze user's last few attempts (mocked)
            return {
                hint: "You seem to be missing the edge case where input is negative.",
                resource: "https://algobox.ai/learn/edge-cases"
            };
        });

        await step.sendEvent("send-hint", {
            name: "app/send.email",
            data: {
                to: userId,
                subject: "Need a hint? 💡",
                template: "hint_email",
                vars: { hint: analysis.hint, labId }
            }
        });

        return { analyzed: true };
    }
);

// 5. Update User Analytics (Triggered on 'user.completed.lab')
export const updateUserAnalytics = inngest.createFunction(
    { id: "update-user-analytics" },
    { event: "user.completed.lab" },
    async ({ event, step }) => {
        const { userId, labType, score } = event.data;

        await step.run("update-skill-heatmap", async () => {
            // Complex aggregation logic (Mocked)
            console.log(`Updating ${labType} skill heatmap for ${userId} (+${score} points)`);
        });

        await step.run("check-milestones", async () => {
            // Check if user unlocked a new roadmap
            const isMilestone = score > 1000; // Mock condition
            if (isMilestone) {
                return { unlocked: "roadmap_advanced_algo" };
            }
            return null;
        });
    }
);
