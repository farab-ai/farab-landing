import React, { useMemo } from "react";
import { Outlet, NavLink } from "react-router-dom";

// 📚 Data - Updated with route paths
const ITEMS: { key: string; label: string; path: string }[] = [
  { key: "countries", label: "Страны", path: "/admin/countries" },
  { key: "exams", label: "Экзамены", path: "/admin/exams" },
  { key: "subjects", label: "Предметы", path: "/admin/subjects" },
  { key: "topics", label: "Темы", path: "/admin/topics" },
  { key: "onboarding-quizzes", label: "Диагностические тесты", path: "/admin/onboarding-quizzes" },
  { key: "course-templates", label: "Шаблоны курсов", path: "/admin/course-templates" },
  { key: "cost-monitoring", label: "Мониторинг затрат", path: "/admin/cost-monitoring" },
  { key: "metrics", label: "Metrics", path: "/admin/metrics" },
  { key: "support-requests", label: "Support Requests", path: "/admin/support-requests" },
];

// 🎨 Professional & Simple Styles
const PRIMARY_COLOR = "#0c4a6e";
const PRIMARY_LIGHT = "#f0f9ff";
const TEXT_COLOR = "#1e293b";
const MUTED_COLOR = "#64748b";
const BORDER_COLOR = "#e2e8f0";

type Style = React.CSSProperties;

type Styles = {
  page: Style;
  container: Style;
  sidebar: Style;
  brand: Style;
  logo: Style;
  brandTitle: Style;
  nav: Style;
  content: Style;
  contentHeader: Style;
  heading: Style;
  subtitle: Style;
  footerMeta: Style;
};

// Helper functions for dynamic styles
const navButtonStyles = (active: boolean): Style => ({
  display: "flex",
  alignItems: "center",
  gap: 12,
  padding: "10px 16px",
  borderRadius: 8,
  background: active ? PRIMARY_LIGHT : "transparent",
  border: "none",
  textAlign: "left",
  cursor: "pointer",
  transition: "background-color 200ms ease, color 200ms ease",
  color: active ? PRIMARY_COLOR : TEXT_COLOR,
  fontSize: 15,
  fontWeight: active ? 600 : 500,
  width: "100%",
  boxShadow: active ? `inset 0 0 0 1px ${PRIMARY_COLOR}10` : "none",
});

const getNavIconStyle = (active: boolean): Style => ({
  width: 20,
  height: 20,
  borderRadius: 4,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: 600,
  color: active ? PRIMARY_LIGHT : PRIMARY_COLOR,
  background: active ? PRIMARY_COLOR : PRIMARY_LIGHT,
  flexShrink: 0,
  fontSize: 12,
});

const getStyles = (): Styles => ({
  page: {
    minHeight: "100vh",
    background: "#fff",
    fontFamily:
      '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    padding: 0,
    boxSizing: "border-box",
  },
  container: {
    maxWidth: 1300,
    margin: "0 auto",
    background: "#fff",
    borderRadius: 0,
    boxShadow: "none",
    overflow: "hidden",
    display: "flex",
    minHeight: "100vh",
  },
  sidebar: {
    width: 240,
    borderRight: `1px solid ${BORDER_COLOR}`,
    padding: "24px 0",
    background: "#fff",
    display: "flex",
    flexDirection: "column",
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "0 24px 20px 24px",
    marginBottom: 16,
    borderBottom: `1px solid ${BORDER_COLOR}`,
  },
  logo: {
    width: 36,
    height: 36,
    borderRadius: 8,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    color: "#fff",
    background: PRIMARY_COLOR,
    fontSize: 18,
    flexShrink: 0,
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: 700,
    color: TEXT_COLOR,
  },
  nav: {
    padding: "0 12px",
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  content: {
    flex: 1,
    padding: 40,
    display: "flex",
    flexDirection: "column",
    background: "#fff",
  },
  contentHeader: {
    marginBottom: 32,
    paddingBottom: 16,
  },
  heading: {
    fontSize: 28,
    fontWeight: 700,
    color: TEXT_COLOR,
    marginBottom: 8,
  },
  subtitle: {
    color: MUTED_COLOR,
    marginTop: 8,
    fontSize: 16,
  },
  footerMeta: {
    marginTop: 30,
    color: MUTED_COLOR,
    fontSize: 13,
    padding: "16px 24px 0 24px",
    borderTop: `1px solid ${BORDER_COLOR}`,
    textAlign: "center",
  },
});

const AdminPage: React.FC = () => {
  const styles = useMemo(() => getStyles(), []);
  
  // --- Content rendered via React Router Outlet ---
  // The Outlet component renders the child route component
  const renderContent = () => {
    return <Outlet />;
  };

  return (
    <div style={styles.page}>
      <div style={styles.container} role="application" aria-label="Admin Management Panel">
        
        {/* Sidebar */}
        <aside style={styles.sidebar}>
          <div style={styles.brand}>
            <div style={styles.logo}>A</div>
            <div>
              <div style={styles.brandTitle}>Admin Hub</div>
              <div style={{ color: MUTED_COLOR, fontSize: 13 }}>Content Management</div>
            </div>
          </div>

          <nav style={styles.nav} aria-label="Admin sections">
            {ITEMS.map((it) => {
              return (
                <NavLink
                  key={it.key}
                  to={it.path}
                  style={({ isActive }) => navButtonStyles(isActive)}
                >
                  {({ isActive }: { isActive: boolean }) => (
                    <>
                      <span style={getNavIconStyle(isActive)} aria-hidden>
                        {it.label.charAt(0)}
                      </span>
                      <span style={{ flex: 1 }}>{it.label}</span>
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>
          
          <div style={{ marginTop: "auto" }}>
            <div style={styles.footerMeta}>
              Version 2.3 • Seamless UI
            </div>
          </div>
        </aside>

        {/* Content - Renders conditionally */}
        <main style={styles.content}>
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default AdminPage;