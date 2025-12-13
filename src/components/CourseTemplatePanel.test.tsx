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
});
