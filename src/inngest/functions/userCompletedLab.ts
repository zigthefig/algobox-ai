import { inngest } from "../../lib/inngest/client.js";

export const userCompletedLab = inngest.createFunction(
    { id: "user-completed-lab" },
    { event: "user.completed.lab" },
    async ({ event, step }) => {

        // 1. Simulate AI Analysis
        const analysis = await step.run("analyze-submission", async () => {
            // Mocking AI delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            return {
                quality: "High",
                securityScore: 95,
                suggestions: ["Good use of input validation", "Consider strict typing"]
            };
        });

        // 2. Update DB (Simulated)
        await step.run("update-user-profile", async () => {
            console.log(`Updating XP for user ${event.data.userId} based on score ${event.data.score}`);
        });

        // 3. Send Notification (Simulated)
        await step.run("send-congrats-email", async () => {
            console.log(`Sending email to user ${event.data.userId}`);
        });

        return { success: true, analysis };
    }
);
