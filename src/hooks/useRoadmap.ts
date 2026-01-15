import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

export interface RoadmapItemProgress {
    topic_id: string;
    completed: boolean;
    completed_at?: string;
}

export function useRoadmap() {
    const { user } = useAuth();
    const [roadmapProgress, setRoadmapProgress] = useState<Record<string, RoadmapItemProgress>>({});
    const [loading, setLoading] = useState(true);

    // Fetch roadmap progress from localStorage
    useEffect(() => {
        if (!user) {
            setRoadmapProgress({});
            setLoading(false);
            return;
        }

        const stored = localStorage.getItem(`roadmap_${user.id}`);
        if (stored) {
            const items: RoadmapItemProgress[] = JSON.parse(stored);
            const progressMap: Record<string, RoadmapItemProgress> = {};
            items.forEach(item => {
                progressMap[item.topic_id] = item;
            });
            setRoadmapProgress(progressMap);
        }
        setLoading(false);
    }, [user]);

    const toggleTopicCompletion = async (topicId: string, completed: boolean) => {
        if (!user) return;

        const now = new Date().toISOString();
        const newProgress: RoadmapItemProgress = {
            topic_id: topicId,
            completed,
            completed_at: completed ? now : undefined,
        };

        const newState = {
            ...roadmapProgress,
            [topicId]: newProgress
        };

        setRoadmapProgress(newState);
        localStorage.setItem(`roadmap_${user.id}`, JSON.stringify(Object.values(newState)));
    };

    const isTopicCompleted = (topicId: string): boolean => {
        return !!roadmapProgress[topicId]?.completed;
    };

    return { roadmapProgress, loading, toggleTopicCompletion, isTopicCompleted };
}
