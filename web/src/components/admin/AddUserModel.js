import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import "../../style/admin-model.scss";
export default function AddUserModal({ open, onClose, onCreated, }) {
    const [form, setForm] = useState({
        full_name: "",
        email: "",
        phone: "",
        role: "users", // default lowercase to match DB
        status: "active",
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    useEffect(() => { if (open) {
        setError(null);
        setSubmitting(false);
    } }, [open]);
    const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    const submit = async (e) => {
        e.preventDefault();
        if (!open || submitting)
            return;
        try {
            setSubmitting(true);
            setError(null);
            if (!form.full_name.trim())
                throw new Error("Full name is required.");
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
                throw new Error("Valid email is required.");
            const payload = {
                full_name: form.full_name.trim(),
                email: form.email.trim().toLowerCase(),
                phone: form.phone.trim() || null,
                role: form.role, // 'admin' | 'users'
                status: form.status, // 'active' | 'inactive' | 'suspended'
                posts_count: 0,
                is_verified: true,
                last_active_at: new Date().toISOString(),
            };
            const { error } = await supabase.from("users").insert(payload);
            if (error)
                throw error;
            onCreated();
        }
        catch (err) {
            setError(err.message || "Failed to create user.");
        }
        finally {
            setSubmitting(false);
        }
    };
    if (!open)
        return null;
    return (_jsx("div", { className: "modal-backdrop", onMouseDown: onClose, children: _jsxs("div", { className: "modal-sheet", onMouseDown: (e) => e.stopPropagation(), children: [_jsxs("div", { className: "modal-head", children: [_jsxs("div", { children: [_jsx("h2", { children: "Add New User" }), _jsx("p", { children: "Create a new user account with role and permissions" })] }), _jsx("button", { className: "icon-btn", "aria-label": "Close", onClick: onClose, children: "\u2715" })] }), error && _jsx("div", { className: "modal-alert", children: error }), _jsxs("form", { className: "modal-body", onSubmit: submit, children: [_jsxs("label", { children: [_jsx("span", { children: "Full Name" }), _jsx("input", { name: "full_name", placeholder: "John Doe", value: form.full_name, onChange: onChange, required: true })] }), _jsxs("label", { children: [_jsx("span", { children: "Email" }), _jsx("input", { name: "email", type: "email", placeholder: "john@example.com", value: form.email, onChange: onChange, required: true })] }), _jsxs("label", { children: [_jsx("span", { children: "Phone" }), _jsx("input", { name: "phone", placeholder: "+1 (555) 123-4567", value: form.phone, onChange: onChange })] }), _jsxs("label", { children: [_jsx("span", { children: "Role" }), _jsxs("select", { name: "role", value: form.role, onChange: onChange, className: "tt-cap", children: [_jsx("option", { value: "users", children: "users" }), _jsx("option", { value: "admin", children: "admin" })] })] }), _jsxs("label", { children: [_jsx("span", { children: "Status" }), _jsxs("select", { name: "status", value: form.status, onChange: onChange, className: "tt-cap", children: [_jsx("option", { value: "active", children: "active" }), _jsx("option", { value: "inactive", children: "inactive" }), _jsx("option", { value: "suspended", children: "suspended" })] })] }), _jsxs("div", { className: "modal-actions", children: [_jsx("button", { type: "button", className: "btn ghost", onClick: onClose, children: "Cancel" }), _jsx("button", { type: "submit", className: "btn primary", disabled: submitting, children: submitting ? "Creating…" : "Create User" })] })] })] }) }));
}
