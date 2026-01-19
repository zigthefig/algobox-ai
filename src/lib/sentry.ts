import * as Sentry from "@sentry/react";

export const initSentry = () => {
    if (import.meta.env.VITE_SENTRY_DSN) {
        Sentry.init({
            dsn: import.meta.env.VITE_SENTRY_DSN,
            integrations: [
                Sentry.browserTracingIntegration(),
                Sentry.replayIntegration({
                    maskAllText: false,
                    blockAllMedia: false,
                }),
            ],
            // Performance Monitoring
            tracesSampleRate: 1.0,
            // Session Replay
            replaysSessionSampleRate: 0.1,
            replaysOnErrorSampleRate: 1.0,

            environment: import.meta.env.MODE,
        });
    } else {
        console.warn("Sentry DSN not found, skipping initialization.");
    }
};

export const captureError = (error: any, context?: Record<string, any>) => {
    console.error("Capturing error to Sentry:", error);
    Sentry.captureException(error, { extra: context });
};
