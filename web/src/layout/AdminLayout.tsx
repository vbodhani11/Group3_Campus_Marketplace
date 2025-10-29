import { useState } from "react";
import { Outlet } from "react-router-dom";
import AdminHeader from "./AdminHeader";
import AdminSidebar from "./AdminSidebar";
import "../style/AdminLayout.scss";

export default function AdminLayout() {
  const [open, setOpen] = useState(false);

  return (
    <div className="admin-shell">
      <AdminHeader open={open} setOpen={setOpen} />
      <AdminSidebar open={open} onClose={() => setOpen(false)} />
      <main className={`admin-main ${open ? "shifted" : ""}`}>
        <Outlet />
      </main>
    </div>
  );
}
