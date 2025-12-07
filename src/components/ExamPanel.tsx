import React, { useState, useEffect } from "react";

// 🌐 API Configuration
const API_HOST = "http://localhost:8080";
// API_BASE is only used for Admin CRUD endpoints (/api/admin/...)
const API_BASE = `${API_HOST}/api/admin`; 

// 🌍 Data Structures
interface Translation {
  en?: string;
  ru?: string;
  kz?: string;
  uz?: string;
  kg?: string;
  zh?: string;
}

// Full minimal structure for a Country needed for the Exam panel's dependencies
interface CountryMinimal {
    id: string;
    country_code: string;
    country_name: Translation; // Includes translation needed for country name lookup
}

/**
 * Updated Exam interface reflecting the DBExam structure without 'exam_year'.
 */
interface Exam {
  id: string;
  exam_id: string;      // Matches DBExam.ExamID
  country_id: string;
  name: Translation;    // Matches DBExam.Name
  created_at?: string;  // Matches DBExam.CreatedAt
  updated_at?: string;  // Matches DBExam.UpdatedAt
}

// 📋 Type for the Form State (Removed exam_year)
interface FormTranslation {
  en: string;
  ru: string;
  kz: string;
  uz: string;
  kg: string;
  zh: string;
}

interface ExamFormData {
    id: string;
    country_id: string;
    exam_code: string; // Mapped to exam_id for API
    exam_name: FormTranslation; // Mapped to name for API
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

const initialFormData: ExamFormData = {
  id: '',
  country_id: '',
  exam_code: '',
  exam_name: { en: '', ru: '', kz: '', uz: '', kg: '', zh: '' },
};

const mapExamToFormData = (exam: Exam): ExamFormData => ({
    id: exam.id,
    country_id: exam.country_id,
    exam_code: exam.exam_id, // Map the API field to the form field
    exam_name: {
        en: exam.name?.en || '', ru: exam.name?.ru || '', kz: exam.name?.kz || '', // Map the API field to the form field
        uz: exam.name?.uz || '', kg: exam.name?.kg || '', zh: exam.name?.zh || '',
    },
});

const ExamPanel: React.FC = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [countries, setCountries] = useState<CountryMinimal[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<ExamFormData>(initialFormData);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showNotification = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 4000);
  };

  // --- Combined Loader (Countries & Exams) ---
  const loadAllData = async () => {
    setLoading(true);
    let loadedCountries: CountryMinimal[] = [];
    
    // 1. Load Countries (Dependency - using /api/admin/countries)
    try {
        const response = await fetch(`${API_BASE}/countries`);
        if (!response.ok) throw new Error("Failed to fetch countries");
        const data: CountryMinimal[] = await response.json();
        loadedCountries = data;
    } catch (error: any) {
        console.error("Failed to load countries, using mock:", error);
        showNotification("Error loading country list. Using mock data.", 'error');
        loadedCountries = [
            { id: 'c1', country_code: 'KAZ', country_name: { en: 'Kazakhstan', ru: 'Казахстан' } },
            { id: 'c2', country_code: 'USA', country_name: { en: 'United States' } }, 
            { id: 'c3', country_code: 'UZB', country_name: { en: 'Uzbekistan', uz: 'Oʻzbekiston' } },
        ];
    }
    setCountries(loadedCountries);
    
    if (loadedCountries.length > 0 && !formData.country_id) {
        setFormData(prev => ({ ...prev, country_id: loadedCountries[0].id }));
    }

    // 2. Load Exams (Using the new /api/exams endpoint)
    let allExams: Exam[] = [];
    try {
        const url = `${API_HOST}/api/exams`; // <-- UPDATED ENDPOINT
        const response = await fetch(url);
        
        if (response.ok) {
            allExams = await response.json();
        } else {
            console.warn(`Failed to fetch all exams from ${url}: ${response.statusText}. Using mock.`);
            allExams = [ 
                { id: 'e1', country_id: 'c1', exam_id: 'UNT', name: { en: 'Unified National Test', ru: 'ЕНТ' } },
                { id: 'e2', country_id: 'c2', exam_id: 'SAT', name: { en: 'Scholastic Assessment Test' } },
            ] as Exam[];
        }
    } catch (error: any) {
        console.error("Failed to load exams:", error);
        showNotification("Error fetching exams. Using mock data.", 'error');
        allExams = [ 
            { id: 'e1', country_id: 'c1', exam_id: 'UNT', name: { en: 'Unified National Test', ru: 'ЕНТ' } },
            { id: 'e2', country_id: 'c2', exam_id: 'SAT', name: { en: 'Scholastic Assessment Test' } },
        ] as Exam[];
    }
    
    setExams(allExams);
    setLoading(false);
  };

  useEffect(() => {
    loadAllData();
  }, []); 

  // --- Form Handlers ---
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    
    if (id.startsWith('exam-name-')) {
      const lang = id.split('-').pop() as keyof FormTranslation;
      setFormData(prev => ({
        ...prev,
        exam_name: { ...prev.exam_name, [lang]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [id]: value }));
    }
  };

  // --- Submit Handler (CRUD: Create/Update) ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // CRUD operations still use API_BASE (/api/admin/...)
    const url = isEditing ? `${API_BASE}/exams/${formData.id}` : `${API_BASE}/exams`;
    const method = isEditing ? 'PUT' : 'POST';

    // Validation
    if (!formData.country_id) {
        showNotification('Country must be selected.', 'error');
        return;
    }
    if (!formData.exam_code.trim()) {
        showNotification('Exam Code is required.', 'error');
        return;
    }

    // Data must match the Exam interface structure for API payload
    const dataToSend: Partial<Exam> = {
      country_id: formData.country_id,
      exam_id: formData.exam_code.toUpperCase(), 
      name: formData.exam_name,
    };
    
    if (isEditing) (dataToSend as Exam).id = formData.id; 

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(`Failed to ${isEditing ? 'update' : 'create'} exam: ${errorBody.message || response.statusText}`);
      }

      showNotification(`Exam ${isEditing ? 'updated' : 'created'} successfully!`, 'success');
      hideForm();
      await loadAllData(); 
    } catch (error: any) {
      console.error("API Error:", error);
      showNotification(`Error: ${error.message}`, 'error');
    }
  };

  // --- Edit/Delete Handlers (CRUD: Read/Delete) ---
  const handleEdit = (exam: Exam) => {
    setFormData(mapExamToFormData(exam)); 
    setIsEditing(true);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this exam? All associated subjects will also be affected.')) {
      return;
    }
    try {
      const response = await fetch(`${API_BASE}/exams/${id}`, { method: 'DELETE' });
      
      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(`Failed to delete exam: ${errorBody.message || response.statusText}`);
      }

      showNotification('Exam deleted successfully!', 'success');
      await loadAllData(); 
    } catch (error: any) {
      console.error("API Error:", error);
      showNotification(`Error: ${error.message}`, 'error');
    }
  };

  const showAddForm = () => {
    setFormData({
        ...initialFormData,
        country_id: countries.length > 0 ? countries[0].id : '',
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
        required={lang === 'en'} 
      />
    ));
  };
  
  // Helper to find country name for display (Uses the CountryMinimal structure)
  const getCountryName = (countryId: string) => {
    const country = countries.find(c => c.id === countryId);
    return country 
        ? `${country.country_name?.en || country.country_code} (${country.country_code})` 
        : `ID: ${countryId}`;
  };

  // --- JSX Rendering ---
  return (
    <div style={styles.panel}>
      
      {message && (
        <div style={getNotificationStyle(message.type)}>{message.text}</div>
      )}

      {/* Header */}
      <div style={styles.sectionHeader}>
        <h2 style={styles.heading}>Exam Management</h2>
        <button 
          onClick={showAddForm} 
          style={getButtonStyle(PRIMARY_COLOR, 'white')}
          disabled={loading || showForm}
        >
          + Add Exam
        </button>
      </div>

      {/* Exam Table View */}
      {!showForm && (
        <div style={styles.tableContainer}>
          {loading ? (
            <div style={styles.emptyState}>Loading exams...</div>
          ) : exams.length === 0 ? (
            <div style={styles.emptyState}>
              <p>No exams added yet. Click "Add Exam" to get started.</p>
            </div>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHeader}>
                  <th style={{ ...styles.tableHeadCell, width: '20%' }}>ID/Code</th>
                  <th style={{ ...styles.tableHeadCell, width: '35%' }}>Name (EN)</th>
                  <th style={{ ...styles.tableHeadCell, width: '25%' }}>Country</th>
                  <th style={{ ...styles.tableHeadCell, width: '20%' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {exams.map(exam => (
                    <tr 
                      key={exam.id} 
                      style={styles.tableBodyRow}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = HOVER_COLOR}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                    >
                      <td style={styles.tableDataCell}>
                        <strong>{exam.exam_id}</strong> 
                      </td>
                      <td style={styles.tableDataCell}>
                        {exam.name?.en || '—'} 
                      </td>
                      <td style={styles.tableDataCell}>
                        {getCountryName(exam.country_id)}
                      </td>
                      <td style={styles.tableDataCell}>
                        <div style={styles.actionCell}>
                          <button 
                            onClick={() => handleEdit(exam)} 
                            style={getButtonStyle(BORDER_COLOR, TEXT_COLOR, true)}
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDelete(exam.id)} 
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

      {/* Exam Form (Create/Edit View) */}
      {showForm && (
        <div style={styles.formContainer}>
          <h3 style={styles.formHeading}>
            {isEditing ? `Edit Exam: ${formData.exam_code}` : 'Add New Exam'}
          </h3>
          <form onSubmit={handleSubmit}>
            
            <div style={styles.formGroup}>
              <label style={styles.label} htmlFor="country_id">Linked Country:</label>
              <select
                id="country_id"
                value={formData.country_id}
                onChange={handleFormChange}
                style={styles.input}
                required
                disabled={countries.length === 0}
              >
                {countries.map(c => (
                    <option key={c.id} value={c.id}>
                        {c.country_name?.en || c.country_code} ({c.country_code})
                    </option>
                ))}
              </select>
              {countries.length === 0 && <small style={{ color: PRIMARY_COLOR }}>No countries available. Please add a country first.</small>}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label} htmlFor="exam_code">Exam Code (e.g., UNT, SAT):</label>
              <input
                type="text"
                id="exam_code"
                value={formData.exam_code}
                onChange={handleFormChange}
                style={styles.input}
                required
                disabled={isEditing}
              />
              {isEditing && <small style={{ color: MUTED_COLOR, fontSize: '12px' }}>Code (ExamID) cannot be changed after creation.</small>}
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>Exam Names (Translations - EN is required):</label>
              {renderTranslationInputs('exam-name', formData.exam_name)}
            </div>
            
            <div style={styles.formActions}>
              <button 
                type="submit" 
                style={getButtonStyle(PRIMARY_COLOR, 'white')}
                disabled={countries.length === 0}
              >
                {isEditing ? 'Save Changes' : 'Save Exam'}
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

export default ExamPanel;