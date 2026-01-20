import { inngest } from "../client.js";
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

// Initialize clients
const resend = new Resend(process.env.VITE_RESEND_API_KEY);
const supabase = createClient(
    process.env.VITE_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || ''
);

// Centralized Notification Handler
export const emailNotification = inngest.createFunction(
    { id: "send-email-notification" },
    { event: "app/send.email" },
    async ({ event, step }) => {
        let { to, subject, template, vars } = event.data;

        // Step 1: Resolve 'to' if it's a User ID (UUID)
        if (to && !to.includes('@')) {
            const resolvedEmail = await step.run("resolve-user-email", async () => {
                const { data } = await supabase.auth.admin.getUserById(to);
                return data?.user?.email;
            });

            if (resolvedEmail) {
                to = resolvedEmail;
            } else {
                return { skipped: true, reason: `Could not resolve email for user ID: ${to}` };
            }
        }

        if (!to) {
            console.log("Skipping email: Missing 'to' field");
            return { skipped: true, reason: "Missing 'to' field" };
        }

        to = to.trim();
        console.log(`Sending email to: '${to}' (Subject: ${subject})`);

        const result = await step.run("send-email-via-resend", async () => {
            // Check if API key is configured
            if (!process.env.VITE_RESEND_API_KEY) {
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
