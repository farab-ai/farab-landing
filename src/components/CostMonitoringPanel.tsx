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
interface DailyUsage {
  date: string;
  total_calls: number;
  total_tokens: number;
  prompt_tokens: number;
  completion_tokens: number;
  total_bytes: number;
  total_cost_usd: number;
}

interface Summary {
  total_calls: number;
  total_tokens: number;
  total_bytes: number;
  total_cost_usd: number;
  average_cost_per_call: number;
}

interface LLMUsageStats {
  daily_usage: DailyUsage[];
  summary: Summary;
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

const CostMonitoringPanel: React.FC = () => {
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [usageStats, setUsageStats] = useState<LLMUsageStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Set default dates (last 30 days)
  useEffect(() => {
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);

    setEndDate(today.toISOString().split("T")[0]);
    setStartDate(thirtyDaysAgo.toISOString().split("T")[0]);
  }, []);

  // Auto-dismiss messages
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const loadDemoData = () => {
    const mockData: LLMUsageStats = {
      daily_usage: [
        {
          date: "2025-11-15",
          total_calls: 45,
          total_tokens: 125000,
          prompt_tokens: 75000,
          completion_tokens: 50000,
          total_bytes: 450000,
          total_cost_usd: 0.020625,
        },
        {
          date: "2025-11-16",
          total_calls: 52,
          total_tokens: 145000,
          prompt_tokens: 85000,
          completion_tokens: 60000,
          total_bytes: 520000,
          total_cost_usd: 0.024375,
        },
        {
          date: "2025-11-17",
          total_calls: 38,
          total_tokens: 98000,
          prompt_tokens: 58000,
          completion_tokens: 40000,
          total_bytes: 380000,
          total_cost_usd: 0.01635,
        },
        {
          date: "2025-11-18",
          total_calls: 67,
          total_tokens: 178000,
          prompt_tokens: 108000,
          completion_tokens: 70000,
          total_bytes: 650000,
          total_cost_usd: 0.0291,
        },
        {
          date: "2025-11-19",
          total_calls: 55,
          total_tokens: 152000,
          prompt_tokens: 92000,
          completion_tokens: 60000,
          total_bytes: 540000,
          total_cost_usd: 0.0249,
        },
        {
          date: "2025-11-20",
          total_calls: 71,
          total_tokens: 195000,
          prompt_tokens: 115000,
          completion_tokens: 80000,
          total_bytes: 720000,
          total_cost_usd: 0.032625,
        },
        {
          date: "2025-11-21",
          total_calls: 48,
          total_tokens: 135000,
          prompt_tokens: 82000,
          completion_tokens: 53000,
          total_bytes: 470000,
          total_cost_usd: 0.02205,
        },
      ],
      summary: {
        total_calls: 376,
        total_tokens: 1028000,
        total_bytes: 3730000,
        total_cost_usd: 0.170025,
        average_cost_per_call: 0.000452,
      },
    };
    setUsageStats(mockData);
    setMessage({ text: "Demo data loaded successfully", type: "success" });
  };

  const fetchUsageStats = async () => {
    if (!startDate || !endDate) {
      setMessage({ text: "Please select both start and end dates", type: "error" });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${API_BASE}/llm-usage/stats?start_date=${startDate}&end_date=${endDate}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: LLMUsageStats = await response.json();
      setUsageStats(data);
      setMessage({ text: "Usage statistics loaded successfully", type: "success" });
    } catch (error) {
      console.error("Error fetching usage stats:", error);
      setMessage({
        text: `Failed to fetch usage stats: ${error instanceof Error ? error.message : "Unknown error"}`,
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when dates are set initially - removed to only load on button click
  // Users should explicitly click "Load Statistics" or "Load Demo Data"

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
        maximumFractionDigits: 6,
      }).format(num);
    },
    []
  );

