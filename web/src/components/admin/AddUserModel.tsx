import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import "../../style/admin-model.scss";

type Role = "admin" | "users";
type Status = "active" | "inactive" | "suspended";

export default function AddUserModal({
  open, onClose, onCreated,
}:{
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    role: "users" as Role,   // default lowercase to match DB
    status: "active" as Status,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { if (open) { setError(null); setSubmitting(false); } }, [open]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!open || submitting) return;

    try {
      setSubmitting(true);
      setError(null);

      if (!form.full_name.trim()) throw new Error("Full name is required.");
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) throw new Error("Valid email is required.");

      const payload = {
        full_name: form.full_name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim() || null,
        role: form.role,           // 'admin' | 'users'
        status: form.status,       // 'active' | 'inactive' | 'suspended'
        posts_count: 0,
        is_verified: true,
        last_active_at: new Date().toISOString(),
      };

      const { error } = await supabase.from("users").insert(payload);
      if (error) throw error;

      onCreated();
    } catch (err: any) {
      setError(err.message || "Failed to create user.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className="modal-sheet" onMouseDown={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <h2>Add New User</h2>
            <p>Create a new user account with role and permissions</p>
          </div>
          <button className="icon-btn" aria-label="Close" onClick={onClose}>✕</button>
        </div>

        {error && <div className="modal-alert">{error}</div>}

        <form className="modal-body" onSubmit={submit}>
          <label>
            <span>Full Name</span>
            <input name="full_name" placeholder="John Doe" value={form.full_name} onChange={onChange} required />
          </label>

          <label>
            <span>Email</span>
            <input name="email" type="email" placeholder="john@example.com" value={form.email} onChange={onChange} required />
          </label>

          <label>
            <span>Phone</span>
            <input name="phone" placeholder="+1 (555) 123-4567" value={form.phone} onChange={onChange} />
          </label>

          <label>
            <span>Role</span>
            <select name="role" value={form.role} onChange={onChange} className="tt-cap">
              <option value="users">users</option>
              <option value="admin">admin</option>
            </select>
          </label>

          <label>
            <span>Status</span>
            <select name="status" value={form.status} onChange={onChange} className="tt-cap">
              <option value="active">active</option>
              <option value="inactive">inactive</option>
              <option value="suspended">suspended</option>
            </select>
          </label>

          <div className="modal-actions">
            <button type="button" className="btn ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn primary" disabled={submitting}>
              {submitting ? "Creating…" : "Create User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
