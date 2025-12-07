import React, { useState, useEffect } from "react";
import { APIHOST } from "../utils/url";


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

// Minimal structure for a Subject (Needed for dependency lookup)
interface SubjectMinimal {
    id: string;
    code: string; // The code/ID of the subject (e.g., 'MATH')
    name: Translation;
}

/**
 * Topic interface reflecting the DBTopic structure with subtopics.
 */
interface Topic {
  id: string;
  subject_id: string; 
  name: Translation;
  subtopics: string[];
  created_at?: string;
  updated_at?: string;
}

// 📋 Type for the Form State
interface FormTranslation {
  en: string;
  ru: string;
  kz: string;
  uz: string;
  kg: string;
  zh: string;
}

interface TopicFormData {
    id: string;
    subject_id: string;
    topic_name: FormTranslation;
    subtopics: string[];
}

// 🎨 Styles (Kept consistent with previous panels)
const PRIMARY_COLOR = "#0c4a6e";
const TEXT_COLOR = "#1e293b";
const MUTED_COLOR = "#64748b";
const BORDER_COLOR = "#e2e8f0";
const HOVER_COLOR = "#f8fafc";
const DANGER_COLOR = "#dc2626";

type Style = React.CSSProperties;

// Helper function for dynamic button styles
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

// Helper style for danger button
const btnDanger: Style = {
  background: DANGER_COLOR,
  color: "white",
  padding: "8px 16px",
  fontSize: "0.9em",
};

// Helper function for notification message styles
const getNotificationStyle = (type: 'success' | 'error'): Style => ({
    position: 'fixed',
    top: '20px',
    right: '20px',
    padding: '15px 25px',
    borderRadius: '6px',
    fontWeight: 500,
    maxWidth: '400px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    zIndex: 1000,
    background: type === 'success' ? '#10b981' : '#ef4444',
    color: 'white',
});

