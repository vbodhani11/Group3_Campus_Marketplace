// Mapper: Supabase row → UI Listing
export function mapListingRowToListing(row) {
    return {
        id: row.id,
        title: row.title,
        price: Number(row.price),
        category: row.category ?? "other",
        imageUrl: row.thumbnail_url ?? (row.image_urls?.[0] ?? undefined),
        description: row.description ?? undefined,
        createdAt: row.created_at,
    };
}
