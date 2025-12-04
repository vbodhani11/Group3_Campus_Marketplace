import { type Listing } from "../lib/listings";
type UseListingsResult = {
    listings: Listing[];
    loading: boolean;
    error: string | null;
};
export declare function useListings(): UseListingsResult;
export {};
