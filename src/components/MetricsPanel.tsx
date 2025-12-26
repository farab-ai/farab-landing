import React, { useState, useEffect, useMemo } from "react";
import { APIHOST } from "../utils/url";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const API_BASE = `${APIHOST}/api/admin`;

// 🌍 Data Structures
interface DailyEarning {
  date: string;
  revenue: number;
  count: number;
}

interface EarningsData {
  totalPurchaseCount: number;
  totalRevenue: number;
  daily: DailyEarning[];
}

interface DailyCount {
  date: string;
  count: number;
}

interface RegistrationsData {
  totalRegistrations: number;
  daily: DailyCount[];
}

interface ActivityData {
  dau: number;
  mau: number;
  daily: DailyCount[];
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

const styles: { [key: string]: Style } = {
  panel: { padding: "0 0 40px 0", background: "#fff" },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "30px",
  },
  heading: { fontSize: "28px", fontWeight: 700, color: TEXT_COLOR },
  dateRangeContainer: {
    display: "flex",
    gap: "15px",
    alignItems: "center",
    marginBottom: "30px",
    padding: "20px",
    background: HOVER_COLOR,
    borderRadius: "8px",
    border: `1px solid ${BORDER_COLOR}`,
  },
  dateGroup: { display: "flex", flexDirection: "column", gap: "8px" },
  label: { display: "block", color: TEXT_COLOR, fontWeight: 600, fontSize: "14px" },
  input: {
    padding: "10px",
    border: `1px solid ${BORDER_COLOR}`,
    borderRadius: "6px",
    fontSize: "1em",
    transition: "border-color 0.2s",
  },
  summaryContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "20px",
    marginBottom: "30px",
  },
  summaryCard: {
    background: "#fff",
    padding: "20px",
    border: `1px solid ${BORDER_COLOR}`,
    borderRadius: "8px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
  },
  summaryLabel: { color: MUTED_COLOR, fontSize: "14px", marginBottom: "8px" },
  summaryValue: { fontSize: "24px", fontWeight: 700, color: PRIMARY_COLOR },
  chartContainer: {
    background: "#fff",
    padding: "20px",
    border: `1px solid ${BORDER_COLOR}`,
    borderRadius: "8px",
    marginBottom: "20px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
  },
  chartTitle: { fontSize: "18px", fontWeight: 600, color: TEXT_COLOR, marginBottom: "15px" },
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
};

