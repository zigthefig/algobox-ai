import { inngest } from "../src/lib/inngest/client";

export const config = {
    runtime: 'edge',
};

export default async function handler(req: Request) {
    if (req.method !== 'POST') {
        return new Response("Method not allowed", { status: 405 });
    }

    try {
        const { name, data } = await req.json();

        if (!name || !data) {
            return new Response("Missing name or data", { status: 400 });
        }

        // Security: In a real app, verify Supabase auth token here from req.headers.get("Authorization")

        await inngest.send({
            name: name,
            data: data,
        });

        return new Response(JSON.stringify({ success: true, eventId: name }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (err) {
        console.error("Event Emit Error:", err);
        return new Response(JSON.stringify({ error: "Failed to emit event" }), { status: 500 });
    }
}
