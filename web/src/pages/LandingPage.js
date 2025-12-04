import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useNavigate } from "react-router-dom";
import "../style/landing.scss";
import Footer from "../components/Footer";
import FeatureCard from "../components/FeatureCard";
export default function LandingPage() {
    const navigate = useNavigate();
    return (_jsxs("div", { className: "landing-page", children: [_jsxs("section", { className: "hero", children: [_jsx("div", { className: "overlay" }), _jsxs("div", { className: "hero-content", children: [_jsx("h1", { children: "Campus Marketplace" }), _jsx("p", { children: "A Digital Hub for Campus Commerce" }), _jsxs("div", { className: "buttons", children: [_jsx("button", { className: "btn login", onClick: () => navigate("/login"), children: "Login" }), _jsx("button", { className: "btn signup", onClick: () => navigate("/register"), children: "Sign Up" })] })] })] }), _jsxs("section", { className: "features", children: [_jsx("h2", { children: "How Campus Marketplace Helps You" }), _jsxs("div", { className: "card-grid", children: [_jsx(FeatureCard, { icon: "\uD83D\uDECD\uFE0F", title: "Buy & Sell Anything", desc: "Find textbooks, electronics, dorm essentials, and more from students right on your campus. Safe, fast, and affordable." }), _jsx(FeatureCard, { icon: "\uD83C\uDF93", title: "Student-to-Student Deals", desc: "Skip middlemen. Connect directly with other students for trusted, local exchanges and verified listings." }), _jsx(FeatureCard, { icon: "\uD83D\uDCE2", title: "Post & Promote Easily", desc: "List your items or services in seconds. Manage chats, track your listings, and close deals all from one platform." })] })] }), _jsx(Footer, {})] }));
}
