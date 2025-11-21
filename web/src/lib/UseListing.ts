// src/hooks/useListings.ts
import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import {type Listing, type ListingRow, mapListingRowToListing } from "../lib/listings";

type UseListingsResult = {
  listings: Listing[];
  loading: boolean;
  error: string | null;
};

export function useListings(): UseListingsResult {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchListings() {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("listings")
        .select("*")
        .eq("status", "active"); // you can tweak this

      if (error) {
        console.error("Error fetching listings:", error);
        setError(error.message);
        setListings([]);
      } else {
        const rows = (data ?? []) as ListingRow[];
        const mapped = rows.map(mapListingRowToListing);
        setListings(mapped);
      }

      setLoading(false);
    }

    fetchListings();
  }, []);

  return { listings, loading, error };
}
