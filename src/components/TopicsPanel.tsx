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

// Subtopic structure matching Go backend
interface Subtopic {
  id: string;
  name: Translation;
  order: number;
}

// Minimal structure for a Subject (Needed for dependency lookup)
interface SubjectMinimal {
  id: string;
  code: string;
  name: Translation;
}

/**
 * Topic interface reflecting the DBTopic structure with subtopics.
 */
interface Topic {
  id: string;
  subject_id: string;
  name: Translation;
  subtopics: Subtopic[];
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

interface SubtopicFormData {
  id: string;
  name: FormTranslation;
  order: number;
}

interface TopicFormData {
  id: string;
  subject_id: string;
  topic_name: FormTranslation;
  subtopics: SubtopicFormData[];
}

// 🎨 Styles
const PRIMARY_COLOR = "#0c4a6e";
const TEXT_COLOR = "#1e293b";
const MUTED_COLOR = "#64748b";
const BORDER_COLOR = "#e2e8f0";
const HOVER_COLOR = "#f8fafc";
const DANGER_COLOR = "#dc2626";

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

const btnDanger: Style = {
  background: DANGER_COLOR,
  color: "white",
  padding: "8px 16px",
  fontSize: "0.9em",
};

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
  panel: { padding: "0 0 40px 0", background: "#fff" },
  sectionHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" },
  heading: { fontSize: "28px", fontWeight: 700, color: TEXT_COLOR },
  tableContainer: { border: `1px solid ${BORDER_COLOR}`, borderRadius: "8px", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" },
  table: { width: "100%", borderCollapse: "collapse", fontSize: "15px" },
  tableHeader: { background: HOVER_COLOR, color: TEXT_COLOR, textAlign: "left", fontWeight: 600 },
  tableHeadCell: { padding: "12px 16px", borderBottom: `1px solid ${BORDER_COLOR}`, color: MUTED_COLOR },
  tableDataCell: { padding: "12px 16px", color: TEXT_COLOR },
  actionCell: { display: 'flex', gap: '8px' },
  emptyState: { textAlign: "center", padding: "40px", color: MUTED_COLOR, border: `1px dashed ${BORDER_COLOR}`, borderRadius: "8px" },
  formContainer: { background: "#fff", padding: "30px", border: `1px solid ${BORDER_COLOR}`, borderRadius: "8px", marginTop: "20px", boxShadow: "0 4px 8px rgba(0,0,0,0.05)" },
  formHeading: { color: TEXT_COLOR, fontSize: "20px", marginBottom: "20px", fontWeight: 600 },
  formGroup: { marginBottom: "20px" },
  label: { display: "block", color: TEXT_COLOR, fontWeight: 600, marginBottom: "8px", fontSize: "14px" },
  input: { width: "100%", padding: "10px", border: `1px solid ${BORDER_COLOR}`, borderRadius: "6px", fontSize: "1em", marginBottom: "8px", transition: "border-color 0.2s", boxSizing: "border-box" as const },
  formActions: { display: "flex", gap: "10px", marginTop: "25px" },
  // Subtopic styles
  subtopicsSection: { marginTop: "10px" },
  subtopicCard: {
    border: `1px solid ${BORDER_COLOR}`,
    borderRadius: "8px",
    padding: "16px",
    marginBottom: "12px",
    background: HOVER_COLOR,
  },
  subtopicHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "12px",
  },
  subtopicTitle: {
    fontWeight: 600,
    color: TEXT_COLOR,
    fontSize: "14px",
  },
  subtopicActions: {
    display: "flex",
    gap: "8px",
    alignItems: "center",
  },
  orderInput: {
    width: "60px",
    padding: "6px 8px",
    border: `1px solid ${BORDER_COLOR}`,
    borderRadius: "4px",
    fontSize: "0.9em",
    textAlign: "center" as const,
  },
  subtopicTranslations: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "8px",
  },
  subtopicInput: {
    padding: "8px",
    border: `1px solid ${BORDER_COLOR}`,
    borderRadius: "4px",
    fontSize: "0.9em",
  },
  addSubtopicBtn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "12px 16px",
    border: `2px dashed ${BORDER_COLOR}`,
    borderRadius: "8px",
    background: "transparent",
    cursor: "pointer",
    color: PRIMARY_COLOR,
    fontWeight: 500,
    width: "100%",
    justifyContent: "center",
    transition: "all 0.2s ease",
  },
  subtopicTag: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    background: "#e0f2fe",
    color: PRIMARY_COLOR,
    padding: "6px 12px",
    borderRadius: "16px",
    fontSize: "0.85em",
    marginRight: "8px",
    marginBottom: "8px",
  },
};

