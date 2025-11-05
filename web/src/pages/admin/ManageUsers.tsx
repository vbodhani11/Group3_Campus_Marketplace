import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import "../../style/admin-users.scss";

/** Types match DB (lowercase) */
type Role = "admin" | "users";
type Status = "active" | "inactive" | "suspended";

type UserRow = {
  id: string;
  full_name: string;
  email: string;
  phone?: string | null;
  role: Role;
  status: Status;
  posts_count?: number | null;
  last_active_at?: string | null;
  created_at?: string | null;
  avatar_url?: string | null;
  is_verified?: boolean | null;
};

const PAGE_SIZE = 8;

export default function ManageUsers() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [totalCount, setTotalCount] = useState(0);

  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"All" | "Active" | "Inactive" | "Suspended">("All");
  const [roleFilter, setRoleFilter] = useState<"All Roles" | Role>("All Roles");
  const [statusFilter, setStatusFilter] = useState<"All Status" | Status>("All Status");

  const [page, setPage] = useState(1);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [allChecked, setAllChecked] = useState(false);

  const [statsRemote, setStatsRemote] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    admins: 0,
  });

  /** ========= FETCH USERS (server-side filtering + pagination) ========= */
  type FetchOpts = {
    page?: number;
    q?: string;
    role?: Role | "All Roles";
    status?: Status | "All Status";
    tab?: "All" | "Active" | "Inactive" | "Suspended";
  };

  const fetchUsers = async (opts?: FetchOpts) => {
    const p = opts?.page ?? page;
    const q = (opts?.q ?? query).trim();
    const r = opts?.role ?? roleFilter;
    const s = opts?.status ?? statusFilter;
    const t = opts?.tab ?? activeTab;

    setLoading(true);

    let qb: any = supabase
      .from("users")
      .select(
        `
        id, full_name, email, phone, role, status,
        posts_count, last_active_at, created_at, avatar_url, is_verified
      `,
        { count: "exact" }
      )
      .order("created_at", { ascending: false });

    // Tabs — Active includes NULL; use ilike to tolerate stray spaces/case
    if (t !== "All") {
      if (t === "Active") {
        qb = qb.or("status.ilike.active%,status.is.null");
      } else if (t === "Inactive") {
        qb = qb.ilike("status", "inactive%");
      } else if (t === "Suspended") {
        qb = qb.ilike("status", "suspended%");
      }
    }

    // Dropdowns — Role straight match
    if (r !== "All Roles") qb = qb.eq("role", r);

    // Dropdowns — Status (include NULLs for 'active' if desired)
    if (s !== "All Status") {
      if (s === "active") qb = qb.or("status.ilike.active%,status.is.null");
      else if (s === "inactive") qb = qb.ilike("status", "inactive%");
      else if (s === "suspended") qb = qb.ilike("status", "suspended%");
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

    setUsers(
      (data ?? []).map((u: any) => ({
        id: u.id,
        full_name: u.full_name ?? "",
        email: u.email ?? "",
        phone: u.phone ?? null,
        role: (String(u.role ?? "users").toLowerCase() as Role),
        status: (["inactive", "suspended"].includes(String(u.status).toLowerCase())
          ? (String(u.status).toLowerCase() as Status)
          : "active"),
        posts_count: u.posts_count ?? 0,
        last_active_at: u.last_active_at,
        created_at: u.created_at,
        avatar_url: u.avatar_url ?? null,
        is_verified: !!u.is_verified,
      }))
    );
    setTotalCount(count ?? 0);
    setLoading(false);
  };

  /** ========= CARD COUNTS ========= */
  const fetchCounts = async () => {
    const countWhere = async (fn?: (q: any) => any) => {
      let q: any = supabase.from("users").select("id", { count: "exact", head: true });
      if (fn) q = fn(q);
      const { count, error } = await q;
      if (error) { console.error(error); return 0; }
      return count ?? 0;
    };

    const [total, active, inactive, admins] = await Promise.all([
      countWhere(),                                                      // all
      countWhere(q => q.or("status.ilike.active%,status.is.null")),     // active (incl. NULL/odd spaces)
      countWhere(q => q.ilike("status", "inactive%")),                  // inactive
      countWhere(q => q.eq("role", "admin")),                           // admins
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
    const next: Record<string, boolean> = {};
    paged.forEach((u) => (next[u.id] = newVal));
    setChecked(next);
  };
  const toggleOne = (id: string) => setChecked((prev) => ({ ...prev, [id]: !prev[id] }));

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

  const importCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    console.log("Imported CSV (preview):", text.slice(0, 300));
    alert("Import parsed. Add your Supabase upsert logic in importCSV().");
    e.target.value = "";
  };

  return (
    <div className="admin-users">
      <div className="header"><h1>Users</h1></div>

      <div className="stat-grid">
        <StatCard title="Total Users" value={statsRemote.total} sub="+12% from last month" icon="users" />
        <StatCard title="Active Users" value={statsRemote.active} sub={`${percent(statsRemote.active, statsRemote.total)} of total`} icon="active" />
        <StatCard title="Inactive Users" value={statsRemote.inactive} sub={`${percent(statsRemote.inactive, statsRemote.total)} of total`} icon="inactive" />
        <StatCard title="Admins" value={statsRemote.admins} sub="With full access" icon="shield" />
      </div>

      <div className="panel">
        <div className="panel-head">
          <div>
            <div className="title">User Management</div>
            <div className="subtitle">Manage user accounts, roles, and permissions</div>
          </div>

          <div className="actions">
            <button className="btn ghost" onClick={exportCSV}>⤓ Export</button>
            <label className="btn ghost file">
              ⤒ Import
              <input type="file" accept=".csv" onChange={importCSV} />
            </label>
            {/* Add User removed */}
          </div>
        </div>

        <div className="toolbar">
          <Tabs
            tabs={["All", "Active", "Inactive", "Suspended"]}
            value={activeTab}
            onChange={(v) => setActiveTab(v as any)}
          />

          <div className="filters">
            <div className="search">
              <span className="icon">🔎</span>
              <input
                placeholder="Search by name or email..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>

            <Dropdown
              label="All Roles"
              value={roleFilter}
              options={["All Roles", "admin", "users"]}
              onChange={(v) => setRoleFilter(v as any)}
            />
            <Dropdown
              label="All Status"
              value={statusFilter}
              options={["All Status", "active", "inactive", "suspended"]}
              onChange={(v) => setStatusFilter(v as any)}
            />
          </div>
        </div>

        <div className="table-wrap">
          <table className="users-table">
            <thead>
              <tr>
                <th style={{ width: 36 }}>
                  <input type="checkbox" checked={allChecked} onChange={toggleAll} />
                </th>
                <th>User</th>
                <th>Contact</th>
                <th>Role</th>
                <th>Status</th>
                <th>Posts</th>
                <th>Last Active</th>
                <th style={{ width: 48 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="empty">Loading…</td></tr>
              ) : paged.length === 0 ? (
                <tr><td colSpan={8} className="empty">No users found.</td></tr>
              ) : paged.map((u) => (
                <tr key={u.id}>
                  <td><input type="checkbox" checked={!!checked[u.id]} onChange={() => toggleOne(u.id)} /></td>
                  <td>
                    <div className="user-cell">
                      <Avatar name={u.full_name} url={u.avatar_url || undefined} />
                      <div className="stack">
                        <div className="name">
                          {u.full_name}
                          {u.is_verified ? <span className="verified" title="Verified">✓</span> : null}
                        </div>
                        <div className="meta">Joined {formatDate(u.created_at)}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="contact">
                      <div>✉️ {u.email}</div>
                      {u.phone ? <div>📞 {u.phone}</div> : null}
                    </div>
                  </td>
                  <td><Badge tone="neutral" className="tt-cap">{u.role}</Badge></td>
                  <td>
                    {u.status === "active"    && <Pill tone="success" className="tt-cap">active</Pill>}
                    {u.status === "inactive"  && <Pill tone="muted"   className="tt-cap">inactive</Pill>}
                    {u.status === "suspended" && <Pill tone="danger"  className="tt-cap">suspended</Pill>}
                  </td>
                  <td>{u.posts_count ?? 0}</td>
                  <td>{relative(u.last_active_at)}</td>
                  <td><div className="menu" title="Actions" onClick={() => alert(`Open actions for ${u.full_name}`)}>⋯</div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="pagination">
          <div>Showing {paged.length} of {totalCount} users</div>
          <div className="pager">
            <button
              className="btn ghost"
              disabled={page === 1}
              onClick={() => {
                const next = Math.max(1, page - 1);
                setPage(next);
                fetchUsers({ page: next });
              }}
            >
              Previous
            </button>
            <span className="page">{page} / {totalPages}</span>
            <button
              className="btn ghost"
              disabled={page === totalPages}
              onClick={() => {
                const next = Math.min(totalPages, page + 1);
                setPage(next);
                fetchUsers({ page: next });
              }}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Small UI bits ---------- */
function StatCard({
  title, value, sub, icon,
}: { title:string; value:number; sub:string; icon:"users"|"active"|"inactive"|"shield" }) {
  return (
    <div className="stat-card">
      <div className={`ic ${icon}`} />
      <div className="stat-content">
        <div className="stat-title">{title}</div>
        <div className="stat-value">{value}</div>
        <div className="stat-sub">{sub}</div>
      </div>
    </div>
  );
}

function Tabs({ tabs, value, onChange }:{ tabs:string[]; value:string; onChange:(v:string)=>void }) {
  return (
    <div className="tabs">
      {tabs.map((t) => (
        <button key={t} className={`tab ${value === t ? "active" : ""}`} onClick={() => onChange(t)}>{t}</button>
      ))}
    </div>
  );
}

function Dropdown({
  label, value, options, onChange,
}:{ label: string; value: string; options: string[]; onChange:(v:string)=>void }) {
  return (
    <div className="dropdown">
      <span className="icon">⏷</span>
      <select aria-label={label} value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

function Avatar({ name, url }:{ name:string; url?:string }) {
  if (url) return <img src={url} alt={name} className="avatar" />;
  return <div className="avatar fallback">{initials(name)}</div>;
}

function Badge({
  children,
  tone = "neutral",
  className = "",
}: {
  children: any;
  tone?: "neutral" | "brand";
  className?: string;
}) {
  return <span className={`badge ${tone} ${className}`}>{children}</span>;
}

function Pill({
  children,
  tone,
  className = "",
}: {
  children: any;
  tone: "success" | "muted" | "danger";
  className?: string;
}) {
  return <span className={`pill ${tone} ${className}`}>{children}</span>;
}

/* ---------- Helpers ---------- */
function initials(n: string) {
  const p = n.split(" ").filter(Boolean);
  return (p[0]?.[0] ?? "").concat(p[1]?.[0] ?? "").toUpperCase() || "US";
}
function formatDate(iso?: string | null) {
  if (!iso) return "-";
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" });
}
function relative(iso?: string | null) {
  if (!iso) return "-";
  const ms = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(ms / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs > 1 ? "s" : ""} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
}
function percent(part:number, total:number){ return total ? `${Math.round((part/total)*100)}%` : "0%"; }
function toCSV(rows: Record<string, any>[]) {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const esc = (v:any) => { const s = String(v ?? ""); return /[,"\n]/.test(s) ? `"${s.replace(/"/g,'""')}"` : s; };
  return [headers.join(",")].concat(rows.map(r => headers.map(h => esc(r[h])).join(","))).join("\n");
}
function downloadFile(content:string, filename:string, type:string){
  const blob = new Blob([content], { type }); const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
}
