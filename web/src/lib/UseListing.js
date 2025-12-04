// src/hooks/useListings.ts
import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import { mapListingRowToListing } from "../lib/listings";
export function useListings() {
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
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
            }
            else {
                const rows = (data ?? []);
                const mapped = rows.map(mapListingRowToListing);
                setListings(mapped);
            }
            setLoading(false);
        }
        fetchListings();
    }, []);
    return { listings, loading, error };
}