// Helper to generate UUID
const generateUUID = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for older browsers
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

const emptyFormTranslation = (): FormTranslation => ({
  en: '', ru: '', kz: '', uz: '', kg: '', zh: ''
});

const initialFormData: TopicFormData = {
  id: '',
  subject_id: '',
  topic_name: emptyFormTranslation(),
  subtopics: [],
};

const mapSubtopicToFormData = (subtopic: Subtopic): SubtopicFormData => ({
  id: subtopic.id,
  name: {
    en: subtopic.name?.en || '',
    ru: subtopic.name?.ru || '',
    kz: subtopic.name?.kz || '',
    uz: subtopic.name?.uz || '',
    kg: subtopic.name?.kg || '',
    zh: subtopic.name?.zh || '',
  },
  order: subtopic.order || 0,
});

const mapTopicToFormData = (topic: Topic): TopicFormData => ({
  id: topic.id,
  subject_id: topic.subject_id,
  topic_name: {
    en: topic.name?.en || '',
    ru: topic.name?.ru || '',
    kz: topic.name?.kz || '',
    uz: topic.name?.uz || '',
    kg: topic.name?.kg || '',
    zh: topic.name?.zh || '',
  },
  subtopics: (topic.subtopics || []).map(mapSubtopicToFormData),
});

