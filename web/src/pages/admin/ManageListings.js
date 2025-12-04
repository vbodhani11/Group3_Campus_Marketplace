import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import "../../style/admin-listings.scss";
import { supabase } from "../../lib/supabaseClient";
const LISTING_FIELDS = "id,product_id,category,title,description,condition,status,price,currency,thumbnail_url,views_count,seller_id,created_at";
function toUiStatus(s) {
    switch (s) {
        case "active": return "Active";
        case "sold": return "Sold";
        case "rejected": return "Rejected";
        case "pending":
        case "draft": return "Pending";
        default: return "Active";
    }
}
function toUiCondition(c) {
    switch (c) {
        case "like_new": return "Like New";
        case "used": return "Used";
        default: return "Good";
    }
}
function Avatar({ name }) {
    const initials = (name || "U").split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() || "U";
    return _jsx("div", { className: "av", children: initials });
}
function Badge({ status }) {
    return _jsx("span", { className: `badge badge--${status.toLowerCase()}`, children: status });
}
function Pill({ text }) { return _jsx("span", { className: "pill", children: text }); }
function EyeIcon() {
    return (_jsx("svg", { width: "18", height: "18", viewBox: "0 0 24 24", "aria-hidden": true, children: _jsx("path", { d: "M12 5C7 5 2.73 8.11 1 12c1.73 3.89 6 7 11 7s9.27-3.11 11-7c-1.73-3.89-6-7-11-7Zm0 11a4 4 0 1 1 0-8 4 4 0 0 1 0 8Z", fill: "currentColor" }) }));
}
function Kebab() { return (_jsxs("button", { className: "kebab", "aria-label": "Actions", children: [_jsx("span", {}), _jsx("span", {}), _jsx("span", {})] })); }
const TABS = [
    { key: "all", label: "All Listings" },
    { key: "Active", label: "Active" },
    { key: "Pending", label: "Pending" },
    { key: "Sold", label: "Sold" },
    { key: "Rejected", label: "Rejected" },
];
export default function ManageListings() {
    const [query, setQuery] = useState("");
    const [statusTab, setStatusTab] = useState("all");
    const [category, setCategory] = useState("All");
    // rows for current page
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState(null);
    // KPIs (global table stats)
    const [kpi, setKpi] = useState({ total: 0, active: 0, pending: 0, value: 0 });
    // --- Pagination (SERVER-SIDE) ---
    const PAGE_SIZE = 20;
    const [page, setPage] = useState(0); // 0-based
    const [totalMatching, setTotalMatching] = useState(0);
    // Reset page when filters/search change
    useEffect(() => { setPage(0); }, [statusTab, category, query]);
    // KPIs once (overall)
    useEffect(() => {
        async function loadKpis() {
            const totalQ = supabase.from("listings").select("*", { count: "exact", head: true });
            const activeQ = supabase.from("listings").select("*", { count: "exact", head: true }).eq("status", "active");
            const pendingQ = supabase.from("listings").select("*", { count: "exact", head: true }).or("status.eq.pending,status.eq.draft");
            const soldValQ = supabase.from("listings").select("price,status");
            const [t, a, p, s] = await Promise.all([totalQ, activeQ, pendingQ, soldValQ]);
            const value = !s.error ? s.data
                .filter(r => r.status === "sold")
                .reduce((sum, r) => sum + Number(r.price || 0), 0) : 0;
            setKpi({ total: t.count || 0, active: a.count || 0, pending: p.count || 0, value });
        }
        loadKpis();
    }, []);
    // Load one page (server-side range)
    useEffect(() => {
        async function loadPage() {
            setLoading(true);
            setErr(null);
            let q = supabase
                .from("listings")
                .select(LISTING_FIELDS, { count: "exact" })
                .order("created_at", { ascending: false });
            if (statusTab !== "all")
                q = q.eq("status", statusTab.toLowerCase());
            if (category !== "All")
                q = q.eq("category", category);
            const qstr = query.trim();
            if (qstr)
                q = q.or(`title.ilike.%${qstr}%,description.ilike.%${qstr}%`);
            const from = page * PAGE_SIZE;
            const to = from + PAGE_SIZE - 1;
            const { data: listings, error, count } = await q.range(from, to);
            if (error) {
                setErr(error.message);
                setRows([]);
                setTotalMatching(0);
                setLoading(false);
                return;
            }
            const ls = (listings || []);
            setTotalMatching(count || 0);
            // Join to users (support both public.users.id and auth_user_id)
            const sellerIds = Array.from(new Set(ls.map(l => l.seller_id).filter(Boolean)));
            const usersMap = new Map();
            if (sellerIds.length > 0) {
                const [r1, r2] = await Promise.all([
                    supabase.from("users").select("id,auth_user_id,full_name,email").in("auth_user_id", sellerIds),
                    supabase.from("users").select("id,auth_user_id,full_name,email").in("id", sellerIds),
                ]);
                const allUsers = [
                    ...(r1.data || []),
                    ...(r2.data || []),
                ];
                for (const u of allUsers) {
                    if (u.auth_user_id)
                        usersMap.set(u.auth_user_id, u);
                    usersMap.set(u.id, u);
                }
            }
            const ui = ls.map((l) => {
                const u = (l.seller_id && usersMap.get(l.seller_id)) || null;
                return {
                    id: l.id,
                    product_id: l.product_id,
                    title: l.title,
                    condition: toUiCondition(l.condition || "good"),
                    seller: { name: (u?.full_name || "Unknown").toString(), email: (u?.email || "—").toString() },
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
        loadPage();
    }, [statusTab, category, query, page]);
    const start = totalMatching === 0 ? 0 : page * PAGE_SIZE + 1;
    const end = Math.min((page + 1) * PAGE_SIZE, totalMatching);
    const totalPages = Math.max(1, Math.ceil(totalMatching / PAGE_SIZE));
    /** ---- Export CSV of what's on screen (current `rows`) ---- */
    function csvEscape(v) {
        const s = (v ?? "").toString();
        // wrap in quotes if it contains comma, quote, or newline; escape quotes
        return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    }
    function exportCsv(data) {
        const headers = [
            "ID",
            "Product ID",
            "Title",
            "Condition",
            "Seller Name",
            "Seller Email",
            "Category",
            "Price",
            "Status",
            "Views",
        ];
        const lines = data.map(r => [
            csvEscape(r.id),
            csvEscape(r.product_id ?? ""),
            csvEscape(r.title),
            csvEscape(r.condition),
            csvEscape(r.seller.name),
            csvEscape(r.seller.email),
            csvEscape(r.category),
            csvEscape(Number(r.price).toFixed(2)),
            csvEscape(r.status),
            csvEscape(r.views),
        ].join(","));
        const csv = [headers.join(","), ...lines].join("\n");
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        const ts = new Date().toISOString().replace(/[:.]/g, "-");
        a.href = url;
        a.download = `listings_page-${page + 1}_${ts}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    }
    return (_jsxs("div", { className: "admin-listings", children: [_jsx("h1", { className: "page-title", children: "Listings" }), _jsxs("section", { className: "kpi-grid", children: [_jsxs("div", { className: "kpi-card", children: [_jsx("div", { className: "kpi-head", children: "Total Listings" }), _jsx("div", { className: "kpi-num", children: kpi.total }), _jsx("div", { className: "kpi-sub", children: "Overall" })] }), _jsxs("div", { className: "kpi-card", children: [_jsx("div", { className: "kpi-head", children: "Active Listings" }), _jsx("div", { className: "kpi-num", children: kpi.active }), _jsx("div", { className: "kpi-sub", children: "Active total count" })] }), _jsxs("div", { className: "kpi-card", children: [_jsx("div", { className: "kpi-head", children: "Pending Review" }), _jsx("div", { className: "kpi-num", children: kpi.pending }), _jsx("div", { className: "kpi-sub", children: "Require approval" })] }), _jsxs("div", { className: "kpi-card", children: [_jsx("div", { className: "kpi-head", children: "Total Value" }), _jsxs("div", { className: "kpi-num", children: ["$", kpi.value] }), _jsx("div", { className: "kpi-sub", children: "Sold items" })] })] }), _jsxs("section", { className: "block", children: [_jsxs("div", { className: "block-head", children: [_jsxs("div", { children: [_jsx("div", { className: "block-title", children: "Manage Listings" }), _jsx("div", { className: "block-sub", children: "Review and manage all marketplace listings" })] }), _jsx("button", { className: "btn btn--ghost", onClick: () => exportCsv(rows), children: "\u2913 Export" })] }), _jsx("div", { className: "tabs", children: TABS.map(t => (_jsx("button", { className: `tab ${statusTab === t.key ? "is-active" : ""}`, onClick: () => setStatusTab(t.key), children: t.label }, t.key))) }), _jsxs("div", { className: "filters", children: [_jsxs("div", { className: "search", children: [_jsx("span", { className: "search-icon" }), _jsx("input", { value: query, onChange: (e) => setQuery(e.target.value), placeholder: "Search by title, description, or seller..." })] }), _jsxs("div", { className: "filter", children: [_jsxs("button", { className: "filter-btn", children: [_jsx("span", { className: "filter-icon" }), category === "All" ? "All Categories" : category, _jsx("span", { className: "caret" })] }), _jsx("div", { className: "filter-menu", children: ["All", "Books", "Electronics", "Furniture", "Clothing", "Other"].map((c) => (_jsx("div", { className: "filter-item", onClick: () => setCategory(c), children: c }, c))) })] }), _jsx("div", { className: "filter disabled", children: _jsxs("button", { className: "filter-btn", children: [_jsx("span", { className: "filter-icon" }), "All Status", _jsx("span", { className: "caret" })] }) })] }), _jsxs("div", { className: "table", children: [_jsxs("div", { className: "tr th", children: [_jsxs("div", { className: "td chk", children: [_jsx("input", { type: "checkbox" }), _jsx("span", { children: "Listing" })] }), _jsx("div", { className: "td seller", children: "Seller" }), _jsx("div", { className: "td category", children: "Category" }), _jsx("div", { className: "td price", children: "Price" }), _jsx("div", { className: "td status", children: "Status" }), _jsx("div", { className: "td views", children: "Views" }), _jsx("div", { className: "td actions", children: "Actions" })] }), err && (_jsx("div", { className: "tr", children: _jsxs("div", { className: "td", style: { gridColumn: "1 / -1", color: "#b91c1c" }, children: ["Error: ", err] }) })), loading && !err && (_jsx("div", { className: "tr", children: _jsx("div", { className: "td", style: { gridColumn: "1 / -1" }, children: "Loading\u2026" }) })), !loading && !err && rows.length === 0 && (_jsx("div", { className: "tr", children: _jsx("div", { className: "td", style: { gridColumn: "1 / -1" }, children: "No listings found." }) })), rows.map((l) => (_jsxs("div", { className: "tr", children: [_jsxs("div", { className: "td chk", children: [_jsx("input", { type: "checkbox" }), l.thumb ? (_jsx("div", { className: "thumb", style: { backgroundImage: `url(${l.thumb})`, backgroundSize: "cover", backgroundPosition: "center" } })) : (_jsx("div", { className: "thumb" })), _jsxs("div", { className: "listing", children: [_jsx("div", { className: "title", children: l.title }), _jsx("div", { className: "sub", children: l.condition })] })] }), _jsxs("div", { className: "td seller", children: [_jsx(Avatar, { name: l.seller.name }), _jsxs("div", { className: "seller-info", children: [_jsx("div", { className: "seller-name", children: l.seller.name }), _jsx("div", { className: "seller-mail", children: l.seller.email })] })] }), _jsx("div", { className: "td category", children: _jsx(Pill, { text: l.category }) }), _jsxs("div", { className: "td price", children: ["$", Number(l.price).toLocaleString()] }), _jsx("div", { className: "td status", children: _jsx(Badge, { status: l.status }) }), _jsxs("div", { className: "td views", children: [_jsx(EyeIcon, {}), _jsx("span", { children: l.views })] }), _jsx("div", { className: "td actions", children: _jsx(Kebab, {}) })] }, l.id))), _jsxs("div", { className: "tfoot", children: [_jsx("div", { children: totalMatching === 0
                                            ? "Showing 0 of 0 listings"
                                            : `Showing ${start}–${end} of ${totalMatching} listings` }), _jsxs("div", { className: "pager", children: [_jsx("button", { className: "btn btn--ghost", onClick: () => setPage(p => Math.max(0, p - 1)), disabled: page === 0 || loading, children: "Previous" }), _jsx("button", { className: "btn btn--ghost", onClick: () => setPage(p => Math.min(totalPages - 1, p + 1)), disabled: (page + 1) >= totalPages || loading, children: "Next" })] })] })] })] })] }));
}
