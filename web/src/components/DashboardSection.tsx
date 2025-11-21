import ListingGrid from "./ListingGrid";
import type { Listing } from "../lib/listings";

interface DashboardSectionProps {
    title: string;
    listings: Listing[];
    onSeeAll?: () => void;
}

export default function DashboardSection({title, listings, onSeeAll}: DashboardSectionProps) {
    return (
        <section className="dashboard-section">
        <div className="dashboard-section__header">
            <h2 className="dashboard-section__title">{title}</h2>
            {onSeeAll && (
            <button
                type="button"
                className="dashboard-section__see-all"
                onClick={onSeeAll}
            >
                See all
            </button>
            )}
        </div>

        <ListingGrid listings={listings} />
        </section>
    );
}
