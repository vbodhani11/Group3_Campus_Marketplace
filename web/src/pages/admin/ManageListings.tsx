import { useEffect, useMemo, useState } from "react";
import "../../style/admin-listings.scss";
import { supabase } from "../../lib/supabaseClient";

/** === DB shapes (based on your screenshots) === */
type DbListing = {
  id: string;
  product_id: string | null;
  category: string | null;
  title: string;
  description: string | null;
  condition: "like_new" | "good" | "used" | string;
  status: "active" | "pending" | "sold" | "rejected" | "draft" | string;
  price: number | string | null;
  currency: string | null;
  thumbnail_url: string | null;
  views_count: number | null;
  seller_id: string | null;
  created_at: string;
};

type DbUser = {
  id: string;
  full_name: string | null;
  email: string | null;
};

/** === UI types === */
type ListingStatus = "Active" | "Pending" | "Sold" | "Rejected";
type ListingUI = {
  id: string;
  title: string;
  condition: "Like New" | "Good" | "Used";
  seller: { name: string; email: string };
  category: string;
  price: number;
  status: ListingStatus;
  views: number;
  thumb?: string | null;
};

const LISTING_FIELDS =
  "id,product_id,category,title,description,condition,status,price,currency,thumbnail_url,views_count,seller_id,created_at";

/** map db -> ui */
function toUiStatus(s: string): ListingStatus {
  switch (s) {
    case "active":
      return "Active";
    case "sold":
      return "Sold";
    case "rejected":
      return "Rejected";
    case "pending":
    case "draft":
      return "Pending";
    default:
      return "Active";
  }
}
function toUiCondition(c: string): "Like New" | "Good" | "Used" {
  switch (c) {
    case "like_new":
      return "Like New";
    case "used":
      return "Used";
    default:
      return "Good";
  }
}

