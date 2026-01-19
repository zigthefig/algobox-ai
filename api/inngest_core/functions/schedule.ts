import { inngest } from "../client.js";

export const weeklyProgressReport = inngest.createFunction(
    { id: "weekly-progress-report" },
    { cron: "0 9 * * 1" }, // Every Monday at 9:00 AM
    async ({ step }) => {

        // Step 1: Fan-out - Fetch active users and trigger individual reports
        const users = await step.run("fetch-active-users", async () => {
            // Mock DB call to get users who were active last week
            return [{ id: "user_1" }, { id: "user_2" }, { id: "user_3" }];
        });

        // Step 2: Trigger individual report generation events
        const events = users.map(user => ({
            name: "user.weekly.report" as const,
            data: { userId: user.id }
        }));

        // Batch send events (up to 100s at a time is fine)
        await step.sendEvent("trigger-user-reports", events);

        return { usersProcessed: users.length };
    }
);

// Listener for individual user report generation
export const generateUserWeeklyReport = inngest.createFunction(
    {
        id: "generate-user-weekly-report",
        concurrency: { limit: 5 }, // Match Inngest free tier limit
        rateLimit: { key: "event.data.userId", limit: 1, period: "1m" } // Idempotency
    },
    { event: "user.weekly.report" },
    async ({ event, step }) => {
        const userId = event.data.userId || "all";

        await step.run("compile-report-data", async () => {
            // Compile stats...
            // console.log(`Compiling week report for ${userId}`);
        });

        await step.sendEvent("email-report", {
            name: "app/send.email",
            data: {
                to: userId,
                subject: "Your Weekly Algobox Report 📊",
                template: "weekly_report",
                vars: { week: "42" } // Dynamic data
            }
        });
    }
);
