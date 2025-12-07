import React, { useState, useEffect } from "react";
import { APIHOST } from "../utils/url";

// 🌐 API Configuration (Reusing constants)
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

// Minimal structure for a Country (Needed for step 1 of loading)
interface CountryMinimal {
    id: string;
    country_code: string;
    country_name: Translation;
}

// Minimal Exam structure needed to link subjects (Needed for step 2 of loading)
interface ExamMinimal {
    id: string;
    exam_id: string; // The code/ID of the exam (e.g., 'UNT', 'SAT')
    name: Translation; 
}

/**
 * Subject interface reflecting the DBSubject structure.
 */
interface Subject {
  id: string;
  code: string;      // Matches DBSubject.Code (e.g., 'MATH', 'PHYSICS')
  exam_id: string;   // Matches DBSubject.ExamID
  name: Translation; // Matches DBSubject.Name
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

interface SubjectFormData {
    id: string;
    exam_id: string;
    code: string; // Subject code (e.g., MATH)
    subject_name: FormTranslation; // Mapped to name for API
}

// 🎨 Styles (Kept consistent)
const PRIMARY_COLOR = "#0c4a6e";
const TEXT_COLOR = "#1e293b";
const MUTED_COLOR = "#64748b";
const BORDER_COLOR = "#e2e8f0";
const HOVER_COLOR = "#f8fauc";
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
  background: DANGER_COLOR, // Red 600
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
};

// ----------------------------------------------------------------------
// Panel Logic and Handlers
// ----------------------------------------------------------------------

const initialFormData: SubjectFormData = {
  id: '',
  exam_id: '',
  code: '', 
  subject_name: { en: '', ru: '', kz: '', uz: '', kg: '', zh: '' },
};

const mapSubjectToFormData = (subject: Subject): SubjectFormData => ({
    id: subject.id,
    exam_id: subject.exam_id,
    code: subject.code, 
    subject_name: {
        en: subject.name?.en || '', ru: subject.name?.ru || '', kz: subject.name?.kz || '', 
        uz: subject.name?.uz || '', kg: subject.name?.kg || '', zh: subject.name?.zh || '',
    },
});