  return (
    <div style={styles.panel}>
      {/* Header */}
      <div style={styles.sectionHeader}>
        <h1 style={styles.heading}>Cost Monitoring</h1>
      </div>

      {/* Date Range Selection */}
      <div style={styles.dateRangeContainer}>
        <div style={styles.dateGroup}>
          <label style={styles.label}>Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            style={styles.input}
          />
        </div>
        <div style={styles.dateGroup}>
          <label style={styles.label}>End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            style={styles.input}
          />
        </div>
        <div style={{ marginTop: "auto", display: "flex", gap: "10px" }}>
          <button
            onClick={fetchUsageStats}
            style={getButtonStyle(PRIMARY_COLOR, "white")}
            disabled={loading}
          >
            {loading ? "Loading..." : "Load Statistics"}
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
      {loading && <div style={styles.loadingState}>Loading usage statistics...</div>}

      {/* Empty State */}
      {!loading && !usageStats && (
        <div style={styles.emptyState}>
          <p>Select a date range and click "Load Statistics" to view usage data</p>
          <p style={{ marginTop: "10px", color: "#8b5cf6" }}>
            Or click "Load Demo Data" to see sample charts
          </p>
        </div>
      )}

      {/* Summary Cards */}
      {!loading && usageStats && (
        <>
          <div style={styles.summaryContainer}>
            <div style={styles.summaryCard}>
              <div style={styles.summaryLabel}>Total Calls</div>
              <div style={styles.summaryValue}>{formatNumber(usageStats.summary.total_calls)}</div>
            </div>
            <div style={styles.summaryCard}>
              <div style={styles.summaryLabel}>Total Tokens</div>
              <div style={styles.summaryValue}>{formatNumber(usageStats.summary.total_tokens)}</div>
            </div>
            <div style={styles.summaryCard}>
              <div style={styles.summaryLabel}>Total Bytes</div>
              <div style={styles.summaryValue}>{formatNumber(usageStats.summary.total_bytes)}</div>
            </div>
            <div style={styles.summaryCard}>
              <div style={styles.summaryLabel}>Total Cost</div>
              <div style={styles.summaryValue}>{formatCurrency(usageStats.summary.total_cost_usd)}</div>
            </div>
            <div style={styles.summaryCard}>
              <div style={styles.summaryLabel}>Avg Cost per Call</div>
              <div style={styles.summaryValue}>
                {formatCurrency(usageStats.summary.average_cost_per_call)}
              </div>
            </div>
          </div>

          {/* Charts */}
          {usageStats.daily_usage.length > 0 ? (
            <>
              {/* Total Calls Chart */}
              <div style={styles.chartContainer}>
                <div style={styles.chartTitle}>Total Calls Per Day</div>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={usageStats.daily_usage}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="total_calls" fill="#0c4a6e" name="Total Calls" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Token Usage Chart */}
              <div style={styles.chartContainer}>
                <div style={styles.chartTitle}>Token Usage Per Day</div>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={usageStats.daily_usage}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="total_tokens"
                      stroke="#0c4a6e"
                      name="Total Tokens"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="prompt_tokens"
                      stroke="#22c55e"
                      name="Prompt Tokens"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="completion_tokens"
                      stroke="#f59e0b"
                      name="Completion Tokens"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Bytes Usage Chart */}
              <div style={styles.chartContainer}>
                <div style={styles.chartTitle}>Bytes Usage Per Day</div>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={usageStats.daily_usage}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="total_bytes" fill="#8b5cf6" name="Total Bytes" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Cost Chart */}
              <div style={styles.chartContainer}>
                <div style={styles.chartTitle}>Cost Per Day (USD)</div>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={usageStats.daily_usage}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="total_cost_usd"
                      stroke="#dc2626"
                      name="Total Cost (USD)"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </>
          ) : (
            <div style={styles.emptyState}>
              <p>No usage data available for the selected date range</p>
            </div>
          )}
        </>
      )}

      {/* Notification Message */}
      {message && <div style={getNotificationStyle(message.type)}>{message.text}</div>}
    </div>
  );
};

export default CostMonitoringPanel;