const styles: { [key: string]: Style } = {
  // --- Layout & Headers ---
  panel: { padding: "0 0 40px 0", background: "#fff" },
  sectionHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" },
  heading: { fontSize: "28px", fontWeight: 700, color: TEXT_COLOR },
  // --- Table Styles ---
  tableContainer: { border: `1px solid ${BORDER_COLOR}`, borderRadius: "8px", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" },
  table: { width: "100%", borderCollapse: "collapse", fontSize: "15px" },
  tableHeader: { background: HOVER_COLOR, color: TEXT_COLOR, textAlign: "left", fontWeight: 600 },
  tableHeadCell: { padding: "12px 16px", borderBottom: `1px solid ${BORDER_COLOR}`, color: MUTED_COLOR },
  tableDataCell: { padding: "12px 16px", color: TEXT_COLOR },
  actionCell: { display: 'flex', gap: '8px' },
  emptyState: { textAlign: "center", padding: "40px", color: MUTED_COLOR, border: `1px dashed ${BORDER_COLOR}`, borderRadius: "8px" },
  // --- Form Styles ---
  formContainer: { background: "#fff", padding: "30px", border: `1px solid ${BORDER_COLOR}`, borderRadius: "8px", marginTop: "20px", boxShadow: "0 4px 8px rgba(0,0,0,0.05)" },
  formHeading: { color: TEXT_COLOR, fontSize: "20px", marginBottom: "20px", fontWeight: 600 },
  formGroup: { marginBottom: "20px" },
  label: { display: "block", color: TEXT_COLOR, fontWeight: 600, marginBottom: "8px", fontSize: "14px" },
  input: { width: "100%", padding: "10px", border: `1px solid ${BORDER_COLOR}`, borderRadius: "6px", fontSize: "1em", marginBottom: "8px", transition: "border-color 0.2s" },
  formActions: { display: "flex", gap: "10px", marginTop: "25px" },
  // --- Subtopics Styles ---
  subtopicContainer: { display: "flex", gap: "8px", alignItems: "center", marginBottom: "8px" },
  subtopicInput: { flex: 1, padding: "10px", border: `1px solid ${BORDER_COLOR}`, borderRadius: "6px", fontSize: "1em" },
  subtopicTag: { display: "inline-flex", alignItems: "center", gap: "6px", background: "#e0f2fe", color: PRIMARY_COLOR, padding: "6px 12px", borderRadius: "16px", fontSize: "0.9em", marginRight: "8px", marginBottom: "8px" },
  subtopicRemoveBtn: { background: "none", border: "none", cursor: "pointer", color: PRIMARY_COLOR, fontWeight: "bold", fontSize: "1em", padding: "0 4px" },
  subtopicsList: { display: "flex", flexWrap: "wrap" as const, marginTop: "10px" },
};

// ----------------------------------------------------------------------
// Panel Logic and Handlers
// ----------------------------------------------------------------------

const initialFormData: TopicFormData = {
  id: '',
  subject_id: '',
  topic_name: { en: '', ru: '', kz: '', uz: '', kg: '', zh: '' },
  subtopics: [],
};

const mapTopicToFormData = (topic: Topic): TopicFormData => ({
    id: topic.id,
    subject_id: topic.subject_id,
    topic_name: {
        en: topic.name?.en || '', ru: topic.name?.ru || '', kz: topic.name?.kz || '',
        uz: topic.name?.uz || '', kg: topic.name?.kg || '', zh: topic.name?.zh || '',
    },
    subtopics: topic.subtopics || [],
});

const TopicsPanel: React.FC = () => {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [subjects, setSubjects] = useState<SubjectMinimal[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<TopicFormData>(initialFormData);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [newSubtopic, setNewSubtopic] = useState('');

  const showNotification = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 4000);
  };

  // --- Combined Loader (Subjects -> Topics) ---
  const loadAllData = async () => {
    setLoading(true);
    let loadedSubjects: SubjectMinimal[] = [];
    let allTopics: Topic[] = [];

    // 1. Load Subjects (Dependency - using non-admin read endpoint)
    try {
        const url = `${APIHOST}/api/subjects`;
        const response = await fetch(url);
        if (!response.ok) throw new Error("Failed to fetch subjects");
        loadedSubjects = await response.json();
    } catch (error: any) {
        console.error("Failed to load subjects:", error);
        showNotification("Error loading subject list. Using mock data.", 'error');
        loadedSubjects = [
            { id: 's1', code: 'MATH', name: { en: 'Mathematics' } },
            { id: 's2', code: 'PHYSICS', name: { en: 'Physics' } },
        ] as SubjectMinimal[];
    }
    setSubjects(loadedSubjects);

    // Set default subject ID for the form if not already set
    if (loadedSubjects.length > 0 && !formData.subject_id) {
        setFormData(prev => ({ ...prev, subject_id: loadedSubjects[0].id }));
    }

    // 2. Load Topics (Using the requested non-admin endpoint: /api/topics)
    try {
        const url = `${APIHOST}/api/topics`; 
        const response = await fetch(url);

        if (response.ok) {
            allTopics = await response.json();
            // Ensure subtopics is always an array
            allTopics = allTopics.map(t => ({ ...t, subtopics: t.subtopics || [] }));
        } else {
            console.warn(`Failed to fetch all topics from ${url}: ${response.statusText}. Using mock.`);
            allTopics = [
                { id: '844fbde5-9f64-4ca8-b7a5-b4bc281e5c3f', subject_id: '10585795-26ce-46cf-bc59-3d3f3702551d', name: { en: 'Arithmetics', ru: 'Арифметика' }, subtopics: ['Addition', 'Subtraction'] },
                { id: 't2', subject_id: 's2', name: { en: 'Kinematics' }, subtopics: [] },
            ] as Topic[];
        }
    } catch (error: any) {
        console.error("Failed to load topics:", error);
        showNotification("Error fetching topics. Using mock data.", 'error');
        allTopics = [
            { id: '844fbde5-9f64-4ca8-b7a5-b4bc281e5c3f', subject_id: '10585795-26ce-46cf-bc59-3d3f3702551d', name: { en: 'Arithmetics' }, subtopics: [] },
        ] as Topic[];
    }

    setTopics(allTopics);
    setLoading(false);
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // --- Form Handlers ---
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = e.target;

    if (id.startsWith('topic-name-')) {
      const lang = id.split('-').pop() as keyof FormTranslation;
      setFormData(prev => ({
        ...prev,
        topic_name: { ...prev.topic_name, [lang]: value }
      }));
    } else if (id === 'subject_id') {
      setFormData(prev => ({ ...prev, [id]: value }));
    }
  };

  // --- Subtopic Handlers ---
  const handleAddSubtopic = () => {
    const trimmed = newSubtopic.trim();
    if (!trimmed) return;
    if (formData.subtopics.includes(trimmed)) {
      showNotification('Subtopic already exists.', 'error');
      return;
    }
    setFormData(prev => ({
      ...prev,
      subtopics: [...prev.subtopics, trimmed]
    }));
    setNewSubtopic('');
  };

  const handleRemoveSubtopic = (index: number) => {
    setFormData(prev => ({
      ...prev,
      subtopics: prev.subtopics.filter((_, i) => i !== index)
    }));
  };

  const handleSubtopicKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSubtopic();
    }
  };

  // --- Submit Handler (CRUD: Create/Update) ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // CRUD operations use the admin endpoint
    const url = isEditing ? `${API_BASE}/topics/${formData.id}` : `${API_BASE}/topics`;
    const method = isEditing ? 'PUT' : 'POST';

    // Validation
    if (!formData.subject_id) {
        showNotification('Subject must be selected.', 'error');
        return;
    }
    if (!formData.topic_name.en.trim()) {
        showNotification('Topic Name (English) is required.', 'error');
        return;
    }

    // Data must match the payload (with subtopics)
    const dataToSend: any = {
      name: formData.topic_name,
      subtopics: formData.subtopics,
    };

    if (!isEditing) {
        // Add SubjectID only for creation (POST)
        dataToSend.subject_id = formData.subject_id;
    }

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(`Failed to ${isEditing ? 'update' : 'create'} topic: ${errorBody.message || response.statusText}`);
      }

      showNotification(`Topic ${isEditing ? 'updated' : 'created'} successfully!`, 'success');
      hideForm();
      // Re-fetch all data to refresh the table
      await loadAllData();
    } catch (error: any) {
      console.error("API Error:", error);
      showNotification(`Error: ${error.message}`, 'error');
    }
  };

  // --- Edit/Delete Handlers (CRUD: Read/Delete) ---
  const handleEdit = (topic: Topic) => {
    setFormData(mapTopicToFormData(topic));
    setIsEditing(true);
    setShowForm(true);
    setNewSubtopic('');
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this topic? All associated quizzes/content will also be affected.')) {
      return;
    }
    try {
      // DELETE uses the admin endpoint
      const response = await fetch(`${API_BASE}/topics/${id}`, { method: 'DELETE' });

      if (response.status === 204 || response.ok) {
        showNotification('Topic deleted successfully!', 'success');
        await loadAllData();
      } else {
        const errorBody = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(`Failed to delete topic: ${errorBody.message || response.statusText}`);
      }
    } catch (error: any) {
      console.error("API Error:", error);
      showNotification(`Error: ${error.message}`, 'error');
    }
  };

  const showAddForm = () => {
    setFormData({
        ...initialFormData,
        subject_id: subjects.length > 0 ? subjects[0].id : '',
    });
    setIsEditing(false);
    setShowForm(true);
    setNewSubtopic('');
  };

  const hideForm = () => {
    setShowForm(false);
    setFormData(initialFormData);
    setIsEditing(false);
    setNewSubtopic('');
  };

  // Render Helper for Translation Inputs
  const renderTranslationInputs = (keyPrefix: string, translationObject: FormTranslation) => {
    const langs: (keyof FormTranslation)[] = ['en', 'ru', 'kz', 'uz', 'kg', 'zh'];
    return langs.map(lang => (
      <input
        key={`${keyPrefix}-${lang}`}
        type="text"
        id={`${keyPrefix}-${lang}`}
        placeholder={lang.toUpperCase()}
        value={translationObject[lang] || ''}
        onChange={handleFormChange}
        style={styles.input}
        required={lang === 'en'} // English name is required
      />
    ));
  };

  // Helper to find subject name for display
  const getSubjectName = (subjectId: string) => {
    const subject = subjects.find(s => s.id === subjectId);
    return subject
        ? `${subject.name?.en || subject.code} (${subject.code})`
        : `ID: ${subjectId}`;
  };

  // --- JSX Rendering ---
  return (
    <div style={styles.panel}>

      {message && (
        <div style={getNotificationStyle(message.type)}>{message.text}</div>
      )}

      {/* Header */}
      <div style={styles.sectionHeader}>
        <h2 style={styles.heading}>Topic Management</h2>
        <button
          onClick={showAddForm}
          style={getButtonStyle(PRIMARY_COLOR, 'white')}
          disabled={loading || showForm || subjects.length === 0}
        >
          + Add Topic
        </button>
      </div>

      {/* Topic Table View */}
      {!showForm && (
        <div style={styles.tableContainer}>
          {loading ? (
            <div style={styles.emptyState}>Loading subjects and topics...</div>
          ) : topics.length === 0 ? (
            <div style={styles.emptyState}>
              <p>No topics added yet. Click "Add Topic" to get started.</p>
              {subjects.length === 0 && <small style={{ color: DANGER_COLOR, marginTop: '10px' }}>* Cannot add topics until subjects are available.</small>}
            </div>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHeader}>
                  <th style={{ ...styles.tableHeadCell, width: '15%' }}>ID</th>
                  <th style={{ ...styles.tableHeadCell, width: '20%' }}>Name (EN)</th>
                  <th style={{ ...styles.tableHeadCell, width: '20%' }}>Subject</th>
                  <th style={{ ...styles.tableHeadCell, width: '25%' }}>Subtopics</th>
                  <th style={{ ...styles.tableHeadCell, width: '20%' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {topics.map(topic => (
                    <tr
                      key={topic.id}
                      style={styles.tableBodyRow}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = HOVER_COLOR}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                    >
                      <td style={styles.tableDataCell}>
                        {/* Display truncated ID for readability */}
                        <strong style={{ fontSize: '0.8em', fontFamily: 'monospace' }}>{topic.id.substring(0, 8)}...</strong>
                      </td>
                      <td style={styles.tableDataCell}>
                        {topic.name?.en || '—'}
                      </td>
                      <td style={styles.tableDataCell}>
                        {getSubjectName(topic.subject_id)}
                      </td>
                      <td style={styles.tableDataCell}>
                        {topic.subtopics && topic.subtopics.length > 0 ? (
                          <span style={{ fontSize: '0.9em', color: MUTED_COLOR }}>
                            {topic.subtopics.slice(0, 3).join(', ')}
                            {topic.subtopics.length > 3 && ` +${topic.subtopics.length - 3} more`}
                          </span>
                        ) : (
                          <span style={{ color: MUTED_COLOR, fontStyle: 'italic' }}>None</span>
                        )}
                      </td>
                      <td style={styles.tableDataCell}>
                        <div style={styles.actionCell}>
                          <button
                            onClick={() => handleEdit(topic)}
                            style={getButtonStyle(BORDER_COLOR, TEXT_COLOR, true)}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(topic.id)}
                            style={btnDanger}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Topic Form (Create/Edit View) */}
      {showForm && (
        <div style={styles.formContainer}>
          <h3 style={styles.formHeading}>
            {isEditing ? `Edit Topic: ${formData.topic_name.en || formData.id.substring(0, 8)}...` : 'Add New Topic'}
          </h3>
          <form onSubmit={handleSubmit}>

            <div style={styles.formGroup}>
              <label style={styles.label} htmlFor="subject_id">Linked Subject:</label>
              <select
                id="subject_id"
                value={formData.subject_id}
                onChange={handleFormChange}
                style={styles.input}
                required
                disabled={isEditing || subjects.length === 0}
              >
                {subjects.map(s => (
                    <option key={s.id} value={s.id}>
                        {s.name?.en || s.code} ({s.code})
                    </option>
                ))}
              </select>
              {(isEditing || subjects.length === 0) && <small style={{ color: MUTED_COLOR, fontSize: '12px' }}>Subject cannot be changed after creation.</small>}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Topic Names (Translations - EN is required):</label>
              {renderTranslationInputs('topic-name', formData.topic_name)}
            </div>

            {/* Subtopics Section */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Subtopics:</label>
              <div style={styles.subtopicContainer}>
                <input
                  type="text"
                  placeholder="Enter subtopic name and press Enter or click Add"
                  value={newSubtopic}
                  onChange={(e) => setNewSubtopic(e.target.value)}
                  onKeyDown={handleSubtopicKeyDown}
                  style={styles.subtopicInput}
                />
                <button
                  type="button"
                  onClick={handleAddSubtopic}
                  style={getButtonStyle(PRIMARY_COLOR, 'white', true)}
                >
                  Add
                </button>
              </div>
              {formData.subtopics.length > 0 && (
                <div style={styles.subtopicsList}>
                  {formData.subtopics.map((subtopic, index) => (
                    <span key={index} style={styles.subtopicTag}>
                      {subtopic}
                      <button
                        type="button"
                        onClick={() => handleRemoveSubtopic(index)}
                        style={styles.subtopicRemoveBtn}
                        title="Remove subtopic"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
              {formData.subtopics.length === 0 && (
                <small style={{ color: MUTED_COLOR, fontSize: '12px' }}>No subtopics added yet.</small>
              )}
            </div>

            <div style={styles.formActions}>
              <button
                type="submit"
                style={getButtonStyle(PRIMARY_COLOR, 'white')}
                disabled={subjects.length === 0}
              >
                {isEditing ? 'Save Changes' : 'Save Topic'}
              </button>
              <button
                type="button"
                onClick={hideForm}
                style={getButtonStyle(BORDER_COLOR, TEXT_COLOR)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default TopicsPanel;