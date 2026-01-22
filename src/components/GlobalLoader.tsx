import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Loader from "@/components/ui/Loader";

export function GlobalLoader() {
    const location = useLocation();
    const [loading, setLoading] = useState(true); // Default true for initial load

    useEffect(() => {
        // Simulate loading on mount (reload)
        const timer = setTimeout(() => setLoading(false), 2000);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        // Simulate loading on route change
        setLoading(true);
        const timer = setTimeout(() => setLoading(false), 800); // Shorter for nav
        return () => clearTimeout(timer);
    }, [location.pathname]);

    if (!loading) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background">
            <Loader />
        </div>
    );
}
