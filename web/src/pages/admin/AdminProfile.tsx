import { useState } from "react";
import "../../style/AdminProfile.scss";
// import { supabase } from "../../lib/supabaseClient";

export default function AdminProfile() {
  const [fullName, setFullName] = useState("Admin User");
  const [email] = useState("admin@campus.com");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const onAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarPreview(URL.createObjectURL(file));
    // TODO: upload to storage + persist URL
  };

  const onSendReset = async () => {
    alert("Reset link sent (wire with supabase.auth.resetPasswordForEmail).");
  };

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      // TODO: update users set full_name=?, avatar_url=? where id=?
      alert("Profile updated!");
    } catch (err) {
      console.error(err);
      alert("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="admin-profile">
      <div className="card">
        <h1>Admin Profile</h1>

        <form className="form" onSubmit={onSave}>
          <div className="avatar-row">
            <img className="avatar" src={avatarPreview || "/avatar-placeholder.png"} alt="Avatar" />
            <label className="upload">
              Change Photo
              <input type="file" accept="image/*" onChange={onAvatarChange} />
            </label>
          </div>

        <div className="grid">
          <div className="field">
            <label>Full Name</label>
            <input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          </div>

          <div className="field">
            <label>Email</label>
            <input value={email} disabled />
            <small className="muted">Email cannot be changed.</small>
          </div>

          <div className="field">
            <label>Password</label>
            <button type="button" className="linklike" onClick={onSendReset}>
              Send password reset link
            </button>
          </div>
        </div>

          <div className="actions">
            <button className="btn primary" type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </button>
            <button className="btn ghost" type="button" onClick={() => window.history.back()}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
