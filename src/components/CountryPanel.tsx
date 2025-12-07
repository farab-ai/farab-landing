import React, { useState, useEffect, useMemo } from "react";
import { v4 as uuidv4 } from 'uuid'; // Used for unique IDs in dynamic lists

// 🌐 API Configuration - Using the specified base URL
const API_HOST = "http://localhost:8080";
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

interface Country {
  id: string;
  country_code: string; // e.g., USA, KAZ
  country_name: Translation;
  languages: string[]; // <-- NEW: Array of language codes (e.g., ['en', 'kz', 'ru'])
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

// Helper interface for managing languages in the form (with IDs for React list stability)
interface LanguageInput {
    tempId: string;
    code: string; // e.g., 'en'
}

interface CountryFormData {
    id: string;
    country_code: string;
    country_name: FormTranslation;
    languages: LanguageInput[]; // <-- NEW: List of language objects
}

// 🎨 Styles (Consistent with other panels)
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

// Helper style for dynamic list items
const languageRowStyle: Style = {
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
    marginBottom: '8px',
};


const styles: { [key: string]: Style } = {
  // --- Layout & Headers ---
  panel: {
    padding: "0 0 40px 0", 
    background: "#fff",
  },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "30px",
  },
  heading: {
    fontSize: "28px",
    fontWeight: 700,
    color: TEXT_COLOR,
  },
  // --- Table Styles ---
  tableContainer: {
    border: `1px solid ${BORDER_COLOR}`,
    borderRadius: "8px",
    overflow: "hidden",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "15px",
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
  },
  // --- Actions ---
  actionCell: {
    display: 'flex',
    gap: '8px',
  },
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
  formGroup: {
    marginBottom: "20px",
  },
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
  inputFocus: {
    borderColor: PRIMARY_COLOR,
    outline: "1px solid " + PRIMARY_COLOR,
  },
  formActions: {
    display: "flex",
    gap: "10px",
    marginTop: "25px",
  },
  languageListContainer: {
    border: `1px solid ${BORDER_COLOR}`,
    padding: '10px',
    borderRadius: '6px',
    marginBottom: '10px'
  }
};

// ----------------------------------------------------------------------
// Panel Logic and Handlers
// ----------------------------------------------------------------------

const initialFormData: CountryFormData = {
  id: '',
  country_code: '',
  country_name: { en: '', ru: '', kz: '', uz: '', kg: '', zh: '' },
  languages: [{ tempId: uuidv4(), code: 'en' }], // Default to English
};

const mapCountryToFormData = (country: Country): CountryFormData => ({
    id: country.id,
    country_code: country.country_code,
    country_name: {
        en: country.country_name.en || '', ru: country.country_name.ru || '', kz: country.country_name.kz || '',
        uz: country.country_name.uz || '', kg: country.country_name.kg || '', zh: country.country_name.zh || '',
    },
    // Map string array to LanguageInput[] for form
    languages: (country.languages || []).map(code => ({ tempId: uuidv4(), code })),
});

