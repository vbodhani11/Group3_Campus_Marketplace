import { useMemo, useState } from "react";
import "../../style/admin-listings.scss";

type ListingStatus = "Active" | "Pending" | "Sold" | "Rejected";
type Category = "Electronics" | "Books" | "Furniture" | "Clothing";

type Listing = {
  id: string;
  title: string;
  condition: "Like New" | "Good" | "Used";
  seller: { name: string; email: string };
  category: Category;
  price: number;
  status: ListingStatus;
  views: number;
};

const INITIAL_LISTINGS: Listing[] = [
  {
    id: "1",
    title: "MacBook Pro 2021 M1",
    condition: "Like New",
    seller: { name: "John Doe", email: "john@campus.edu" },
    category: "Electronics",
    price: 1200,
    status: "Active",
    views: 156,
  },
  {
    id: "2",
    title: "Calculus Textbook 8th Edition",
    condition: "Good",
    seller: { name: "Jane Smith", email: "jane@campus.edu" },
    category: "Books",
    price: 45,
    status: "Active",
    views: 89,
  },
  {
    id: "3",
    title: "Dorm Room Desk",
    condition: "Used",
    seller: { name: "Bob Johnson", email: "bob@campus.edu" },
    category: "Furniture",
    price: 80,
    status: "Pending",
    views: 34,
  },
  {
    id: "4",
    title: "Winter Jacket – North Face",
    condition: "Good",
    seller: { name: "Alice Williams", email: "alice@campus.edu" },
    category: "Clothing",
    price: 60,
    status: "Active",
    views: 67,
  },
  {
    id: "5",
    title: "iPhone 13 128GB",
    condition: "Good",
    seller: { name: "Charlie Brown", email: "charlie@campus.edu" },
    category: "Electronics",
    price: 550,
    status: "Sold",
    views: 234,
  },
  {
    id: "6",
    title: "Mini Fridge",
    condition: "Good",
    seller: { name: "Emma Davis", email: "emma@campus.edu" },
    category: "Furniture",
    price: 100,
    status: "Active",
    views: 122,
  },
  {
    id: "7",
    title: "Graphics Calculator TI-84",
    condition: "Used",
    seller: { name: "Michael Chen", email: "michael@campus.edu" },
    category: "Electronics",
    price: 85,
    status: "Rejected",
    views: 45,
  },
  {
    id: "8",
    title: "Organic Chemistry Study Guide",
    condition: "Like New",
    seller: { name: "Sarah Anderson", email: "sarah@campus.edu" },
    category: "Books",
    price: 25,
    status: "Active",
    views: 78,
  },
];

function Avatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return <div className="av">{initials}</div>;
}

function Badge({ status }: { status: ListingStatus }) {
  return <span className={`badge badge--${status.toLowerCase()}`}>{status}</span>;
}

function Pill({ text }: { text: string }) {
  return <span className="pill">{text}</span>;
}

function EyeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
      <path
        d="M12 5C7 5 2.73 8.11 1 12c1.73 3.89 6 7 11 7s9.27-3.11 11-7c-1.73-3.89-6-7-11-7Zm0 11a4 4 0 1 1 0-8 4 4 0 0 1 0 8Z"
        fill="currentColor"
      />
    </svg>
  );
}

function Kebab() {
  return (
    <button className="kebab" aria-label="Actions">
      <span />
      <span />
      <span />
    </button>
  );
}

const TABS: Array<{ key: "all" | ListingStatus; label: string; dot?: number }> = [
  { key: "all", label: "All Listings" },
  { key: "Active", label: "Active" },
  { key: "Pending", label: "Pending", dot: 1 },
  { key: "Sold", label: "Sold" },
  { key: "Rejected", label: "Rejected" },
];

