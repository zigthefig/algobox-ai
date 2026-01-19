import posthog from 'posthog-js';

// Initialize PostHog
export const initAnalytics = () => {
    if (typeof window !== 'undefined') {
        posthog.init(import.meta.env.VITE_POSTHOG_KEY || 'phc_placeholder', {
            api_host: import.meta.env.VITE_POSTHOG_HOST || 'https://app.posthog.com',
            capture_pageview: false, // We will handle this manually for SPA
            persistence: 'localStorage',
        });
    }
};

// Custom hook-like structure related to analytics helper
export const analytics = {
    identify: (userId: string, traits?: Record<string, any>) => {
        posthog.identify(userId, traits);
    },
    reset: () => {
        posthog.reset();
    },
    track: (eventName: string, properties?: Record<string, any>) => {
        posthog.capture(eventName, properties);
    },
    page: (path?: string) => {
        posthog.capture('$pageview', { path });
    }
};
