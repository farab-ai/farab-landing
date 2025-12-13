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

  test('displays Archive button for active templates', async () => {
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
    
    await waitFor(() => {
      expect(screen.getByText('Archive')).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  test('displays Activate button for inactive templates', async () => {
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
              is_active: false,
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
      expect(screen.getByText('Activate')).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  test('archive button calls archive API', async () => {
    const mockFetch = global.fetch as jest.Mock;
    mockFetch.mockImplementation((url: string, options?: any) => {
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
      if (url.includes('/archive') && options?.method === 'PUT') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({}),
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

    // Mock window.confirm
    const originalConfirm = window.confirm;
    window.confirm = jest.fn(() => true);

    render(<CourseTemplatePanel />);
    
    await waitFor(() => {
      expect(screen.getByText('Archive')).toBeInTheDocument();
    }, { timeout: 3000 });

    const archiveButton = screen.getByText('Archive');
    fireEvent.click(archiveButton);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/archive'),
        expect.objectContaining({ method: 'PUT' })
      );
    });

    // Restore original confirm
    window.confirm = originalConfirm;
  });

  test('activate button calls activate API', async () => {
    const mockFetch = global.fetch as jest.Mock;
    mockFetch.mockImplementation((url: string, options?: any) => {
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
      if (url.includes('/activate') && options?.method === 'PUT') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({}),
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
              is_active: false,
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
      expect(screen.getByText('Activate')).toBeInTheDocument();
    }, { timeout: 3000 });

    const activateButton = screen.getByText('Activate');
    fireEvent.click(activateButton);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/activate'),
        expect.objectContaining({ method: 'PUT' })
      );
    });
  });
});
