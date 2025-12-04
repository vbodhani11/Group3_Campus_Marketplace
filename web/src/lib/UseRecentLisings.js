// src/hooks/useRecentListings.ts
import { useMemo } from "react";
import { useListings } from "./UseListing";
import { getRecentListingIds } from "../lib/RecentViews";
export function useRecentListings() {
    const { listings, loading, error } = useListings();
    const ids = getRecentListingIds();
    const recentListings = useMemo(() => {
        if (!ids.length || !listings.length)
            return [];
        return ids
            .map((id) => listings.find((l) => l.id === id))
            .filter((l) => Boolean(l));
    }, [ids, listings]);
    return { recentListings, loading, error };
}
