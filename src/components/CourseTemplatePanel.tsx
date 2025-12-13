import React, { useState, useEffect } from "react";
import { APIHOST } from "../utils/url";
import LoadingOverlay from "./LoadingOverlay";

// API_BASE is only used for Admin CRUD endpoints (/api/admin/...)
const API_BASE = `${APIHOST}/api/admin`;

// 🌍 Data Structures
interface Translation {
  en?: string;
  ru?: string;
  kz?: string;
  uz?: string;
  kg?: string;
  zh?: string;
}

// ExamName represents the localized exam name
interface ExamName {
  kz?: string;
  ru?: string;
  en?: string;
  uz?: string;
  kg?: string;
  zh?: string;
}

// SubjectName represents the localized subject name
interface SubjectName {
  kz?: string;
  ru?: string;
  en?: string;
  uz?: string;
  kg?: string;
  zh?: string;
}

// CourseTemplateWithDetails includes additional details like exam name, subject name, and roadmap
interface CourseTemplateWithDetails {
  id: string;
  exam_id: string;
  subject_id: string;
  language: string;
  roadmap_id: string;
  is_active: boolean;
  archived_at?: string;
  created_at: string;
  updated_at: string;
  exam_name: ExamName;
  subject_name: SubjectName;
  roadmap?: Roadmap;
}

// Roadmap represents the full learning journey for a course
interface Roadmap {
  id: string;
  goal_statement?: string;
  levels?: Level[];
}

// Level represents a themed unit within a roadmap
interface Level {
  id: string;
  title: string;
  description?: string;
  color?: string;
  order: number;
}

// Minimal Exam structure
interface ExamMinimal {
  id: string;
  exam_id: string;
  name: Translation;
}

// Minimal Subject structure
interface SubjectMinimal {
  id: string;
  code: string;
  exam_id: string;
  name: Translation;
}

// Form data for creating course template
interface CreateCourseTemplateRequest {
  exam_id: string;
  subject_id: string;
  language: string;
}

// Regenerate level request
interface RegenerateLevelRequest {
  prompt?: string;
}

// Filter form data
interface FilterFormData {
  exam_id: string;
  subject_id: string;
  language: string;
  is_active: string; // "all", "true", or "false"
}

// 🎨 Styles (Kept consistent)
const PRIMARY_COLOR = "#0c4a6e";
const TEXT_COLOR = "#1e293b";
const MUTED_COLOR = "#64748b";
const BORDER_COLOR = "#e2e8f0";
const HOVER_COLOR = "#f8fafc";
const DANGER_COLOR = "#dc2626";
const SUCCESS_COLOR = "#10b981";

type Style = React.CSSProperties;

// Helper function for dynamic button styles
const getButtonStyle = (
  background: string,
  color: string,
  small: boolean = false
): Style => ({
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

// Helper function for notification message styles
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
  background: type === "success" ? SUCCESS_COLOR : "#ef4444",
  color: "white",
});

const styles: { [key: string]: Style } = {
  // --- Layout & Headers ---
  panel: { padding: "0 0 40px 0", background: "#fff" },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "30px",
  },
  heading: { fontSize: "28px", fontWeight: 700, color: TEXT_COLOR },
  // --- Table Styles ---
  tableContainer: {
    border: `1px solid ${BORDER_COLOR}`,
    borderRadius: "8px",
    overflow: "hidden",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
  },
  table: { width: "100%", borderCollapse: "collapse", fontSize: "15px" },
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
  tableDataCell: { padding: "12px 16px", color: TEXT_COLOR },
  actionCell: { display: "flex", gap: "8px" },
  emptyState: {
    textAlign: "center",
    padding: "40px",
    color: MUTED_COLOR,
    border: `1px dashed ${BORDER_COLOR}`,
    borderRadius: "8px",
  },
  // --- Form Styles ---
  formContainer: {
    background: "#fff",
    padding: "30px",
    border: `1px solid ${BORDER_COLOR}`,
    borderRadius: "8px",
    marginTop: "20px",
    boxShadow: "0 4px 8px rgba(0,0,0,0.05)",
  },
  formHeading: {
    color: TEXT_COLOR,
    fontSize: "20px",
    marginBottom: "20px",
    fontWeight: 600,
  },
  formGroup: { marginBottom: "20px" },
  label: {
    display: "block",
    color: TEXT_COLOR,
    fontWeight: 600,
    marginBottom: "8px",
    fontSize: "14px",
  },
  input: {
    width: "100%",
    padding: "10px",
    border: `1px solid ${BORDER_COLOR}`,
    borderRadius: "6px",
    fontSize: "1em",
    marginBottom: "8px",
    transition: "border-color 0.2s",
  },
  formActions: { display: "flex", gap: "10px", marginTop: "25px" },
  filterSection: {
    background: HOVER_COLOR,
    padding: "20px",
    border: `1px solid ${BORDER_COLOR}`,
    borderRadius: "8px",
    marginBottom: "20px",
  },
  filterGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "15px",
    marginBottom: "15px",
  },
  badge: {
    padding: "4px 8px",
    borderRadius: "4px",
    fontSize: "0.85em",
    fontWeight: 500,
  },
  detailCard: {
    background: "#fff",
    padding: "20px",
    border: `1px solid ${BORDER_COLOR}`,
    borderRadius: "8px",
    marginTop: "20px",
  },
  detailSection: {
    marginBottom: "20px",
  },
  detailLabel: {
    color: MUTED_COLOR,
    fontSize: "0.9em",
    marginBottom: "4px",
  },
  detailValue: {
    color: TEXT_COLOR,
    fontSize: "1em",
    fontWeight: 500,
  },
};

