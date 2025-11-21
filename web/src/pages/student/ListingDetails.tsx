/* THIS IS A TEMP AI GENERATED FILE */

import { useParams } from "react-router-dom";
import { useListings } from "../../lib/UseListing";
import type { Listing } from "../../lib/listings";

export default function ListingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { listings, loading, error } = useListings();

  const listing: Listing | undefined = listings.find((l) => l.id === id);

  if (loading) {
    return <div>Loading listing…</div>;
  }

  if (error) {
    return <div>Error loading listing: {error}</div>;
  }

  if (!listing) {
    return <div>Listing not found.</div>;
  }

  return (
    <div style={{ padding: "1.5rem" }}>
      <h1>Listing JSON</h1>
      <pre>
        {JSON.stringify(listing, null, 2)}
      </pre>
    </div>
  );
}
