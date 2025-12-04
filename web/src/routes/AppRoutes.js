import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Navigate, Routes, Route } from "react-router-dom";
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
import ManageOrders from "../pages/admin/ManageOrders";
import Analytics from "../pages/admin/Analytics";
import Settings from "../pages/admin/Settings";
import AdminProfile from "../pages/admin/AdminProfile";
import ReportsPage from "../pages/admin/Reports";
// student
import StudDashboard from "../pages/student/StudDashboard";
import Sell from "../pages/student/Sell";
import Messages from "../pages/student/Messages";
import Account from "../pages/student/Account";
import Listings from "../pages/student/Listings";
import ListingDetailPage from "../pages/student/ListingDetails";
export default function AppRoutes() {
    return (_jsx(CartProvider, { children: _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(LandingPage, {}) }), _jsx(Route, { path: "/login", element: _jsx(Login, {}) }), _jsx(Route, { path: "/register", element: _jsx(Register, {}) }), _jsx(Route, { path: "/forgot-password", element: _jsx(ForgotPassword, {}) }), _jsx(Route, { path: "/reset-password", element: _jsx(ResetPassword, {}) }), _jsxs(Route, { path: "/admin", element: _jsx(AdminLayout, {}), children: [_jsx(Route, { index: true, element: _jsx(Navigate, { to: "dashboard", replace: true }) }), _jsx(Route, { path: "dashboard", element: _jsx(AdminDashboard, {}) }), _jsx(Route, { path: "manage-users", element: _jsx(ManageUsers, {}) }), _jsx(Route, { path: "manage-listings", element: _jsx(ManageListings, {}) }), _jsx(Route, { path: "manage-orders", element: _jsx(ManageOrders, {}) }), _jsx(Route, { path: "reports", element: _jsx(ReportsPage, {}) }), _jsx(Route, { path: "analytics", element: _jsx(Analytics, {}) }), _jsx(Route, { path: "settings", element: _jsx(Settings, {}) }), _jsx(Route, { path: "profile", element: _jsx(AdminProfile, {}) })] }), _jsx(Route, { path: "/student", element: _jsx(Navigate, { to: "/Listings", replace: true }) }), _jsx(Route, { path: "Listings", element: _jsx(Listings, {}) }), _jsx(Route, { path: "/student/dashboard", element: _jsx(StudDashboard, {}) }), _jsx(Route, { path: "Sell", element: _jsx(Sell, {}) }), _jsx(Route, { path: "Messages", element: _jsx(Messages, {}) }), _jsx(Route, { path: "Account", element: _jsx(Account, {}) }), _jsx(Route, { path: "/listing/:id", element: _jsx(ListingDetailPage, {}) }), _jsx(Route, { path: "*", element: _jsx("div", { style: { padding: 20 }, children: "Not Found" }) })] }) }));
}
