import React, { useState, useMemo } from "react";
// 🚨 IMPORTANT: Adjust this path to where your CountryPanel.tsx is located.
import CountryPanel from "../components/CountryPanel"; 
import ExamPanel from "../components/ExamPanel";
import SubjectsPanel from "../components/SubjectsPanel";
import TopicsPanel from "../components/TopicsPanel";
import QuestionsPanel from "../components/QuestionsPanel";
// If CountryPanel.tsx is in the same directory: import CountryPanel from "./CountryPanel";

// 📚 Data
const ITEMS: { key: string; label: string }[] = [
  { key: "countries", label: "Страны" },
  { key: "exams", label: "Экзамены" },
  { key: "subjects", label: "Предметы" },
  { key: "topics", label: "Темы" },
  { key: "onboarding-quizzes", label: "Диагностические тесты" },
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
  const [selected, setSelected] = useState<string>(ITEMS[0].key);
  const styles = useMemo(() => getStyles(), []);

  const onKeySelect = (e: React.KeyboardEvent, key: string) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setSelected(key);
    }
  };

  const selectedItemLabel = ITEMS.find((i) => i.key === selected)?.label || "Dashboard";
  
  // --- Conditional Content Renderer ---
  const renderContent = () => {
    if (selected === 'countries') {
      // Render the dedicated CountryPanel component
      return <CountryPanel />;
    } else if (selected === 'exams') {
        return <ExamPanel />;
    } else if (selected === 'subjects') {
        return <SubjectsPanel />;
    } else if (selected === 'topics') {
        return <TopicsPanel />;
    } else if (selected === 'onboarding-quizzes') {
        return <QuestionsPanel />;
    }

    // Default placeholder content for other sections
    return (
      <>
        <div style={styles.contentHeader}>
          <h1 style={styles.heading}>{selectedItemLabel} Management</h1>
          <p style={styles.subtitle}>
            Manage, view, and edit all entries for the **{selectedItemLabel}** section.
          </p>
        </div>
        
        {/* Main Content Area - Placeholder */}
        <div style={{ padding: 40, border: `1px solid ${BORDER_COLOR}`, borderRadius: 8, minHeight: 400, marginTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ color: MUTED_COLOR, textAlign: 'center' }}>
              Content area for **{selectedItemLabel}** is currently under development.
          </p>
        </div>
      </>
    );
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
              const active = it.key === selected;
              return (
                <button
                  key={it.key}
                  onClick={() => setSelected(it.key)}
                  onKeyDown={(e) => onKeySelect(e, it.key)}
                  aria-current={active ? "page" : undefined}
                  style={navButtonStyles(active)}
                >
                  <span style={getNavIconStyle(active)} aria-hidden>
                    {it.label.charAt(0)}
                  </span>
                  <span style={{ flex: 1 }}>{it.label}</span>
                </button>
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