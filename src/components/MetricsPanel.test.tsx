import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import MetricsPanel from './MetricsPanel';

// Mock fetch API
global.fetch = jest.fn();

describe('MetricsPanel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock default successful response for auto-fetch on mount
    (global.fetch as jest.Mock).mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          totalPurchaseCount: 0,
          totalRevenue: 0,
          daily: [],
        }),
      })
    );
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
      expect(screen.getByRole('button', { name: /Load Earnings/i })).not.toBeDisabled();
    });
    
    // Check for labels
    expect(screen.getByLabelText(/Start Date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/End Date/i)).toBeInTheDocument();
    
    // Check for buttons
    expect(screen.getByRole('button', { name: /Load Earnings/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Load Demo Data/i })).toBeInTheDocument();
  });

  test('auto-fetches data on component mount', async () => {
    const mockData = {
      totalPurchaseCount: 150,
      totalRevenue: 1497.50,
      daily: [
        { date: "2024-01-01", revenue: 89.85, count: 10 },
        { date: "2024-01-02", revenue: 149.75, count: 15 },
      ],
    };

    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockData),
      })
    );

    render(<MetricsPanel />);
    
    // Should auto-fetch data on mount
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/admin/earnings?start_date=')
      );
    });

    // Should display the data
    await waitFor(() => {
      expect(screen.getByText('150')).toBeInTheDocument();
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
      expect(screen.getByText('150')).toBeInTheDocument();
      expect(screen.getByText('$1,497.50')).toBeInTheDocument();
    });
    
    // Check if summary cards are displayed
    expect(screen.getByText(/Total Purchase Count/i)).toBeInTheDocument();
    expect(screen.getByText(/Total Revenue/i)).toBeInTheDocument();
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

  test('fetches earnings from API when Load Earnings is clicked', async () => {
    const mockData = {
      totalPurchaseCount: 150,
      totalRevenue: 1497.50,
      daily: [
        { date: "2024-01-01", revenue: 89.85, count: 10 },
      ],
    };

    render(<MetricsPanel />);
    
    // Wait for initial auto-fetch to complete
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Load Earnings/i })).not.toBeDisabled();
    });

    // Mock the response for manual load
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockData),
      })
    );
    
    const loadButton = screen.getByRole('button', { name: /Load Earnings/i });
    fireEvent.click(loadButton);
    
    await waitFor(() => {
      expect(screen.getByText('150')).toBeInTheDocument();
    });
  });

  test('shows error message when API call fails on mount', async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.reject(new Error('Network error'))
    );

    render(<MetricsPanel />);
    
    await waitFor(() => {
      expect(screen.getByText(/Failed to fetch earnings/i)).toBeInTheDocument();
    });
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
      expect(screen.getByText('150')).toBeInTheDocument();
    });
    
    expect(screen.getByText(/Revenue Per Day/i)).toBeInTheDocument();
    expect(screen.getByText(/Purchase Count Per Day/i)).toBeInTheDocument();
    expect(screen.getByText(/Revenue & Purchase Count/i)).toBeInTheDocument();
  });

  test('auto-fetches data when date range changes', async () => {
    const mockData = {
      totalPurchaseCount: 100,
      totalRevenue: 999.50,
      daily: [
        { date: "2024-02-01", revenue: 99.95, count: 10 },
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
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockData),
      })
    );

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
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          totalPurchaseCount: 0,
          totalRevenue: 0,
          daily: [],
        }),
      })
    );

    render(<MetricsPanel />);
    
    await waitFor(() => {
      expect(screen.getByText(/No daily earnings data available/i)).toBeInTheDocument();
    });
  });
});
