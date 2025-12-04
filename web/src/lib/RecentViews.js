const RECENT_LISTINGS_KEY = "recent_listing_ids";
const MAX_RECENT = 10;
export function addRecentListing(id) {
    try {
        const raw = localStorage.getItem(RECENT_LISTINGS_KEY);
        const existing = raw ? JSON.parse(raw) : [];
        // Remove if already present, then add to front
        const without = existing.filter((x) => x !== id);
        const updated = [id, ...without].slice(0, MAX_RECENT);
        localStorage.setItem(RECENT_LISTINGS_KEY, JSON.stringify(updated));
    }
    catch (err) {
        console.error("Failed to update recent listings", err);
    }
}
export function getRecentListingIds() {
    try {
        const raw = localStorage.getItem(RECENT_LISTINGS_KEY);
        return raw ? JSON.parse(raw) : [];
    }
    catch {
        return [];
    }
}
