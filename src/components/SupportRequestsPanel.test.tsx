import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import SupportRequestsPanel from './SupportRequestsPanel';

// Mock fetch API
global.fetch = jest.fn();

describe('SupportRequestsPanel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('renders the Support Requests heading', () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          requests: [],
          total: 0,
          page: 1,
          pageSize: 30,
          totalPages: 1,
        }),
      })
    );

    render(<SupportRequestsPanel />);
    const heading = screen.getByRole('heading', { name: /Support Requests/i });
    expect(heading).toBeInTheDocument();
  });

  test('renders filter controls and refresh button', async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          requests: [],
          total: 0,
          page: 1,
          pageSize: 30,
          totalPages: 1,
        }),
      })
    );

    render(<SupportRequestsPanel />);
    
    await waitFor(() => {
      expect(screen.getByLabelText(/Status/i)).toBeInTheDocument();
    });
    
    expect(screen.getByRole('button', { name: /Refresh/i })).toBeInTheDocument();
  });

  test('fetches and displays support requests on mount', async () => {
    const mockData = {
      requests: [
        {
          id: '1',
          email: 'test@example.com',
          subject: 'Test Subject',
          message: 'Test message content',
          status: 'open',
          source: 'web',
          platform: 'desktop',
          appVersion: '1.0.0',
          locale: 'en',
          ipAddress: '127.0.0.1',
          createdAt: '2024-01-15T10:30:00Z',
        },
        {
          id: '2',
          email: 'user@example.com',
          subject: 'Another Request',
          message: 'Another message',
          status: 'in_progress',
          source: 'mobile',
          platform: 'ios',
          appVersion: '1.2.0',
          locale: 'en',
          ipAddress: '192.168.1.1',
          createdAt: '2024-01-16T14:00:00Z',
        },
      ],
      total: 2,
      page: 1,
      pageSize: 30,
      totalPages: 1,
    };

    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockData),
      })
    );

    render(<SupportRequestsPanel />);

    await waitFor(() => {
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
    });

    expect(screen.getByText('Test Subject')).toBeInTheDocument();
    expect(screen.getByText('user@example.com')).toBeInTheDocument();
    expect(screen.getByText('Another Request')).toBeInTheDocument();
  });

  test('displays loading state while fetching', () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      new Promise(() => {}) // Never resolves to keep loading state
    );

    render(<SupportRequestsPanel />);
    expect(screen.getByText(/Loading support requests/i)).toBeInTheDocument();
  });

  test('displays empty state when no requests are found', async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          requests: [],
          total: 0,
          page: 1,
          pageSize: 30,
          totalPages: 1,
        }),
      })
    );

    render(<SupportRequestsPanel />);

    await waitFor(() => {
      expect(screen.getByText(/No support requests found/i)).toBeInTheDocument();
    });
  });

  test('filters support requests by status', async () => {
    const initialData = {
      requests: [
        {
          id: '1',
          email: 'test@example.com',
          subject: 'Test',
          message: 'Test message',
          status: 'open',
          source: 'web',
          platform: 'desktop',
          appVersion: '1.0.0',
          locale: 'en',
          ipAddress: '127.0.0.1',
          createdAt: '2024-01-15T10:30:00Z',
        },
      ],
      total: 1,
      page: 1,
      pageSize: 30,
      totalPages: 1,
    };

    const filteredData = {
      requests: [
        {
          id: '2',
          email: 'closed@example.com',
          subject: 'Closed Request',
          message: 'Closed message',
          status: 'closed',
          source: 'web',
          platform: 'desktop',
          appVersion: '1.0.0',
          locale: 'en',
          ipAddress: '127.0.0.1',
          createdAt: '2024-01-16T10:30:00Z',
        },
      ],
      total: 1,
      page: 1,
      pageSize: 30,
      totalPages: 1,
    };

    (global.fetch as jest.Mock)
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(initialData),
        })
      )
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(filteredData),
        })
      );

    render(<SupportRequestsPanel />);

    await waitFor(() => {
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
    });

    const statusSelect = screen.getByLabelText(/Status/i) as HTMLSelectElement;
    fireEvent.change(statusSelect, { target: { value: 'closed' } });

    await waitFor(() => {
      expect(screen.getByText('closed@example.com')).toBeInTheDocument();
    });

    expect(screen.queryByText('test@example.com')).not.toBeInTheDocument();
  });

  test('handles pagination correctly', async () => {
    const page1Data = {
      requests: [
        {
          id: '1',
          email: 'page1@example.com',
          subject: 'Page 1',
          message: 'Message 1',
          status: 'open',
          source: 'web',
          platform: 'desktop',
          appVersion: '1.0.0',
          locale: 'en',
          ipAddress: '127.0.0.1',
          createdAt: '2024-01-15T10:30:00Z',
        },
      ],
      total: 2,
      page: 1,
      pageSize: 1,
      totalPages: 2,
    };

    const page2Data = {
      requests: [
        {
          id: '2',
          email: 'page2@example.com',
          subject: 'Page 2',
          message: 'Message 2',
          status: 'open',
          source: 'web',
          platform: 'desktop',
          appVersion: '1.0.0',
          locale: 'en',
          ipAddress: '127.0.0.1',
          createdAt: '2024-01-16T10:30:00Z',
        },
      ],
      total: 2,
      page: 2,
      pageSize: 1,
      totalPages: 2,
    };

    (global.fetch as jest.Mock)
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(page1Data),
        })
      )
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(page2Data),
        })
      );

    render(<SupportRequestsPanel />);

    await waitFor(() => {
      expect(screen.getByText('page1@example.com')).toBeInTheDocument();
    });

    const nextButton = screen.getByRole('button', { name: /Next/i });
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(screen.getByText('page2@example.com')).toBeInTheDocument();
    });

    expect(screen.queryByText('page1@example.com')).not.toBeInTheDocument();
  });

  test('shows error message when API call fails', async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.reject(new Error('Network error'))
    );

    render(<SupportRequestsPanel />);

    await waitFor(() => {
      expect(screen.getByText(/Failed to fetch support requests/i)).toBeInTheDocument();
    });

    // Should also show empty state
    expect(screen.getByText(/No support requests found/i)).toBeInTheDocument();
  });

  test('displays status badges with correct styling', async () => {
    const mockData = {
      requests: [
        {
          id: '1',
          email: 'test1@example.com',
          subject: 'Open Request',
          message: 'Message 1',
          status: 'open',
          source: 'web',
          platform: 'desktop',
          appVersion: '1.0.0',
          locale: 'en',
          ipAddress: '127.0.0.1',
          createdAt: '2024-01-15T10:30:00Z',
        },
        {
          id: '2',
          email: 'test2@example.com',
          subject: 'In Progress Request',
          message: 'Message 2',
          status: 'in_progress',
          source: 'web',
          platform: 'desktop',
          appVersion: '1.0.0',
          locale: 'en',
          ipAddress: '127.0.0.1',
          createdAt: '2024-01-16T10:30:00Z',
        },
        {
          id: '3',
          email: 'test3@example.com',
          subject: 'Closed Request',
          message: 'Message 3',
          status: 'closed',
          source: 'web',
          platform: 'desktop',
          appVersion: '1.0.0',
          locale: 'en',
          ipAddress: '127.0.0.1',
          createdAt: '2024-01-17T10:30:00Z',
        },
      ],
      total: 3,
      page: 1,
      pageSize: 30,
      totalPages: 1,
    };

    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockData),
      })
    );

    render(<SupportRequestsPanel />);

    await waitFor(() => {
      expect(screen.getByText('open')).toBeInTheDocument();
    });

    expect(screen.getByText('in progress')).toBeInTheDocument();
    expect(screen.getByText('closed')).toBeInTheDocument();
  });

  test('refresh button reloads data', async () => {
    const mockData = {
      requests: [
        {
          id: '1',
          email: 'test@example.com',
          subject: 'Test',
          message: 'Message',
          status: 'open',
          source: 'web',
          platform: 'desktop',
          appVersion: '1.0.0',
          locale: 'en',
          ipAddress: '127.0.0.1',
          createdAt: '2024-01-15T10:30:00Z',
        },
      ],
      total: 1,
      page: 1,
      pageSize: 30,
      totalPages: 1,
    };

    (global.fetch as jest.Mock).mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockData),
      })
    );

    render(<SupportRequestsPanel />);

    await waitFor(() => {
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
    });

    const refreshButton = screen.getByRole('button', { name: /Refresh/i });
    fireEvent.click(refreshButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });
  });
});
