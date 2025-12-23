import React, { useState, useEffect, useMemo } from "react";
import { APIHOST } from "../utils/url";

const API_BASE = `${APIHOST}/api/admin`;

// 🌍 Data Structures
interface SupportRequest {
  id: string;
  email: string;
  subject: string;
  message: string;
  status: string;
  source: string;
  platform: string;
  appVersion: string;
  locale: string;
  ipAddress: string;
  createdAt: string;
}

interface ListSupportRequestsResponse {
  requests: SupportRequest[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// 🎨 Styles
const PRIMARY_COLOR = "#0c4a6e";
const TEXT_COLOR = "#1e293b";
const MUTED_COLOR = "#64748b";
const BORDER_COLOR = "#e2e8f0";
const HOVER_COLOR = "#f8fafc";

type Style = React.CSSProperties;

const getButtonStyle = (background: string, color: string, small: boolean = false): Style => ({
  padding: small ? "6px 12px" : "10px 20px",
  border: "none",
  borderRadius: "6px",
  fontSize: small ? "0.9em" : "1em",
  cursor: "pointer",
  fontWeight: 500,
  transition: "all 0.2s ease",
  background,
  color,
});

const getNotificationStyle = (type: "success" | "error"): Style => ({
  position: "fixed",
  top: "20px",
  right: "20px",
  padding: "15px 25px",
  borderRadius: "6px",
  fontWeight: 500,
  maxWidth: "400px",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
  zIndex: 1000,
  background: type === "success" ? "#10b981" : "#ef4444",
  color: "white",
});

const getStatusBadgeStyle = (status: string): Style => ({
  display: "inline-block",
  padding: "4px 12px",
  borderRadius: "12px",
  fontSize: "0.85em",
  fontWeight: 600,
  background:
    status === "open"
      ? "#dbeafe"
      : status === "in_progress"
      ? "#fef3c7"
      : "#d1fae5",
  color:
    status === "open"
      ? "#1e40af"
      : status === "in_progress"
      ? "#92400e"
      : "#065f46",
});

const styles: { [key: string]: Style } = {
  panel: { padding: "0 0 40px 0", background: "#fff" },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "30px",
  },
  heading: { fontSize: "28px", fontWeight: 700, color: TEXT_COLOR },
  filterContainer: {
    display: "flex",
    gap: "15px",
    alignItems: "center",
    marginBottom: "20px",
    padding: "15px",
    background: HOVER_COLOR,
    borderRadius: "8px",
    border: `1px solid ${BORDER_COLOR}`,
  },
  filterGroup: { display: "flex", flexDirection: "column", gap: "8px" },
  label: { display: "block", color: TEXT_COLOR, fontWeight: 600, fontSize: "14px" },
  select: {
    padding: "8px 12px",
    border: `1px solid ${BORDER_COLOR}`,
    borderRadius: "6px",
    fontSize: "1em",
    transition: "border-color 0.2s",
    minWidth: "150px",
  },
  tableContainer: {
    border: `1px solid ${BORDER_COLOR}`,
    borderRadius: "8px",
    overflow: "hidden",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "14px",
  },
  tableHeader: {
    background: HOVER_COLOR,
    color: TEXT_COLOR,
    textAlign: "left",
    fontWeight: 600,
  },
  tableHeadCell: {
    padding: "12px 16px",
    borderBottom: `1px solid ${BORDER_COLOR}`,
    color: MUTED_COLOR,
  },
  tableDataCell: {
    padding: "12px 16px",
    color: TEXT_COLOR,
    borderBottom: `1px solid ${BORDER_COLOR}`,
  },
  emptyState: {
    textAlign: "center",
    padding: "40px",
    color: MUTED_COLOR,
    border: `1px dashed ${BORDER_COLOR}`,
    borderRadius: "8px",
  },
  loadingState: {
    textAlign: "center",
    padding: "40px",
    color: MUTED_COLOR,
  },
  paginationContainer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "20px",
    padding: "15px",
    background: HOVER_COLOR,
    borderRadius: "8px",
    border: `1px solid ${BORDER_COLOR}`,
  },
  paginationInfo: {
    color: MUTED_COLOR,
    fontSize: "14px",
  },
  paginationButtons: {
    display: "flex",
    gap: "10px",
  },
  messagePreview: {
    maxWidth: "300px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
};

const SupportRequestsPanel: React.FC = () => {
  const [requests, setRequests] = useState<SupportRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(
    null
  );
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(30);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const showNotification = (text: string, type: "success" | "error") => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 4000);
  };

  const loadSupportRequests = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        pageSize: pageSize.toString(),
      });

      if (statusFilter) {
        params.append("status", statusFilter);
      }

      const response = await fetch(`${API_BASE}/support-requests?${params.toString()}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ListSupportRequestsResponse = await response.json();
      setRequests(data.requests || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
      setCurrentPage(data.page || 1);
    } catch (error) {
      console.error("Error fetching support requests:", error);
      showNotification(
        `Failed to fetch support requests: ${error instanceof Error ? error.message : "Unknown error"}`,
        "error"
      );
      // Set empty state on error
      setRequests([]);
      setTotal(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSupportRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, statusFilter]);

  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const formatDate = useMemo(
    () => (dateString: string) => {
      try {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }).format(date);
      } catch {
        return dateString;
      }
    },
    []
  );

  return (
    <div style={styles.panel}>
      {/* Header */}
      <div style={styles.sectionHeader}>
        <h1 style={styles.heading}>Support Requests</h1>
      </div>

      {/* Filter Controls */}
      <div style={styles.filterContainer}>
        <div style={styles.filterGroup}>
          <label htmlFor="status-filter" style={styles.label}>
            Status
          </label>
          <select
            id="status-filter"
            value={statusFilter}
            onChange={handleStatusFilterChange}
            style={styles.select}
          >
            <option value="">All Statuses</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="closed">Closed</option>
          </select>
        </div>
        <div style={{ marginTop: "auto" }}>
          <button onClick={loadSupportRequests} style={getButtonStyle(PRIMARY_COLOR, "white")}>
            Refresh
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && <div style={styles.loadingState}>Loading support requests...</div>}

      {/* Empty State */}
      {!loading && requests.length === 0 && (
        <div style={styles.emptyState}>
          <p>No support requests found</p>
          {statusFilter && <p style={{ marginTop: "10px" }}>Try changing the filter</p>}
        </div>
      )}

      {/* Support Requests Table */}
      {!loading && requests.length > 0 && (
        <>
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHeader}>
                  <th style={{ ...styles.tableHeadCell, width: "12%" }}>Created</th>
                  <th style={{ ...styles.tableHeadCell, width: "18%" }}>Email</th>
                  <th style={{ ...styles.tableHeadCell, width: "18%" }}>Subject</th>
                  <th style={{ ...styles.tableHeadCell, width: "25%" }}>Message</th>
                  <th style={{ ...styles.tableHeadCell, width: "10%" }}>Status</th>
                  <th style={{ ...styles.tableHeadCell, width: "8%" }}>Source</th>
                  <th style={{ ...styles.tableHeadCell, width: "9%" }}>Platform</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((request) => (
                  <tr
                    key={request.id}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = HOVER_COLOR)
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "white")
                    }
                  >
                    <td style={styles.tableDataCell}>{formatDate(request.createdAt)}</td>
                    <td style={styles.tableDataCell}>{request.email}</td>
                    <td style={styles.tableDataCell}>{request.subject}</td>
                    <td style={styles.tableDataCell}>
                      <div style={styles.messagePreview} title={request.message}>
                        {request.message}
                      </div>
                    </td>
                    <td style={styles.tableDataCell}>
                      <span style={getStatusBadgeStyle(request.status)}>
                        {request.status.replace("_", " ")}
                      </span>
                    </td>
                    <td style={styles.tableDataCell}>{request.source || "—"}</td>
                    <td style={styles.tableDataCell}>{request.platform || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div style={styles.paginationContainer}>
            <div style={styles.paginationInfo}>
              Showing {requests.length} of {total} requests (Page {currentPage} of {totalPages})
            </div>
            <div style={styles.paginationButtons}>
              <button
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                style={{
                  ...getButtonStyle(BORDER_COLOR, TEXT_COLOR, true),
                  opacity: currentPage === 1 ? 0.5 : 1,
                  cursor: currentPage === 1 ? "not-allowed" : "pointer",
                }}
              >
                Previous
              </button>
              <button
                onClick={handleNextPage}
                disabled={currentPage >= totalPages}
                style={{
                  ...getButtonStyle(BORDER_COLOR, TEXT_COLOR, true),
                  opacity: currentPage >= totalPages ? 0.5 : 1,
                  cursor: currentPage >= totalPages ? "not-allowed" : "pointer",
                }}
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}

      {/* Notification Message */}
      {message && <div style={getNotificationStyle(message.type)}>{message.text}</div>}
    </div>
  );
};

export default SupportRequestsPanel;
