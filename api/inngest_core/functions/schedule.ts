import { inngest } from "../client.js";
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

// Initialize clients
const resend = new Resend(process.env.RESEND_API_KEY);
const supabase = createClient(
    process.env.VITE_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || ''
);

export const weeklyProgressReport = inngest.createFunction(
    { id: "weekly-progress-report" },
    { cron: "0 9 * * 1" }, // Every Monday at 9:00 AM
    async ({ step }) => {

        // Step 1: Fetch all active users
        const users = await step.run("fetch-active-users", async () => {
            const { data, error } = await supabase
                .from('profiles')
                .select('id, username, full_name, score')
                .gt('score', 0);

            if (error) {
                console.error("Error fetching users:", error);
                return [];
            }
            return data || [];
        });

        // Step 2: Trigger individual report generation events
        const events = users.map(user => ({
            name: "user.weekly.report" as const,
            data: { userId: user.id, username: user.username, score: user.score }
        }));

        if (events.length > 0) {
            await step.sendEvent("trigger-user-reports", events);
        }

        return { usersProcessed: users.length };
    }
);

// Listener for individual user report generation
export const generateUserWeeklyReport = inngest.createFunction(
    {
        id: "generate-user-weekly-report",
        concurrency: { limit: 5 },
        rateLimit: { key: "event.data.userId", limit: 1, period: "1m" }
    },
    { event: "user.weekly.report" },
    async ({ event, step }) => {
        const { userId, username, score } = event.data;

        // Step 1: Calculate weekly stats
        const weeklyStats = await step.run("compile-report-data", async (): Promise<{ solved: number; attempted: number; rank: number; totalScore: number }> => {
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

            const { data: weekActivity, error } = await supabase
                .from('problem_progress')
                .select('problem_id, status, solved_at')
                .eq('user_id', userId)
                .gte('solved_at', oneWeekAgo.toISOString());

            if (error) return { solved: 0, attempted: 0, rank: 0, totalScore: score || 0 };

            const solved = weekActivity?.filter(p => p.status === 'solved').length || 0;
            const attempted = weekActivity?.length || 0;

            // Get rank
            const { data: rankings } = await supabase
                .from('profiles')
                .select('id')
                .order('score', { ascending: false });

            const rank = (rankings?.findIndex(p => p.id === userId) ?? -1) + 1;

            return { solved, attempted, rank, totalScore: score ?? 0 };
        });

        // Step 2: Get user email and send report
        const userEmail = await step.run("get-user-email", async () => {
            const { data } = await supabase.auth.admin.getUserById(userId);
            return data?.user?.email;
        });

        if (!userEmail) return { skipped: true };

        await step.run("send-weekly-email", async () => {
            if (!process.env.RESEND_API_KEY) {
                console.log(`[Mock Weekly Report] To: ${userEmail}`);
                return;
            }

            await resend.emails.send({
                from: 'Algobox <onboarding@resend.dev>',
                to: userEmail,
                subject: `📊 Your Weekly Algobox Report - ${weeklyStats.solved} problems solved!`,
                html: `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <style>
                            body { font-family: 'Segoe UI', Arial, sans-serif; background: #0a0a0a; color: #e5e5e5; margin: 0; padding: 0; }
                            .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
                            .header { text-align: center; margin-bottom: 24px; }
                            .logo { font-size: 28px; font-weight: bold; color: #22d3ee; }
                            .hero { background: linear-gradient(135deg, #1e3a5f, #0f172a); border-radius: 16px; padding: 32px; text-align: center; margin-bottom: 24px; }
                            h1 { color: #22d3ee; margin: 0 0 8px 0; font-size: 24px; }
                            .subtitle { color: #94a3b8; margin: 0; }
                            .stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin: 24px 0; }
                            .stat-card { background: #1a1a2e; border-radius: 12px; padding: 20px; text-align: center; }
                            .stat-value { font-size: 32px; font-weight: bold; color: #22d3ee; }
                            .stat-label { color: #6b7280; font-size: 14px; margin-top: 4px; }
                            .rank-badge { background: linear-gradient(135deg, #f59e0b, #d97706); color: #0a0a0a; padding: 8px 16px; border-radius: 20px; font-weight: 600; display: inline-block; margin-top: 16px; }
                            .cta { display: inline-block; background: linear-gradient(135deg, #22d3ee, #06b6d4); color: #0a0a0a; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 24px; }
                            .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 32px; }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <div class="header">
                                <span class="logo">⚡ Algobox Weekly</span>
                            </div>
                            
                            <div class="hero">
                                <h1>Great work this week, ${username || 'Developer'}! 🎉</h1>
                                <p class="subtitle">Here's your progress summary for the past 7 days</p>
                                
                                <div class="stats-grid">
                                    <div class="stat-card">
                                        <div class="stat-value">${weeklyStats.solved}</div>
                                        <div class="stat-label">Problems Solved</div>
                                    </div>
                                    <div class="stat-card">
                                        <div class="stat-value">${weeklyStats.totalScore}</div>
                                        <div class="stat-label">Total XP</div>
                                    </div>
                                </div>
                                
                                ${weeklyStats.rank > 0 ? `<div class="rank-badge">🏆 Rank #${weeklyStats.rank} on Leaderboard</div>` : ''}
                                
                                <a href="https://algobox.ai/dashboard" class="cta">View Full Stats →</a>
                            </div>
                            
                            <div class="footer">
                                <p>Keep up the momentum! Every problem you solve brings you closer to mastery.</p>
                                <p><a href="https://algobox.ai/settings" style="color: #6b7280;">Manage email preferences</a></p>
                            </div>
                        </div>
                    </body>
                    </html>
                `
            });
        });

        return { sent: true, stats: weeklyStats };
    }
);
