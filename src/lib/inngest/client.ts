// Frontend event sender - calls backend API to trigger Inngest events
// This is needed because the frontend can't directly send to Inngest without an event key

interface InngestEvent {
    name: string;
    data: Record<string, unknown>;
}

class FrontendInngestClient {
    async send(event: InngestEvent): Promise<void> {
        const response = await fetch('/api/inngest-event', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(event),
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Failed to send event');
        }
    }
}

export const inngest = new FrontendInngestClient();
export const inngestClient = inngest;

