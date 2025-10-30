import { useCallback, useEffect, useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import "../style/AdminSidebar.scss";
import { supabase } from "../lib/supabaseClient";

type Props = {
  open: boolean;
  onClose?: () => void;
};

type StoredUser = { id?: string; email?: string; full_name?: string; role?: string };

function getStoredUser(): StoredUser | null {
  try {
    const raw = localStorage.getItem("cm_user");
    return raw ? (JSON.parse(raw) as StoredUser) : null;
  } catch {
    return null;
  }
}

export default function AdminSidebar({ open, onClose }: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const [name, setName] = useState("Admin");
  const [email, setEmail] = useState("");

  const loadProfile = useCallback(async () => {
    const s = getStoredUser();
    if (s?.full_name) setName(s.full_name);
    if (s?.email) setEmail(s.email);

    try {
      if (s?.id) {
        const { data } = await supabase
          .from("users")
          .select("full_name,email")
          .eq("id", s.id)
          .single();
        if (data) {
          setName(data.full_name || s.full_name || "Admin");
          setEmail(data.email || s.email || "");
          return;
        }
      }
      if (s?.email) {
        const { data } = await supabase
          .from("users")
          .select("full_name,email")
          .eq("email", s.email)
          .single();
        if (data) {
          setName(data.full_name || "Admin");
          setEmail(data.email || s.email || "");
        }
      }
    } catch {}
  }, []);

  useEffect(() => {
    loadProfile();
    const onStorage = (e: StorageEvent) => e.key === "cm_user" && loadProfile();
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [loadProfile]);

  // CLOSE THE SIDEBAR ON ANY ROUTE CHANGE
  useEffect(() => {
    if (open && onClose) onClose();
  }, [location.pathname]);

  const handleLogout = async () => {
    try { await supabase.auth.signOut(); } catch {}
    localStorage.removeItem("cm_user");
    navigate("/login", { replace: true });
  };

  // CLOSE ON NAV CLICK
  const closeOnClick = () => onClose?.();

  return (
    <>
      {open && <div className="portal-overlay" onClick={onClose} />}

      <aside className={`portal ${open ? "open" : ""}`} aria-label="Admin sidebar">
        <div>
          <div className="portal-head">Admin Portal</div>
          <nav className="portal-nav">
            <NavLink to="/admin/dashboard" onClick={closeOnClick} className="navitem">
              Dashboard
            </NavLink>
            <NavLink to="/admin/manage-users" onClick={closeOnClick} className="navitem">
              Users
            </NavLink>
            <NavLink to="/admin/manage-listings" onClick={closeOnClick} className="navitem">
              Listings
            </NavLink>
            <NavLink to="/admin/analytics" onClick={closeOnClick} className="navitem">
              Analytics
            </NavLink>
            <NavLink to="/admin/settings" onClick={closeOnClick} className="navitem">
              Settings
            </NavLink>
          </nav>
        </div>

        <div className="portal-foot">
          <div className="me">
            <img src="/Avatar.jpeg" alt="Admin avatar" />
            <div>
              <div className="name">{name || "Admin"}</div>
              <div className="muted">{email || "—"}</div>
            </div>
          </div>
          <button className="logout" onClick={handleLogout}>Logout</button>
        </div>
      </aside>
    </>
  );
}
