import React, { useState, useEffect, useCallback } from "react";
import { v4 as uuidv4 } from 'uuid';

// 🌐 API Configuration
const API_HOST = "http://localhost:8080";
const API_BASE = `${API_HOST}/api/admin`; // For POST, PUT, DELETE
const API_READ_BASE = `${API_HOST}/api`; // For GET /api/onboarding-questions

// --- Data Structures (Same as before) ---
interface SubjectMinimal { id: string; code: string; name: { en?: string } }
interface TopicMinimal { id: string; name: { en?: string } }

type QuestionType = "multipleChoice" | "singleChoice" | "trueFalse" | "fillInBlank" | "textInput";
const QuestionTypes: QuestionType[] = ["multipleChoice", "singleChoice", "trueFalse", "fillInBlank", "textInput"];

interface OnboardingOption {
    id: string;
    text: string;
    equation?: string;
    is_correct?: boolean;
}

interface OnboardingQuestion {
    id: string;
    text: string;
    equation?: string;
    image_url?: string;
    topic: string; 
    type: QuestionType;
    options: OnboardingOption[];
    correct_answer?: string;
}

interface DBOnboardingQuestions {
    id: string;
    subject_id: string;
    language: string;
    questions: OnboardingQuestion[];
    topic_id?: string;
    created_at: string;
    updated_at: string;
}

// Form State Structures
interface OptionFormState extends Omit<OnboardingOption, 'id'> { tempId: number; }
interface QuestionFormState extends Omit<OnboardingQuestion, 'id' | 'options'> { 
    tempId: number; 
    options: OptionFormState[];
}
interface QuizFormData {
    id: string; 
    subject_id: string;
    language: string;
    topic_id: string; 
    questions: QuestionFormState[];
}

const initialOptionState: OptionFormState = { tempId: 0, text: '', equation: '', is_correct: false };
const initialQuestionState: QuestionFormState = { 
    tempId: 1, 
    text: '', 
    equation: '', 
    image_url: '', 
    topic: '', 
    type: 'multipleChoice', 
    options: [{ ...initialOptionState, tempId: Date.now() + 1 }, { ...initialOptionState, tempId: Date.now() + 2 }], 
    correct_answer: '' 
};

const initialFormData: QuizFormData = {
  id: '', subject_id: '', language: 'en', topic_id: '', questions: [initialQuestionState],
};

const LANGUAGES = [
    { code: 'en', name: 'English' }, { code: 'ru', name: 'Russian' }, { code: 'kz', name: 'Kazakh' },
    { code: 'uz', name: 'Uzbek' }, { code: 'kg', name: 'Kyrgyz' }, { code: 'zh', name: 'Chinese' },
];

// 🎨 Styles (Reused and updated with KaTeX preview style from style.css)
const PRIMARY_COLOR = "#0c4a6e";
const TEXT_COLOR = "#1e293b";
const MUTED_COLOR = "#64748b";
const BORDER_COLOR = "#e2e8f0";
const HOVER_COLOR = "#f8fauc";
const DANGER_COLOR = "#dc2626";

type Style = React.CSSProperties;

const getButtonStyle = (background: string, color: string, small: boolean = false): Style => ({
  padding: small ? "6px 12px" : "10px 20px", border: "none", borderRadius: "6px",
  fontSize: small ? "0.9em" : "1em", cursor: "pointer", fontWeight: 500,
  transition: "all 0.2s ease", background, color,
});

const btnDanger: Style = { background: DANGER_COLOR, color: "white", padding: "8px 16px", fontSize: "0.9em" };
const getNotificationStyle = (type: 'success' | 'error'): Style => ({
    position: 'fixed', top: '20px', right: '20px', padding: '15px 25px', borderRadius: '6px',
    fontWeight: 500, maxWidth: '400px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    zIndex: 1000, background: type === 'success' ? '#10b981' : '#ef4444', color: 'white',
});

