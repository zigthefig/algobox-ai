import { inngest } from "../client.js";
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

// Initialize clients
const resend = new Resend(process.env.RESEND_API_KEY);
const supabase = createClient(
    process.env.VITE_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || ''
);

// ============================================
// 1. WELCOME EMAIL - Triggered on user signup
// ============================================
export const welcomeEmail = inngest.createFunction(
    { id: "welcome-email" },
    { event: "user.signup" },
    async ({ event, step }) => {
        const { email, name, userId } = event.data;

        await step.run("send-welcome-email", async () => {
            if (!process.env.RESEND_API_KEY) {
                console.log(`[Mock Welcome Email] To: ${email}`);
                return { messageId: `mock_welcome_${Date.now()}` };
            }

            const { data, error } = await resend.emails.send({
                from: 'Algobox <onboarding@resend.dev>',
                to: email,
                subject: '🚀 Welcome to Algobox - Your Algorithm Journey Starts Now!',
                html: `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <style>
                            body { font-family: 'Segoe UI', Arial, sans-serif; background: #0a0a0a; color: #e5e5e5; margin: 0; padding: 0; }
                            .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
                            .header { text-align: center; margin-bottom: 32px; }
                            .logo { font-size: 32px; font-weight: bold; background: linear-gradient(135deg, #22d3ee, #a855f7); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
                            .hero { background: linear-gradient(135deg, #1e1b4b, #0f172a); border-radius: 16px; padding: 32px; text-align: center; margin-bottom: 24px; }
                            .hero h1 { color: #22d3ee; margin: 0 0 16px 0; font-size: 28px; }
                            .hero p { color: #94a3b8; margin: 0; font-size: 16px; line-height: 1.6; }
                            .cta { display: inline-block; background: linear-gradient(135deg, #22d3ee, #06b6d4); color: #0a0a0a; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 24px 0; }
                            .tips { background: #1a1a2e; border-radius: 12px; padding: 24px; margin-bottom: 24px; }
                            .tips h3 { color: #22d3ee; margin: 0 0 16px 0; }
                            .tip { display: flex; align-items: flex-start; margin-bottom: 12px; }
                            .tip-icon { font-size: 20px; margin-right: 12px; }
                            .tip-text { color: #94a3b8; }
                            .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 32px; }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <div class="header">
                                <span class="logo">⚡ Algobox</span>
                            </div>
                            
                            <div class="hero">
                                <h1>Welcome, ${name || 'Developer'}! 👋</h1>
                                <p>You've just joined thousands of developers mastering algorithms and landing their dream tech jobs.</p>
                            </div>
                            
                            <div class="tips">
                                <h3>Quick Start Tips:</h3>
                                <div class="tip">
                                    <span class="tip-icon">🎯</span>
                                    <span class="tip-text">Start with our <strong>Roadmap</strong> to follow a structured learning path</span>
                                </div>
                                <div class="tip">
                                    <span class="tip-icon">⚔️</span>
                                    <span class="tip-text">Try <strong>Battle Arena</strong> to solve problems side-by-side with AI</span>
                                </div>
                                <div class="tip">
                                    <span class="tip-icon">🏆</span>
                                    <span class="tip-text">Check the <strong>Leaderboard</strong> and climb the ranks!</span>
                                </div>
                            </div>
                            
                            <div style="text-align: center;">
                                <a href="https://algobox.ai/dashboard" class="cta">Start Solving →</a>
                            </div>
                            
                            <div class="footer">
                                <p>You received this email because you signed up for Algobox.</p>
                                <p>© 2026 Algobox. Made with ❤️ for developers.</p>
                            </div>
                        </div>
                    </body>
                    </html>
                `
            });

            if (error) throw new Error(`Resend error: ${error.message}`);
            return { messageId: data?.id };
        });

        return { sent: true };
    }
);

// ============================================
// 2. DAILY STREAK REMINDER - Runs at 8 PM daily
// ============================================
export const dailyStreakReminder = inngest.createFunction(
    { id: "daily-streak-reminder" },
    { cron: "0 20 * * *" }, // Every day at 8 PM server time
    async ({ step }) => {
        // Step 1: Get users who haven't solved today but have an active streak
        const usersToRemind = await step.run("fetch-users-needing-reminder", async () => {
            const today = new Date().toISOString().split('T')[0];

            // Get all users with their last activity
            const { data: profiles, error } = await supabase
                .from('profiles')
                .select('id, username, full_name, score')
                .gt('score', 0); // Only users who have solved at least 1 problem

            if (error || !profiles) return [];

            // Check which users have NOT solved today
            const { data: todayActivity } = await supabase
                .from('problem_progress')
                .select('user_id')
                .gte('solved_at', today + 'T00:00:00Z')
                .eq('status', 'solved');

            const activeToday = new Set((todayActivity || []).map(a => a.user_id));

            // Return users who haven't solved today
            return profiles.filter(p => !activeToday.has(p.id));
        });

        // Step 2: Send reminder to each user
        if (usersToRemind.length > 0) {
            const events = usersToRemind.map(user => ({
                name: "app/send.streak-reminder" as const,
                data: { userId: user.id, username: user.username || user.full_name }
            }));

            await step.sendEvent("send-streak-reminders", events);
        }

        return { remindersQueued: usersToRemind.length };
    }
);

// Handler for individual streak reminder emails
export const sendStreakReminderEmail = inngest.createFunction(
    {
        id: "send-streak-reminder-email",
        concurrency: { limit: 5 }
    },
    { event: "app/send.streak-reminder" },
    async ({ event, step }) => {
        const { userId, username } = event.data;

        // Get user's email from auth
        const userEmail = await step.run("get-user-email", async () => {
            const { data } = await supabase.auth.admin.getUserById(userId);
            return data?.user?.email;
        });

        if (!userEmail) return { skipped: true, reason: "No email found" };

        await step.run("send-streak-email", async () => {
            if (!process.env.RESEND_API_KEY) {
                console.log(`[Mock Streak Reminder] To: ${userEmail}`);
                return;
            }

            await resend.emails.send({
                from: 'Algobox <onboarding@resend.dev>',
                to: userEmail,
                subject: "🔥 Don't break your streak! One problem keeps you going",
                html: `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <style>
                            body { font-family: 'Segoe UI', Arial, sans-serif; background: #0a0a0a; color: #e5e5e5; margin: 0; padding: 0; }
                            .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
                            .hero { background: linear-gradient(135deg, #7c2d12, #1c1917); border-radius: 16px; padding: 32px; text-align: center; }
                            .emoji { font-size: 64px; margin-bottom: 16px; }
                            h1 { color: #fb923c; margin: 0 0 16px 0; }
                            p { color: #94a3b8; line-height: 1.6; }
                            .cta { display: inline-block; background: linear-gradient(135deg, #f97316, #ea580c); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 24px; }
                            .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 32px; }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <div class="hero">
                                <div class="emoji">🔥</div>
                                <h1>Hey ${username || 'there'}, your streak is waiting!</h1>
                                <p>You haven't solved a problem today yet. Just one quick problem keeps your momentum going!</p>
                                <p><strong>Pro tip:</strong> Even a 5-minute practice session counts. Small wins add up!</p>
                                <a href="https://algobox.ai/practice" class="cta">Solve Now →</a>
                            </div>
                            <div class="footer">
                                <p>Don't want streak reminders? <a href="https://algobox.ai/settings" style="color: #6b7280;">Update preferences</a></p>
                            </div>
                        </div>
                    </body>
                    </html>
                `
            });
        });

        return { sent: true };
    }
);
