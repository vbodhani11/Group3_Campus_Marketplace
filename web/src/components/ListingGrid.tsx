import ListingCard from "./ListingCard";
import type { Listing } from "../lib/listings";

interface ListingGridProps {
    listings: Listing[];
}

export default function ListingGrid({ listings }: ListingGridProps) {
    return (
        <div className="listing-grid">
        {listings.map((l) => (
            <ListingCard key={l.id} listing={l} />
        ))}
        </div>
    );
}