export default function Listings() {
  const [query, setQuery] = useState("");
  const [statusTab, setStatusTab] = useState<"all" | ListingStatus>("all");
  const [category, setCategory] = useState<"All" | Category>("All");

  const filtered = useMemo(() => {
    return INITIAL_LISTINGS.filter((l) => {
      const matchesStatus = statusTab === "all" ? true : l.status === statusTab;
      const matchesCat = category === "All" ? true : l.category === category;
      const q = query.trim().toLowerCase();
      const matchesQ =
        q.length === 0 ||
        l.title.toLowerCase().includes(q) ||
        l.seller.name.toLowerCase().includes(q) ||
        l.seller.email.toLowerCase().includes(q);
      return matchesStatus && matchesCat && matchesQ;
    });
  }, [query, statusTab, category]);

  const totals = useMemo(() => {
    const active = INITIAL_LISTINGS.filter((l) => l.status === "Active").length;
    const sold = INITIAL_LISTINGS.filter((l) => l.status === "Sold");
    const totalValue = sold.reduce((s, l) => s + l.price, 0);
    return { total: INITIAL_LISTINGS.length, active, pending: 1, value: totalValue };
  }, []);

  return (
    <div className="admin-listings">
      <h1 className="page-title">Listings</h1>

      {/* KPI cards */}
      <section className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-head">Total Listings</div>
          <div className="kpi-num">{totals.total}</div>
          <div className="kpi-sub">+18 from last week</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-head">Active Listings</div>
          <div className="kpi-num">{totals.active}</div>
          <div className="kpi-sub">63% of total</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-head">Pending Review</div>
          <div className="kpi-num">{totals.pending}</div>
          <div className="kpi-sub">Require approval</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-head">Total Value</div>
          <div className="kpi-num">${totals.value}</div>
          <div className="kpi-sub">From sold items</div>
        </div>
      </section>

      {/* Manage Listings block */}
      <section className="block">
        <div className="block-head">
          <div>
            <div className="block-title">Manage Listings</div>
            <div className="block-sub">Review and manage all marketplace listings</div>
          </div>
          <button className="btn btn--ghost">
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
              <path d="M5 20h14a1 1 0 0 0 1-1v-2H4v2a1 1 0 0 0 1 1Zm14-12h-4V4h-6v4H5l7 7 7-7Z" fill="currentColor" />
            </svg>
            Export
          </button>
        </div>

        {/* Tabs */}
        <div className="tabs">
          {TABS.map((t) => (
            <button
              key={t.key}
              className={`tab ${statusTab === t.key ? "is-active" : ""}`}
              onClick={() => setStatusTab(t.key as any)}
            >
              {t.label}
              {typeof t.dot === "number" && <span className="tab-dot">{t.dot}</span>}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="filters">
          <div className="search">
            <span className="search-icon" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by title, description, or seller..."
            />
          </div>

          <div className="filter">
            <button className="filter-btn">
              <span className="filter-icon" />
              {category === "All" ? "All Categories" : category}
              <span className="caret" />
            </button>
            <div className="filter-menu">
              {(["All", "Electronics", "Books", "Furniture", "Clothing"] as const).map((c) => (
                <div key={c} className="filter-item" onClick={() => (setCategory(c as any))}>
                  {c}
                </div>
              ))}
            </div>
          </div>

          <div className="filter disabled">
            <button className="filter-btn">
              <span className="filter-icon" />
              All Status
              <span className="caret" />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="table">
          <div className="tr th">
            <div className="td chk">
              <input type="checkbox" />
              <span>Listing</span>
            </div>
            <div className="td seller">Seller</div>
            <div className="td category">Category</div>
            <div className="td price">Price</div>
            <div className="td status">Status</div>
            <div className="td views">Views</div>
            <div className="td actions">Actions</div>
          </div>

          {filtered.map((l) => (
            <div className="tr" key={l.id}>
              <div className="td chk">
                <input type="checkbox" />
                <div className="thumb" />
                <div className="listing">
                  <div className="title">{l.title}</div>
                  <div className="sub">{l.condition}</div>
                </div>
              </div>

              <div className="td seller">
                <Avatar name={l.seller.name} />
                <div className="seller-info">
                  <div className="seller-name">{l.seller.name}</div>
                  <div className="seller-mail">{l.seller.email}</div>
                </div>
              </div>

              <div className="td category">
                <Pill text={l.category} />
              </div>

              <div className="td price">${l.price}</div>

              <div className="td status">
                <Badge status={l.status} />
              </div>

              <div className="td views">
                <EyeIcon />
                <span>{l.views}</span>
              </div>

              <div className="td actions">
                <Kebab />
              </div>
            </div>
          ))}

          <div className="tfoot">
            <div>Showing {filtered.length} of {INITIAL_LISTINGS.length} listings</div>
            <div className="pager">
              <button className="btn btn--ghost" disabled>Previous</button>
              <button className="btn btn--ghost">Next</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
