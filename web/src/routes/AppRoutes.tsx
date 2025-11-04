// web/src/routes/AppRoutes.tsx
import { Routes, Route, Navigate } from "react-router-dom";

// public
import LandingPage from "../pages/LandingPage";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import ForgotPassword from "../pages/auth/ForgotPassword";

// admin
import AdminLayout from "../layout/AdminLayout";
import AdminDashboard from "../pages/admin/AdminDashboard";
import ManageUsers from "../pages/admin/ManageUsers";
import ManageListings from "../pages/admin/ManageListings";
import Analytics from "../pages/admin/Analytics";
import Settings from "../pages/admin/Settings";
import AdminProfile from "../pages/admin/AdminProfile";

// student
import Listings from "../pages/student/Listings";

export default function AppRoutes() {
  return (
    <Routes>
      {/* public */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* admin */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="manage-users" element={<ManageUsers />} />
        <Route path="manage-listings" element={<ManageListings />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="settings" element={<Settings />} />
        <Route path="profile" element={<AdminProfile />} />
      </Route>

      {/* student */}
      <Route path="/student" element={<Navigate to="/student/dashboard" replace />} />
      <Route path="student/dashboard" element={<Listings />} />

      {/* 404 */}
      <Route path="*" element={<div style={{ padding: 20 }}>Not Found</div>} />
    </Routes>
  );
}
