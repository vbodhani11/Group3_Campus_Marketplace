import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import "../../style/admin-reports.scss";
const PAGE_SIZE = 6;
export default function ReportsPage() {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [priorityFilter, setPriorityFilter] = useState("All");
    const [currentPage, setCurrentPage] = useState(1);
    const [actionMenuOpenId, setActionMenuOpenId] = useState(null);
    // ───────────────────────────── fetch reports ─────────────────────────────
    useEffect(() => {
        const fetchReports = async () => {
            setLoading(true);
            setError(null);
            const { data, error } = await supabase
                .from("reports")
                .select(`
          id,
          report_type,
          category,
          description,
          reporter_id,
          reported_user_id,
          reported_listing_id,
          priority,
          status,
          created_at,
          reporter:reporter_id (
            id,
            full_name,
            email,
            role,
            status
          ),
          user:reported_user_id (
            id,
            full_name,
            email,
            role,
            status
          ),
          listing:reported_listing_id (
            id,
            product_id,
            title,
            category,
            price,
            status,
            seller_id
          )
        `)
                .order("created_at", { ascending: false });
            if (error) {
                console.error(error);
                setError("Failed to load reports.");
            }
            else {
                setReports(data ?? []);
            }
            setLoading(false);
        };
        fetchReports();
    }, []);
    // ────────────────────────────── KPI cards ────────────────────────────────
    const totalReports = reports.length;
    const openReports = reports.filter((r) => r.status === "Open").length;
    const inProgressReports = reports.filter((r) => r.status === "In Progress").length;
    const criticalReports = reports.filter((r) => r.priority === "Critical").length;
    // ───────────────────────────── filtering logic ───────────────────────────
    const filteredReports = useMemo(() => {
        let list = [...reports];
        // Tabs
        switch (activeTab) {
            case "open":
                list = list.filter((r) => r.status === "Open");
                break;
            case "inProgress":
                list = list.filter((r) => r.status === "In Progress");
                break;
            case "resolved":
                list = list.filter((r) => r.status === "Resolved");
                break;
            case "userReports":
                list = list.filter((r) => r.report_type === "user");
                break;
            case "listingReports":
                list = list.filter((r) => r.report_type === "listing");
                break;
            default:
                break;
        }
        // Status filter
        if (statusFilter !== "All") {
            list = list.filter((r) => r.status === statusFilter);
        }
        // Priority filter
        if (priorityFilter !== "All") {
            list = list.filter((r) => r.priority === priorityFilter);
        }
        // Search
        if (searchTerm.trim()) {
            const q = searchTerm.toLowerCase();
            list = list.filter((r) => {
                const reporterName = r.reporter?.full_name ?? "";
                const reporterEmail = r.reporter?.email ?? "";
                const listingTitle = r.listing?.title ?? "";
                const listingCategory = r.listing?.category ?? "";
                const userName = r.user?.full_name ?? "";
                const text = (r.category +
                    " " +
                    (r.description ?? "") +
                    " " +
                    reporterName +
                    " " +
                    reporterEmail +
                    " " +
                    listingTitle +
                    " " +
                    listingCategory +
                    " " +
                    userName).toLowerCase();
                return text.includes(q);
            });
        }
        return list;
    }, [reports, activeTab, statusFilter, priorityFilter, searchTerm]);
    // ───────────────────────────── pagination ────────────────────────────────
    const totalPages = Math.max(1, Math.ceil(filteredReports.length / PAGE_SIZE));
    const paginatedReports = filteredReports.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
    useEffect(() => {
        setCurrentPage(1);
    }, [activeTab, statusFilter, priorityFilter, searchTerm]);
    // ───────────────────────────── update helpers ────────────────────────────
    const updateReport = async (id, updates) => {
        const { error } = await supabase
            .from("reports")
            .update(updates)
            .eq("id", id);
        if (error) {
            console.error(error);
            setError("Failed to update report.");
            return;
        }
        setReports((prev) => prev.map((r) => (r.id === id ? { ...r, ...updates } : r)));
    };
    // ───────────────────────────── render helpers ────────────────────────────
    const formatDate = (iso) => iso.slice(0, 10);
    const renderPriorityBadge = (priority) => (_jsx("span", { className: `priority-badge priority-${priority.toLowerCase()}`, children: priority }));
    const renderStatusBadge = (status) => (_jsx("span", { className: `status-badge status-${status
            .replace(" ", "-")
            .toLowerCase()}`, children: status }));
    const renderReportTypeChip = (report) => {
        if (report.report_type === "listing") {
            return _jsx("span", { className: "chip chip-type", children: "Listing" });
        }
        return _jsx("span", { className: "chip chip-type chip-user", children: "User" });
    };
    const renderCategoryChip = (category) => (_jsx("span", { className: "chip chip-category", children: category }));
    // ───────────────────────────────── UI ────────────────────────────────────
    return (_jsxs("div", { className: "admin-reports-page", children: [_jsx("header", { className: "page-header", children: _jsx("h1", { children: "Reports" }) }), _jsxs("section", { className: "reports-kpis", children: [_jsxs("div", { className: "kpi-card", children: [_jsx("div", { className: "kpi-label", children: "Total Reports" }), _jsx("div", { className: "kpi-value", children: totalReports }), _jsx("div", { className: "kpi-sub", children: "Last 30 days" })] }), _jsxs("div", { className: "kpi-card", children: [_jsx("div", { className: "kpi-label", children: "Open Reports" }), _jsx("div", { className: "kpi-value", children: openReports }), _jsx("div", { className: "kpi-sub", children: "Require attention" })] }), _jsxs("div", { className: "kpi-card", children: [_jsx("div", { className: "kpi-label", children: "In Progress" }), _jsx("div", { className: "kpi-value", children: inProgressReports }), _jsx("div", { className: "kpi-sub", children: "Being reviewed" })] }), _jsxs("div", { className: "kpi-card", children: [_jsx("div", { className: "kpi-label", children: "Critical" }), _jsx("div", { className: "kpi-value", children: criticalReports }), _jsx("div", { className: "kpi-sub", children: "High priority issues" })] })] }), _jsxs("section", { className: "reports-card", children: [_jsx("div", { className: "reports-card-header", children: _jsxs("div", { children: [_jsx("h2", { children: "Reports & Complaints" }), _jsx("p", { children: "Review and manage user reports and complaints" })] }) }), _jsx("div", { className: "reports-tabs", children: [
                            { key: "all", label: "All Reports" },
                            { key: "open", label: "Open" },
                            { key: "inProgress", label: "In Progress" },
                            { key: "resolved", label: "Resolved" },
                            { key: "userReports", label: "User Reports" },
                            { key: "listingReports", label: "Listing Reports" },
                        ].map((tab) => (_jsx("button", { className: `tab-button ${activeTab === tab.key ? "active" : ""}`, onClick: () => setActiveTab(tab.key), children: tab.label }, tab.key))) }), _jsxs("div", { className: "reports-filters", children: [_jsx("div", { className: "search-box", children: _jsx("input", { type: "text", placeholder: "Search by description, reporter, or item...", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value) }) }), _jsxs("div", { className: "filters-right", children: [_jsx("div", { className: "filter-select", children: _jsxs("select", { value: statusFilter, onChange: (e) => setStatusFilter(e.target.value), children: [_jsx("option", { value: "All", children: "All Status" }), _jsx("option", { value: "Open", children: "Open" }), _jsx("option", { value: "In Progress", children: "In Progress" }), _jsx("option", { value: "Resolved", children: "Resolved" }), _jsx("option", { value: "Dismissed", children: "Dismissed" })] }) }), _jsx("div", { className: "filter-select", children: _jsxs("select", { value: priorityFilter, onChange: (e) => setPriorityFilter(e.target.value), children: [_jsx("option", { value: "All", children: "All Priority" }), _jsx("option", { value: "Low", children: "Low" }), _jsx("option", { value: "Medium", children: "Medium" }), _jsx("option", { value: "High", children: "High" }), _jsx("option", { value: "Critical", children: "Critical" })] }) })] })] }), _jsx("div", { className: "reports-table-wrapper", children: loading ? (_jsx("div", { className: "table-loading", children: "Loading reports\u2026" })) : error ? (_jsx("div", { className: "table-error", children: error })) : paginatedReports.length === 0 ? (_jsx("div", { className: "table-empty", children: "No reports found." })) : (_jsxs("table", { className: "reports-table", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Report Details" }), _jsx("th", { children: "Reported Item" }), _jsx("th", { children: "Reporter" }), _jsx("th", { children: "Priority" }), _jsx("th", { children: "Status" }), _jsx("th", { children: "Date" }), _jsx("th", { className: "col-actions", children: "Actions" })] }) }), _jsx("tbody", { children: paginatedReports.map((report) => (_jsxs("tr", { children: [_jsxs("td", { className: "col-details", children: [_jsxs("div", { className: "details-chips", children: [renderReportTypeChip(report), renderCategoryChip(report.category)] }), _jsx("div", { className: "details-text", children: report.description || "No description provided." })] }), _jsx("td", { className: "col-item", children: report.report_type === "listing" && report.listing ? (_jsxs("div", { children: [_jsx("div", { className: "item-title", children: report.listing.title }), report.listing.category && (_jsx("div", { className: "item-sub", children: report.listing.category }))] })) : report.report_type === "user" && report.user ? (_jsxs("div", { children: [_jsx("div", { className: "item-title", children: report.user.full_name || "User account" }), _jsx("div", { className: "item-sub", children: "User account" })] })) : (_jsx("span", { children: "-" })) }), _jsx("td", { className: "col-reporter", children: report.reporter ? (_jsxs("div", { children: [_jsx("div", { className: "reporter-name", children: report.reporter.full_name || "User" }), _jsx("div", { className: "reporter-email", children: report.reporter.email })] })) : (_jsx("span", { children: "-" })) }), _jsx("td", { className: "col-priority", children: renderPriorityBadge(report.priority) }), _jsx("td", { className: "col-status", children: renderStatusBadge(report.status) }), _jsx("td", { className: "col-date", children: formatDate(report.created_at) }), _jsx("td", { className: "col-actions", children: _jsxs("div", { className: "actions-wrapper", children: [_jsx("button", { className: "actions-button", onClick: () => setActionMenuOpenId((prev) => prev === report.id ? null : report.id), children: "\u22EE" }), actionMenuOpenId === report.id && (_jsxs("div", { className: "actions-menu", children: [report.status !== "In Progress" && (_jsx("button", { onClick: () => updateReport(report.id, {
                                                                        status: "In Progress",
                                                                    }), children: "Mark In Progress" })), report.status !== "Resolved" && (_jsx("button", { onClick: () => updateReport(report.id, {
                                                                        status: "Resolved",
                                                                    }), children: "Mark Resolved" })), report.status !== "Dismissed" && (_jsx("button", { onClick: () => updateReport(report.id, {
                                                                        status: "Dismissed",
                                                                    }), children: "Dismiss" }))] }))] }) })] }, report.id))) })] })) }), _jsxs("div", { className: "reports-footer", children: [_jsxs("span", { children: ["Showing ", paginatedReports.length, " of ", filteredReports.length, " reports"] }), _jsxs("div", { className: "pagination", children: [_jsx("button", { onClick: () => setCurrentPage((p) => Math.max(1, p - 1)), disabled: currentPage === 1, children: "Previous" }), _jsxs("span", { children: ["Page ", currentPage, " of ", totalPages] }), _jsx("button", { onClick: () => setCurrentPage((p) => Math.min(totalPages, p + 1)), disabled: currentPage === totalPages, children: "Next" })] })] })] })] }));
}
