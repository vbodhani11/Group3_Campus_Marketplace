import type { Listing } from "../lib/listings";
export declare function useRecentListings(): {
    recentListings: Listing[];
    loading: boolean;
    error: string | null;
};
