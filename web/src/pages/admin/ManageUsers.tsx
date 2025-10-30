import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import AddUserModal from "../../components/admin/AddUserModel";
import "../../style/admin-users.scss";

type Role = "Admin" | "User";
type Status = "Active" | "Inactive" | "Suspended";

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
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"All" | "Active" | "Inactive" | "Suspended">("All");
  const [roleFilter, setRoleFilter] = useState<"All Roles" | Role>("All Roles");
  const [statusFilter, setStatusFilter] = useState<"All Status" | Status>("All Status");
  const [page, setPage] = useState(1);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [allChecked, setAllChecked] = useState(false);

  // Modal state
  const [isAddOpen, setIsAddOpen] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("users")
      .select(`
        id, full_name, email, phone, role, status,
        posts_count, last_active_at, created_at, avatar_url, is_verified
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error.message);
      setUsers(mockUsers());
    } else {
      setUsers(
        (data as any[]).map((u) => ({
          id: u.id,
          full_name: u.full_name ?? "",
          email: u.email ?? "",
          phone: u.phone ?? null,
          role: toRole(u.role),
          status: toStatus(u.status),
          posts_count: u.posts_count ?? 0,
          last_active_at: u.last_active_at,
          created_at: u.created_at,
          avatar_url: u.avatar_url ?? null,
          is_verified: !!u.is_verified,
        }))
      );
    }
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  // reset pagination + checkboxes when filters change
  useEffect(() => {
    setPage(1); setChecked({}); setAllChecked(false);
  }, [query, activeTab, roleFilter, statusFilter]);

  const filtered = useMemo(() => {
    let list = [...users];
    if (activeTab !== "All") list = list.filter((u) => u.status === activeTab);
    if (roleFilter !== "All Roles") list = list.filter((u) => u.role === roleFilter);
    if (statusFilter !== "All Status") list = list.filter((u) => u.status === statusFilter);

    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (u) =>
          u.full_name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          (u.phone ?? "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [users, query, activeTab, roleFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const stats = useMemo(() => {
    const total = users.length;
    const active = users.filter((u) => u.status === "Active").length;
    const inactive = users.filter((u) => u.status === "Inactive").length;
    const admins = users.filter((u) => u.role === "Admin").length;
    return { total, active, inactive, admins };
  }, [users]);

  const toggleAll = () => {
    const newVal = !allChecked;
    setAllChecked(newVal);
    const next: Record<string, boolean> = {};
    paged.forEach((u) => (next[u.id] = newVal));
    setChecked(next);
  };

  const toggleOne = (id: string) => setChecked((prev) => ({ ...prev, [id]: !prev[id] }));

  const exportCSV = () => {
    const rows = filtered.map((u) => ({
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
        <StatCard title="Total Users" value={stats.total} sub="+12% from last month" icon="users" />
        <StatCard title="Active Users" value={stats.active} sub={`${percent(stats.active, stats.total)} of total`} icon="active" />
        <StatCard title="Inactive Users" value={stats.inactive} sub={`${percent(stats.inactive, stats.total)} of total`} icon="inactive" />
        <StatCard title="Admins" value={stats.admins} sub="With full access" icon="shield" />
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
            <button className="btn primary" onClick={() => setIsAddOpen(true)}>＋ Add User</button>
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
              options={["All Roles", "Admin", "Editor", "Moderator", "User"]}
              onChange={(v) => setRoleFilter(v as any)}
            />
            <Dropdown
              label="All Status"
              value={statusFilter}
              options={["All Status", "Active", "Inactive", "Suspended"]}
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
                  <td><Badge tone="neutral">{u.role}</Badge></td>
                  <td>
                    {u.status === "Active" && <Pill tone="success">Active</Pill>}
                    {u.status === "Inactive" && <Pill tone="muted">Inactive</Pill>}
                    {u.status === "Suspended" && <Pill tone="danger">Suspended</Pill>}
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
          <div>Showing {paged.length} of {filtered.length} users</div>
          <div className="pager">
            <button className="btn ghost" disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Previous</button>
            <span className="page">{page} / {totalPages}</span>
            <button className="btn ghost" disabled={page === totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>Next</button>
          </div>
        </div>
      </div>

      {/* Add User Modal */}
      <AddUserModal
        open={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onCreated={() => { setIsAddOpen(false); fetchUsers(); }}
      />
    </div>
  );
}

/* ---------- tiny UI bits ---------- */

function StatCard({ title, value, sub, icon }:{
  title:string; value:number; sub:string; icon:"users"|"active"|"inactive"|"shield"
}) {
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
}:{
  label: string; value: string; options: string[]; onChange:(v:string)=>void
}) {
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
}: {
  children: any;
  tone?: "neutral" | "brand";
}) {
  return <span className={`badge ${tone}`}>{children}</span>;
}
function Pill({ 
  children, 
  tone 
}:{ 
  children:any; 
  tone:"success"|"muted"|"danger" 
}) { 
  return <span className={`pill ${tone}`}>{children}</span>; 
}

/* ---------- helpers ---------- */
function initials(n: string) { const p = n.split(" ").filter(Boolean); return (p[0]?.[0] ?? "").concat(p[1]?.[0] ?? "").toUpperCase() || "US"; }
function formatDate(iso?: string | null) { if (!iso) return "-"; const d = new Date(iso); return d.toLocaleDateString(undefined,{year:"numeric",month:"short",day:"2-digit"}); }
function relative(iso?: string | null) {
  if (!iso) return "-";
  const ms = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(ms / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs>1?"s":""} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days>1?"s":""} ago`;
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
function toRole(v:any): Role { const s = String(v ?? "").toLowerCase(); if (s==="admin") return "Admin"; return "User"; }
function toStatus(v:any): Status { const s = String(v ?? "").toLowerCase(); if (s==="inactive") return "Inactive"; if (s==="suspended") return "Suspended"; return "Active"; }
function isoMinutesAgo(n:number){ return new Date(Date.now()-n*60000).toISOString(); }
function isoHoursAgo(n:number){ return new Date(Date.now()-n*3600000).toISOString(); }
function isoDaysAgo(n:number){ return new Date(Date.now()-n*86400000).toISOString(); }

/* Mock data - DB not ready */
function mockUsers(): UserRow[] {
  return [
    { id:"1", full_name:"John Doe", email:"john.doe@example.com", phone:"+1 (555) 123-4567", role:"Admin", status:"Active", posts_count:45, last_active_at:isoMinutesAgo(2), created_at:"2024-01-15T10:00:00Z", is_verified:true },
    { id:"2", full_name:"Jane Smith", email:"jane.smith@example.com", phone:"+1 (555) 234-5678", role:"User", status:"Active", posts_count:32, last_active_at:isoHoursAgo(1), created_at:"2024-02-20T10:00:00Z", is_verified:true },
    { id:"3", full_name:"Bob Johnson", email:"bob.johnson@example.com", phone:"+1 (555) 345-6789", role:"User", status:"Inactive", posts_count:8, last_active_at:isoDaysAgo(5), created_at:"2024-03-10T10:00:00Z", is_verified:false },
    { id:"4", full_name:"Alice Williams", email:"alice.williams@example.com", phone:"+1 (555) 456-7890", role:"Admin", status:"Active", posts_count:28, last_active_at:isoHoursAgo(3), created_at:"2024-04-05T10:00:00Z", is_verified:true },
    { id:"5", full_name:"Charlie Brown", email:"charlie.brown@example.com", phone:"+1 (555) 567-8901", role:"User", status:"Active", posts_count:15, last_active_at:isoMinutesAgo(30), created_at:"2024-05-12T10:00:00Z", is_verified:true },
    { id:"6", full_name:"Emma Davis", email:"emma.davis@example.com", phone:"+1 (555) 678-9012", role:"Admin", status:"Active", posts_count:52, last_active_at:isoMinutesAgo(15), created_at:"2024-06-08T10:00:00Z", is_verified:true },
    { id:"7", full_name:"Michael Chen", email:"michael.chen@example.com", phone:"+1 (555) 789-0123", role:"User", status:"Suspended", posts_count:3, last_active_at:isoDaysAgo(7), created_at:"2024-07-22T10:00:00Z", is_verified:false },
    { id:"8", full_name:"Sarah Anderson", email:"sarah.anderson@example.com", phone:"+1 (555) 890-1234", role:"User", status:"Active", posts_count:19, last_active_at:isoHoursAgo(2), created_at:"2024-08-14T10:00:00Z", is_verified:true },
  ];
}
