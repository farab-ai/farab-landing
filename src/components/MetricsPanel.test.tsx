import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import MetricsPanel from './MetricsPanel';

// Mock fetch API
global.fetch = jest.fn();

describe('MetricsPanel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock default successful response for auto-fetch on mount (all three endpoints)
    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/earnings')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            totalPurchaseCount: 0,
            totalRevenue: 0,
            daily: [],
          }),
        });
      } else if (url.includes('/user-stats/registrations')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            totalRegistrations: 0,
            daily: [],
          }),
        });
      } else if (url.includes('/user-stats/activity')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            dau: 0,
            mau: 0,
            daily: [],
          }),
        });
      }
      return Promise.reject(new Error('Unknown endpoint'));
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('renders the Metrics heading', () => {
    render(<MetricsPanel />);
    const heading = screen.getByRole('heading', { name: /Metrics/i });
    expect(heading).toBeInTheDocument();
  });

  test('renders date range inputs and buttons', async () => {
    render(<MetricsPanel />);
    
    // Wait for auto-fetch to complete
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Load All Metrics/i })).not.toBeDisabled();
    });
    
    // Check for labels
    expect(screen.getByLabelText(/Start Date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/End Date/i)).toBeInTheDocument();
    
    // Check for buttons
    expect(screen.getByRole('button', { name: /Load All Metrics/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Load Demo Data/i })).toBeInTheDocument();
  });

  test('auto-fetches data on component mount', async () => {
    const mockEarnings = {
      totalPurchaseCount: 150,
      totalRevenue: 1497.50,
      daily: [
        { date: "2024-01-01", revenue: 89.85, count: 10 },
        { date: "2024-01-02", revenue: 149.75, count: 15 },
      ],
    };
    const mockRegistrations = {
      totalRegistrations: 100,
      daily: [
        { date: "2024-01-01", count: 10 },
        { date: "2024-01-02", count: 15 },
      ],
    };
    const mockActivity = {
      dau: 250,
      mau: 1500,
      daily: [
        { date: "2024-01-01", count: 245 },
        { date: "2024-01-02", count: 260 },
      ],
    };

    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/earnings')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockEarnings),
        });
      } else if (url.includes('/user-stats/registrations')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockRegistrations),
        });
      } else if (url.includes('/user-stats/activity')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockActivity),
        });
      }
      return Promise.reject(new Error('Unknown endpoint'));
    });

    render(<MetricsPanel />);
    
    // Should auto-fetch data on mount
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/admin/earnings?start_date=')
      );
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/admin/user-stats/registrations?start_date=')
      );
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/admin/user-stats/activity?start_date=')
      );
    });

    // Should display the data
    await waitFor(() => {
      expect(screen.getByText('150')).toBeInTheDocument(); // Total Purchase Count
      expect(screen.getByText('100')).toBeInTheDocument(); // Total Registrations
      expect(screen.getByText('250')).toBeInTheDocument(); // DAU
      expect(screen.getByText('1,500')).toBeInTheDocument(); // MAU
    });
  });

  test('loads demo data when Load Demo Data button is clicked', async () => {
    render(<MetricsPanel />);
    
    // Wait for initial auto-fetch to complete
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Load Demo Data/i })).not.toBeDisabled();
    });
    
    const demoButton = screen.getByRole('button', { name: /Load Demo Data/i });
    fireEvent.click(demoButton);
    
    await waitFor(() => {
      expect(screen.getAllByText('150').length).toBeGreaterThan(0); // Total Purchase Count or Total Registrations
      expect(screen.getByText('$1,497.50')).toBeInTheDocument(); // Total Revenue
      expect(screen.getAllByText('250').length).toBeGreaterThan(0); // DAU
      expect(screen.getByText('1,500')).toBeInTheDocument(); // MAU
    });
    
    // Check if summary cards are displayed
    expect(screen.getByText(/Total Purchase Count/i)).toBeInTheDocument();
    expect(screen.getByText(/Total Revenue/i)).toBeInTheDocument();
    expect(screen.getByText(/Total Registrations/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Daily Active Users/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Monthly Active Users/i)).toBeInTheDocument();
  });

  test('shows success message after loading demo data', async () => {
    render(<MetricsPanel />);
    
    // Wait for initial auto-fetch to complete
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Load Demo Data/i })).not.toBeDisabled();
    });
    
    const demoButton = screen.getByRole('button', { name: /Load Demo Data/i });
    fireEvent.click(demoButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Demo data loaded successfully/i)).toBeInTheDocument();
    });
  });

  test('fetches earnings from API when Load All Metrics is clicked', async () => {
    const mockEarnings = {
      totalPurchaseCount: 150,
      totalRevenue: 1497.50,
      daily: [
        { date: "2024-01-01", revenue: 89.85, count: 10 },
      ],
    };
    const mockRegistrations = {
      totalRegistrations: 100,
      daily: [
        { date: "2024-01-01", count: 10 },
      ],
    };
    const mockActivity = {
      dau: 250,
      mau: 1500,
      daily: [
        { date: "2024-01-01", count: 245 },
      ],
    };

    render(<MetricsPanel />);
    
    // Wait for initial auto-fetch to complete
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Load All Metrics/i })).not.toBeDisabled();
    });

    // Mock the response for manual load
    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/earnings')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockEarnings),
        });
      } else if (url.includes('/user-stats/registrations')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockRegistrations),
        });
      } else if (url.includes('/user-stats/activity')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockActivity),
        });
      }
      return Promise.reject(new Error('Unknown endpoint'));
    });
    
    const loadButton = screen.getByRole('button', { name: /Load All Metrics/i });
    fireEvent.click(loadButton);
    
    await waitFor(() => {
      expect(screen.getByText('150')).toBeInTheDocument();
      expect(screen.getByText('100')).toBeInTheDocument();
      expect(screen.getByText('250')).toBeInTheDocument();
    });
  });

  test('shows error message when API call fails on mount', async () => {
    (global.fetch as jest.Mock).mockImplementation(() =>
      Promise.reject(new Error('Network error'))
    );

    render(<MetricsPanel />);
    
    await waitFor(() => {
      // Should show one of the error messages for failed fetch
      const errorText = screen.queryByText(/Failed to fetch/i);
      expect(errorText).toBeInTheDocument();
    }, { timeout: 5000 });
  });

  test('displays chart titles after loading data', async () => {
    render(<MetricsPanel />);
    
    // Wait for initial auto-fetch to complete
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Load Demo Data/i })).not.toBeDisabled();
    });
    
    const demoButton = screen.getByRole('button', { name: /Load Demo Data/i });
    fireEvent.click(demoButton);
    
    await waitFor(() => {
      expect(screen.getByText('Total Registrations')).toBeInTheDocument();
    });
    
    // Earnings chart titles
    expect(screen.getByText(/Revenue Per Day/i)).toBeInTheDocument();
    expect(screen.getByText(/Purchase Count Per Day/i)).toBeInTheDocument();
    expect(screen.getByText(/Revenue & Purchase Count/i)).toBeInTheDocument();
    
    // Registrations chart titles
    expect(screen.getByText(/Daily User Registrations/i)).toBeInTheDocument();
    expect(screen.getByText(/Registration Trend/i)).toBeInTheDocument();
    
    // Activity chart title (exact match for the chart container's title)
    expect(screen.getAllByText(/Daily Active Users/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Activity Trend/i)).toBeInTheDocument();
  });

  test('auto-fetches data when date range changes', async () => {
    const mockEarnings = {
      totalPurchaseCount: 100,
      totalRevenue: 999.50,
      daily: [
        { date: "2024-02-01", revenue: 99.95, count: 10 },
      ],
    };
    const mockRegistrations = {
      totalRegistrations: 80,
      daily: [
        { date: "2024-02-01", count: 8 },
      ],
    };
    const mockActivity = {
      dau: 200,
      mau: 1200,
      daily: [
        { date: "2024-02-01", count: 195 },
      ],
    };

    render(<MetricsPanel />);
    
    // Wait for initial auto-fetch
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });

    // Clear previous fetch calls
    jest.clearAllMocks();

    // Mock the response for the date change
    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/earnings')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockEarnings),
        });
      } else if (url.includes('/user-stats/registrations')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockRegistrations),
        });
      } else if (url.includes('/user-stats/activity')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockActivity),
        });
      }
      return Promise.reject(new Error('Unknown endpoint'));
    });

    // Change date range
    const startDateInput = screen.getByLabelText(/Start Date/i) as HTMLInputElement;
    fireEvent.change(startDateInput, { target: { value: '2024-02-01' } });

    // Should trigger another fetch
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('start_date=2024-02-01')
      );
    });
  });

  test('displays empty state when no data is available', async () => {
    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/earnings')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            totalPurchaseCount: 0,
            totalRevenue: 0,
            daily: [],
          }),
        });
      } else if (url.includes('/user-stats/registrations')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            totalRegistrations: 0,
            daily: [],
          }),
        });
      } else if (url.includes('/user-stats/activity')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            dau: 0,
            mau: 0,
            daily: [],
          }),
        });
      }
      return Promise.reject(new Error('Unknown endpoint'));
    });

    render(<MetricsPanel />);
    
    await waitFor(() => {
      expect(screen.getByText(/No daily earnings data available/i)).toBeInTheDocument();
    });
  });

  test('displays DAU/MAU ratio correctly', async () => {
    render(<MetricsPanel />);
    
    // Wait for initial auto-fetch to complete
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Load Demo Data/i })).not.toBeDisabled();
    });
    
    const demoButton = screen.getByRole('button', { name: /Load Demo Data/i });
    fireEvent.click(demoButton);
    
    // DAU = 250, MAU = 1500, ratio = (250/1500)*100 = 16.7%
    await waitFor(() => {
      expect(screen.getByText('16.7%')).toBeInTheDocument();
    });
  });

  test('shows section headings for each metric type', async () => {
    render(<MetricsPanel />);
    
    // Wait for initial auto-fetch to complete
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Load Demo Data/i })).not.toBeDisabled();
    });
    
    const demoButton = screen.getByRole('button', { name: /Load Demo Data/i });
    fireEvent.click(demoButton);
    
    await waitFor(() => {
      expect(screen.getByText(/User Registration Statistics/i)).toBeInTheDocument();
      expect(screen.getByText(/User Activity Statistics/i)).toBeInTheDocument();
      expect(screen.getByText(/Earnings Statistics/i)).toBeInTheDocument();
    });
  });
});