const MetricsPanel: React.FC = () => {
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [earningsData, setEarningsData] = useState<EarningsData | null>(null);
  const [registrationsData, setRegistrationsData] = useState<RegistrationsData | null>(null);
  const [activityData, setActivityData] = useState<ActivityData | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Set default dates (today to 1 month ago) and auto-load data
  useEffect(() => {
    const today = new Date();
    const oneMonthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());

    const startDateStr = oneMonthAgo.toISOString().split("T")[0];
    const endDateStr = today.toISOString().split("T")[0];

    setStartDate(startDateStr);
    setEndDate(endDateStr);
  }, []);

  // Auto-dismiss messages
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // Auto-fetch data when dates are set or changed
  useEffect(() => {
    if (startDate && endDate) {
      fetchAllData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate]);

  const loadDemoData = () => {
    const mockEarnings: EarningsData = {
      totalPurchaseCount: 150,
      totalRevenue: 1497.50,
      daily: [
        { date: "2024-01-01", revenue: 89.85, count: 10 },
        { date: "2024-01-02", revenue: 149.75, count: 15 },
        { date: "2024-01-03", revenue: 119.60, count: 12 },
        { date: "2024-01-04", revenue: 179.40, count: 18 },
        { date: "2024-01-05", revenue: 99.70, count: 10 },
        { date: "2024-01-06", revenue: 139.65, count: 14 },
        { date: "2024-01-07", revenue: 159.55, count: 16 },
        { date: "2024-01-08", revenue: 129.50, count: 13 },
        { date: "2024-01-09", revenue: 189.45, count: 19 },
        { date: "2024-01-10", revenue: 109.60, count: 11 },
      ],
    };
    const mockRegistrations: RegistrationsData = {
      totalRegistrations: 150,
      daily: [
        { date: "2024-01-01", count: 10 },
        { date: "2024-01-02", count: 15 },
        { date: "2024-01-03", count: 12 },
        { date: "2024-01-04", count: 18 },
        { date: "2024-01-05", count: 10 },
        { date: "2024-01-06", count: 14 },
        { date: "2024-01-07", count: 16 },
        { date: "2024-01-08", count: 13 },
        { date: "2024-01-09", count: 19 },
        { date: "2024-01-10", count: 11 },
      ],
    };
    const mockActivity: ActivityData = {
      dau: 250,
      mau: 1500,
      daily: [
        { date: "2024-01-01", count: 245 },
        { date: "2024-01-02", count: 260 },
        { date: "2024-01-03", count: 240 },
        { date: "2024-01-04", count: 255 },
        { date: "2024-01-05", count: 235 },
        { date: "2024-01-06", count: 265 },
        { date: "2024-01-07", count: 270 },
        { date: "2024-01-08", count: 250 },
        { date: "2024-01-09", count: 268 },
        { date: "2024-01-10", count: 242 },
      ],
    };
    setEarningsData(mockEarnings);
    setRegistrationsData(mockRegistrations);
    setActivityData(mockActivity);
    setMessage({ text: "Demo data loaded successfully", type: "success" });
  };

  const fetchEarnings = async () => {
    if (!startDate || !endDate) {
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE}/earnings?start_date=${startDate}&end_date=${endDate}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: EarningsData = await response.json();
      setEarningsData(data);
    } catch (error) {
      console.error("Error fetching earnings:", error);
      setMessage({
        text: `Failed to fetch earnings: ${error instanceof Error ? error.message : "Unknown error"}`,
        type: "error",
      });
      throw error; // Re-throw so Promise.allSettled can track it
    }
  };

  const fetchRegistrations = async () => {
    if (!startDate || !endDate) {
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE}/user-stats/registrations?start_date=${startDate}&end_date=${endDate}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: RegistrationsData = await response.json();
      setRegistrationsData(data);
    } catch (error) {
      console.error("Error fetching registrations:", error);
      setMessage({
        text: `Failed to fetch registrations: ${error instanceof Error ? error.message : "Unknown error"}`,
        type: "error",
      });
      throw error; // Re-throw so Promise.allSettled can track it
    }
  };

  const fetchActivity = async () => {
    if (!startDate || !endDate) {
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE}/user-stats/activity?start_date=${startDate}&end_date=${endDate}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ActivityData = await response.json();
      setActivityData(data);
    } catch (error) {
      console.error("Error fetching activity:", error);
      setMessage({
        text: `Failed to fetch activity: ${error instanceof Error ? error.message : "Unknown error"}`,
        type: "error",
      });
      throw error; // Re-throw so Promise.allSettled can track it
    }
  };

  const fetchAllData = async () => {
    if (!startDate || !endDate) {
      setMessage({ text: "Please select both start and end dates", type: "error" });
      return;
    }

    setLoading(true);
    const results = await Promise.allSettled([
      fetchEarnings(),
      fetchRegistrations(),
      fetchActivity(),
    ]);
    
    const failures = results.filter(r => r.status === 'rejected');
    if (failures.length === 0) {
      setMessage({ text: "All metrics loaded successfully", type: "success" });
    } else if (failures.length === results.length) {
      // All failed, error message already set by individual fetch functions
    } else {
      // Some succeeded, some failed
      setMessage({ text: "Some metrics failed to load", type: "error" });
    }
    
    setLoading(false);
  };

  // Memoize formatters to avoid creating new objects on every render
  const formatNumber = useMemo(
    () => (num: number) => {
      return new Intl.NumberFormat("en-US").format(num);
    },
    []
  );

  const formatCurrency = useMemo(
    () => (num: number) => {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(num);
    },
    []
  );

  return (
    <div style={styles.panel}>
      {/* Header */}
      <div style={styles.sectionHeader}>
        <h1 style={styles.heading}>Metrics</h1>
      </div>

      {/* Date Range Selection */}
      <div style={styles.dateRangeContainer}>
        <div style={styles.dateGroup}>
          <label htmlFor="start-date" style={styles.label}>Start Date</label>
          <input
            id="start-date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            style={styles.input}
          />
        </div>
        <div style={styles.dateGroup}>
          <label htmlFor="end-date" style={styles.label}>End Date</label>
          <input
            id="end-date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            style={styles.input}
          />
        </div>
        <div style={{ marginTop: "auto", display: "flex", gap: "10px" }}>
          <button
            onClick={fetchAllData}
            style={getButtonStyle(PRIMARY_COLOR, "white")}
            disabled={loading}
          >
            {loading ? "Loading..." : "Load All Metrics"}
          </button>
          <button
            onClick={loadDemoData}
            style={getButtonStyle("#8b5cf6", "white")}
            disabled={loading}
          >
            Load Demo Data
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && <div style={styles.loadingState}>Loading metrics data...</div>}

      {/* Empty State */}
      {!loading && !earningsData && !registrationsData && !activityData && (
        <div style={styles.emptyState}>
          <p>No metrics data available for the selected date range</p>
          <p style={{ marginTop: "10px", color: "#8b5cf6" }}>
            Or click "Load Demo Data" to see sample charts
          </p>
        </div>
      )}

      {/* User Registration Metrics */}
      {!loading && registrationsData && (
        <>
          <div style={{ ...styles.chartTitle, fontSize: "22px", marginTop: "40px", marginBottom: "20px" }}>
            User Registration Statistics
          </div>
          <div style={styles.summaryContainer}>
            <div style={styles.summaryCard}>
              <div style={styles.summaryLabel}>Total Registrations</div>
              <div style={styles.summaryValue}>{formatNumber(registrationsData.totalRegistrations)}</div>
            </div>
          </div>

          {/* Charts */}
          {registrationsData.daily.length > 0 ? (
            <>
              {/* Daily Registrations Chart */}
              <div style={styles.chartContainer}>
                <div style={styles.chartTitle}>Daily User Registrations</div>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={registrationsData.daily}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#10b981" name="Registrations" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Registration Trend Line Chart */}
              <div style={styles.chartContainer}>
                <div style={styles.chartTitle}>Registration Trend</div>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={registrationsData.daily}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="#10b981"
                      name="Registrations"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </>
          ) : (
            <div style={styles.emptyState}>
              <p>No daily registration data available for the selected date range</p>
            </div>
          )}
        </>
      )}

      {/* User Activity Metrics */}
      {!loading && activityData && (
        <>
          <div style={{ ...styles.chartTitle, fontSize: "22px", marginTop: "40px", marginBottom: "20px" }}>
            User Activity Statistics
          </div>
          <div style={styles.summaryContainer}>
            <div style={styles.summaryCard}>
              <div style={styles.summaryLabel}>Daily Active Users (DAU)</div>
              <div style={styles.summaryValue}>{formatNumber(activityData.dau)}</div>
            </div>
            <div style={styles.summaryCard}>
              <div style={styles.summaryLabel}>Monthly Active Users (MAU)</div>
              <div style={styles.summaryValue}>{formatNumber(activityData.mau)}</div>
            </div>
            <div style={styles.summaryCard}>
              <div style={styles.summaryLabel}>DAU/MAU Ratio</div>
              <div style={styles.summaryValue}>
                {activityData.mau > 0 
                  ? `${((activityData.dau / activityData.mau) * 100).toFixed(1)}%`
                  : 'N/A'}
              </div>
            </div>
          </div>

          {/* Charts */}
          {activityData.daily.length > 0 ? (
            <>
              {/* Daily Active Users Chart */}
              <div style={styles.chartContainer}>
                <div style={styles.chartTitle}>Daily Active Users</div>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={activityData.daily}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#8b5cf6" name="Active Users" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Activity Trend Line Chart */}
              <div style={styles.chartContainer}>
                <div style={styles.chartTitle}>Activity Trend</div>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={activityData.daily}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="#8b5cf6"
                      name="Active Users"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </>
          ) : (
            <div style={styles.emptyState}>
              <p>No daily activity data available for the selected date range</p>
            </div>
          )}
        </>
      )}

      {/* Earnings Metrics */}
      {!loading && earningsData && (
        <>
          <div style={{ ...styles.chartTitle, fontSize: "22px", marginTop: "40px", marginBottom: "20px" }}>
            Earnings Statistics
          </div>
          <div style={styles.summaryContainer}>
            <div style={styles.summaryCard}>
              <div style={styles.summaryLabel}>Total Purchase Count</div>
              <div style={styles.summaryValue}>{formatNumber(earningsData.totalPurchaseCount)}</div>
            </div>
            <div style={styles.summaryCard}>
              <div style={styles.summaryLabel}>Total Revenue</div>
              <div style={styles.summaryValue}>{formatCurrency(earningsData.totalRevenue)}</div>
            </div>
          </div>

          {/* Charts */}
          {earningsData.daily.length > 0 ? (
            <>
              {/* Revenue Per Day Chart */}
              <div style={styles.chartContainer}>
                <div style={styles.chartTitle}>Revenue Per Day</div>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={earningsData.daily}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value) => (typeof value === 'number' ? formatCurrency(value) : value)} />
                    <Legend />
                    <Bar dataKey="revenue" fill="#0c4a6e" name="Revenue (USD)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Purchase Count Per Day Chart */}
              <div style={styles.chartContainer}>
                <div style={styles.chartTitle}>Purchase Count Per Day</div>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={earningsData.daily}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="#10b981"
                      name="Purchase Count"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Combined Chart */}
              <div style={styles.chartContainer}>
                <div style={styles.chartTitle}>Revenue & Purchase Count</div>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={earningsData.daily}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="revenue"
                      stroke="#0c4a6e"
                      name="Revenue (USD)"
                      strokeWidth={2}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="count"
                      stroke="#10b981"
                      name="Purchase Count"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </>
          ) : (
            <div style={styles.emptyState}>
              <p>No daily earnings data available for the selected date range</p>
            </div>
          )}
        </>
      )}

      {/* Notification Message */}
      {message && <div style={getNotificationStyle(message.type)}>{message.text}</div>}
    </div>
  );
};

export default MetricsPanel;
