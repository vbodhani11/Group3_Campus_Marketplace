import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ListingGrid from "../../components/ListingGrid";
import type { Listing } from "../../lib/listings";
import "../../style/Listings.scss";
import { useListings } from "../../lib/UseListing";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

type CategoryFilter = "all" | "electronics" | "books" | "furniture";
type SortOption = "relevance" | "price-asc" | "price-desc" | "newest";

export default function ListingsPage() {
  const { listings, loading, error } = useListings();
  const [searchParams, setSearchParams] = useSearchParams();

  const [searchQuery, setSearchQuery] = useState("");
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [sortOption, setSortOption] = useState<SortOption>("relevance");

  // Category from URL
  const categoryParam = searchParams.get("category");

  const categoryFilter: CategoryFilter =
    categoryParam === "electronics" ||
    categoryParam === "books" ||
    categoryParam === "furniture"
      ? categoryParam
      : "all";

  function updateCategoryFilter(next: CategoryFilter) {
    const params = new URLSearchParams(searchParams);

    if (next === "all") {
      params.delete("category");
    } else {
      params.set("category", next);
    }

    setSearchParams(params);
  }

  const filteredAndSorted = useMemo(() => {
    let result: Listing[] = [...listings];

    // Text search: title + description
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      result = result.filter((listing) => {
        const titleMatch = listing.title.toLowerCase().includes(q);
        const descMatch =
          (listing.description ?? "").toLowerCase().includes(q);
        return titleMatch || descMatch;
      });
    }

    // Category filter
    if (categoryFilter !== "all") {
      result = result.filter((listing) => listing.category === categoryFilter);
    }

    // Price range filter
    const min = minPrice ? Number(minPrice) : null;
    const max = maxPrice ? Number(maxPrice) : null;

    if (min !== null && !Number.isNaN(min)) {
      result = result.filter((listing) => listing.price >= min);
    }
    if (max !== null && !Number.isNaN(max)) {
      result = result.filter((listing) => listing.price <= max);
    }

    // Sorting
    switch (sortOption) {
      case "price-asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "newest":
        result.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() -
            new Date(a.createdAt).getTime()
        );
        break;
      case "relevance":
      default:
        // “Relevance” could be your default order or a future custom score
        break;
    }

    return result;
  }, [
    listings,
    searchQuery,
    categoryFilter,
    minPrice,
    maxPrice,
    sortOption,
  ]);

  return (
    <> 
      <Header />
      <div className="listings-page">
        <div className="listings-page__layout">

          {/* Sidebar Filters */}
          <aside className="listings-page__sidebar">
            <h2 className="listings-page__sidebar-title">Filters</h2>

            {/* Search */}
            <div className="listings-page__filter-group">
              <label className="listings-page__filter-label" htmlFor="search">
                Search
              </label>
              <input
                id="search"
                type="text"
                className="listings-page__search-input"
                placeholder="Search listings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Category */ /*Also the following code is AI generated*/}
            <div className="listings-page__filter-group">
              <span className="listings-page__filter-label">Category</span>
              <div className="listings-page__filter-options">
                <label className="listings-page__radio-option">
                  <input
                    type="radio"
                    name="category"
                    value="all"
                    checked={categoryFilter === "all"}
                    onChange={() => updateCategoryFilter("all")}
                  />
                  <span>All</span>
                </label>
                <label className="listings-page__radio-option">
                  <input
                    type="radio"
                    name="category"
                    value="electronics"
                    checked={categoryFilter === "electronics"}
                    onChange={() => updateCategoryFilter("electronics")}
                  />
                  <span>Electronics</span>
                </label>
                <label className="listings-page__radio-option">
                  <input
                    type="radio"
                    name="category"
                    value="books"
                    checked={categoryFilter === "books"}
                    onChange={() => updateCategoryFilter("books")}
                  />
                  <span>Books</span>
                </label>
                <label className="listings-page__radio-option">
                  <input
                    type="radio"
                    name="category"
                    value="furniture"
                    checked={categoryFilter === "furniture"}
                    onChange={() => updateCategoryFilter("furniture")}
                  />
                  <span>Furniture</span>
                </label>
              </div>
            </div>

            {/* Price range */}
            <div className="listings-page__filter-group">
              <span className="listings-page__filter-label">Price</span>
              <div className="listings-page__price-range">
                <input
                  type="number"
                  className="listings-page__price-input"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                />
                <span className="listings-page__price-separator">–</span>
                <input
                  type="number"
                  className="listings-page__price-input"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                />
              </div>
            </div>
          </aside>

          {/* Main content: sort bar + grid */}
          <main className="listings-page__content">
            <div className="listings-page__toolbar">
              <div className="listings-page__results-count">
                {loading && "Loading..."}
                {error && !loading && `Error: ${error}`}
                {!loading && !error && (
                  <>
                    {filteredAndSorted.length} result
                    {filteredAndSorted.length === 1 ? "" : "s"}
                  </>
                )}
              </div>

              {/* Sorting*/ /*TODO: this is broken now and I don't know why */}
              <div className="listings-page__sort">
                <label
                  className="listings-page__sort-label"
                  htmlFor="sort-select"
                >
                  Sort by:
                </label>
                <select
                  id="sort-select"
                  className="listings-page__sort-select"
                  value={sortOption}
                  onChange={(e) =>
                    setSortOption(e.target.value as SortOption)
                  }
                >
                  <option value="relevance">Relevance</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="newest">Newest</option>
                </select>
              </div>
            </div>

            {!loading && !error && filteredAndSorted.length > 0 && (
              <ListingGrid listings={filteredAndSorted} />
            )}

            {!loading && !error && filteredAndSorted.length === 0 && (
              <div className="listings-page__empty-state">
                No listings match your filters.
              </div>
            )}
          </main>
        </div>
      </div>
      <Footer />
    </>
  );
}
