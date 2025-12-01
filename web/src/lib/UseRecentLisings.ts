// src/hooks/useRecentListings.ts

import { useMemo } from "react";
import { useListings } from "./UseListing"; 
import type { Listing } from "../lib/listings";
import { getRecentListingIds } from "../lib/RecentViews"; 

export function useRecentListings(): {
  recentListings: Listing[];
  loading: boolean;
  error: string | null;
} {
  const { listings, loading, error } = useListings();
  const ids = getRecentListingIds();

  const recentListings: Listing[] = useMemo(() => {
    if (!ids.length || !listings.length) return [];

    
    return ids
      .map((id) => listings.find((l) => l.id === id))
      .filter((l): l is Listing => Boolean(l));
  }, [ids, listings]);

  return { recentListings, loading, error };
}