const CountryPanel: React.FC = () => {
  const [countries, setCountries] = useState<Country[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<CountryFormData>(initialFormData);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showNotification = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 4000);
  };

  // 1. Country Loader (CRUD: Read)
  const loadCountries = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/countries`);
      if (!response.ok) throw new Error("Failed to fetch countries");
      const data: Country[] = await response.json();
      setCountries(data);
    } catch (error) {
      console.error("Failed to load countries:", error);
      showNotification("Error loading countries. Using mock data.", 'error');
      // Mock Data Fallback (with languages)
      const mockData: Country[] = [
          { id: 'c1', country_code: 'KAZ', country_name: { en: 'Kazakhstan', ru: 'Казахстан' }, languages: ['kz', 'ru', 'en'] },
          { id: 'c2', country_code: 'USA', country_name: { en: 'United States' }, languages: ['en'] },
          { id: 'c3', country_code: 'UZB', country_name: { en: 'Uzbekistan', uz: 'Oʻzbekiston' }, languages: ['uz', 'ru'] },
      ];
      setCountries(mockData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCountries();
  }, []);

  // --- Form Handlers ---
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    
    if (id.startsWith('country-name-')) {
      const lang = id.split('-').pop() as keyof FormTranslation;
      setFormData(prev => ({
        ...prev,
        country_name: { ...prev.country_name, [lang]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [id]: value }));
    }
  };

  // Language Handlers
  const handleLanguageChange = (tempId: string, value: string) => {
    setFormData(prev => ({
        ...prev,
        languages: prev.languages.map(lang => 
            lang.tempId === tempId ? { ...lang, code: value.toLowerCase().trim() } : lang
        ),
    }));
  };

  const addLanguage = () => {
    setFormData(prev => ({
        ...prev,
        languages: [...prev.languages, { tempId: uuidv4(), code: '' }],
    }));
  };

  const removeLanguage = (tempId: string) => {
    setFormData(prev => ({
        ...prev,
        languages: prev.languages.filter(lang => lang.tempId !== tempId),
    }));
  };


  // --- Submit Handler (CRUD: Create/Update) ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const url = isEditing ? `${API_BASE}/countries/${formData.id}` : `${API_BASE}/countries`;
    const method = isEditing ? 'PUT' : 'POST';

    const languageCodes = formData.languages
        .map(l => l.code)
        .filter(code => code); // Filter out empty codes

    // Validation
    if (languageCodes.length === 0) {
        showNotification('At least one language must be specified for the country.', 'error');
        return;
    }
    if (new Set(languageCodes).size !== languageCodes.length) {
        showNotification('Language codes must be unique.', 'error');
        return;
    }


    // Data must match the Country interface structure
    const dataToSend: Partial<Country> = {
      country_code: formData.country_code.toUpperCase(),
      country_name: formData.country_name,
      languages: languageCodes, // Send only the string array
    };
    
    // Include ID in data if editing (for PUT request payload)
    if (isEditing) (dataToSend as Country).id = formData.id; 

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(`Failed to ${isEditing ? 'update' : 'create'} country: ${errorBody.message || response.statusText}`);
      }

      showNotification(`Country ${isEditing ? 'updated' : 'created'} successfully!`, 'success');
      hideForm();
      await loadCountries();
    } catch (error: any) {
      console.error("API Error:", error);
      showNotification(`Error: ${error.message}`, 'error');
    }
  };

  // --- Edit/Delete Handlers (CRUD: Read/Delete) ---
  const handleEdit = (country: Country) => {
    setFormData(mapCountryToFormData(country)); 
    setIsEditing(true);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this country? All associated exams will also be affected.')) {
      return;
    }
    try {
      const response = await fetch(`${API_BASE}/countries/${id}`, { method: 'DELETE' });
      
      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(`Failed to delete country: ${errorBody.message || response.statusText}`);
      }

      showNotification('Country deleted successfully!', 'success');
      await loadCountries();
    } catch (error: any) {
      console.error("API Error:", error);
      showNotification(`Error: ${error.message}`, 'error');
    }
  };

  const showAddForm = () => {
    setFormData(initialFormData);
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


  // --- JSX Rendering ---
  return (
    <div style={styles.panel}>
      
      {message && (
        <div style={getNotificationStyle(message.type)}>{message.text}</div>
      )}

      {/* Header */}
      <div style={styles.sectionHeader}>
        <h2 style={styles.heading}>Country Management</h2>
        <button 
          onClick={showAddForm} 
          style={getButtonStyle(PRIMARY_COLOR, 'white')}
          disabled={loading || showForm}
        >
          + Add Country
        </button>
      </div>

      {/* Country Table View */}
      {!showForm && (
        <div style={styles.tableContainer}>
          {loading ? (
            <div style={styles.emptyState}>Loading countries...</div>
          ) : countries.length === 0 ? (
            <div style={styles.emptyState}>
              <p>No countries added yet. Click "Add Country" to get started.</p>
            </div>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHeader}>
                  <th style={{ ...styles.tableHeadCell, width: '15%' }}>Code</th>
                  <th style={{ ...styles.tableHeadCell, width: '35%' }}>Name (EN)</th>
                  <th style={{ ...styles.tableHeadCell, width: '20%' }}>Languages</th> {/* Column for Languages */}
                  <th style={{ ...styles.tableHeadCell, width: '30%' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {countries.map(country => (
                    <tr 
                      key={country.id} 
                      style={styles.tableBodyRow}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = HOVER_COLOR}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                    >
                      <td style={styles.tableDataCell}>
                        <strong>{country.country_code}</strong>
                      </td>
                      <td style={styles.tableDataCell}>
                        {country.country_name.en || '—'}
                      </td>
                      <td style={styles.tableDataCell}>
                        {(country.languages || []).map(lang => 
                            <span key={lang} style={{ 
                                display: 'inline-block', 
                                margin: '2px', 
                                padding: '3px 8px', 
                                background: MUTED_COLOR, 
                                color: 'white', 
                                borderRadius: '4px',
                                fontSize: '0.8em'
                            }}>{lang.toUpperCase()}</span>
                        )}
                      </td>
                      <td style={styles.tableDataCell}>
                        <div style={styles.actionCell}>
                          <button 
                            onClick={() => handleEdit(country)} 
                            style={getButtonStyle(BORDER_COLOR, TEXT_COLOR, true)}
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDelete(country.id)} 
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

      {/* Country Form (Create/Edit View) */}
      {showForm && (
        <div style={styles.formContainer}>
          <h3 style={styles.formHeading}>
            {isEditing ? `Edit Country: ${formData.country_code}` : 'Add New Country'}
          </h3>
          <form onSubmit={handleSubmit}>
            
            <div style={styles.formGroup}>
              <label style={styles.label} htmlFor="country_code">Country Code (e.g., KAZ, USA):</label>
              <input
                type="text"
                id="country_code"
                maxLength={3}
                value={formData.country_code}
                onChange={handleFormChange}
                style={styles.input}
                required
                disabled={isEditing}
              />
              {isEditing && <small style={{ color: MUTED_COLOR, fontSize: '12px' }}>Code cannot be changed after creation.</small>}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Country Names (Translations - EN is required):</label>
              {renderTranslationInputs('country-name', formData.country_name)}
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>Supported Languages (ISO 639-1 code, e.g., 'en', 'ru'):</label>
              <div style={styles.languageListContainer}>
                {formData.languages.map((lang, index) => (
                    <div key={lang.tempId} style={languageRowStyle}>
                        <input
                            type="text"
                            id={`language-code-${lang.tempId}`}
                            placeholder="Language Code (e.g., en)"
                            value={lang.code}
                            onChange={(e) => handleLanguageChange(lang.tempId, e.target.value)}
                            style={{ ...styles.input, flex: 1, margin: 0 }}
                            required
                        />
                        {/* Ensure the last input cannot be removed if it's the only one */}
                        {formData.languages.length > 1 && ( 
                            <button
                                type="button"
                                onClick={() => removeLanguage(lang.tempId)}
                                style={getButtonStyle(DANGER_COLOR, 'white', true)}
                            >
                                Remove
                            </button>
                        )}
                    </div>
                ))}
                <button
                    type="button"
                    onClick={addLanguage}
                    style={getButtonStyle(BORDER_COLOR, TEXT_COLOR, true)}
                >
                    + Add Language
                </button>
              </div>
            </div>

            <div style={styles.formActions}>
              <button 
                type="submit" 
                style={getButtonStyle(PRIMARY_COLOR, 'white')}
              >
                {isEditing ? 'Save Changes' : 'Save Country'}
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

export default CountryPanel;