const SubjectPanel: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [exams, setExams] = useState<ExamMinimal[]>([]);
  const [countries, setCountries] = useState<CountryMinimal[]>([]); 
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<SubjectFormData>(initialFormData);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showNotification = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 4000);
  };

  // --- Combined Loader (Countries -> Exams -> Subjects) ---
  const loadAllData = async () => {
    setLoading(true);
    let loadedCountries: CountryMinimal[] = [];
    let loadedExams: ExamMinimal[] = [];
    let allSubjects: Subject[] = [];

    // 1. Load Countries (Using /api/admin/countries for admin access)
    try {
        const response = await fetch(`${API_BASE}/countries`);
        if (!response.ok) throw new Error("Failed to fetch countries");
        loadedCountries = await response.json();
    } catch (error: any) {
        console.error("Failed to load countries:", error);
        showNotification("Error loading country list. Using mock data.", 'error');
        loadedCountries = [
            { id: 'c1', country_code: 'KAZ', country_name: { en: 'Kazakhstan', ru: 'Казахстан' } },
            { id: 'c2', country_code: 'USA', country_name: { en: 'United States' } }, 
        ];
    }
    setCountries(loadedCountries);

    // 2. Load Exams (Using the new /api/exams endpoint)
    try {
        const url = `${APIHOST}/api/exams`; // <-- UPDATED ENDPOINT
        const response = await fetch(url);
        if (!response.ok) throw new Error("Failed to fetch exams");
        loadedExams = await response.json(); 
    } catch (error: any) {
        console.error("Failed to load exams:", error);
        showNotification("Error loading exam list. Using mock data.", 'error');
        loadedExams = [
            { id: 'e1', exam_id: 'UNT', name: { en: 'Unified National Test' } },
            { id: 'e2', exam_id: 'SAT', name: { en: 'Scholastic Assessment Test' } },
        ];
    }
    setExams(loadedExams);
    
    // Set default exam ID for the form if not already set
    if (loadedExams.length > 0 && !formData.exam_id) {
        setFormData(prev => ({ ...prev, exam_id: loadedExams[0].id }));
    }

    // 3. Load Subjects (Using the /api/subjects endpoint)
    try {
        const url = `${APIHOST}/api/subjects`; 
        const response = await fetch(url);
        
        if (response.ok) {
            allSubjects = await response.json();
        } else {
            console.warn(`Failed to fetch all subjects from ${url}: ${response.statusText}. Using mock.`);
            allSubjects = [
                { id: 's1', exam_id: 'e1', code: 'MATH', name: { en: 'Mathematics' } },
                { id: 's2', exam_id: 'e1', code: 'PHYSICS', name: { en: 'Physics' } },
                { id: 's3', exam_id: 'e2', code: 'EBRW', name: { en: 'Evidence-Based Reading and Writing' } },
            ] as Subject[];
        }
    } catch (error: any) {
        console.error("Failed to load subjects:", error);
        showNotification("Error fetching subjects. Using mock data.", 'error');
        allSubjects = [ 
            { id: 's1', exam_id: 'e1', code: 'MATH', name: { en: 'Mathematics' } },
            { id: 's2', exam_id: 'e1', code: 'PHYSICS', name: { en: 'Physics' } },
        ] as Subject[];
    }
    
    setSubjects(allSubjects);
    setLoading(false);
  };

  useEffect(() => {
    loadAllData();
  }, []); 

  // --- Form Handlers ---
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    
    if (id.startsWith('subject-name-')) {
      const lang = id.split('-').pop() as keyof FormTranslation;
      setFormData(prev => ({
        ...prev,
        subject_name: { ...prev.subject_name, [lang]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [id]: value }));
    }
  };

  // --- Submit Handler (CRUD: Create/Update) ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Use API_BASE for admin-level CRUD operations
    const url = isEditing ? `${API_BASE}/subjects/${formData.id}` : `${API_BASE}/subjects`;
    const method = isEditing ? 'PUT' : 'POST';

    // Validation
    if (!formData.exam_id) {
        showNotification('Exam must be selected.', 'error');
        return;
    }
    if (!isEditing && !formData.code.trim()) { 
        showNotification('Subject Code is required.', 'error');
        return;
    }
    if (!formData.subject_name.en.trim()) {
        showNotification('Subject Name (English) is required.', 'error');
        return;
    }

    // Data must match the CreateSubjectRequest or UpdateSubjectRequest payload
    const dataToSend: any = {
      name: formData.subject_name, // Matches 'Name' in both Create/Update requests
    };
    
    if (!isEditing) {
        // Add ExamID and Code only for creation (POST)
        dataToSend.exam_id = formData.exam_id;
        dataToSend.code = formData.code.toUpperCase();
    }
    // For PUT, only 'name' is needed in the body (as confirmed by the Go code)

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(`Failed to ${isEditing ? 'update' : 'create'} subject: ${errorBody.message || response.statusText}`);
      }

      showNotification(`Subject ${isEditing ? 'updated' : 'created'} successfully!`, 'success');
      hideForm();
      // Re-fetch all data to refresh the table
      await loadAllData(); 
    } catch (error: any) {
      console.error("API Error:", error);
      showNotification(`Error: ${error.message}`, 'error');
    }
  };

  // --- Edit/Delete Handlers (CRUD: Read/Delete) ---
  const handleEdit = (subject: Subject) => {
    setFormData(mapSubjectToFormData(subject)); 
    setIsEditing(true);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this subject? All associated content will also be affected.')) {
      return;
    }
    try {
      // DELETE uses the admin endpoint
      const response = await fetch(`${API_BASE}/subjects/${id}`, { method: 'DELETE' });
      
      if (response.status === 204) {
        showNotification('Subject deleted successfully!', 'success');
        await loadAllData(); 
      } else if (!response.ok) {
        const errorBody = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(`Failed to delete subject: ${errorBody.message || response.statusText}`);
      }
    } catch (error: any) {
      console.error("API Error:", error);
      showNotification(`Error: ${error.message}`, 'error');
    }
  };

  const showAddForm = () => {
    setFormData({
        ...initialFormData,
        exam_id: exams.length > 0 ? exams[0].id : '',
    });
    setIsEditing(false);
    setShowForm(true);
  };

  const hideForm = () => {
    setShowForm(false);
    setFormData(initialFormData);
    setIsEditing(false);
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
  
  // Helper to find exam name for display
  const getExamName = (examId: string) => {
    const exam = exams.find(e => e.id === examId);
    return exam 
        ? `${exam.name?.en || exam.exam_id} (${exam.exam_id})` 
        : `ID: ${examId}`;
  };

  // --- JSX Rendering ---
  return (
    <div style={styles.panel}>
      
      {message && (
        <div style={getNotificationStyle(message.type)}>{message.text}</div>
      )}

      {/* Header */}
      <div style={styles.sectionHeader}>
        <h2 style={styles.heading}>Subject Management</h2>
        <button 
          onClick={showAddForm} 
          style={getButtonStyle(PRIMARY_COLOR, 'white')}
          disabled={loading || showForm || exams.length === 0}
        >
          + Add Subject
        </button>
      </div>

      {/* Subject Table View */}
      {!showForm && (
        <div style={styles.tableContainer}>
          {loading ? (
            <div style={styles.emptyState}>Loading countries, exams, and subjects...</div>
          ) : subjects.length === 0 ? (
            <div style={styles.emptyState}>
              <p>No subjects added yet. Click "Add Subject" to get started.</p>
              {exams.length === 0 && <small style={{ color: DANGER_COLOR, marginTop: '10px' }}>* Cannot add subjects until exams are available.</small>}
            </div>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHeader}>
                  <th style={{ ...styles.tableHeadCell, width: '15%' }}>Code</th>
                  <th style={{ ...styles.tableHeadCell, width: '35%' }}>Name (EN)</th>
                  <th style={{ ...styles.tableHeadCell, width: '25%' }}>Exam</th>
                  <th style={{ ...styles.tableHeadCell, width: '25%' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {subjects.map(subject => (
                    <tr 
                      key={subject.id} 
                      style={styles.tableBodyRow}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = HOVER_COLOR}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                    >
                      <td style={styles.tableDataCell}>
                        <strong>{subject.code}</strong> 
                      </td>
                      <td style={styles.tableDataCell}>
                        {subject.name?.en || '—'} 
                      </td>
                      <td style={styles.tableDataCell}>
                        {getExamName(subject.exam_id)}
                      </td>
                      <td style={styles.tableDataCell}>
                        <div style={styles.actionCell}>
                          <button 
                            onClick={() => handleEdit(subject)} 
                            style={getButtonStyle(BORDER_COLOR, TEXT_COLOR, true)}
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDelete(subject.id)} 
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

      {/* Subject Form (Create/Edit View) */}
      {showForm && (
        <div style={styles.formContainer}>
          <h3 style={styles.formHeading}>
            {isEditing ? `Edit Subject: ${formData.code}` : 'Add New Subject'}
          </h3>
          <form onSubmit={handleSubmit}>
            
            <div style={styles.formGroup}>
              <label style={styles.label} htmlFor="exam_id">Linked Exam:</label>
              <select
                id="exam_id"
                value={formData.exam_id}
                onChange={handleFormChange}
                style={styles.input}
                required
                disabled={isEditing || exams.length === 0}
              >
                {exams.map(e => (
                    <option key={e.id} value={e.id}>
                        {e.name?.en || e.exam_id} ({e.exam_id})
                    </option>
                ))}
              </select>
              {(isEditing || exams.length === 0) && <small style={{ color: MUTED_COLOR, fontSize: '12px' }}>Exam cannot be changed after creation.</small>}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label} htmlFor="code">Subject Code (e.g., MATH, PHYSICS):</label>
              <input
                type="text"
                id="code"
                value={formData.code}
                onChange={handleFormChange}
                style={styles.input}
                required
                disabled={isEditing}
              />
              {isEditing && <small style={{ color: MUTED_COLOR, fontSize: '12px' }}>Code cannot be changed after creation.</small>}
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>Subject Names (Translations - EN is required):</label>
              {renderTranslationInputs('subject-name', formData.subject_name)}
            </div>
            
            <div style={styles.formActions}>
              <button 
                type="submit" 
                style={getButtonStyle(PRIMARY_COLOR, 'white')}
                disabled={exams.length === 0}
              >
                {isEditing ? 'Save Changes' : 'Save Subject'}
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

export default SubjectPanel;