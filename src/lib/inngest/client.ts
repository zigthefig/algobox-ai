import { Inngest } from "inngest";

// valid event keys:
type Events = {
    "user.completed.lab": {
        data: {
            userId: string;
            labId: string;
            score: number;
        };
    };
    "ai.requested": {
        data: {
            userId: string;
            prompt: string;
            context?: string;
        }
    }
};

export const inngest = new Inngest({
    id: "algobox-ai",
    schemas: {
        events: {} as Events,
    },
});
