// web/src/routes/AppRoutes.tsx
import { Navigate } from "react-router-dom";
import { BrowserRouter as Routes, Route } from "react-router-dom";
import { CartProvider } from "../context/CartContext";

// public
import LandingPage from "../pages/LandingPage";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import ForgotPassword from "../pages/auth/ForgotPassword";
import ResetPassword from "../pages/auth/ResetPassword";

// admin
import AdminLayout from "../layout/AdminLayout";
import AdminDashboard from "../pages/admin/AdminDashboard";
import ManageUsers from "../pages/admin/ManageUsers";
import ManageListings from "../pages/admin/ManageListings";
import Analytics from "../pages/admin/Analytics";
import Settings from "../pages/admin/Settings";
import AdminProfile from "../pages/admin/AdminProfile";

// student
import StudentDashboard from "../pages/student/StudDashboard";
import Listings from "../pages/student/Listings";
import Sell from "../pages/student/Sell";
import Messages from "../pages/student/Messages";
import StudentLayout from "../layout/StudentLayout";
import Profile from "../pages/student/StudentProfile";
import StudentProduct from "../pages/student/StudentProduct";
import Cart from "../pages/student/StudentCartPage";

export default function AppRoutes() {
  return (
    <CartProvider>
    <Routes>
      {/* public */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

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
        {/* <Route path="/student" element={<Navigate to="/Listings" replace />} /> */}
        {/* <Route path="Listings" element={<StudDashboard />} /> */}
        {/* <Route path="/student/dashboard" element={<StudDashboard />} /> */}
        {/* <Route path="Sell" element={<Sell />} /> */}
        {/* <Route path="Messages" element={<Messages />} /> */}
        {/* <Route path="Account" element={<Account />} /> */}

        <Route path="/student" element={<StudentLayout />}>
        <Route index element={<Navigate to="StudentDashboard" replace />} />
        <Route path="dashboard" element={<StudentDashboard />} />
        <Route path="sell" element={<Sell />} />
        <Route path="listings" element={<Listings />} />
        <Route path="product" element={<StudentProduct />} />
        <Route path="messages" element={<Messages />} />
        <Route path="profile" element={<Profile />} />
        <Route path="listing/:id" element={<StudentProduct />} />
        <Route path="cart" element={<Cart />} />
        </Route>


        {/* 404 */}
      <Route path="*" element={<div style={{ padding: 20 }}>Not Found</div>} />
    </Routes>
    </CartProvider>
  );
}