// ----------------------------------------------------------------------
// Panel Logic and Handlers
// ----------------------------------------------------------------------

const initialFormData: CreateCourseTemplateRequest = {
  exam_id: "",
  subject_id: "",
  language: "en",
};

const initialFilterData: FilterFormData = {
  exam_id: "",
  subject_id: "",
  language: "",
  is_active: "all",
};

const LANGUAGES = [
  { code: "en", name: "English" },
  { code: "ru", name: "Russian" },
  { code: "kz", name: "Kazakh" },
  { code: "uz", name: "Uzbek" },
  { code: "kg", name: "Kyrgyz" },
  { code: "zh", name: "Chinese" },
];

const CourseTemplatePanel: React.FC = () => {
  const [courseTemplates, setCourseTemplates] = useState<
    CourseTemplateWithDetails[]
  >([]);
  const [exams, setExams] = useState<ExamMinimal[]>([]);
  const [subjects, setSubjects] = useState<SubjectMinimal[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showFilters, setShowFilters] = useState(true);
  const [formData, setFormData] = useState<CreateCourseTemplateRequest>(
    initialFormData
  );
  const [filterData, setFilterData] = useState<FilterFormData>(
    initialFilterData
  );
  const [selectedTemplate, setSelectedTemplate] =
    useState<CourseTemplateWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [creatingCourse, setCreatingCourse] = useState(false);
  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);
  const [showRegenerateModal, setShowRegenerateModal] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null);
  const [regeneratePrompt, setRegeneratePrompt] = useState("");
  const [processingLevel, setProcessingLevel] = useState(false);

  const showNotification = (text: string, type: "success" | "error") => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 4000);
  };

  // --- Load Dependencies (Exams & Subjects) ---
  const loadDependencies = async () => {
    // Load Exams
    try {
      const response = await fetch(`${APIHOST}/api/exams`);
      if (response.ok) {
        const data: ExamMinimal[] = await response.json();
        setExams(data);
      }
    } catch (error: any) {
      console.error("Failed to load exams:", error);
      showNotification("Error loading exams.", "error");
    }

    // Load Subjects
    try {
      const response = await fetch(`${APIHOST}/api/subjects`);
      if (response.ok) {
        const data: SubjectMinimal[] = await response.json();
        setSubjects(data);
      }
    } catch (error: any) {
      console.error("Failed to load subjects:", error);
      showNotification("Error loading subjects.", "error");
    }
  };

  // --- Load Course Templates with Filters ---
  const loadCourseTemplates = async () => {
    setLoading(true);
    try {
      // Build query string from filters
      const params = new URLSearchParams();
      if (filterData.exam_id) params.append("exam_id", filterData.exam_id);
      if (filterData.subject_id)
        params.append("subject_id", filterData.subject_id);
      if (filterData.language) params.append("language", filterData.language);
      if (filterData.is_active !== "all") {
        params.append("is_active", filterData.is_active);
      }

      const url = `${API_BASE}/course-templates?${params.toString()}`;
      const response = await fetch(url);

      if (response.ok) {
        const data: CourseTemplateWithDetails[] = await response.json();
        setCourseTemplates(data || []);
      } else {
        console.error("Failed to fetch course templates");
        setCourseTemplates([]);
      }
    } catch (error: any) {
      console.error("Failed to load course templates:", error);
      showNotification("Error fetching course templates.", "error");
      setCourseTemplates([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    const initData = async () => {
      await loadDependencies();
      await loadCourseTemplates();
    };
    initData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Form Handlers ---
  const handleFormChange = (
    e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>
  ) => {
    const { id, value } = e.target;
    setFilterData((prev) => ({ ...prev, [id]: value }));
  };

  const applyFilters = () => {
    loadCourseTemplates();
  };

  const resetFilters = () => {
    setFilterData(initialFilterData);
    setTimeout(() => loadCourseTemplates(), 100);
  };

  // --- Submit Handler (Create Course Template) ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.exam_id) {
      showNotification("Exam must be selected.", "error");
      return;
    }
    if (!formData.subject_id) {
      showNotification("Subject must be selected.", "error");
      return;
    }
    if (!formData.language) {
      showNotification("Language must be selected.", "error");
      return;
    }

    setCreatingCourse(true);
    try {
      const response = await fetch(`${API_BASE}/course-templates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorBody = await response
          .json()
          .catch(() => ({ message: "Unknown error" }));
        throw new Error(
          `Failed to create course template: ${errorBody.message || response.statusText}`
        );
      }

      showNotification("Course template created successfully!", "success");
      hideForm();
      await loadCourseTemplates();
    } catch (error: any) {
      console.error("API Error:", error);
      showNotification(`Error: ${error.message}`, "error");
    } finally {
      setCreatingCourse(false);
    }
  };

  // --- View Details Handler ---
  const handleViewDetails = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE}/course-templates/${id}`);

      if (response.ok) {
        const data: CourseTemplateWithDetails = await response.json();
        setSelectedTemplate(data);
      } else {
        showNotification("Failed to load course template details.", "error");
      }
    } catch (error: any) {
      console.error("Failed to load details:", error);
      showNotification("Error loading course template details.", "error");
    }
  };

  const hideForm = () => {
    setShowForm(false);
    setFormData(initialFormData);
  };

  const hideDetails = () => {
    setSelectedTemplate(null);
  };

  // --- Level Management Handlers ---
  const handleRegenerateLevel = async () => {
    if (!selectedTemplate || !selectedLevel) return;

    setProcessingLevel(true);
    try {
      const body: RegenerateLevelRequest = {};
      if (regeneratePrompt.trim()) {
        body.prompt = regeneratePrompt.trim();
      }

      const response = await fetch(
        `${API_BASE}/course-templates/${selectedTemplate.id}/levels/${selectedLevel.id}/regenerate`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );

      if (!response.ok) {
        const errorBody = await response
          .json()
          .catch(() => ({ message: "Unknown error" }));
        throw new Error(
          `Failed to regenerate level: ${errorBody.message || response.statusText}`
        );
      }

      showNotification("Level regenerated successfully!", "success");
      setShowRegenerateModal(false);
      setRegeneratePrompt("");
      setSelectedLevel(null);
      
      // Refresh the template details to show updated levels
      await handleViewDetails(selectedTemplate.id);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error("API Error:", error);
      showNotification(`Error: ${errorMessage}`, "error");
    } finally {
      setProcessingLevel(false);
    }
  };

  const handleDeleteLevel = async (levelId: string) => {
    if (!selectedTemplate) return;

    if (!window.confirm("Are you sure you want to delete this level? This action cannot be undone.")) {
      return;
    }

    setProcessingLevel(true);
    try {
      const response = await fetch(
        `${API_BASE}/course-templates/${selectedTemplate.id}/levels/${levelId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const errorBody = await response
          .json()
          .catch(() => ({ message: "Unknown error" }));
        throw new Error(
          `Failed to delete level: ${errorBody.message || response.statusText}`
        );
      }

      showNotification("Level deleted successfully!", "success");
      
      // Refresh the template details to show updated levels
      await handleViewDetails(selectedTemplate.id);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error("API Error:", error);
      showNotification(`Error: ${errorMessage}`, "error");
    } finally {
      setProcessingLevel(false);
    }
  };

  const openRegenerateModal = (level: Level) => {
    setSelectedLevel(level);
    setRegeneratePrompt("");
    setShowRegenerateModal(true);
  };

  const closeRegenerateModal = () => {
    setShowRegenerateModal(false);
    setRegeneratePrompt("");
    setSelectedLevel(null);
  };

  // --- Utility Functions ---
  const getTranslationValue = (translation: Translation | undefined): string => {
    if (!translation) return "N/A";
    return translation.en || translation.ru || translation.kz || "N/A";
  };

  const getFilteredSubjects = (): SubjectMinimal[] => {
    if (!formData.exam_id) return subjects;
    return subjects.filter((s) => s.exam_id === formData.exam_id);
  };

  // --- Render Functions ---
  const renderFilters = () => (
    <div style={styles.filterSection}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "15px",
        }}
      >
        <h3 style={{ margin: 0, fontSize: "18px", color: TEXT_COLOR }}>
          Filters
        </h3>
        <button
          onClick={() => setShowFilters(!showFilters)}
          style={getButtonStyle(PRIMARY_COLOR, "white", true)}
        >
          {showFilters ? "Hide" : "Show"}
        </button>
      </div>

      {showFilters && (
        <>
          <div style={styles.filterGrid}>
            <div>
              <label htmlFor="exam_id" style={styles.label}>
                Exam
              </label>
              <select
                id="exam_id"
                value={filterData.exam_id}
                onChange={handleFilterChange}
                style={styles.input}
              >
                <option value="">All Exams</option>
                {exams.map((exam) => (
                  <option key={exam.id} value={exam.id}>
                    {getTranslationValue(exam.name)} ({exam.exam_id})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="subject_id" style={styles.label}>
                Subject
              </label>
              <select
                id="subject_id"
                value={filterData.subject_id}
                onChange={handleFilterChange}
                style={styles.input}
              >
                <option value="">All Subjects</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {getTranslationValue(subject.name)} ({subject.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="language" style={styles.label}>
                Language
              </label>
              <select
                id="language"
                value={filterData.language}
                onChange={handleFilterChange}
                style={styles.input}
              >
                <option value="">All Languages</option>
                {LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="is_active" style={styles.label}>
                Status
              </label>
              <select
                id="is_active"
                value={filterData.is_active}
                onChange={handleFilterChange}
                style={styles.input}
              >
                <option value="all">All</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={applyFilters}
              style={getButtonStyle(PRIMARY_COLOR, "white", true)}
            >
              Apply Filters
            </button>
            <button
              onClick={resetFilters}
              style={getButtonStyle(MUTED_COLOR, "white", true)}
            >
              Reset
            </button>
          </div>
        </>
      )}
    </div>
  );

  const renderCreateForm = () => (
    <div style={styles.formContainer}>
      <h3 style={styles.formHeading}>Create Course Template</h3>
      <form onSubmit={handleSubmit}>
        <div style={styles.formGroup}>
          <label htmlFor="exam_id" style={styles.label}>
            Exam *
          </label>
          <select
            id="exam_id"
            value={formData.exam_id}
            onChange={handleFormChange}
            style={styles.input}
            required
          >
            <option value="">Select Exam</option>
            {exams.map((exam) => (
              <option key={exam.id} value={exam.id}>
                {getTranslationValue(exam.name)} ({exam.exam_id})
              </option>
            ))}
          </select>
        </div>

        <div style={styles.formGroup}>
          <label htmlFor="subject_id" style={styles.label}>
            Subject *
          </label>
          <select
            id="subject_id"
            value={formData.subject_id}
            onChange={handleFormChange}
            style={styles.input}
            required
          >
            <option value="">Select Subject</option>
            {getFilteredSubjects().map((subject) => (
              <option key={subject.id} value={subject.id}>
                {getTranslationValue(subject.name)} ({subject.code})
              </option>
            ))}
          </select>
        </div>

        <div style={styles.formGroup}>
          <label htmlFor="language" style={styles.label}>
            Language *
          </label>
          <select
            id="language"
            value={formData.language}
            onChange={handleFormChange}
            style={styles.input}
            required
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>

        <div style={styles.formActions}>
          <button
            type="submit"
            style={getButtonStyle(PRIMARY_COLOR, "white")}
          >
            Create Template
          </button>
          <button
            type="button"
            onClick={hideForm}
            style={getButtonStyle(MUTED_COLOR, "white")}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );

  const renderRegenerateModal = () => {
    if (!showRegenerateModal || !selectedLevel) return null;

    return (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0, 0, 0, 0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
        }}
        onClick={closeRegenerateModal}
      >
        <div
          style={{
            background: "white",
            borderRadius: "8px",
            padding: "30px",
            maxWidth: "500px",
            width: "90%",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <h3 style={{ ...styles.formHeading, marginBottom: "15px" }}>
            Regenerate Level
          </h3>
          <div style={{ marginBottom: "20px", color: TEXT_COLOR }}>
            <strong>Level:</strong> {selectedLevel.title}
          </div>
          
          <div style={styles.formGroup}>
            <label style={styles.label}>
              Custom Prompt (Optional)
            </label>
            <textarea
              value={regeneratePrompt}
              onChange={(e) => setRegeneratePrompt(e.target.value)}
              placeholder="e.g., Make the title more engaging and add focus on practical applications"
              style={{
                ...styles.input,
                minHeight: "100px",
                resize: "vertical",
                fontFamily: "inherit",
              }}
            />
            <div style={{ fontSize: "0.85em", color: MUTED_COLOR, marginTop: "5px" }}>
              Leave empty to regenerate with default settings
            </div>
          </div>

          <div style={styles.formActions}>
            <button
              onClick={handleRegenerateLevel}
              disabled={processingLevel}
              style={{
                ...getButtonStyle(PRIMARY_COLOR, "white"),
                opacity: processingLevel ? 0.6 : 1,
                cursor: processingLevel ? "not-allowed" : "pointer",
              }}
            >
              {processingLevel ? "Regenerating..." : "Regenerate"}
            </button>
            <button
              onClick={closeRegenerateModal}
              disabled={processingLevel}
              style={{
                ...getButtonStyle(MUTED_COLOR, "white"),
                opacity: processingLevel ? 0.6 : 1,
                cursor: processingLevel ? "not-allowed" : "pointer",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderDetailsView = () => {
    if (!selectedTemplate) return null;

    return (
      <div style={styles.detailCard}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <h3 style={styles.formHeading}>Course Template Details</h3>
          <button
            onClick={hideDetails}
            style={getButtonStyle(MUTED_COLOR, "white", true)}
          >
            Close
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
          <div style={styles.detailSection}>
            <div style={styles.detailLabel}>ID</div>
            <div style={styles.detailValue}>{selectedTemplate.id}</div>
          </div>

          <div style={styles.detailSection}>
            <div style={styles.detailLabel}>Status</div>
            <div style={styles.detailValue}>
              <span
                style={{
                  ...styles.badge,
                  background: selectedTemplate.is_active
                    ? SUCCESS_COLOR
                    : DANGER_COLOR,
                  color: "white",
                }}
              >
                {selectedTemplate.is_active ? "Active" : "Inactive"}
              </span>
            </div>
          </div>

          <div style={styles.detailSection}>
            <div style={styles.detailLabel}>Exam</div>
            <div style={styles.detailValue}>
              {getTranslationValue(selectedTemplate.exam_name)}
            </div>
          </div>

          <div style={styles.detailSection}>
            <div style={styles.detailLabel}>Subject</div>
            <div style={styles.detailValue}>
              {getTranslationValue(selectedTemplate.subject_name)}
            </div>
          </div>

          <div style={styles.detailSection}>
            <div style={styles.detailLabel}>Language</div>
            <div style={styles.detailValue}>
              {LANGUAGES.find((l) => l.code === selectedTemplate.language)
                ?.name || selectedTemplate.language}
            </div>
          </div>

          <div style={styles.detailSection}>
            <div style={styles.detailLabel}>Roadmap ID</div>
            <div style={styles.detailValue}>
              {selectedTemplate.roadmap_id || "N/A"}
            </div>
          </div>

          <div style={styles.detailSection}>
            <div style={styles.detailLabel}>Created At</div>
            <div style={styles.detailValue}>
              {new Date(selectedTemplate.created_at).toLocaleString()}
            </div>
          </div>

          <div style={styles.detailSection}>
            <div style={styles.detailLabel}>Updated At</div>
            <div style={styles.detailValue}>
              {new Date(selectedTemplate.updated_at).toLocaleString()}
            </div>
          </div>
        </div>

        {selectedTemplate.roadmap && (
          <div style={{ marginTop: "20px" }}>
            <h4 style={{ color: TEXT_COLOR, marginBottom: "10px" }}>
              Roadmap Information
            </h4>
            <div style={styles.detailSection}>
              <div style={styles.detailLabel}>Goal Statement</div>
              <div style={styles.detailValue}>
                {selectedTemplate.roadmap.goal_statement || "N/A"}
              </div>
            </div>

            {selectedTemplate.roadmap.levels &&
              selectedTemplate.roadmap.levels.length > 0 && (
                <div style={{ marginTop: "15px" }}>
                  <div style={styles.detailLabel}>Levels</div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "10px",
                      marginTop: "10px",
                    }}
                  >
                    {selectedTemplate.roadmap.levels.map((level, index) => (
                      <div
                        key={level.id}
                        style={{
                          padding: "10px",
                          border: `1px solid ${BORDER_COLOR}`,
                          borderRadius: "6px",
                          background: HOVER_COLOR,
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 600, color: TEXT_COLOR }}>
                              Level {index + 1}: {level.title}
                            </div>
                            {level.description && (
                              <div
                                style={{
                                  fontSize: "0.9em",
                                  color: MUTED_COLOR,
                                  marginTop: "4px",
                                }}
                              >
                                {level.description}
                              </div>
                            )}
                          </div>
                          <div style={{ display: "flex", gap: "8px", marginLeft: "10px" }}>
                            <button
                              onClick={() => openRegenerateModal(level)}
                              disabled={processingLevel}
                              style={{
                                ...getButtonStyle(PRIMARY_COLOR, "white", true),
                                opacity: processingLevel ? 0.6 : 1,
                                cursor: processingLevel ? "not-allowed" : "pointer",
                              }}
                              title="Regenerate this level"
                            >
                              Regenerate
                            </button>
                            <button
                              onClick={() => handleDeleteLevel(level.id)}
                              disabled={processingLevel}
                              style={{
                                ...getButtonStyle(DANGER_COLOR, "white", true),
                                opacity: processingLevel ? 0.6 : 1,
                                cursor: processingLevel ? "not-allowed" : "pointer",
                              }}
                              title="Delete this level"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
          </div>
        )}
      </div>
    );
  };

  const renderTable = () => {
    if (loading) {
      return (
        <div style={styles.emptyState}>
          <p>Loading course templates...</p>
        </div>
      );
    }

    if (courseTemplates.length === 0) {
      return (
        <div style={styles.emptyState}>
          <p>No course templates found. Create one to get started!</p>
        </div>
      );
    }

    return (
      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead style={styles.tableHeader}>
            <tr>
              <th style={styles.tableHeadCell}>Exam</th>
              <th style={styles.tableHeadCell}>Subject</th>
              <th style={styles.tableHeadCell}>Language</th>
              <th style={styles.tableHeadCell}>Status</th>
              <th style={styles.tableHeadCell}>Created</th>
              <th style={styles.tableHeadCell}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {courseTemplates.map((template) => (
              <tr key={template.id} style={{ borderBottom: `1px solid ${BORDER_COLOR}` }}>
                <td style={styles.tableDataCell}>
                  {getTranslationValue(template.exam_name)}
                </td>
                <td style={styles.tableDataCell}>
                  {getTranslationValue(template.subject_name)}
                </td>
                <td style={styles.tableDataCell}>
                  {LANGUAGES.find((l) => l.code === template.language)?.name ||
                    template.language}
                </td>
                <td style={styles.tableDataCell}>
                  <span
                    style={{
                      ...styles.badge,
                      background: template.is_active
                        ? SUCCESS_COLOR
                        : DANGER_COLOR,
                      color: "white",
                    }}
                  >
                    {template.is_active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td style={styles.tableDataCell}>
                  {new Date(template.created_at).toLocaleDateString()}
                </td>
                <td style={styles.tableDataCell}>
                  <div style={styles.actionCell}>
                    <button
                      onClick={() => handleViewDetails(template.id)}
                      style={getButtonStyle(PRIMARY_COLOR, "white", true)}
                    >
                      View Details
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div style={styles.panel}>
      {creatingCourse && <LoadingOverlay message="Creating course template..." />}
      {processingLevel && <LoadingOverlay message="Processing level..." />}
      {message && (
        <div style={getNotificationStyle(message.type)}>{message.text}</div>
      )}
      {renderRegenerateModal()}

      <div style={styles.sectionHeader}>
        <h2 style={styles.heading}>Course Templates</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          style={getButtonStyle(PRIMARY_COLOR, "white")}
        >
          {showForm ? "Cancel" : "Create New Template"}
        </button>
      </div>

      {renderFilters()}

      {showForm && renderCreateForm()}

      {selectedTemplate && renderDetailsView()}

      {!showForm && !selectedTemplate && renderTable()}
    </div>
  );
};

export default CourseTemplatePanel;
