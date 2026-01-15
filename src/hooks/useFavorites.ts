import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export function useFavorites() {
    const { user } = useAuth();
    const [favorites, setFavorites] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);

    // Fetch user's favorites from localStorage
    useEffect(() => {
        if (!user) {
            setFavorites(new Set());
            setLoading(false);
            return;
        }

        const stored = localStorage.getItem(`favorites_${user.id}`);
        if (stored) {
            setFavorites(new Set(JSON.parse(stored)));
        }
        setLoading(false);
    }, [user]);

    const toggleFavorite = async (problemId: string) => {
        if (!user) {
            toast.error("Please login to save favorites");
            return;
        }

        const isFavorited = favorites.has(problemId);
        const newFavorites = new Set(favorites);

        if (isFavorited) {
            newFavorites.delete(problemId);
            toast.success("Removed from favorites");
        } else {
            newFavorites.add(problemId);
            toast.success("Added to favorites");
        }

        setFavorites(newFavorites);
        localStorage.setItem(`favorites_${user.id}`, JSON.stringify([...newFavorites]));
    };

    const isFavorite = (problemId: string): boolean => {
        return favorites.has(problemId);
    };

    return { favorites, loading, toggleFavorite, isFavorite };
}