const TopicsPanel: React.FC = () => {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [subjects, setSubjects] = useState<SubjectMinimal[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<TopicFormData>(initialFormData);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showNotification = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 4000);
  };

  const loadAllData = async () => {
    setLoading(true);
    let loadedSubjects: SubjectMinimal[] = [];
    let allTopics: Topic[] = [];

    // 1. Load Subjects
    try {
      const url = `${APIHOST}/api/subjects`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch subjects");
      loadedSubjects = await response.json();
    } catch (error: any) {
      console.error("Failed to load subjects:", error);
      showNotification("Error loading subject list.", 'error');
      loadedSubjects = [];
    }
    setSubjects(loadedSubjects);

    if (loadedSubjects.length > 0 && !formData.subject_id) {
      setFormData(prev => ({ ...prev, subject_id: loadedSubjects[0].id }));
    }

    // 2. Load Topics
    try {
      const url = `${APIHOST}/api/topics`;
      const response = await fetch(url);
      if (response.ok) {
        allTopics = await response.json();
        allTopics = allTopics.map(t => ({ ...t, subtopics: t.subtopics || [] }));
      } else {
        console.warn(`Failed to fetch topics: ${response.statusText}`);
        allTopics = [];
      }
    } catch (error: any) {
      console.error("Failed to load topics:", error);
      showNotification("Error fetching topics.", 'error');
      allTopics = [];
    }

    setTopics(allTopics);
    setLoading(false);
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // --- Form Handlers ---
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
    const newSubtopic: SubtopicFormData = {
      id: generateUUID(),
      name: emptyFormTranslation(),
      order: formData.subtopics.length, // Auto-assign order
    };
    setFormData(prev => ({
      ...prev,
      subtopics: [...prev.subtopics, newSubtopic]
    }));
  };

  const handleRemoveSubtopic = (index: number) => {
    setFormData(prev => ({
      ...prev,
      subtopics: prev.subtopics.filter((_, i) => i !== index)
    }));
  };

  const handleSubtopicChange = (
    index: number,
    field: 'order' | keyof FormTranslation,
    value: string | number
  ) => {
    setFormData(prev => {
      const updatedSubtopics = [...prev.subtopics];
      if (field === 'order') {
        updatedSubtopics[index] = {
          ...updatedSubtopics[index],
          order: typeof value === 'number' ? value : parseInt(value, 10) || 0
        };
      } else {
        updatedSubtopics[index] = {
          ...updatedSubtopics[index],
          name: {
            ...updatedSubtopics[index].name,
            [field]: value
          }
        };
      }
      return { ...prev, subtopics: updatedSubtopics };
    });
  };

  const moveSubtopic = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= formData.subtopics.length) return;

    setFormData(prev => {
      const updatedSubtopics = [...prev.subtopics];
      [updatedSubtopics[index], updatedSubtopics[newIndex]] = [updatedSubtopics[newIndex], updatedSubtopics[index]];
      // Update order values to match new positions
      return {
        ...prev,
        subtopics: updatedSubtopics.map((st, i) => ({ ...st, order: i }))
      };
    });
  };

  // --- Submit Handler ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const url = isEditing ? `${API_BASE}/topics/${formData.id}` : `${API_BASE}/topics`;
    const method = isEditing ? 'PUT' : 'POST';

    if (!formData.subject_id) {
      showNotification('Subject must be selected.', 'error');
      return;
    }
    if (!formData.topic_name.en.trim()) {
      showNotification('Topic Name (English) is required.', 'error');
      return;
    }

    // Validate subtopics - at least EN name should be present
    for (const st of formData.subtopics) {
      if (!st.name.en.trim()) {
        showNotification('All subtopics must have an English name.', 'error');
        return;
      }
    }

    // Convert form data to API format
    const subtopicsForAPI: Subtopic[] = formData.subtopics.map((st, index) => ({
      id: st.id,
      name: {
        en: st.name.en || undefined,
        ru: st.name.ru || undefined,
        kz: st.name.kz || undefined,
        uz: st.name.uz || undefined,
        kg: st.name.kg || undefined,
        zh: st.name.zh || undefined,
      },
      order: st.order ?? index,
    }));

    const dataToSend: any = {
      name: formData.topic_name,
      subtopics: subtopicsForAPI,
    };

    if (!isEditing) {
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
      await loadAllData();
    } catch (error: any) {
      console.error("API Error:", error);
      showNotification(`Error: ${error.message}`, 'error');
    }
  };

  const handleEdit = (topic: Topic) => {
    setFormData(mapTopicToFormData(topic));
    setIsEditing(true);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this topic?')) {
      return;
    }
    try {
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
  };

  const hideForm = () => {
    setShowForm(false);
    setFormData(initialFormData);
    setIsEditing(false);
  };

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
        required={lang === 'en'}
      />
    ));
  };

  const getSubjectName = (subjectId: string) => {
    const subject = subjects.find(s => s.id === subjectId);
    return subject
      ? `${subject.name?.en || subject.code} (${subject.code})`
      : `ID: ${subjectId}`;
  };

  // Render subtopic editor in form
  const renderSubtopicEditor = () => {
    const langs: (keyof FormTranslation)[] = ['en', 'ru', 'kz', 'uz', 'kg', 'zh'];

    return (
      <div style={styles.subtopicsSection}>
        {formData.subtopics
          .sort((a, b) => a.order - b.order)
          .map((subtopic, index) => (
            <div key={subtopic.id} style={styles.subtopicCard}>
              <div style={styles.subtopicHeader}>
                <span style={styles.subtopicTitle}>
                  Subtopic #{index + 1} {subtopic.name.en && `- ${subtopic.name.en}`}
                </span>
                <div style={styles.subtopicActions}>
                  <label style={{ fontSize: '12px', color: MUTED_COLOR }}>Order:</label>
                  <input
                    type="number"
                    value={subtopic.order}
                    onChange={(e) => handleSubtopicChange(index, 'order', e.target.value)}
                    style={styles.orderInput}
                    min={0}
                  />
                  <button
                    type="button"
                    onClick={() => moveSubtopic(index, 'up')}
                    disabled={index === 0}
                    style={{
                      ...getButtonStyle(BORDER_COLOR, TEXT_COLOR, true),
                      opacity: index === 0 ? 0.5 : 1,
                    }}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => moveSubtopic(index, 'down')}
                    disabled={index === formData.subtopics.length - 1}
                    style={{
                      ...getButtonStyle(BORDER_COLOR, TEXT_COLOR, true),
                      opacity: index === formData.subtopics.length - 1 ? 0.5 : 1,
                    }}
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveSubtopic(index)}
                    style={{ ...btnDanger, padding: '6px 12px' }}
                  >
                    Remove
                  </button>
                </div>
              </div>
              <div style={styles.subtopicTranslations}>
                {langs.map(lang => (
                  <input
                    key={`subtopic-${subtopic.id}-${lang}`}
                    type="text"
                    placeholder={`${lang.toUpperCase()}${lang === 'en' ? ' (required)' : ''}`}
                    value={subtopic.name[lang] || ''}
                    onChange={(e) => handleSubtopicChange(index, lang, e.target.value)}
                    style={styles.subtopicInput}
                    required={lang === 'en'}
                  />
                ))}
              </div>
              <small style={{ color: MUTED_COLOR, fontSize: '11px', marginTop: '8px', display: 'block' }}>
                ID: {subtopic.id}
              </small>
            </div>
          ))}

        <button
          type="button"
          onClick={handleAddSubtopic}
          style={styles.addSubtopicBtn}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = PRIMARY_COLOR;
            e.currentTarget.style.background = '#f0f9ff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = BORDER_COLOR;
            e.currentTarget.style.background = 'transparent';
          }}
        >
          + Add Subtopic
        </button>
      </div>
    );
  };

  return (
    <div style={styles.panel}>
      {message && (
        <div style={getNotificationStyle(message.type)}>{message.text}</div>
      )}

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
              {subjects.length === 0 && (
                <small style={{ color: DANGER_COLOR, marginTop: '10px' }}>
                  * Cannot add topics until subjects are available.
                </small>
              )}
            </div>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHeader}>
                  <th style={{ ...styles.tableHeadCell, width: '12%' }}>ID</th>
                  <th style={{ ...styles.tableHeadCell, width: '20%' }}>Name (EN)</th>
                  <th style={{ ...styles.tableHeadCell, width: '18%' }}>Subject</th>
                  <th style={{ ...styles.tableHeadCell, width: '30%' }}>Subtopics</th>
                  <th style={{ ...styles.tableHeadCell, width: '20%' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {topics.map(topic => (
                  <tr
                    key={topic.id}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = HOVER_COLOR}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                  >
                    <td style={styles.tableDataCell}>
                      <strong style={{ fontSize: '0.8em', fontFamily: 'monospace' }}>
                        {topic.id.substring(0, 8)}...
                      </strong>
                    </td>
                    <td style={styles.tableDataCell}>{topic.name?.en || '—'}</td>
                    <td style={styles.tableDataCell}>{getSubjectName(topic.subject_id)}</td>
                    <td style={styles.tableDataCell}>
                      {topic.subtopics && topic.subtopics.length > 0 ? (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                          {topic.subtopics
                            .sort((a, b) => (a.order || 0) - (b.order || 0))
                            .slice(0, 3)
                            .map((st, idx) => (
                              <span key={st.id || idx} style={styles.subtopicTag}>
                                {st.name?.en || `#${idx + 1}`}
                              </span>
                            ))}
                          {topic.subtopics.length > 3 && (
                            <span style={{ ...styles.subtopicTag, background: '#f1f5f9', color: MUTED_COLOR }}>
                              +{topic.subtopics.length - 3} more
                            </span>
                          )}
                        </div>
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

      {/* Topic Form (Create/Edit) */}
      {showForm && (
        <div style={styles.formContainer}>
          <h3 style={styles.formHeading}>
            {isEditing
              ? `Edit Topic: ${formData.topic_name.en || formData.id.substring(0, 8)}...`
              : 'Add New Topic'}
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
              {(isEditing || subjects.length === 0) && (
                <small style={{ color: MUTED_COLOR, fontSize: '12px' }}>
                  Subject cannot be changed after creation.
                </small>
              )}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Topic Names (Translations - EN is required):</label>
              {renderTranslationInputs('topic-name', formData.topic_name)}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>
                Subtopics ({formData.subtopics.length}):
              </label>
              {renderSubtopicEditor()}
              {formData.subtopics.length === 0 && (
                <small style={{ color: MUTED_COLOR, fontSize: '12px', display: 'block', marginTop: '8px' }}>
                  No subtopics added. Click "Add Subtopic" to create one.
                </small>
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