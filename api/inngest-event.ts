import { inngest } from './inngest_core/client.js';
import type { IncomingMessage, ServerResponse } from 'http';

interface VercelRequest extends IncomingMessage {
    body: { name?: string; data?: Record<string, unknown> };
    method?: string;
}

interface VercelResponse extends ServerResponse {
    status: (code: number) => VercelResponse;
    json: (data: unknown) => void;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { name, data } = req.body;

        if (!name || !data) {
            return res.status(400).json({ error: 'Missing event name or data' });
        }

        // Whitelist of allowed events from frontend
        const allowedEvents = ['user.signup', 'user.completed.lab', 'ai.requested'];

        if (!allowedEvents.includes(name)) {
            return res.status(403).json({ error: 'Event not allowed' });
        }

        // Type assertion needed for dynamic event names
        await inngest.send({ name, data } as Parameters<typeof inngest.send>[0]);

        return res.status(200).json({ success: true, event: name });
    } catch (error) {
        console.error('Error sending Inngest event:', error);
        return res.status(500).json({ error: 'Failed to send event' });
    }
}
