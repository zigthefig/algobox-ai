import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { analytics } from "@/lib/analytics";

export function AnalyticsListener() {
    const location = useLocation();

    useEffect(() => {
        analytics.page(location.pathname);
    }, [location]);

    return null;
}
