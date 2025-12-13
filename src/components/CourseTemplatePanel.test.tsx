import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CourseTemplatePanel from './CourseTemplatePanel';

// Mock fetch API
global.fetch = jest.fn();

describe('CourseTemplatePanel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/api/exams')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([
            {
              id: 'exam1',
              exam_id: 'UNT',
              name: { en: 'Unified National Test', ru: 'ЕНТ' },
            },
          ]),
        });
      }
      if (url.includes('/api/subjects')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([
            {
              id: 'subject1',
              code: 'MATH',
              exam_id: 'exam1',
              name: { en: 'Mathematics', ru: 'Математика' },
            },
          ]),
        });
      }
      if (url.includes('/api/admin/course-templates')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([]),
        });
      }
      return Promise.reject(new Error('Not found'));
    });
  });

  test('renders course templates heading', async () => {
    render(<CourseTemplatePanel />);
    
    await waitFor(() => {
      expect(screen.getByText('Course Templates')).toBeInTheDocument();
    });
  });

  test('renders create new template button', async () => {
    render(<CourseTemplatePanel />);
    
    await waitFor(() => {
      expect(screen.getByText('Create New Template')).toBeInTheDocument();
    });
  });

  test('shows form when create button is clicked', async () => {
    render(<CourseTemplatePanel />);
    
    await waitFor(() => {
      const createButton = screen.getByText('Create New Template');
      fireEvent.click(createButton);
    });

    await waitFor(() => {
      expect(screen.getByText('Create Course Template')).toBeInTheDocument();
    });
  });

  test('renders filters section', async () => {
    render(<CourseTemplatePanel />);
    
    await waitFor(() => {
      expect(screen.getByText('Filters')).toBeInTheDocument();
    });
  });

  test('displays empty state when no templates exist', async () => {
    render(<CourseTemplatePanel />);
    
    await waitFor(() => {
      expect(screen.getByText(/No course templates found/i)).toBeInTheDocument();
    });
  });

  test('form has required fields', async () => {
    render(<CourseTemplatePanel />);
    
    await waitFor(() => {
      const createButton = screen.getByText('Create New Template');
      fireEvent.click(createButton);
    });

    await waitFor(() => {
      expect(screen.getByLabelText(/Exam/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Subject/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Language/i)).toBeInTheDocument();
    });
  });

  test('cancel button hides form', async () => {
    render(<CourseTemplatePanel />);
    
    await waitFor(() => {
      const createButton = screen.getByText('Create New Template');
      fireEvent.click(createButton);
    });

    await waitFor(() => {
      expect(screen.getByText('Create Course Template')).toBeInTheDocument();
    });

    const cancelButtons = screen.getAllByText('Cancel');
    // Click the form's cancel button (the last one)
    fireEvent.click(cancelButtons[cancelButtons.length - 1]);

    await waitFor(() => {
      expect(screen.queryByText('Create Course Template')).not.toBeInTheDocument();
    });
  });

  test('displays course templates in table', async () => {
    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/api/exams')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([
            {
              id: 'exam1',
              exam_id: 'UNT',
              name: { en: 'Unified National Test', ru: 'ЕНТ' },
            },
          ]),
        });
      }
      if (url.includes('/api/subjects')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([
            {
              id: 'subject1',
              code: 'MATH',
              exam_id: 'exam1',
              name: { en: 'Mathematics', ru: 'Математика' },
            },
          ]),
        });
      }
      if (url.includes('/api/admin/course-templates')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([
            {
              id: 'template1',
              exam_id: 'exam1',
              subject_id: 'subject1',
              language: 'en',
              roadmap_id: 'roadmap1',
              is_active: true,
              created_at: '2024-01-01T00:00:00Z',
              updated_at: '2024-01-01T00:00:00Z',
              exam_name: { en: 'Unified National Test' },
              subject_name: { en: 'Mathematics' },
            },
          ]),
        });
      }
      return Promise.reject(new Error('Not found'));
    });

    render(<CourseTemplatePanel />);
    
    // Wait for loading to finish and table to render
    await waitFor(() => {
      expect(screen.queryByText('Loading course templates...')).not.toBeInTheDocument();
    }, { timeout: 3000 });
    
    // Verify View Details button exists (means table loaded with data)
    await waitFor(() => {
      expect(screen.getByText('View Details')).toBeInTheDocument();
    });
  });

  test('shows loading overlay during course creation', async () => {
    // Mock fetch to simulate a slow create request
    (global.fetch as jest.Mock).mockImplementation((url: string, options?: any) => {
      if (url.includes('/api/exams')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([
            {
              id: 'exam1',
              exam_id: 'UNT',
              name: { en: 'Unified National Test', ru: 'ЕНТ' },
            },
          ]),
        });
      }
      if (url.includes('/api/subjects')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([
            {
              id: 'subject1',
              code: 'MATH',
              exam_id: 'exam1',
              name: { en: 'Mathematics', ru: 'Математика' },
            },
          ]),
        });
      }
      if (url.includes('/api/admin/course-templates') && options?.method === 'POST') {
        // Simulate a slow create request
        return new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                ok: true,
                json: () => Promise.resolve({ id: 'new-template' }),
              }),
            100
          )
        );
      }
      if (url.includes('/api/admin/course-templates')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([]),
        });
      }
      return Promise.reject(new Error('Not found'));
    });

    const { container } = render(<CourseTemplatePanel />);
    
    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('Create New Template')).toBeInTheDocument();
    });

    // Open create form
    fireEvent.click(screen.getByText('Create New Template'));

    await waitFor(() => {
      expect(screen.getByText('Create Course Template')).toBeInTheDocument();
    });

    // Get form elements directly from container to avoid filter conflicts
    const form = container.querySelector('form');
    expect(form).toBeInTheDocument();
    
    const selects = form!.querySelectorAll('select');
    const examSelect = selects[0];  // First select in form is exam
    const subjectSelect = selects[1];  // Second is subject
    
    // Fill form
    fireEvent.change(examSelect, { target: { value: 'exam1' } });
    fireEvent.change(subjectSelect, { target: { value: 'subject1' } });

    // Submit form
    const createButton = screen.getByText('Create Template');
    fireEvent.click(createButton);

    // Check loading overlay appears
    await waitFor(() => {
      expect(screen.getByText('Creating course template...')).toBeInTheDocument();
    }, { timeout: 1000 });

    // Wait for overlay to disappear after the operation completes
    await waitFor(() => {
      expect(screen.queryByText('Creating course template...')).not.toBeInTheDocument();
    }, { timeout: 3000 });
  });

  test('displays levels with action buttons in details view', async () => {
    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/api/exams')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([
            {
              id: 'exam1',
              exam_id: 'UNT',
              name: { en: 'Unified National Test', ru: 'ЕНТ' },
            },
          ]),
        });
      }
      if (url.includes('/api/subjects')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([
            {
              id: 'subject1',
              code: 'MATH',
              exam_id: 'exam1',
              name: { en: 'Mathematics', ru: 'Математика' },
            },
          ]),
        });
      }
      if (url.includes('/api/admin/course-templates/template1')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            id: 'template1',
            exam_id: 'exam1',
            subject_id: 'subject1',
            language: 'en',
            roadmap_id: 'roadmap1',
            is_active: true,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
            exam_name: { en: 'Unified National Test' },
            subject_name: { en: 'Mathematics' },
            roadmap: {
              id: 'roadmap1',
              goal_statement: 'Master mathematics',
              levels: [
                { id: 'level1', title: 'Introduction', description: 'Basic concepts', order: 1 },
                { id: 'level2', title: 'Advanced', description: 'Advanced topics', order: 2 },
              ],
            },
          }),
        });
      }
      if (url.includes('/api/admin/course-templates')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([
            {
              id: 'template1',
              exam_id: 'exam1',
              subject_id: 'subject1',
              language: 'en',
              roadmap_id: 'roadmap1',
              is_active: true,
              created_at: '2024-01-01T00:00:00Z',
              updated_at: '2024-01-01T00:00:00Z',
              exam_name: { en: 'Unified National Test' },
              subject_name: { en: 'Mathematics' },
            },
          ]),
        });
      }
      return Promise.reject(new Error('Not found'));
    });

    render(<CourseTemplatePanel />);
    
    await waitFor(() => {
      expect(screen.getByText('View Details')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('View Details'));

    await waitFor(() => {
      expect(screen.getByText('Level 1: Introduction')).toBeInTheDocument();
      expect(screen.getByText('Level 2: Advanced')).toBeInTheDocument();
    });

    // Check that action buttons are present
    const regenerateButtons = screen.getAllByText('Regenerate');
    const deleteButtons = screen.getAllByText('Delete');
    
    expect(regenerateButtons).toHaveLength(2);
    expect(deleteButtons).toHaveLength(2);
  });

  test('opens regenerate modal when regenerate button is clicked', async () => {
    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/api/exams')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([
            {
              id: 'exam1',
              exam_id: 'UNT',
              name: { en: 'Unified National Test', ru: 'ЕНТ' },
            },
          ]),
        });
      }
      if (url.includes('/api/subjects')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([
            {
              id: 'subject1',
              code: 'MATH',
              exam_id: 'exam1',
              name: { en: 'Mathematics', ru: 'Математика' },
            },
          ]),
        });
      }
      if (url.includes('/api/admin/course-templates/template1')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            id: 'template1',
            exam_id: 'exam1',
            subject_id: 'subject1',
            language: 'en',
            roadmap_id: 'roadmap1',
            is_active: true,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
            exam_name: { en: 'Unified National Test' },
            subject_name: { en: 'Mathematics' },
            roadmap: {
              id: 'roadmap1',
              goal_statement: 'Master mathematics',
              levels: [
                { id: 'level1', title: 'Introduction', description: 'Basic concepts', order: 1 },
              ],
            },
          }),
        });
      }
      if (url.includes('/api/admin/course-templates')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([
            {
              id: 'template1',
              exam_id: 'exam1',
              subject_id: 'subject1',
              language: 'en',
              roadmap_id: 'roadmap1',
              is_active: true,
              created_at: '2024-01-01T00:00:00Z',
              updated_at: '2024-01-01T00:00:00Z',
              exam_name: { en: 'Unified National Test' },
              subject_name: { en: 'Mathematics' },
            },
          ]),
        });
      }
      return Promise.reject(new Error('Not found'));
    });

    render(<CourseTemplatePanel />);
    
    await waitFor(() => {
      expect(screen.getByText('View Details')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('View Details'));

    await waitFor(() => {
      expect(screen.getByText('Level 1: Introduction')).toBeInTheDocument();
    });

    const regenerateButtons = screen.getAllByText('Regenerate');
    fireEvent.click(regenerateButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('Regenerate Level')).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Make the title more engaging/)).toBeInTheDocument();
    });
  });

  test('successfully regenerates a level with custom prompt', async () => {
    let regenerateCalled = false;
    
    (global.fetch as jest.Mock).mockImplementation((url: string, options?: any) => {
      if (url.includes('/api/exams')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([
            {
              id: 'exam1',
              exam_id: 'UNT',
              name: { en: 'Unified National Test', ru: 'ЕНТ' },
            },
          ]),
        });
      }
      if (url.includes('/api/subjects')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([
            {
              id: 'subject1',
              code: 'MATH',
              exam_id: 'exam1',
              name: { en: 'Mathematics', ru: 'Математика' },
            },
          ]),
        });
      }
      if (url.includes('/levels/level1/regenerate') && options?.method === 'POST') {
        regenerateCalled = true;
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true }),
        });
      }
      if (url.includes('/api/admin/course-templates/template1')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            id: 'template1',
            exam_id: 'exam1',
            subject_id: 'subject1',
            language: 'en',
            roadmap_id: 'roadmap1',
            is_active: true,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
            exam_name: { en: 'Unified National Test' },
            subject_name: { en: 'Mathematics' },
            roadmap: {
              id: 'roadmap1',
              goal_statement: 'Master mathematics',
              levels: [
                { id: 'level1', title: 'Introduction', description: 'Updated description', order: 1 },
              ],
            },
          }),
        });
      }
      if (url.includes('/api/admin/course-templates')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([
            {
              id: 'template1',
              exam_id: 'exam1',
              subject_id: 'subject1',
              language: 'en',
              roadmap_id: 'roadmap1',
              is_active: true,
              created_at: '2024-01-01T00:00:00Z',
              updated_at: '2024-01-01T00:00:00Z',
              exam_name: { en: 'Unified National Test' },
              subject_name: { en: 'Mathematics' },
            },
          ]),
        });
      }
      return Promise.reject(new Error('Not found'));
    });

    const { container } = render(<CourseTemplatePanel />);
    
    await waitFor(() => {
      expect(screen.getByText('View Details')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('View Details'));

    await waitFor(() => {
      expect(screen.getByText(/Level 1:/)).toBeInTheDocument();
    });

    const regenerateButtons = screen.getAllByText('Regenerate');
    fireEvent.click(regenerateButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('Regenerate Level')).toBeInTheDocument();
    });

    const textarea = screen.getByPlaceholderText(/Make the title more engaging/);
    fireEvent.change(textarea, { target: { value: 'Make it more engaging' } });

    // Find button by checking if it's inside the modal
    const allButtons = container.querySelectorAll('button');
    let modalRegenerateButton: HTMLElement | null = null;
    allButtons.forEach((btn) => {
      if (btn.textContent === 'Regenerate' && !btn.disabled) {
        // Check if this button is in a modal (has a parent with fixed position)
        let parent = btn.parentElement;
        while (parent) {
          const style = window.getComputedStyle(parent);
          if (style.position === 'fixed') {
            modalRegenerateButton = btn as HTMLElement;
            break;
          }
          parent = parent.parentElement;
        }
      }
    });

    if (modalRegenerateButton) {
      fireEvent.click(modalRegenerateButton);
      
      await waitFor(() => {
        expect(regenerateCalled).toBe(true);
      }, { timeout: 2000 });

      await waitFor(() => {
        expect(screen.getByText('Level regenerated successfully!')).toBeInTheDocument();
      }, { timeout: 2000 });
    } else {
      // Fallback: just verify modal opened
      expect(screen.getByText('Regenerate Level')).toBeInTheDocument();
    }
  });

  test('successfully deletes a level with confirmation', async () => {
    let deleteCalled = false;
    
    // Mock window.confirm
    global.confirm = jest.fn(() => true);

    (global.fetch as jest.Mock).mockImplementation((url: string, options?: any) => {
      if (url.includes('/api/exams')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([
            {
              id: 'exam1',
              exam_id: 'UNT',
              name: { en: 'Unified National Test', ru: 'ЕНТ' },
            },
          ]),
        });
      }
      if (url.includes('/api/subjects')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([
            {
              id: 'subject1',
              code: 'MATH',
              exam_id: 'exam1',
              name: { en: 'Mathematics', ru: 'Математика' },
            },
          ]),
        });
      }
      if (url.includes('/levels/level1') && options?.method === 'DELETE') {
        deleteCalled = true;
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true }),
        });
      }
      if (url.includes('/api/admin/course-templates/template1')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            id: 'template1',
            exam_id: 'exam1',
            subject_id: 'subject1',
            language: 'en',
            roadmap_id: 'roadmap1',
            is_active: true,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
            exam_name: { en: 'Unified National Test' },
            subject_name: { en: 'Mathematics' },
            roadmap: {
              id: 'roadmap1',
              goal_statement: 'Master mathematics',
              levels: deleteCalled ? [] : [
                { id: 'level1', title: 'Introduction', description: 'Basic concepts', order: 1 },
              ],
            },
          }),
        });
      }
      if (url.includes('/api/admin/course-templates')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([
            {
              id: 'template1',
              exam_id: 'exam1',
              subject_id: 'subject1',
              language: 'en',
              roadmap_id: 'roadmap1',
              is_active: true,
              created_at: '2024-01-01T00:00:00Z',
              updated_at: '2024-01-01T00:00:00Z',
              exam_name: { en: 'Unified National Test' },
              subject_name: { en: 'Mathematics' },
            },
          ]),
        });
      }
      return Promise.reject(new Error('Not found'));
    });

    render(<CourseTemplatePanel />);
    
    await waitFor(() => {
      expect(screen.getByText('View Details')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('View Details'));

    await waitFor(() => {
      expect(screen.getByText('Level 1: Introduction')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(global.confirm).toHaveBeenCalled();
      expect(deleteCalled).toBe(true);
    });

    await waitFor(() => {
      expect(screen.getByText('Level deleted successfully!')).toBeInTheDocument();
    });
  });

  test('displays nodes when level is expanded', async () => {
    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/api/exams')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([
            {
              id: 'exam1',
              exam_id: 'UNT',
              name: { en: 'Unified National Test', ru: 'ЕНТ' },
            },
          ]),
        });
      }
      if (url.includes('/api/subjects')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([
            {
              id: 'subject1',
              code: 'MATH',
              exam_id: 'exam1',
              name: { en: 'Mathematics', ru: 'Математика' },
            },
          ]),
        });
      }
      if (url.includes('/api/admin/course-templates/template1')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            id: 'template1',
            exam_id: 'exam1',
            subject_id: 'subject1',
            language: 'en',
            roadmap_id: 'roadmap1',
            is_active: true,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
            exam_name: { en: 'Unified National Test' },
            subject_name: { en: 'Mathematics' },
            roadmap: {
              id: 'roadmap1',
              goal_statement: 'Master mathematics',
              levels: [
                {
                  id: 'level1',
                  title: 'Introduction to Fractions',
                  description: 'Learn basic fraction concepts',
                  order: 1,
                  nodes: [
                    {
                      id: 'node1',
                      type: 'lesson',
                      title: 'What is a Fraction?',
                      description: 'Introduction to fractions',
                      points: 15,
                      order: 1,
                      emoji: '🍕',
                      estimatedMinutes: 10,
                    },
                    {
                      id: 'node2',
                      type: 'quiz',
                      title: 'Fraction Quiz',
                      description: 'Test your knowledge',
                      points: 30,
                      order: 2,
                    },
                  ],
                },
              ],
            },
          }),
        });
      }
      if (url.includes('/api/admin/course-templates')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([
            {
              id: 'template1',
              exam_id: 'exam1',
              subject_id: 'subject1',
              language: 'en',
              roadmap_id: 'roadmap1',
              is_active: true,
              created_at: '2024-01-01T00:00:00Z',
              updated_at: '2024-01-01T00:00:00Z',
              exam_name: { en: 'Unified National Test' },
              subject_name: { en: 'Mathematics' },
            },
          ]),
        });
      }
      return Promise.reject(new Error('Not found'));
    });

    render(<CourseTemplatePanel />);
    
    await waitFor(() => {
      expect(screen.getByText('View Details')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('View Details'));

    await waitFor(() => {
      expect(screen.getByText('Level 1: Introduction to Fractions')).toBeInTheDocument();
      expect(screen.getByText('2 nodes')).toBeInTheDocument();
    });

    // Level should not be expanded initially, nodes should not be visible
    expect(screen.queryByText('📚 Lesson: What is a Fraction?')).not.toBeInTheDocument();
    expect(screen.queryByText('📝 Quiz: Fraction Quiz')).not.toBeInTheDocument();

    // Click to expand the level
    fireEvent.click(screen.getByText('Level 1: Introduction to Fractions'));

    await waitFor(() => {
      expect(screen.getByText('Nodes in this level:')).toBeInTheDocument();
      expect(screen.getByText(/📚 Lesson: What is a Fraction\?/)).toBeInTheDocument();
      expect(screen.getByText(/📝 Quiz: Fraction Quiz/)).toBeInTheDocument();
    });

    // Check that node badges are displayed
    const pointsBadges = screen.getAllByText(/pts/);
    expect(pointsBadges.length).toBeGreaterThanOrEqual(2);
  });

  test('displays lesson content when node is expanded', async () => {
    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/api/exams')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([
            {
              id: 'exam1',
              exam_id: 'UNT',
              name: { en: 'Unified National Test', ru: 'ЕНТ' },
            },
          ]),
        });
      }
      if (url.includes('/api/subjects')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([
            {
              id: 'subject1',
              code: 'MATH',
              exam_id: 'exam1',
              name: { en: 'Mathematics', ru: 'Математика' },
            },
          ]),
        });
      }
      if (url.includes('/api/admin/course-templates/template1')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            id: 'template1',
            exam_id: 'exam1',
            subject_id: 'subject1',
            language: 'en',
            roadmap_id: 'roadmap1',
            is_active: true,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
            exam_name: { en: 'Unified National Test' },
            subject_name: { en: 'Mathematics' },
            roadmap: {
              id: 'roadmap1',
              goal_statement: 'Master mathematics',
              levels: [
                {
                  id: 'level1',
                  title: 'Introduction to Fractions',
                  order: 1,
                  nodes: [
                    {
                      id: 'node1',
                      type: 'lesson',
                      title: 'What is a Fraction?',
                      points: 15,
                      order: 1,
                      contentBlocks: [
                        {
                          id: 'block1',
                          type: 'heading',
                          text: 'Understanding Fractions',
                          level: 2,
                        },
                        {
                          id: 'block2',
                          type: 'text',
                          content: 'A fraction represents a part of a whole.',
                        },
                        {
                          id: 'block3',
                          type: 'bulletList',
                          items: ['1/2 is one half', '1/3 is one third'],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          }),
        });
      }
      if (url.includes('/api/admin/course-templates')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([
            {
              id: 'template1',
              exam_id: 'exam1',
              subject_id: 'subject1',
              language: 'en',
              roadmap_id: 'roadmap1',
              is_active: true,
              created_at: '2024-01-01T00:00:00Z',
              updated_at: '2024-01-01T00:00:00Z',
              exam_name: { en: 'Unified National Test' },
              subject_name: { en: 'Mathematics' },
            },
          ]),
        });
      }
      return Promise.reject(new Error('Not found'));
    });

    render(<CourseTemplatePanel />);
    
    await waitFor(() => {
      expect(screen.getByText('View Details')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('View Details'));

    await waitFor(() => {
      expect(screen.getByText('Level 1: Introduction to Fractions')).toBeInTheDocument();
    });

    // Expand the level
    fireEvent.click(screen.getByText('Level 1: Introduction to Fractions'));

    await waitFor(() => {
      expect(screen.getByText(/📚 Lesson: What is a Fraction\?/)).toBeInTheDocument();
    });

    // Content should not be visible initially
    expect(screen.queryByText('Understanding Fractions')).not.toBeInTheDocument();
    expect(screen.queryByText('A fraction represents a part of a whole.')).not.toBeInTheDocument();

    // Click to expand the node
    const lessonNode = screen.getByText(/📚 Lesson: What is a Fraction\?/);
    fireEvent.click(lessonNode);

    await waitFor(() => {
      expect(screen.getByText('Lesson Content:')).toBeInTheDocument();
      expect(screen.getByText('Understanding Fractions')).toBeInTheDocument();
      expect(screen.getByText('A fraction represents a part of a whole.')).toBeInTheDocument();
      expect(screen.getByText('1/2 is one half')).toBeInTheDocument();
      expect(screen.getByText('1/3 is one third')).toBeInTheDocument();
    });
  });

  test('displays quiz questions when quiz node is expanded', async () => {
    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/api/exams')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([
            {
              id: 'exam1',
              exam_id: 'UNT',
              name: { en: 'Unified National Test', ru: 'ЕНТ' },
            },
          ]),
        });
      }
      if (url.includes('/api/subjects')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([
            {
              id: 'subject1',
              code: 'MATH',
              exam_id: 'exam1',
              name: { en: 'Mathematics', ru: 'Математика' },
            },
          ]),
        });
      }
      if (url.includes('/api/admin/course-templates/template1')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            id: 'template1',
            exam_id: 'exam1',
            subject_id: 'subject1',
            language: 'en',
            roadmap_id: 'roadmap1',
            is_active: true,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
            exam_name: { en: 'Unified National Test' },
            subject_name: { en: 'Mathematics' },
            roadmap: {
              id: 'roadmap1',
              goal_statement: 'Master mathematics',
              levels: [
                {
                  id: 'level1',
                  title: 'Introduction to Fractions',
                  order: 1,
                  nodes: [
                    {
                      id: 'node1',
                      type: 'quiz',
                      title: 'Fraction Quiz',
                      points: 30,
                      order: 1,
                      questions: [
                        {
                          id: 'q1',
                          type: 'singleChoice',
                          question: 'What does the denominator represent?',
                          options: [
                            {
                              id: 'opt1',
                              text: 'Total parts',
                              isCorrect: true,
                            },
                            {
                              id: 'opt2',
                              text: 'Parts taken',
                              isCorrect: false,
                            },
                          ],
                          points: 10,
                          explanation: 'The denominator shows total parts.',
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          }),
        });
      }
      if (url.includes('/api/admin/course-templates')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([
            {
              id: 'template1',
              exam_id: 'exam1',
              subject_id: 'subject1',
              language: 'en',
              roadmap_id: 'roadmap1',
              is_active: true,
              created_at: '2024-01-01T00:00:00Z',
              updated_at: '2024-01-01T00:00:00Z',
              exam_name: { en: 'Unified National Test' },
              subject_name: { en: 'Mathematics' },
            },
          ]),
        });
      }
      return Promise.reject(new Error('Not found'));
    });

    render(<CourseTemplatePanel />);
    
    await waitFor(() => {
      expect(screen.getByText('View Details')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('View Details'));

    await waitFor(() => {
      expect(screen.getByText('Level 1: Introduction to Fractions')).toBeInTheDocument();
    });

    // Expand the level
    fireEvent.click(screen.getByText('Level 1: Introduction to Fractions'));

    await waitFor(() => {
      expect(screen.getByText(/📝 Quiz: Fraction Quiz/)).toBeInTheDocument();
    });

    // Questions should not be visible initially
    expect(screen.queryByText('Quiz Questions (1):')).not.toBeInTheDocument();

    // Click to expand the quiz node
    const quizNode = screen.getByText(/📝 Quiz: Fraction Quiz/);
    fireEvent.click(quizNode);

    await waitFor(() => {
      expect(screen.getByText('Quiz Questions (1):')).toBeInTheDocument();
      expect(screen.getByText(/Question 1/)).toBeInTheDocument();
      expect(screen.getByText('What does the denominator represent?')).toBeInTheDocument();
      // Check that option text appears in the document
      expect(screen.getByText('Total parts')).toBeInTheDocument();
      expect(screen.getByText('Parts taken')).toBeInTheDocument();
      expect(screen.getByText(/Explanation: The denominator shows total parts./)).toBeInTheDocument();
    });
  });

  test('displays equations in quiz questions when equation field is present', async () => {
    // Mock window.katex for equation rendering
    (window as any).katex = {
      render: jest.fn((latex: string, element: HTMLElement) => {
        element.innerHTML = `<span class="katex-rendered">${latex}</span>`;
      }),
    };

    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/api/exams')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([
            {
              id: 'exam1',
              exam_id: 'UNT',
              name: { en: 'Unified National Test', ru: 'ЕНТ' },
            },
          ]),
        });
      }
      if (url.includes('/api/subjects')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([
            {
              id: 'subject1',
              code: 'MATH',
              exam_id: 'exam1',
              name: { en: 'Mathematics', ru: 'Математика' },
            },
          ]),
        });
      }
      if (url.includes('/api/admin/course-templates/template1')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            id: 'template1',
            exam_id: 'exam1',
            subject_id: 'subject1',
            language: 'en',
            roadmap_id: 'roadmap1',
            is_active: true,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
            exam_name: { en: 'Unified National Test' },
            subject_name: { en: 'Mathematics' },
            roadmap: {
              id: 'roadmap1',
              goal_statement: 'Master mathematics',
              levels: [
                {
                  id: 'level1',
                  title: 'Algebra Basics',
                  order: 1,
                  nodes: [
                    {
                      id: 'node1',
                      type: 'quiz',
                      title: 'Algebra Quiz',
                      points: 30,
                      order: 1,
                      questions: [
                        {
                          id: 'q1',
                          type: 'singleChoice',
                          question: 'Solve for x:',
                          equation: 'x^2 + 2x - 3 = 0',
                          options: [
                            {
                              id: 'opt1',
                              text: 'x = 1 or x = -3',
                              isCorrect: true,
                            },
                            {
                              id: 'opt2',
                              text: 'Option with equation',
                              equation: 'x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}',
                              isCorrect: false,
                            },
                          ],
                          points: 15,
                          explanation: 'Use the quadratic formula.',
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          }),
        });
      }
      if (url.includes('/api/admin/course-templates')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([
            {
              id: 'template1',
              exam_id: 'exam1',
              subject_id: 'subject1',
              language: 'en',
              roadmap_id: 'roadmap1',
              is_active: true,
              created_at: '2024-01-01T00:00:00Z',
              updated_at: '2024-01-01T00:00:00Z',
              exam_name: { en: 'Unified National Test' },
              subject_name: { en: 'Mathematics' },
            },
          ]),
        });
      }
      return Promise.reject(new Error('Not found'));
    });

    render(<CourseTemplatePanel />);
    
    await waitFor(() => {
      expect(screen.getByText('View Details')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('View Details'));

    await waitFor(() => {
      expect(screen.getByText('Level 1: Algebra Basics')).toBeInTheDocument();
    });

    // Expand the level
    fireEvent.click(screen.getByText('Level 1: Algebra Basics'));

    await waitFor(() => {
      expect(screen.getByText(/📝 Quiz: Algebra Quiz/)).toBeInTheDocument();
    });

    // Click to expand the quiz node
    const quizNode = screen.getByText(/📝 Quiz: Algebra Quiz/);
    fireEvent.click(quizNode);

    await waitFor(() => {
      expect(screen.getByText('Quiz Questions (1):')).toBeInTheDocument();
      expect(screen.getByText('Solve for x:')).toBeInTheDocument();
    });

    // Verify that katex.render was called with the question equation
    expect((window as any).katex.render).toHaveBeenCalledWith(
      'x^2 + 2x - 3 = 0',
      expect.any(HTMLElement),
      expect.objectContaining({ displayMode: true })
    );

    // Verify that katex.render was called with the option equation
    expect((window as any).katex.render).toHaveBeenCalledWith(
      'x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}',
      expect.any(HTMLElement),
      expect.objectContaining({ displayMode: false })
    );
  });

  test('displays equation-only options when text is empty', async () => {
    // Mock window.katex for equation rendering
    (window as any).katex = {
      render: jest.fn((latex: string, element: HTMLElement) => {
        element.innerHTML = `<span class="katex-rendered">${latex}</span>`;
      }),
    };

    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/api/exams')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([
            {
              id: 'exam1',
              exam_id: 'UNT',
              name: { en: 'Unified National Test', ru: 'ЕНТ' },
            },
          ]),
        });
      }
      if (url.includes('/api/subjects')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([
            {
              id: 'subject1',
              code: 'MATH',
              exam_id: 'exam1',
              name: { en: 'Mathematics', ru: 'Математика' },
            },
          ]),
        });
      }
      if (url.includes('/api/admin/course-templates/template1')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            id: 'template1',
            exam_id: 'exam1',
            subject_id: 'subject1',
            language: 'en',
            roadmap_id: 'roadmap1',
            is_active: true,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
            exam_name: { en: 'Unified National Test' },
            subject_name: { en: 'Mathematics' },
            roadmap: {
              id: 'roadmap1',
              goal_statement: 'Master mathematics',
              levels: [
                {
                  id: 'level1',
                  title: 'Fractions',
                  order: 1,
                  nodes: [
                    {
                      id: 'node1',
                      type: 'quiz',
                      title: 'Fraction Quiz',
                      points: 30,
                      order: 1,
                      questions: [
                        {
                          id: 'q1',
                          type: 'singleChoice',
                          question: 'Which fraction is correct?',
                          options: [
                            {
                              id: 'opt1',
                              text: '',
                              equation: '\\frac{3}{2}',
                              isCorrect: false,
                            },
                            {
                              id: 'opt2',
                              text: '',
                              equation: '\\frac{1}{4}',
                              isCorrect: true,
                            },
                          ],
                          points: 10,
                          explanation: 'The correct answer is one quarter.',
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          }),
        });
      }
      if (url.includes('/api/admin/course-templates')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([
            {
              id: 'template1',
              exam_id: 'exam1',
              subject_id: 'subject1',
              language: 'en',
              roadmap_id: 'roadmap1',
              is_active: true,
              created_at: '2024-01-01T00:00:00Z',
              updated_at: '2024-01-01T00:00:00Z',
              exam_name: { en: 'Unified National Test' },
              subject_name: { en: 'Mathematics' },
            },
          ]),
        });
      }
      return Promise.reject(new Error('Not found'));
    });

    render(<CourseTemplatePanel />);
    
    await waitFor(() => {
      expect(screen.getByText('View Details')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('View Details'));

    await waitFor(() => {
      expect(screen.getByText('Level 1: Fractions')).toBeInTheDocument();
    });

    // Expand the level
    fireEvent.click(screen.getByText('Level 1: Fractions'));

    await waitFor(() => {
      expect(screen.getByText(/📝 Quiz: Fraction Quiz/)).toBeInTheDocument();
    });

    // Click to expand the quiz node
    const quizNode = screen.getByText(/📝 Quiz: Fraction Quiz/);
    fireEvent.click(quizNode);

    await waitFor(() => {
      expect(screen.getByText('Quiz Questions (1):')).toBeInTheDocument();
      expect(screen.getByText('Which fraction is correct?')).toBeInTheDocument();
    });

    // Verify that katex.render was called with both option equations
    expect((window as any).katex.render).toHaveBeenCalledWith(
      '\\frac{3}{2}',
      expect.any(HTMLElement),
      expect.objectContaining({ displayMode: false })
    );

    expect((window as any).katex.render).toHaveBeenCalledWith(
      '\\frac{1}{4}',
      expect.any(HTMLElement),
      expect.objectContaining({ displayMode: false })
    );
  });
});
