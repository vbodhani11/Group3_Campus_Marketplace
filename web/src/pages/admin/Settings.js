import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React, { useEffect, useMemo, useState } from "react";
import "../../style/admin-settings.scss";
import { supabase } from "../../lib/supabaseClient";
const SETTINGS_KEY = "default";
// --- DEFAULT VALUES (same as your current hard-coded ones) ---
const DEFAULT_PLATFORM = {
    name: "Campus Marketplace",
    tagline: "Buy and Sell with Fellow Students",
    desc: "A trusted marketplace for students to buy and sell items within the campus community.",
    email: "support@campus.edu",
};
const DEFAULT_POLICIES = {
    autoApprove: false,
    maxPrice: 10000,
    defaultDuration: "30 days",
    allowNegotiation: true,
};
const DEFAULT_CATS = [
    "Electronics",
    "Books",
    "Furniture",
    "Clothing",
    "Sports & Outdoors",
    "Home & Garden",
];
const DEFAULT_CAT_SETTINGS = {
    requireSelection: true,
    allowMultiple: false,
};
const DEFAULT_MOD = {
    manualApproval: true,
    profanityFilter: true,
    duplicateDetect: true,
    autoApproveAfter: "24 hours",
};
const DEFAULT_RESTRICTIONS = {
    requireEmailVerification: true,
    campusEmailRequired: true,
    maxActiveListings: 10,
};
const DEFAULT_PAYMENTS = {
    enableOnline: false,
    methods: {
        cashOnPickup: true,
        venmo: true,
        paypal: false,
        card: false,
    },
    feesEnabled: false,
    platformFeePct: 5,
    minFee: 0.5,
};
const DEFAULT_NOTIF = {
    email: {
        newListing: true,
        sale: true,
        reviewReminders: true,
        weeklyReports: true,
    },
    user: {
        approved: true,
        rejected: true,
        newMessage: false,
        priceDrop: false,
    },
};
function Toggle({ checked, onChange, disabled }) {
    return (_jsx("button", { type: "button", className: `tg ${checked ? "on" : ""} ${disabled ? "disabled" : ""}`, onClick: () => !disabled && onChange(!checked), "aria-pressed": checked, children: _jsx("span", { className: "knob" }) }));
}
function FieldRow({ label, sub, children, right, }) {
    return (_jsxs("div", { className: "field-row", children: [_jsxs("div", { className: "left", children: [_jsx("div", { className: "label", children: label }), sub && _jsx("div", { className: "sub", children: sub })] }), _jsx("div", { className: "mid", children: children }), _jsx("div", { className: "right", children: right })] }));
}
export default function Settings() {
    const [tab, setTab] = useState("general");
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    // General
    const [platform, setPlatform] = useState(DEFAULT_PLATFORM);
    const [policies, setPolicies] = useState(DEFAULT_POLICIES);
    // Categories
    const [newCat, setNewCat] = useState("");
    const [cats, setCats] = useState(DEFAULT_CATS);
    const [catSettings, setCatSettings] = useState(DEFAULT_CAT_SETTINGS);
    // Moderation
    const [mod, setMod] = useState(DEFAULT_MOD);
    const [restrictions, setRestrictions] = useState(DEFAULT_RESTRICTIONS);
    // Payments
    const [payments, setPayments] = useState(DEFAULT_PAYMENTS);
    // Notifications
    const [notif, setNotif] = useState(DEFAULT_NOTIF);
    // Load settings from Supabase on mount
    useEffect(() => {
        const fetchSettings = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from("app_settings")
                .select("*")
                .eq("key", SETTINGS_KEY)
                .single();
            if (error || !data) {
                console.log("Using default settings (no row yet or error):", error?.message);
                setLoading(false);
                return;
            }
            if (data.platform)
                setPlatform(data.platform);
            if (data.policies)
                setPolicies(data.policies);
            if (data.categories)
                setCats(data.categories);
            if (data.cat_settings)
                setCatSettings(data.cat_settings);
            if (data.moderation)
                setMod(data.moderation);
            if (data.restrictions)
                setRestrictions(data.restrictions);
            if (data.payments)
                setPayments(data.payments);
            if (data.notifications)
                setNotif(data.notifications);
            setLoading(false);
        };
        fetchSettings();
    }, []);
    const canSave = useMemo(() => !loading, [loading]);
    const addCategory = () => {
        const v = newCat.trim();
        if (!v || cats.includes(v))
            return;
        setCats([...cats, v]);
        setNewCat("");
    };
    const removeCategory = (name) => setCats(cats.filter((c) => c !== name));
    const handleSave = async () => {
        setSaving(true);
        try {
            const payload = {
                key: SETTINGS_KEY,
                platform,
                policies,
                categories: cats,
                cat_settings: catSettings,
                moderation: mod,
                restrictions,
                payments,
                notifications: notif,
            };
            const { error } = await supabase.from("app_settings").upsert(payload);
            if (error) {
                console.error("Error saving settings:", error.message);
            }
        }
        finally {
            setSaving(false);
        }
    };
    return (_jsxs("div", { className: "admin-settings", children: [_jsx("h1", { className: "page-title", children: "Settings" }), _jsxs("div", { className: "panel", children: [_jsx("div", { className: "panel-head", children: _jsxs("div", { children: [_jsx("div", { className: "panel-title", children: "Marketplace Settings" }), _jsx("div", { className: "panel-sub", children: "Configure your campus marketplace platform" })] }) }), _jsx("div", { className: "tabs", children: [
                            { k: "general", t: "General" },
                            { k: "categories", t: "Categories" },
                            { k: "moderation", t: "Moderation" },
                            { k: "payments", t: "Payments" },
                            { k: "notifications", t: "Notifications" },
                        ].map((x) => (_jsx("button", { className: `tab ${tab === x.k ? "is-active" : ""}`, onClick: () => setTab(x.k), children: x.t }, x.k))) }), tab === "general" && (_jsxs(_Fragment, { children: [_jsxs("section", { className: "section", children: [_jsxs("div", { className: "section-head", children: [_jsx("div", { className: "section-title", children: "Platform Information" }), _jsx("div", { className: "section-sub", children: "Basic configuration for your marketplace" })] }), _jsx(FieldRow, { label: "Marketplace Name", children: _jsx("input", { className: "input", value: platform.name, onChange: (e) => setPlatform({ ...platform, name: e.target.value }) }) }), _jsx(FieldRow, { label: "Tagline", children: _jsx("input", { className: "input", value: platform.tagline, onChange: (e) => setPlatform({ ...platform, tagline: e.target.value }) }) }), _jsx(FieldRow, { label: "Description", children: _jsx("textarea", { className: "textarea", rows: 3, value: platform.desc, onChange: (e) => setPlatform({ ...platform, desc: e.target.value }) }) }), _jsx(FieldRow, { label: "Support Email", children: _jsx("input", { className: "input", value: platform.email, onChange: (e) => setPlatform({ ...platform, email: e.target.value }) }) })] }), _jsxs("section", { className: "section", children: [_jsxs("div", { className: "section-head", children: [_jsx("div", { className: "section-title", children: "Listing Policies" }), _jsx("div", { className: "section-sub", children: "Configure default rules for marketplace listings" })] }), _jsx(FieldRow, { label: "Auto-approve Listings", sub: "Automatically approve new listings without review", right: _jsx(Toggle, { checked: policies.autoApprove, onChange: (v) => setPolicies({ ...policies, autoApprove: v }) }) }), _jsx(FieldRow, { label: "Maximum Listing Price ($)", children: _jsx("input", { type: "number", className: "input", value: policies.maxPrice, onChange: (e) => setPolicies({ ...policies, maxPrice: Number(e.target.value) }) }) }), _jsx(FieldRow, { label: "Default Listing Duration (days)", children: _jsxs("select", { className: "select", value: policies.defaultDuration, onChange: (e) => setPolicies({ ...policies, defaultDuration: e.target.value }), children: [_jsx("option", { children: "7 days" }), _jsx("option", { children: "14 days" }), _jsx("option", { children: "30 days" }), _jsx("option", { children: "60 days" })] }) }), _jsx(FieldRow, { label: "Allow Price Negotiation", sub: "Let buyers make offers below asking price", right: _jsx(Toggle, { checked: policies.allowNegotiation, onChange: (v) => setPolicies({ ...policies, allowNegotiation: v }) }) })] }), _jsx("div", { className: "savebar", children: _jsxs("button", { className: "btn btn--primary", disabled: !canSave || saving, onClick: handleSave, children: [_jsx("span", { className: "ico-disk" }), "Save Changes"] }) })] })), tab === "categories" && (_jsxs(_Fragment, { children: [_jsxs("section", { className: "section", children: [_jsxs("div", { className: "section-head", children: [_jsx("div", { className: "section-title", children: "Manage Categories" }), _jsx("div", { className: "section-sub", children: "Add, edit, or remove listing categories" })] }), _jsxs("div", { className: "add-row", children: [_jsx("input", { className: "input", placeholder: "Enter new category name", value: newCat, onChange: (e) => setNewCat(e.target.value), onKeyDown: (e) => e.key === "Enter" && addCategory() }), _jsx("button", { className: "btn btn--dark", onClick: addCategory, children: "+ Add" })] }), _jsx("div", { className: "chips", children: cats.map((c) => (_jsxs("span", { className: "chip", children: [_jsx("span", { className: "chip-ico", children: "\uD83C\uDFF7\uFE0F" }), c, _jsx("button", { className: "chip-x", onClick: () => removeCategory(c), children: "\u00D7" })] }, c))) })] }), _jsxs("section", { className: "section", children: [_jsxs("div", { className: "section-head", children: [_jsx("div", { className: "section-title", children: "Category Settings" }), _jsx("div", { className: "section-sub", children: "Configure category-specific options" })] }), _jsx(FieldRow, { label: "Require Category Selection", sub: "Force users to select a category when creating listings", right: _jsx(Toggle, { checked: catSettings.requireSelection, onChange: (v) => setCatSettings({ ...catSettings, requireSelection: v }) }) }), _jsx(FieldRow, { label: "Allow Multiple Categories", sub: "Let sellers assign multiple categories to a listing", right: _jsx(Toggle, { checked: catSettings.allowMultiple, onChange: (v) => setCatSettings({ ...catSettings, allowMultiple: v }) }) })] }), _jsx("div", { className: "savebar", children: _jsxs("button", { className: "btn btn--primary", disabled: saving, onClick: handleSave, children: [_jsx("span", { className: "ico-disk" }), "Save Changes"] }) })] })), tab === "moderation" && (_jsxs(_Fragment, { children: [_jsxs("section", { className: "section", children: [_jsxs("div", { className: "section-head", children: [_jsx("div", { className: "section-title", children: "Content Moderation" }), _jsx("div", { className: "section-sub", children: "Set rules for content review and moderation" })] }), _jsx(FieldRow, { label: "Manual Approval Required", sub: "Review all new listings before they go live", right: _jsx(Toggle, { checked: mod.manualApproval, onChange: (v) => setMod({ ...mod, manualApproval: v }) }) }), _jsx(FieldRow, { label: "Profanity Filter", sub: "Automatically flag listings with inappropriate language", right: _jsx(Toggle, { checked: mod.profanityFilter, onChange: (v) => setMod({ ...mod, profanityFilter: v }) }) }), _jsx(FieldRow, { label: "Duplicate Detection", sub: "Detect and prevent duplicate listings", right: _jsx(Toggle, { checked: mod.duplicateDetect, onChange: (v) => setMod({ ...mod, duplicateDetect: v }) }) }), _jsx(FieldRow, { label: "Auto-approve After (hours)", children: _jsxs("select", { className: "select", value: mod.autoApproveAfter, onChange: (e) => setMod({ ...mod, autoApproveAfter: e.target.value }), children: [_jsx("option", { children: "12 hours" }), _jsx("option", { children: "24 hours" }), _jsx("option", { children: "48 hours" })] }) })] }), _jsxs("section", { className: "section", children: [_jsxs("div", { className: "section-head", children: [_jsx("div", { className: "section-title", children: "User Restrictions" }), _jsx("div", { className: "section-sub", children: "Configure user access and restrictions" })] }), _jsx(FieldRow, { label: "Require Email Verification", sub: "Users must verify email before posting", right: _jsx(Toggle, { checked: restrictions.requireEmailVerification, onChange: (v) => setRestrictions({ ...restrictions, requireEmailVerification: v }) }) }), _jsx(FieldRow, { label: "Campus Email Required", sub: "Only allow .edu email addresses", right: _jsx(Toggle, { checked: restrictions.campusEmailRequired, onChange: (v) => setRestrictions({ ...restrictions, campusEmailRequired: v }) }) }), _jsx(FieldRow, { label: "Max Active Listings per User", children: _jsx("input", { type: "number", className: "input", value: restrictions.maxActiveListings, onChange: (e) => setRestrictions({ ...restrictions, maxActiveListings: Number(e.target.value) }) }) })] }), _jsx("div", { className: "savebar", children: _jsxs("button", { className: "btn btn--primary", disabled: saving, onClick: handleSave, children: [_jsx("span", { className: "ico-disk" }), "Save Changes"] }) })] })), tab === "payments" && (_jsxs(_Fragment, { children: [_jsxs("section", { className: "section", children: [_jsxs("div", { className: "section-head", children: [_jsx("div", { className: "section-title", children: "Payment Settings" }), _jsx("div", { className: "section-sub", children: "Configure payment and transaction options" })] }), _jsx(FieldRow, { label: "Enable Online Payments", sub: "Allow buyers to pay through the platform", right: _jsx(Toggle, { checked: payments.enableOnline, onChange: (v) => setPayments({ ...payments, enableOnline: v }) }) }), _jsxs("div", { className: "pm-group", children: [_jsx("div", { className: "pm-label", children: "Payment Methods" }), _jsx("div", { className: "pm-list", children: [
                                                    ["cashOnPickup", "Cash on Pickup"],
                                                    ["venmo", "Venmo"],
                                                    ["paypal", "PayPal"],
                                                    ["card", "Credit/Debit Card"],
                                                ].map(([key, label]) => (_jsxs("label", { className: `pm-item ${payments.methods[key] ? "on" : ""}`, children: [_jsx("input", { type: "checkbox", checked: payments.methods[key], onChange: (e) => setPayments({
                                                                ...payments,
                                                                methods: { ...payments.methods, [key]: e.target.checked },
                                                            }) }), _jsx("span", { className: "pm-switch" }), _jsx("span", { children: label })] }, key))) })] })] }), _jsxs("section", { className: "section", children: [_jsxs("div", { className: "section-head", children: [_jsx("div", { className: "section-title", children: "Transaction Fees" }), _jsx("div", { className: "section-sub", children: "Set platform fees for transactions" })] }), _jsx(FieldRow, { label: "Charge Transaction Fees", sub: "Take a percentage of each sale", right: _jsx(Toggle, { checked: payments.feesEnabled, onChange: (v) => setPayments({ ...payments, feesEnabled: v }) }) }), _jsx(FieldRow, { label: "Platform Fee (%)", children: _jsx("input", { type: "number", className: "input", value: payments.platformFeePct, disabled: !payments.feesEnabled, onChange: (e) => setPayments({ ...payments, platformFeePct: Number(e.target.value) }) }) }), _jsx(FieldRow, { label: "Minimum Fee ($)", children: _jsx("input", { type: "number", step: "0.01", className: "input", value: payments.minFee, disabled: !payments.feesEnabled, onChange: (e) => setPayments({ ...payments, minFee: Number(e.target.value) }) }) })] }), _jsx("div", { className: "savebar", children: _jsxs("button", { className: "btn btn--primary", disabled: saving, onClick: handleSave, children: [_jsx("span", { className: "ico-disk" }), "Save Changes"] }) })] })), tab === "notifications" && (_jsxs(_Fragment, { children: [_jsxs("section", { className: "section", children: [_jsxs("div", { className: "section-head", children: [_jsx("div", { className: "section-title", children: "Email Notifications" }), _jsx("div", { className: "section-sub", children: "Configure automated email notifications" })] }), _jsx(FieldRow, { label: "New Listing Notifications", sub: "Notify admins when new listings are posted", right: _jsx(Toggle, { checked: notif.email.newListing, onChange: (v) => setNotif({ ...notif, email: { ...notif.email, newListing: v } }) }) }), _jsx(FieldRow, { label: "Sale Notifications", sub: "Notify sellers when items are marked as sold", right: _jsx(Toggle, { checked: notif.email.sale, onChange: (v) => setNotif({ ...notif, email: { ...notif.email, sale: v } }) }) }), _jsx(FieldRow, { label: "Review Reminders", sub: "Remind admins of pending listings to review", right: _jsx(Toggle, { checked: notif.email.reviewReminders, onChange: (v) => setNotif({ ...notif, email: { ...notif.email, reviewReminders: v } }) }) }), _jsx(FieldRow, { label: "Weekly Reports", sub: "Send weekly marketplace performance reports", right: _jsx(Toggle, { checked: notif.email.weeklyReports, onChange: (v) => setNotif({ ...notif, email: { ...notif.email, weeklyReports: v } }) }) })] }), _jsxs("section", { className: "section", children: [_jsxs("div", { className: "section-head", children: [_jsx("div", { className: "section-title", children: "User Notifications" }), _jsx("div", { className: "section-sub", children: "Configure notifications sent to users" })] }), _jsx(FieldRow, { label: "Listing Approved", sub: "Notify when their listing is approved", right: _jsx(Toggle, { checked: notif.user.approved, onChange: (v) => setNotif({ ...notif, user: { ...notif.user, approved: v } }) }) }), _jsx(FieldRow, { label: "Listing Rejected", sub: "Notify when their listing is rejected with reason", right: _jsx(Toggle, { checked: notif.user.rejected, onChange: (v) => setNotif({ ...notif, user: { ...notif.user, rejected: v } }) }) }), _jsx(FieldRow, { label: "New Message", sub: "Notify when they receive a message about their listing", right: _jsx(Toggle, { checked: notif.user.newMessage, onChange: (v) => setNotif({ ...notif, user: { ...notif.user, newMessage: v } }) }) }), _jsx(FieldRow, { label: "Price Drop Alerts", sub: "Notify interested buyers of price reductions", right: _jsx(Toggle, { checked: notif.user.priceDrop, onChange: (v) => setNotif({ ...notif, user: { ...notif.user, priceDrop: v } }) }) })] }), _jsx("div", { className: "savebar", children: _jsxs("button", { className: "btn btn--primary", disabled: saving, onClick: handleSave, children: [_jsx("span", { className: "ico-disk" }), "Save Changes"] }) })] }))] })] }));
}