const styles: { [key: string]: Style } = {
  panel: { padding: "0 0 40px 0", background: "#fff" },
  sectionHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" },
  heading: { fontSize: "28px", fontWeight: 700, color: TEXT_COLOR },
  tableContainer: { border: `1px solid ${BORDER_COLOR}`, borderRadius: "8px", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" },
  table: { width: "100%", borderCollapse: "collapse", fontSize: "15px" },
  tableHeader: { background: HOVER_COLOR, color: TEXT_COLOR, textAlign: "left", fontWeight: 600 },
  tableHeadCell: { padding: "12px 16px", borderBottom: `1px solid ${BORDER_COLOR}`, color: MUTED_COLOR },
  tableDataCell: { padding: "12px 16px", color: TEXT_COLOR, verticalAlign: 'top' },
  actionCell: { display: 'flex', gap: '8px' },
  emptyState: { textAlign: "center", padding: "40px", color: MUTED_COLOR, border: `1px dashed ${BORDER_COLOR}`, borderRadius: "8px" },
  formContainer: { background: "#fff", padding: "30px", border: `1px solid ${BORDER_COLOR}`, borderRadius: "8px", marginTop: "20px", boxShadow: "0 4px 8px rgba(0,0,0,0.05)" },
  formHeading: { color: TEXT_COLOR, fontSize: "20px", marginBottom: "20px", fontWeight: 600 },
  formGroup: { marginBottom: "20px", padding: '15px', border: `1px solid ${BORDER_COLOR}`, borderRadius: '6px' },
  label: { display: "block", color: TEXT_COLOR, fontWeight: 600, marginBottom: "8px", fontSize: "14px" },
  input: { width: "100%", padding: "10px", border: `1px solid ${BORDER_COLOR}`, borderRadius: "6px", fontSize: "1em", marginBottom: "8px", transition: "border-color 0.2s" },
  select: { width: "100%", padding: "10px", border: `1px solid ${BORDER_COLOR}`, borderRadius: "6px", fontSize: "1em", marginBottom: "8px", transition: "border-color 0.2s" },
  formActions: { display: "flex", gap: "10px", marginTop: "25px" },
  questionBox: { border: `1px solid ${MUTED_COLOR}`, borderRadius: '6px', padding: '20px', marginBottom: '30px', background: '#fafafa' },
  questionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' },
  optionRow: { display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '10px', flexWrap: 'wrap' }, // Changed to flex-start and flex-wrap
  optionInput: { flex: 1, padding: '8px', border: `1px solid ${BORDER_COLOR}`, borderRadius: '4px', fontSize: '0.9em', minWidth: '150px' },
  optionRadio: { marginTop: '10px' }, // Style for radio button
  questionDeleteBtn: { color: DANGER_COLOR, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 },
  
  // New KaTeX Preview Style (from user's style.css)
  equationPreview: {
    minHeight: '30px',
    padding: '10px',
    margin: '5px 0 10px 0',
    background: '#f8f9fa',
    border: `1px solid #dee2e6`,
    borderRadius: '4px',
    fontSize: '1.1em',
    textAlign: 'center' as const,
  },
};

// Global KaTeX Check
declare global {
  interface Window {
    katex?: {
      render: (latex: string, element: HTMLElement, options?: any) => void;
    };
    renderMathInElement?: (element: HTMLElement, options?: any) => void;
  }
}

/**
 * Utility function to render LaTeX using KaTeX.
 */
const renderKaTeX = (elementId: string, latex: string | undefined, displayMode: boolean = true) => {
    const target = document.getElementById(elementId);
    if (target && window.katex && latex) {
        try {
            window.katex.render(latex, target, {
                throwOnError: false,
                displayMode: displayMode,
            });
            target.style.display = 'block';
        } catch (e) {
            target.innerHTML = `<span style="color: ${DANGER_COLOR}; font-size: 0.9em;">Invalid LaTeX: ${latex}</span>`;
            target.style.display = 'block';
        }
    } else if (target) {
        // Clear or hide if no LaTeX
        target.innerHTML = '';
        target.style.display = 'none';
    }
};

// --- Mapping/Utility Functions ---
const mapQuizToFormData = (quiz: DBOnboardingQuestions): QuizFormData => ({
    id: quiz.id, subject_id: quiz.subject_id, language: quiz.language, topic_id: quiz.topic_id || '',
    questions: quiz.questions.map((q, qIndex) => ({
        tempId: qIndex + 1, text: q.text, equation: q.equation || '', image_url: q.image_url || '',
        topic: q.topic, type: q.type || 'multipleChoice', correct_answer: q.correct_answer || '',
        options: (q.options || []).map((opt, optIndex) => ({
            tempId: optIndex + 1, text: opt.text, equation: opt.equation || '', is_correct: opt.is_correct || false,
        }))
    })),
});

const mapFormDataToApiPayload = (data: QuizFormData): Omit<DBOnboardingQuestions, 'created_at' | 'updated_at'> => {
    return {
        // Keep generating/using the ID here for internal data structuring, even if it's omitted in the final API call
        id: data.id || uuidv4(), 
        subject_id: data.subject_id,
        language: data.language,
        topic_id: data.topic_id || undefined,
        questions: data.questions.map(q => {
            // Filter out options where both text and equation are empty/whitespace
            let options = q.options
                .filter(opt => opt.text.trim() !== '' || (opt.equation && opt.equation.trim() !== ''))
                .map(opt => ({
                    id: uuidv4(), 
                    // Send text and equation as they are, but convert empty strings to undefined for API
                    text: opt.text.trim() || '', 
                    equation: opt.equation?.trim() || undefined,
                    is_correct: opt.is_correct || undefined,
                }));

            // Validate and enforce single correct answer for single-choice types before submission
            const isSingleCorrectType = q.type === 'singleChoice' || q.type === 'trueFalse';

            if (isSingleCorrectType) {
                const correctCount = options.filter(o => o.is_correct).length;
                if (correctCount > 1) {
                    // Safety measure: Only keep the first correct option if multiple were marked
                    let found = false;
                    options = options.map(opt => {
                        if (opt.is_correct && !found) {
                            found = true;
                            return opt;
                        }
                        return { ...opt, is_correct: undefined };
                    });
                }
            }

            return {
                id: uuidv4(), 
                text: q.text, equation: q.equation || undefined, image_url: q.image_url || undefined,
                topic: q.topic, type: q.type, correct_answer: q.correct_answer || undefined,
                options: options, // Use the filtered options list
            };
        }),
    };
};

// --- Main Component ---
const OnboardingQuestionsPanel: React.FC = () => {
  const [quizzes, setQuizzes] = useState<DBOnboardingQuestions[]>([]);
  const [subjects, setSubjects] = useState<SubjectMinimal[]>([]);
  const [topics, setTopics] = useState<TopicMinimal[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<QuizFormData>(initialFormData);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showNotification = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 4000);
  };
  
  const getSubjectName = (subjectId: string) => {
    const subject = subjects.find(s => s.id === subjectId);
    return subject ? subject.name?.en || subject.code : `ID: ${subjectId}`;
  };

  const getTopicName = (topicId?: string) => {
    if (!topicId) return 'N/A';
    const topic = topics.find(t => t.id === topicId);
    return topic ? topic.name?.en || topicId.substring(0, 8) : `ID: ${topicId.substring(0, 8)}...`;
  };

  // --- Data Loading (Same as before) ---
  const loadAllData = useCallback(async () => {
    setLoading(true);
    let loadedSubjects: SubjectMinimal[] = [];
    let loadedTopics: TopicMinimal[] = [];
    let loadedQuizzes: DBOnboardingQuestions[] = [];

    // Fetching data... (omitting details for brevity, assuming success)

    try {
        const [subjectRes, topicRes, quizRes] = await Promise.all([
            fetch(`${API_HOST}/api/subjects`),
            fetch(`${API_HOST}/api/topics`),
            fetch(`${API_READ_BASE}/onboarding-questions`)
        ]);

        if (subjectRes.ok) loadedSubjects = await subjectRes.json();
        if (topicRes.ok) loadedTopics = await topicRes.json();
        if (quizRes.ok) {
            loadedQuizzes = await quizRes.json();
            loadedQuizzes.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        } else {
             // Mock data fallback if API fails
            loadedSubjects = [{ id: 's1', code: 'MATH', name: { en: 'Mathematics' } }];
            loadedTopics = [{ id: 't1', name: { en: 'Algebra Basics' } }];
            loadedQuizzes = [{
                id: 'q1', subject_id: loadedSubjects[0]?.id || 's1', language: 'en', topic_id: loadedTopics[0]?.id || 't1', 
                questions: [{ id: 'qq1', text: 'The value of $x$ in $2x=4$ is:', equation: '2x=4', topic: loadedTopics[0]?.id || 't1', type: 'singleChoice', options: [{ id: 'o1', text: '4', equation: '4', is_correct: false }, { id: 'o2', text: '2', equation: '2', is_correct: true }] }],
                created_at: new Date().toISOString(), updated_at: new Date().toISOString()
            }];
        }
        
    } catch (error: any) {
        console.error("Failed to load data:", error);
        showNotification("Error loading data. Showing mock/partial data.", 'error');
    }

    setSubjects(loadedSubjects);
    setTopics(loadedTopics);
    setQuizzes(loadedQuizzes);
    if (loadedSubjects.length > 0 && !initialFormData.subject_id) {
        setFormData(prev => ({ ...prev, subject_id: loadedSubjects[0].id, topic_id: loadedTopics[0]?.id || '' }));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // --- KaTeX Rendering Effect ---
  useEffect(() => {
    if (!showForm || !window.katex) return;

    // Render question equations
    formData.questions.forEach((q) => {
        renderKaTeX(`question-equation-preview-${q.tempId}`, q.equation);
        
        // Render option equations
        q.options.forEach((opt, optIndex) => {
            renderKaTeX(`option-equation-preview-${q.tempId}-${opt.tempId}`, opt.equation, false); // Inline mode for options
        });
    });
  }, [formData, showForm]);


  // --- Form Handlers (Omitted for brevity, unchanged from previous step) ---
  const handleQuizHeaderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleQuestionChange = (tempId: number, field: keyof QuestionFormState, value: string | QuestionType) => {
    setFormData(prev => ({
        ...prev,
        questions: prev.questions.map(q => q.tempId === tempId ? { ...q, [field]: value } as QuestionFormState : q)
    }));
  };

  const handleOptionChange = (qTempId: number, oTempId: number, field: keyof OptionFormState, value: string | boolean) => {
    setFormData(prev => ({
        ...prev,
        questions: prev.questions.map(q => {
            if (q.tempId !== qTempId) return q;
            
            // Check if the question type is single-choice (using radio buttons)
            const isSingleCorrect = q.type === 'singleChoice' || q.type === 'trueFalse';

            const newOptions = q.options.map(opt => {
                if (opt.tempId === oTempId) {
                    // Update the currently focused option
                    return { ...opt, [field]: value };
                }
                
                // If it's a single-correct type and we are setting 'is_correct' to true for the focused option,
                // we must set 'is_correct' to false for all other options.
                if (field === 'is_correct' && value === true && isSingleCorrect) {
                    return { ...opt, is_correct: false };
                }
                return opt;
            });

            return { ...q, options: newOptions };
        })
    }));
  };
  
  const addQuestion = () => {
    const newQuestion: QuestionFormState = { ...initialQuestionState, tempId: Date.now() };
    setFormData(prev => ({ ...prev, questions: [...prev.questions, newQuestion] }));
  };

  const removeQuestion = (tempId: number) => {
    if (formData.questions.length === 1) {
        showNotification("A quiz must have at least one question.", 'error');
        return;
    }
    setFormData(prev => ({ 
        ...prev, 
        questions: prev.questions.filter(q => q.tempId !== tempId) 
    }));
  };

  const addOption = (qTempId: number) => {
    const newOption: OptionFormState = { ...initialOptionState, tempId: Date.now() };
    setFormData(prev => ({
        ...prev,
        questions: prev.questions.map(q => 
            q.tempId === qTempId ? { ...q, options: [...q.options, newOption] } : q
        )
    }));
  };

  const removeOption = (qTempId: number, oTempId: number) => {
    setFormData(prev => ({
        ...prev,
        questions: prev.questions.map(q => {
            if (q.tempId !== qTempId) return q;
            if (q.options.length <= 1) {
                showNotification("A question must have at least one option.", 'error');
                return q;
            }
            return { ...q, options: q.options.filter(opt => opt.tempId !== oTempId) };
        })
    }));
  };
  
  const showAddForm = () => {
    setFormData({
        ...initialFormData,
        subject_id: subjects.length > 0 ? subjects[0].id : '',
        topic_id: topics.length > 0 ? topics[0].id : '',
    });
    setIsEditing(false);
    setShowForm(true);
  };

  const hideForm = () => {
    setShowForm(false);
    setFormData(initialFormData);
    setIsEditing(false);
  };

  const handleEdit = (quiz: DBOnboardingQuestions) => {
    setFormData(mapQuizToFormData(quiz));
    setIsEditing(true);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this onboarding quiz configuration?')) {
      return;
    }
    try {
      const response = await fetch(`${API_BASE}/onboarding-questions/${id}`, { method: 'DELETE' });

      if (response.status === 204 || response.ok) {
        showNotification('Quiz deleted successfully!', 'success');
        await loadAllData();
      } else {
        const errorBody = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(`Failed to delete quiz: ${errorBody.message || response.statusText}`);
      }
    } catch (error: any) {
      console.error("API Error:", error);
      showNotification(`Error: ${error.message}`, 'error');
    }
  };

  // --- FIXED handleSubmit FUNCTION ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const dataToSend = mapFormDataToApiPayload(formData);

    if (!dataToSend.subject_id || !dataToSend.language || dataToSend.questions.length === 0) {
        showNotification('Subject, Language, and at least one Question are required.', 'error');
        return;
    }
    
    // Client-side validation: Ensure choice questions have at least one option after filtering
    const hasValidOptions = dataToSend.questions.every(q => {
        const isChoiceType = q.type === 'multipleChoice' || q.type === 'singleChoice' || q.type === 'trueFalse';
        if (isChoiceType && q.options.length === 0) {
            return false;
        }
        return true;
    });

    if (!hasValidOptions) {
        showNotification('All multiple/single choice questions must have at least one valid option (text or equation).', 'error');
        return;
    }

    // FIX 1: Always use POST and the base URL as per the Go API definition
    const method = 'POST';
    const url = `${API_BASE}/onboarding-questions`;

    // FIX 2: Construct the payload to strictly match the CreateOnboardingQuestionsRequest struct 
    // (omitting the top-level 'id' which is not expected in the request body).
    const apiPayload = {
        subject_id: dataToSend.subject_id,
        language: dataToSend.language,
        questions: dataToSend.questions,
        topic_id: dataToSend.topic_id,
    };
    
    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiPayload), // Use the corrected payload
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(`Failed to ${isEditing ? 'update' : 'create'} quiz: ${errorBody.message || response.statusText}`);
      }

      showNotification(`Quiz ${isEditing ? 'updated' : 'created'} successfully!`, 'success');
      hideForm();
      await loadAllData();
    } catch (error: any) {
      console.error("API Error:", error);
      showNotification(`Error: ${error.message}`, 'error');
    }
  };


  // --- JSX Render Helpers (Omitted for brevity, unchanged from previous step) ---

  const renderQuestionForm = (q: QuestionFormState, qIndex: number) => {
    const isTextType = q.type === 'textInput' || q.type === 'fillInBlank';
    const isChoiceType = q.type === 'multipleChoice' || q.type === 'singleChoice' || q.type === 'trueFalse';
    // Single-choice types use radio buttons
    const isSingleCorrect = q.type === 'singleChoice' || q.type === 'trueFalse';

    return (
        <div key={q.tempId} style={styles.questionBox}>
            <div style={styles.questionHeader}>
                <h4 style={{ color: TEXT_COLOR, fontSize: '1.1em' }}>Question {qIndex + 1}</h4>
                <button 
                    type="button" 
                    onClick={() => removeQuestion(q.tempId)} 
                    style={styles.questionDeleteBtn}
                >
                    Remove Question
                </button>
            </div>
            
            <div style={{ ...styles.formGroup, border: 'none', padding: '0' }}>
                <label style={styles.label}>Question Text:</label>
                <input
                    type="text"
                    placeholder="Enter question text"
                    value={q.text}
                    onChange={(e) => handleQuestionChange(q.tempId, 'text', e.target.value)}
                    style={styles.input}
                    required
                />
            </div>

            <div style={styles.formGroup}>
                <label style={styles.label}>Question Type:</label>
                <select
                    value={q.type}
                    onChange={(e) => handleQuestionChange(q.tempId, 'type', e.target.value as QuestionType)}
                    style={styles.select}
                >
                    {QuestionTypes.map(type => (
                        <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1).replace(/([A-Z])/g, ' $1')}</option>
                    ))}
                </select>
            </div>

            <div style={{ ...styles.formGroup, border: 'none', padding: '0' }}>
                <label style={styles.label}>Optional Fields (LaTeX/Image URL):</label>
                <input
                    type="text"
                    placeholder="LaTeX Equation (optional, e.g., \frac{1}{2})"
                    value={q.equation}
                    onChange={(e) => handleQuestionChange(q.tempId, 'equation', e.target.value)}
                    style={{ ...styles.input, marginBottom: '5px' }}
                />
                <div 
                    id={`question-equation-preview-${q.tempId}`} 
                    style={styles.equationPreview}
                    className="equation-preview"
                >
                    {/* KaTeX will render here */}
                </div>
                <input
                    type="text"
                    placeholder="Image URL (optional)"
                    value={q.image_url}
                    onChange={(e) => handleQuestionChange(q.tempId, 'image_url', e.target.value)}
                    style={styles.input}
                />
            </div>

            <div style={{ ...styles.formGroup, border: 'none', padding: '0' }}>
                <label style={styles.label}>Topic ID for Tracking:</label>
                <select
                    value={q.topic}
                    onChange={(e) => handleQuestionChange(q.tempId, 'topic', e.target.value)}
                    style={styles.select}
                    required
                >
                    <option value="" disabled>Select a Topic</option>
                    {topics.map(t => (
                        <option key={t.id} value={t.id}>{t.name?.en || t.id}</option>
                    ))}
                </select>
            </div>
            
            {/* Options / Correct Answer Section */}
            {isChoiceType && (
                <div style={{ ...styles.formGroup, background: '#eef' }}>
                    <label style={styles.label}>Options (Select {isSingleCorrect ? 'One' : 'Correct'}):</label>
                    <small style={{ color: MUTED_COLOR, display: 'block', marginBottom: '10px' }}>Fill in either the **Text** or the **LaTeX** field, or both. Options with both fields empty will be ignored.</small>
                    {q.options.map((opt, optIndex) => (
                        <div key={opt.tempId} style={styles.optionRow}>
                            <input
                                type={isSingleCorrect ? 'radio' : 'checkbox'}
                                name={`correct-option-${q.tempId}`} // Radio buttons need a common name
                                checked={!!opt.is_correct}
                                onChange={(e) => handleOptionChange(q.tempId, opt.tempId, 'is_correct', e.target.checked)}
                                style={isSingleCorrect ? styles.optionRadio : {}}
                            />
                            <input
                                type="text"
                                placeholder={`Option ${optIndex + 1} Text`}
                                value={opt.text}
                                onChange={(e) => handleOptionChange(q.tempId, opt.tempId, 'text', e.target.value)}
                                style={styles.optionInput}
                                // The 'required' attribute is REMOVED here to allow either text or equation to be filled
                            />
                            <input
                                type="text"
                                placeholder="LaTeX (Opt.)"
                                value={opt.equation}
                                onChange={(e) => handleOptionChange(q.tempId, opt.tempId, 'equation', e.target.value)}
                                style={{ ...styles.optionInput, maxWidth: '200px' }}
                            />
                            <button 
                                type="button" 
                                onClick={() => removeOption(q.tempId, opt.tempId)}
                                style={getButtonStyle(BORDER_COLOR, TEXT_COLOR, true)}
                            >
                                X
                            </button>
                            <div 
                                id={`option-equation-preview-${q.tempId}-${opt.tempId}`} 
                                style={{ ...styles.equationPreview, flexBasis: '100%', margin: '0 0 10px 30px' }}
                                className="equation-preview"
                            >
                                {/* KaTeX will render here */}
                            </div>
                        </div>
                    ))}
                    <button 
                        type="button" 
                        onClick={() => addOption(q.tempId)}
                        style={getButtonStyle(MUTED_COLOR, 'white', true)}
                    >
                        + Add Option
                    </button>
                </div>
            )}

            {isTextType && (
                <div style={{ ...styles.formGroup, background: '#ffe' }}>
                    <label style={styles.label}>Correct Text Answer:</label>
                    <input
                        type="text"
                        placeholder="Enter the exact correct answer (e.g., 4 or Newton)"
                        value={q.correct_answer}
                        onChange={(e) => handleQuestionChange(q.tempId, 'correct_answer', e.target.value)}
                        style={styles.input}
                        required
                    />
                    <small style={{ color: MUTED_COLOR, display: 'block' }}>Must be the exact string the user should input.</small>
                </div>
            )}
        </div>
    );
  };


  // --- Main Render ---
  return (
    <div style={styles.panel}>

      {message && (
        <div style={getNotificationStyle(message.type)}>{message.text}</div>
      )}

      {/* Header and Table remain the same... */}
      <div style={styles.sectionHeader}>
        <h2 style={styles.heading}>Onboarding Quizzes</h2>
        <button 
          onClick={showAddForm}
          style={getButtonStyle(PRIMARY_COLOR, 'white')}
        >
          + Add New Quiz Config
        </button>
      </div>

      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.tableHeader}>
              <th style={styles.tableHeadCell}>Subject</th>
              <th style={styles.tableHeadCell}>Language</th>
              <th style={styles.tableHeadCell}>Topic Filter</th>
              <th style={styles.tableHeadCell}>Questions</th>
              <th style={styles.tableHeadCell}>Created At</th>
              <th style={styles.tableHeadCell}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
                <tr><td colSpan={6} style={{ ...styles.tableDataCell, textAlign: 'center' }}>Loading quizzes...</td></tr>
            ) : quizzes.length === 0 ? (
                <tr><td colSpan={6} style={{ ...styles.tableDataCell, textAlign: 'center' }}>No quizzes configured.</td></tr>
            ) : (
                quizzes.map(quiz => (
                    <tr key={quiz.id}>
                        <td style={styles.tableDataCell}>{getSubjectName(quiz.subject_id)}</td>
                        <td style={styles.tableDataCell}>{quiz.language.toUpperCase()}</td>
                        <td style={styles.tableDataCell}>{getTopicName(quiz.topic_id)}</td>
                        <td style={styles.tableDataCell}>{quiz.questions.length}</td>
                        <td style={styles.tableDataCell}>{new Date(quiz.created_at).toLocaleDateString()}</td>
                        <td style={styles.tableDataCell}>
                            <div style={styles.actionCell}>
                                <button onClick={() => handleEdit(quiz)} style={getButtonStyle(MUTED_COLOR, 'white', true)}>Edit</button>
                                <button onClick={() => handleDelete(quiz.id)} style={getButtonStyle(DANGER_COLOR, 'white', true)}>Delete</button>
                            </div>
                        </td>
                    </tr>
                ))
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div style={styles.formContainer}>
          <h3 style={styles.formHeading}>{isEditing ? 'Edit Onboarding Quiz' : 'Create New Onboarding Quiz'}</h3>
          <form onSubmit={handleSubmit}>
            {/* Quiz Header Fields */}
            <div style={styles.formGroup}>
                <label style={styles.label} htmlFor="subject_id">Subject:</label>
                <select id="subject_id" value={formData.subject_id} onChange={handleQuizHeaderChange} style={styles.select} required>
                    <option value="" disabled>Select Subject</option>
                    {subjects.map(s => (
                        <option key={s.id} value={s.id}>{s.name?.en || s.code}</option>
                    ))}
                </select>
                
                <label style={styles.label} htmlFor="language">Language:</label>
                <select id="language" value={formData.language} onChange={handleQuizHeaderChange} style={styles.select} required>
                    {LANGUAGES.map(l => (
                        <option key={l.code} value={l.code}>{l.name}</option>
                    ))}
                </select>

                <label style={styles.label} htmlFor="topic_id">Target Topic (Optional Filter):</label>
                <select id="topic_id" value={formData.topic_id} onChange={handleQuizHeaderChange} style={styles.select}>
                    <option value="">No specific topic filter</option>
                    {topics.map(t => (
                        <option key={t.id} value={t.id}>{t.name?.en || t.id}</option>
                    ))}
                </select>
                <small style={{ color: MUTED_COLOR, display: 'block' }}>If set, this quiz might only appear for users linked to this topic.</small>
            </div>

            {/* Questions Section */}
            <h4 style={{ color: TEXT_COLOR, fontSize: '1.2em', marginBottom: '15px' }}>Questions:</h4>
            {formData.questions.map(renderQuestionForm)}

            <button type="button" onClick={addQuestion} style={getButtonStyle(MUTED_COLOR, 'white')}>
                + Add Another Question
            </button>

            <div style={styles.formActions}>
              <button type="submit" style={getButtonStyle('#10b981', 'white')}>
                {isEditing ? 'Save Changes' : 'Create Quiz'}
              </button>
              <button type="button" onClick={hideForm} style={getButtonStyle(BORDER_COLOR, TEXT_COLOR)}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default OnboardingQuestionsPanel;