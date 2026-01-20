import { inngest } from "../client.js";
import { Resend } from 'resend';

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY);

// Centralized Notification Handler
export const emailNotification = inngest.createFunction(
    { id: "send-email-notification" },
    { event: "app/send.email" },
    async ({ event, step }) => {
        const { to, subject, template, vars } = event.data;

        const result = await step.run("send-email-via-resend", async () => {
            // Check if API key is configured
            if (!process.env.RESEND_API_KEY) {
                console.log(`[Mock Email] To: ${to}, Subject: ${subject}`);
                return { messageId: `mock_${Date.now()}` };
            }

            // Send real email via Resend
            const { data, error } = await resend.emails.send({
                from: 'Algobox <onboarding@resend.dev>', // Update with your verified domain
                to: to,
                subject: subject,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #7c3aed;">${subject}</h2>
                        <p>Template: ${template}</p>
                        <pre style="background: #f3f4f6; padding: 16px; border-radius: 8px;">
                            ${JSON.stringify(vars, null, 2)}
                        </pre>
                        <hr style="border: none; border-top: 1px solid #e5e7eb;" />
                        <p style="color: #6b7280; font-size: 12px;">
                            Sent from Algobox AI Learning Platform
                        </p>
                    </div>
                `
            });

            if (error) {
                throw new Error(`Resend error: ${error.message}`);
            }

            return { messageId: data?.id || 'unknown' };
        });

        return { sent: true, id: result.messageId };
    }
);