/** small UI atoms */
function Avatar({ name }: { name: string }) {
  const initials =
    (name || "U")
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U";
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
      <path d="M12 5C7 5 2.73 8.11 1 12c1.73 3.89 6 7 11 7s9.27-3.11 11-7c-1.73-3.89-6-7-11-7Zm0 11a4 4 0 1 1 0-8 4 4 0 0 1 0 8Z" fill="currentColor" />
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

const TABS: Array<{ key: "all" | ListingStatus; label: string }> = [
  { key: "all", label: "All Listings" },
  { key: "Active", label: "Active" },
  { key: "Pending", label: "Pending" },
  { key: "Sold", label: "Sold" },
  { key: "Rejected", label: "Rejected" },
];

export default function ManageListings() {
  const [query, setQuery] = useState("");
  const [statusTab, setStatusTab] = useState<"all" | ListingStatus>("all");
  const [category, setCategory] = useState<"All" | string>("All");

  /** table rows */
  const [rows, setRows] = useState<ListingUI[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  /** KPIs (true table-wide counts, not filtered) */
  const [kpi, setKpi] = useState({ total: 0, active: 0, pending: 0, value: 0 });

  /** load KPIs from entire table */
  async function loadKpis() {
    // total count
    const totalQ = supabase.from("listings").select("*", { count: "exact", head: true });
    const activeQ = supabase
      .from("listings")
      .select("*", { count: "exact", head: true })
      .eq("status", "active");
    const pendingQ = supabase
      .from("listings")
      .select("*", { count: "exact", head: true })
      .or("status.eq.pending,status.eq.draft");
    const soldValQ = supabase.from("listings").select("price,status");

    const [{ count: total }, { count: active }, { count: pending }, { data: soldRows, error: soldErr }] =
      await Promise.all([totalQ, activeQ, pendingQ, soldValQ]);

    const value = !soldErr
      ? (soldRows as DbListing[]).filter((r) => r.status === "sold").reduce((s, r) => s + Number(r.price || 0), 0)
      : 0;

    setKpi({
      total: total || 0,
      active: active || 0,
      pending: pending || 0,
      value,
    });
  }

  /** load listings for the table (with current filters except search) + LEFT join to users */
  async function loadRows() {
    setLoading(true);
    setErr(null);

    let q = supabase.from("listings").select(LISTING_FIELDS).order("created_at", { ascending: false });

    // server-side filters we can push
    if (statusTab !== "all") q = q.eq("status", statusTab.toLowerCase());
    if (category !== "All") q = q.eq("category", category);

    const { data: listings, error } = await q;
    if (error) {
      setErr(error.message);
      setRows([]);
      setLoading(false);
      return;
    }

    const ls = (listings || []) as DbListing[];

    // LEFT JOIN to users by seller_id -> id (use full_name / email)
    const sellerIds = Array.from(new Set(ls.map((l) => l.seller_id).filter(Boolean))) as string[];
    const usersMap = new Map<string, DbUser>();

    if (sellerIds.length > 0) {
      const { data: users, error: uErr } = await supabase.from("users").select("id,full_name,email").in("id", sellerIds);
      if (!uErr && users) {
        for (const u of users as DbUser[]) usersMap.set(u.id, u);
      }
    }

    const ui: ListingUI[] = ls.map((l) => {
      const u = (l.seller_id && usersMap.get(l.seller_id)) || null;
      return {
        id: l.id,
        title: l.title,
        condition: toUiCondition(l.condition || "good"),
        seller: {
          name: (u?.full_name || "Unknown").toString(),
          email: (u?.email || "—").toString(),
        },
        category: l.category || "Other",
        price: Number(l.price ?? 0),
        status: toUiStatus(l.status || "active"),
        views: Number(l.views_count ?? 0),
        thumb: l.thumbnail_url || null,
      };
    });

    setRows(ui);
    setLoading(false);
  }

  /** on first load + whenever filters change */
  useEffect(() => {
    loadKpis();
  }, []); // KPIs are global; load once (or call again after mutations)

  useEffect(() => {
    loadRows();
  }, [statusTab, category]);

  /** client-side search on the loaded rows */
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (l) =>
        l.title.toLowerCase().includes(q) ||
        l.seller.name.toLowerCase().includes(q) ||
        l.seller.email.toLowerCase().includes(q)
    );
  }, [rows, query]);

  return (
    <div className="admin-listings">
      <h1 className="page-title">Listings</h1>

      {/* KPI cards (true table numbers) */}
      <section className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-head">Total Listings</div>
          <div className="kpi-num">{kpi.total}</div>
          <div className="kpi-sub">Overall</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-head">Active Listings</div>
          <div className="kpi-num">{kpi.active}</div>
          <div className="kpi-sub">Active total count</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-head">Pending Review</div>
          <div className="kpi-num">{kpi.pending}</div>
          <div className="kpi-sub">Require approval</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-head">Total Value</div>
          <div className="kpi-num">${kpi.value}</div>
          <div className="kpi-sub">Sold items</div>
        </div>
      </section>

      <section className="block">
        <div className="block-head">
          <div>
            <div className="block-title">Manage Listings</div>
            <div className="block-sub">Review and manage all marketplace listings</div>
          </div>
          <button className="btn btn--ghost" onClick={() => { loadKpis(); loadRows(); }}>
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
              <path d="M5 20h14a1 1 0 0 0 1-1v-2H4v2a1 1 0 0 0 1 1Zm14-12h-4V4h-6v4H5l7 7 7-7Z" fill="currentColor" />
            </svg>
            Refresh
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
              {["All", "Books", "Electronics", "Furniture", "Clothing", "Other"].map((c) => (
                <div key={c} className="filter-item" onClick={() => setCategory(c)}>
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

          {err && (
            <div className="tr">
              <div className="td" style={{ gridColumn: "1 / -1", color: "#b91c1c" }}>
                Error: {err}
              </div>
            </div>
          )}
          {loading && !err && (
            <div className="tr">
              <div className="td" style={{ gridColumn: "1 / -1" }}>Loading…</div>
            </div>
          )}
          {!loading && !err && filtered.length === 0 && (
            <div className="tr">
              <div className="td" style={{ gridColumn: "1 / -1" }}>No listings found.</div>
            </div>
          )}

          {filtered.map((l) => (
            <div className="tr" key={l.id}>
              <div className="td chk">
                <input type="checkbox" />
                {l.thumb ? (
                  <div
                    className="thumb"
                    style={{ backgroundImage: `url(${l.thumb})`, backgroundSize: "cover", backgroundPosition: "center" }}
                  />
                ) : (
                  <div className="thumb" />
                )}
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

              <div className="td price">${Number(l.price).toLocaleString()}</div>

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
            <div>Showing {filtered.length} of {kpi.total} listings</div>
            <div className="pager">
              <button className="btn btn--ghost" disabled>Previous</button>
              <button className="btn btn--ghost" disabled>Next</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
