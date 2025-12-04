import { useState } from "react";
import "../../style/studentprofile.scss";

export default function StudentProfile() {
  const [tab, setTab] = useState<"profile" | "settings">("profile");

  // PROFILE STATE
  const [fullName, setFullName] = useState("Student User");
  const [email] = useState("student@campus.com");
  const [bio, setBio] = useState("Loves trading textbooks and tech gear.");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // SETTINGS STATE
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [msgAlerts, setMsgAlerts] = useState(true);
  const [publicProfile, setPublicProfile] = useState(true);

  const onAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarPreview(URL.createObjectURL(file));
  };

  const onSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      alert("Profile updated!");
      setSaving(false);
    }, 1000);
  };

  return (
    <section className="student-profile">
      <div className="card">
        {/* ---- Tabs ---- */}
        <div className="tabs">
          <button
            className={`tab ${tab === "profile" ? "is-active" : ""}`}
            onClick={() => setTab("profile")}
          >
            Profile
          </button>
          <button
            className={`tab ${tab === "settings" ? "is-active" : ""}`}
            onClick={() => setTab("settings")}
          >
            Settings
          </button>
        </div>

        {/* ---- PROFILE TAB ---- */}
        {tab === "profile" && (
          <form className="form" onSubmit={onSaveProfile}>
            <h1>My Profile</h1>

            <div className="avatar-row">
              <img
                className="avatar"
                src={avatarPreview || "/Avatar.jpeg"}
                alt="Avatar"
              />
              <label className="upload">
                Change Photo
                <input type="file" accept="image/*" onChange={onAvatarChange} />
              </label>
            </div>

            <div className="grid">
              <div className="field">
                <label>Full Name</label>
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>

              <div className="field">
                <label>Email</label>
                <input value={email} disabled />
                <small className="muted">Email cannot be changed.</small>
              </div>

              <div className="field span-2">
                <label>Bio</label>
                <textarea
                  placeholder="Tell others about yourself..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                />
              </div>
            </div>

            <div className="actions">
              <button className="btn primary" type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </button>
              <button
                className="btn ghost"
                type="button"
                onClick={() => window.history.back()}
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* ---- SETTINGS TAB ---- */}
        {tab === "settings" && (
          <div className="settings">
            <h1>Settings</h1>
            <p className="muted-sub">
              Manage notifications, privacy, and account preferences.
            </p>

            <div className="setting-section">
              <h3>Notifications</h3>
              <div className="setting-row">
                <label>Email Notifications</label>
                <input
                  type="checkbox"
                  checked={emailNotifs}
                  onChange={() => setEmailNotifs(!emailNotifs)}
                />
              </div>
              <div className="setting-row">
                <label>Message Alerts</label>
                <input
                  type="checkbox"
                  checked={msgAlerts}
                  onChange={() => setMsgAlerts(!msgAlerts)}
                />
              </div>
            </div>

            <div className="setting-section">
              <h3>Privacy</h3>
              <div className="setting-row">
                <label>Public Profile</label>
                <input
                  type="checkbox"
                  checked={publicProfile}
                  onChange={() => setPublicProfile(!publicProfile)}
                />
              </div>
            </div>

            <div className="setting-section">
              <h3>Account</h3>
              <div className="setting-row">
                <label>Change Password</label>
                <button className="btn ghost small">Send Reset Link</button>
              </div>
              <div className="setting-row danger">
                <label>Delete Account</label>
                <button className="btn danger small">Delete</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
