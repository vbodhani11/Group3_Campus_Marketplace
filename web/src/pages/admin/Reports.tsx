import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import "../../style/admin-reports.scss";

type ReportType = "user" | "listing";
type ReportStatus = "Open" | "In Progress" | "Resolved" | "Dismissed";
type ReportPriority = "Low" | "Medium" | "High" | "Critical";

type DbUser = {
  id: string;
  full_name: string | null;
  email: string;
  role?: string | null;
  status?: string | null;
};

type DbListing = {
  id: string; // UUID now
  product_id: string | null;
  title: string;
  category: string | null;
  price: number | null;
  status: string | null;
  seller_id: string | null;
};

type DbReport = {
  id: number;
  report_type: ReportType;
  category: string;
  description: string | null;
  reporter_id: string | null;
  reported_user_id: string | null;
  reported_listing_id: string | null; // UUID now
  priority: ReportPriority;
  status: ReportStatus;
  created_at: string;

  // joined data
  reporter: DbUser | null;
  user: DbUser | null;
  listing: DbListing | null;
};

type TabKey =
  | "all"
  | "open"
  | "inProgress"
  | "resolved"
  | "userReports"
  | "listingReports";

const PAGE_SIZE = 6;

export default function ReportsPage() {
  const [reports, setReports] = useState<DbReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<ReportStatus | "All">("All");
  const [priorityFilter, setPriorityFilter] =
    useState<ReportPriority | "All">("All");

  const [currentPage, setCurrentPage] = useState(1);
  const [actionMenuOpenId, setActionMenuOpenId] = useState<number | null>(null);

  // ───────────────────────────── fetch reports ─────────────────────────────
  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("reports")
        .select(
          `
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
        `
        )
        .order("created_at", { ascending: false });

      if (error) {
        console.error(error);
        setError("Failed to load reports.");
      } else {
        setReports((data as unknown as DbReport[]) ?? []);
      }

      setLoading(false);
    };

    fetchReports();
  }, []);

  // ────────────────────────────── KPI cards ────────────────────────────────
  const totalReports = reports.length;
  const openReports = reports.filter((r) => r.status === "Open").length;
  const inProgressReports = reports.filter(
    (r) => r.status === "In Progress"
  ).length;
  const criticalReports = reports.filter(
    (r) => r.priority === "Critical"
  ).length;

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
        const text = (
          r.category +
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
          userName
        ).toLowerCase();
        return text.includes(q);
      });
    }

    return list;
  }, [reports, activeTab, statusFilter, priorityFilter, searchTerm]);

  // ───────────────────────────── pagination ────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(filteredReports.length / PAGE_SIZE));

  const paginatedReports = filteredReports.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, statusFilter, priorityFilter, searchTerm]);

  // ───────────────────────────── update helpers ────────────────────────────
  const updateReport = async (
    id: number,
    updates: Partial<Pick<DbReport, "status" | "priority">>
  ) => {
    const { error } = await supabase
      .from("reports")
      .update(updates)
      .eq("id", id);

    if (error) {
      console.error(error);
      setError("Failed to update report.");
      return;
    }

    setReports((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updates } : r))
    );
  };

  // ───────────────────────────── render helpers ────────────────────────────
  const formatDate = (iso: string) => iso.slice(0, 10);

  const renderPriorityBadge = (priority: ReportPriority) => (
    <span className={`priority-badge priority-${priority.toLowerCase()}`}>
      {priority}
    </span>
  );

  const renderStatusBadge = (status: ReportStatus) => (
    <span
      className={`status-badge status-${status
        .replace(" ", "-")
        .toLowerCase()}`}
    >
      {status}
    </span>
  );

  const renderReportTypeChip = (report: DbReport) => {
    if (report.report_type === "listing") {
      return <span className="chip chip-type">Listing</span>;
    }
    return <span className="chip chip-type chip-user">User</span>;
  };

  const renderCategoryChip = (category: string) => (
    <span className="chip chip-category">{category}</span>
  );

  // ───────────────────────────────── UI ────────────────────────────────────
  return (
    <div className="admin-reports-page">
      <header className="page-header">
        <h1>Reports</h1>
      </header>

      {/* KPI cards */}
      <section className="reports-kpis">
        <div className="kpi-card">
          <div className="kpi-label">Total Reports</div>
          <div className="kpi-value">{totalReports}</div>
          <div className="kpi-sub">Last 30 days</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Open Reports</div>
          <div className="kpi-value">{openReports}</div>
          <div className="kpi-sub">Require attention</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">In Progress</div>
          <div className="kpi-value">{inProgressReports}</div>
          <div className="kpi-sub">Being reviewed</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Critical</div>
          <div className="kpi-value">{criticalReports}</div>
          <div className="kpi-sub">High priority issues</div>
        </div>
      </section>

      {/* Main card */}
      <section className="reports-card">
        <div className="reports-card-header">
          <div>
            <h2>Reports &amp; Complaints</h2>
            <p>Review and manage user reports and complaints</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="reports-tabs">
          {[
            { key: "all", label: "All Reports" },
            { key: "open", label: "Open" },
            { key: "inProgress", label: "In Progress" },
            { key: "resolved", label: "Resolved" },
            { key: "userReports", label: "User Reports" },
            { key: "listingReports", label: "Listing Reports" },
          ].map((tab) => (
            <button
              key={tab.key}
              className={`tab-button ${
                activeTab === tab.key ? "active" : ""
              }`}
              onClick={() => setActiveTab(tab.key as TabKey)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Filters row */}
        <div className="reports-filters">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search by description, reporter, or item..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filters-right">
            <div className="filter-select">
              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value as ReportStatus | "All")
                }
              >
                <option value="All">All Status</option>
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
                <option value="Dismissed">Dismissed</option>
              </select>
            </div>
            <div className="filter-select">
              <select
                value={priorityFilter}
                onChange={(e) =>
                  setPriorityFilter(e.target.value as ReportPriority | "All")
                }
              >
                <option value="All">All Priority</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="reports-table-wrapper">
          {loading ? (
            <div className="table-loading">Loading reports…</div>
          ) : error ? (
            <div className="table-error">{error}</div>
          ) : paginatedReports.length === 0 ? (
            <div className="table-empty">No reports found.</div>
          ) : (
            <table className="reports-table">
              <thead>
                <tr>
                  <th>Report Details</th>
                  <th>Reported Item</th>
                  <th>Reporter</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th className="col-actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedReports.map((report) => (
                  <tr key={report.id}>
                    {/* Report details */}
                    <td className="col-details">
                      <div className="details-chips">
                        {renderReportTypeChip(report)}
                        {renderCategoryChip(report.category)}
                      </div>
                      <div className="details-text">
                        {report.description || "No description provided."}
                      </div>
                    </td>

                    {/* Reported item */}
                    <td className="col-item">
                        {report.report_type === "listing" && report.listing ? (
                    <div>
                    {/* main item title */}
                    <div className="item-title">
                        {report.listing.title}
                    </div>
                    {/* small category text under it */}
                    {report.listing.category && (
                    <div className="item-sub">
                        {report.listing.category}
                    </div>
                    )}
                    </div>
                    ) : report.report_type === "user" && report.user ? (
                    <div>
                    {/* show which user account is being reported */}
                    <div className="item-title">
                        {report.user.full_name || "User account"}
                    </div>
                    <div className="item-sub">User account</div>
                    </div>
                    ) : (
                    <span>-</span>
                    )}
                    </td>

                    {/* Reporter */}
                    <td className="col-reporter">
                      {report.reporter ? (
                        <div>
                          <div className="reporter-name">
                            {report.reporter.full_name || "User"}
                          </div>
                          <div className="reporter-email">
                            {report.reporter.email}
                          </div>
                        </div>
                      ) : (
                        <span>-</span>
                      )}
                    </td>

                    {/* Priority */}
                    <td className="col-priority">
                      {renderPriorityBadge(report.priority)}
                    </td>

                    {/* Status */}
                    <td className="col-status">
                      {renderStatusBadge(report.status)}
                    </td>

                    {/* Date */}
                    <td className="col-date">
                      {formatDate(report.created_at)}
                    </td>

                    {/* Actions */}
                    <td className="col-actions">
                      <div className="actions-wrapper">
                        <button
                          className="actions-button"
                          onClick={() =>
                            setActionMenuOpenId((prev) =>
                              prev === report.id ? null : report.id
                            )
                          }
                        >
                          ⋮
                        </button>
                        {actionMenuOpenId === report.id && (
                          <div className="actions-menu">
                            {report.status !== "In Progress" && (
                              <button
                                onClick={() =>
                                  updateReport(report.id, {
                                    status: "In Progress",
                                  })
                                }
                              >
                                Mark In Progress
                              </button>
                            )}
                            {report.status !== "Resolved" && (
                              <button
                                onClick={() =>
                                  updateReport(report.id, {
                                    status: "Resolved",
                                  })
                                }
                              >
                                Mark Resolved
                              </button>
                            )}
                            {report.status !== "Dismissed" && (
                              <button
                                onClick={() =>
                                  updateReport(report.id, {
                                    status: "Dismissed",
                                  })
                                }
                              >
                                Dismiss
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer / pagination */}
        <div className="reports-footer">
          <span>
            Showing {paginatedReports.length} of {filteredReports.length} reports
          </span>
          <div className="pagination">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
