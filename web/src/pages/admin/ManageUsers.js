import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import "../../style/admin-users.scss";
const PAGE_SIZE = 8;
export default function ManageUsers() {
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState([]);
    const [totalCount, setTotalCount] = useState(0);
    const [query, setQuery] = useState("");
    const [activeTab, setActiveTab] = useState("All");
    const [roleFilter, setRoleFilter] = useState("All Roles");
    const [statusFilter, setStatusFilter] = useState("All Status");
    const [page, setPage] = useState(1);
    const [checked, setChecked] = useState({});
    const [allChecked, setAllChecked] = useState(false);
    const [statsRemote, setStatsRemote] = useState({
        total: 0,
        active: 0,
        inactive: 0,
        admins: 0,
    });
    const fetchUsers = async (opts) => {
        const p = opts?.page ?? page;
        const q = (opts?.q ?? query).trim();
        const r = opts?.role ?? roleFilter;
        const s = opts?.status ?? statusFilter;
        const t = opts?.tab ?? activeTab;
        setLoading(true);
        let qb = supabase
            .from("users")
            .select(`
        id, full_name, email, phone, role, status,
        posts_count, last_active_at, created_at, avatar_url, is_verified
      `, { count: "exact" })
            .order("created_at", { ascending: false });
        // Tabs — Active includes NULL; use ilike to tolerate stray spaces/case
        if (t !== "All") {
            if (t === "Active") {
                qb = qb.or("status.ilike.active%,status.is.null");
            }
            else if (t === "Inactive") {
                qb = qb.ilike("status", "inactive%");
            }
            else if (t === "Suspended") {
                qb = qb.ilike("status", "suspended%");
            }
        }
        // Dropdowns — Role straight match
        if (r !== "All Roles")
            qb = qb.eq("role", r);
        // Dropdowns — Status (include NULLs for 'active' if desired)
        if (s !== "All Status") {
            if (s === "active")
                qb = qb.or("status.ilike.active%,status.is.null");
            else if (s === "inactive")
                qb = qb.ilike("status", "inactive%");
            else if (s === "suspended")
                qb = qb.ilike("status", "suspended%");
        }
        // Search
        if (q) {
            const like = `%${q}%`;
            qb = qb.or(`full_name.ilike.${like},email.ilike.${like},phone.ilike.${like}`);
        }
        // Pagination
        const from = (p - 1) * PAGE_SIZE;
        const to = from + PAGE_SIZE - 1;
        const { data, count, error } = await qb.range(from, to);
        if (error) {
            console.error("fetchUsers error:", error);
            setUsers([]);
            setTotalCount(0);
            setLoading(false);
            return;
        }
        setUsers((data ?? []).map((u) => ({
            id: u.id,
            full_name: u.full_name ?? "",
            email: u.email ?? "",
            phone: u.phone ?? null,
            role: String(u.role ?? "users").toLowerCase(),
            status: (["inactive", "suspended"].includes(String(u.status).toLowerCase())
                ? String(u.status).toLowerCase()
                : "active"),
            posts_count: u.posts_count ?? 0,
            last_active_at: u.last_active_at,
            created_at: u.created_at,
            avatar_url: u.avatar_url ?? null,
            is_verified: !!u.is_verified,
        })));
        setTotalCount(count ?? 0);
        setLoading(false);
    };
    /** ========= CARD COUNTS ========= */
    const fetchCounts = async () => {
        const countWhere = async (fn) => {
            let q = supabase.from("users").select("id", { count: "exact", head: true });
            if (fn)
                q = fn(q);
            const { count, error } = await q;
            if (error) {
                console.error(error);
                return 0;
            }
            return count ?? 0;
        };
        const [total, active, inactive, admins] = await Promise.all([
            countWhere(), // all
            countWhere(q => q.or("status.ilike.active%,status.is.null")), // active (incl. NULL/odd spaces)
            countWhere(q => q.ilike("status", "inactive%")), // inactive
            countWhere(q => q.eq("role", "admin")), // admins
        ]);
        setStatsRemote({ total, active, inactive, admins });
    };
    /** initial load */
    useEffect(() => {
        fetchUsers({ page: 1 });
        fetchCounts();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    /** re-fetch when filters/tabs change */
    useEffect(() => {
        setPage(1);
        setChecked({});
        setAllChecked(false);
        fetchUsers({ page: 1, q: query, role: roleFilter, status: statusFilter, tab: activeTab });
        // If you want the cards to also reflect current filters/tabs, call fetchCounts() here.
        // fetchCounts();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [query, roleFilter, statusFilter, activeTab]);
    const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
    const paged = users;
    const toggleAll = () => {
        const newVal = !allChecked;
        setAllChecked(newVal);
        const next = {};
        paged.forEach((u) => (next[u.id] = newVal));
        setChecked(next);
    };
    const toggleOne = (id) => setChecked((prev) => ({ ...prev, [id]: !prev[id] }));
    const exportCSV = () => {
        const rows = paged.map((u) => ({
            Name: u.full_name,
            Email: u.email,
            Phone: u.phone ?? "",
            Role: u.role,
            Status: u.status,
            Posts: u.posts_count ?? 0,
            "Last Active": relative(u.last_active_at),
            Joined: formatDate(u.created_at),
        }));
        const csv = toCSV(rows);
        downloadFile(csv, "users_export.csv", "text/csv;charset=utf-8;");
    };
    const importCSV = async (e) => {
        const file = e.target.files?.[0];
        if (!file)
            return;
        const text = await file.text();
        console.log("Imported CSV (preview):", text.slice(0, 300));
        alert("Import parsed. Add your Supabase upsert logic in importCSV().");
        e.target.value = "";
    };
    return (_jsxs("div", { className: "admin-users", children: [_jsx("div", { className: "header", children: _jsx("h1", { children: "Users" }) }), _jsxs("div", { className: "stat-grid", children: [_jsx(StatCard, { title: "Total Users", value: statsRemote.total, sub: "+12% from last month", icon: "users" }), _jsx(StatCard, { title: "Active Users", value: statsRemote.active, sub: `${percent(statsRemote.active, statsRemote.total)} of total`, icon: "active" }), _jsx(StatCard, { title: "Inactive Users", value: statsRemote.inactive, sub: `${percent(statsRemote.inactive, statsRemote.total)} of total`, icon: "inactive" }), _jsx(StatCard, { title: "Admins", value: statsRemote.admins, sub: "With full access", icon: "shield" })] }), _jsxs("div", { className: "panel", children: [_jsxs("div", { className: "panel-head", children: [_jsxs("div", { children: [_jsx("div", { className: "title", children: "User Management" }), _jsx("div", { className: "subtitle", children: "Manage user accounts, roles, and permissions" })] }), _jsxs("div", { className: "actions", children: [_jsx("button", { className: "btn ghost", onClick: exportCSV, children: "\u2913 Export" }), _jsxs("label", { className: "btn ghost file", children: ["\u2912 Import", _jsx("input", { type: "file", accept: ".csv", onChange: importCSV })] })] })] }), _jsxs("div", { className: "toolbar", children: [_jsx(Tabs, { tabs: ["All", "Active", "Inactive", "Suspended"], value: activeTab, onChange: (v) => setActiveTab(v) }), _jsxs("div", { className: "filters", children: [_jsxs("div", { className: "search", children: [_jsx("span", { className: "icon", children: "\uD83D\uDD0E" }), _jsx("input", { placeholder: "Search by name or email...", value: query, onChange: (e) => setQuery(e.target.value) })] }), _jsx(Dropdown, { label: "All Roles", value: roleFilter, options: ["All Roles", "admin", "users"], onChange: (v) => setRoleFilter(v) }), _jsx(Dropdown, { label: "All Status", value: statusFilter, options: ["All Status", "active", "inactive", "suspended"], onChange: (v) => setStatusFilter(v) })] })] }), _jsx("div", { className: "table-wrap", children: _jsxs("table", { className: "users-table", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { style: { width: 36 }, children: _jsx("input", { type: "checkbox", checked: allChecked, onChange: toggleAll }) }), _jsx("th", { children: "User" }), _jsx("th", { children: "Contact" }), _jsx("th", { children: "Role" }), _jsx("th", { children: "Status" }), _jsx("th", { children: "Posts" }), _jsx("th", { children: "Last Active" }), _jsx("th", { style: { width: 48 }, children: "Actions" })] }) }), _jsx("tbody", { children: loading ? (_jsx("tr", { children: _jsx("td", { colSpan: 8, className: "empty", children: "Loading\u2026" }) })) : paged.length === 0 ? (_jsx("tr", { children: _jsx("td", { colSpan: 8, className: "empty", children: "No users found." }) })) : paged.map((u) => (_jsxs("tr", { children: [_jsx("td", { children: _jsx("input", { type: "checkbox", checked: !!checked[u.id], onChange: () => toggleOne(u.id) }) }), _jsx("td", { children: _jsxs("div", { className: "user-cell", children: [_jsx(Avatar, { name: u.full_name, url: u.avatar_url || undefined }), _jsxs("div", { className: "stack", children: [_jsxs("div", { className: "name", children: [u.full_name, u.is_verified ? _jsx("span", { className: "verified", title: "Verified", children: "\u2713" }) : null] }), _jsxs("div", { className: "meta", children: ["Joined ", formatDate(u.created_at)] })] })] }) }), _jsx("td", { children: _jsxs("div", { className: "contact", children: [_jsxs("div", { children: ["\u2709\uFE0F ", u.email] }), u.phone ? _jsxs("div", { children: ["\uD83D\uDCDE ", u.phone] }) : null] }) }), _jsx("td", { children: _jsx(Badge, { tone: "neutral", className: "tt-cap", children: u.role }) }), _jsxs("td", { children: [u.status === "active" && _jsx(Pill, { tone: "success", className: "tt-cap", children: "active" }), u.status === "inactive" && _jsx(Pill, { tone: "muted", className: "tt-cap", children: "inactive" }), u.status === "suspended" && _jsx(Pill, { tone: "danger", className: "tt-cap", children: "suspended" })] }), _jsx("td", { children: u.posts_count ?? 0 }), _jsx("td", { children: relative(u.last_active_at) }), _jsx("td", { children: _jsx("div", { className: "menu", title: "Actions", onClick: () => alert(`Open actions for ${u.full_name}`), children: "\u22EF" }) })] }, u.id))) })] }) }), _jsxs("div", { className: "pagination", children: [_jsxs("div", { children: ["Showing ", paged.length, " of ", totalCount, " users"] }), _jsxs("div", { className: "pager", children: [_jsx("button", { className: "btn ghost", disabled: page === 1, onClick: () => {
                                            const next = Math.max(1, page - 1);
                                            setPage(next);
                                            fetchUsers({ page: next });
                                        }, children: "Previous" }), _jsxs("span", { className: "page", children: [page, " / ", totalPages] }), _jsx("button", { className: "btn ghost", disabled: page === totalPages, onClick: () => {
                                            const next = Math.min(totalPages, page + 1);
                                            setPage(next);
                                            fetchUsers({ page: next });
                                        }, children: "Next" })] })] })] })] }));
}
/* ---------- Small UI bits ---------- */
function StatCard({ title, value, sub, icon, }) {
    return (_jsxs("div", { className: "stat-card", children: [_jsx("div", { className: `ic ${icon}` }), _jsxs("div", { className: "stat-content", children: [_jsx("div", { className: "stat-title", children: title }), _jsx("div", { className: "stat-value", children: value }), _jsx("div", { className: "stat-sub", children: sub })] })] }));
}
function Tabs({ tabs, value, onChange }) {
    return (_jsx("div", { className: "tabs", children: tabs.map((t) => (_jsx("button", { className: `tab ${value === t ? "active" : ""}`, onClick: () => onChange(t), children: t }, t))) }));
}
function Dropdown({ label, value, options, onChange, }) {
    return (_jsxs("div", { className: "dropdown", children: [_jsx("span", { className: "icon", children: "\u23F7" }), _jsx("select", { "aria-label": label, value: value, onChange: (e) => onChange(e.target.value), children: options.map((o) => _jsx("option", { value: o, children: o }, o)) })] }));
}
function Avatar({ name, url }) {
    if (url)
        return _jsx("img", { src: url, alt: name, className: "avatar" });
    return _jsx("div", { className: "avatar fallback", children: initials(name) });
}
function Badge({ children, tone = "neutral", className = "", }) {
    return _jsx("span", { className: `badge ${tone} ${className}`, children: children });
}
function Pill({ children, tone, className = "", }) {
    return _jsx("span", { className: `pill ${tone} ${className}`, children: children });
}
/* ---------- Helpers ---------- */
function initials(n) {
    const p = n.split(" ").filter(Boolean);
    return (p[0]?.[0] ?? "").concat(p[1]?.[0] ?? "").toUpperCase() || "US";
}
function formatDate(iso) {
    if (!iso)
        return "-";
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" });
}
function relative(iso) {
    if (!iso)
        return "-";
    const ms = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(ms / 60000);
    if (mins < 1)
        return "just now";
    if (mins < 60)
        return `${mins} min ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24)
        return `${hrs} hour${hrs > 1 ? "s" : ""} ago`;
    const days = Math.floor(hrs / 24);
    return `${days} day${days > 1 ? "s" : ""} ago`;
}
function percent(part, total) { return total ? `${Math.round((part / total) * 100)}%` : "0%"; }
function toCSV(rows) {
    if (!rows.length)
        return "";
    const headers = Object.keys(rows[0]);
    const esc = (v) => { const s = String(v ?? ""); return /[,"\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
    return [headers.join(",")].concat(rows.map(r => headers.map(h => esc(r[h])).join(","))).join("\n");
}
function downloadFile(content, filename, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
}
