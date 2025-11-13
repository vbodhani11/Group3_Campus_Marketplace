export type ListingCategory = "electronics" | "books" | "furniture" | "other";

export type Listing = {
  id: string;
  title: string;
  price: number;
  category: ListingCategory;
  imageUrl?: string;
  description?: string;
  createdAt: string;
};

// DB row shape from Supabase "listings" table (subset you care about)
export type ListingRow = {
  id: string;
  product_id: string;
  category: string;
  title: string;
  description: string | null;
  condition: string;
  status: string;
  price: string; // numeric in DB → string in JS
  currency: string;
  quantity: number;
  is_negotiable: boolean;
  image_urls: string[] | null;
  thumbnail_url: string | null;
  tags: string[] | null;
  location_text: string | null;
  shipping_available: boolean;
  shipping_cost: string | null;
  views_count: number;
  favorites_count: number;
  created_at: string;
};

// Mapper: Supabase row → UI Listing
export function mapListingRowToListing(row: ListingRow): Listing {
  return {
    id: row.id,
    title: row.title,
    price: Number(row.price),
    category: (row.category as ListingCategory) ?? "other",
    imageUrl: row.thumbnail_url ?? (row.image_urls?.[0] ?? undefined),
    description: row.description ?? undefined,
    createdAt: row.created_at,
  };
}
