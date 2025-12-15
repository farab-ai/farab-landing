import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CostMonitoringPanel from './CostMonitoringPanel';

// Mock fetch API
global.fetch = jest.fn();

describe('CostMonitoringPanel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('renders the Cost Monitoring heading', () => {
    render(<CostMonitoringPanel />);
    const heading = screen.getByRole('heading', { name: /Cost Monitoring/i });
    expect(heading).toBeInTheDocument();
  });

  test('renders date range inputs and buttons', () => {
    render(<CostMonitoringPanel />);
    
    // Check for labels
    expect(screen.getByText(/Start Date/i)).toBeInTheDocument();
    expect(screen.getByText(/End Date/i)).toBeInTheDocument();
    
    // Check for buttons
    expect(screen.getByRole('button', { name: /Load Statistics/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Load Demo Data/i })).toBeInTheDocument();
  });

  test('shows empty state message initially', () => {
    render(<CostMonitoringPanel />);
    expect(screen.getByText(/Select a date range and click "Load Statistics" to view usage data/i)).toBeInTheDocument();
  });

  test('loads demo data when Load Demo Data button is clicked', async () => {
    render(<CostMonitoringPanel />);
    
    const demoButton = screen.getByRole('button', { name: /Load Demo Data/i });
    fireEvent.click(demoButton);
    
    await waitFor(() => {
      const totalCallsElements = screen.getAllByText(/Total Calls/i);
      expect(totalCallsElements.length).toBeGreaterThan(0);
      expect(screen.getByText('376')).toBeInTheDocument();
    });
    
    // Check if summary cards are displayed
    expect(screen.getByText(/Total Tokens/i)).toBeInTheDocument();
    expect(screen.getByText(/Total Bytes/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Total Cost/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Avg Cost per Call/i)).toBeInTheDocument();
  });

  test('shows success message after loading demo data', async () => {
    render(<CostMonitoringPanel />);
    
    const demoButton = screen.getByRole('button', { name: /Load Demo Data/i });
    fireEvent.click(demoButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Demo data loaded successfully/i)).toBeInTheDocument();
    });
  });

  test('fetches usage stats from API when Load Statistics is clicked', async () => {
    const mockData = {
      daily_usage: [
        {
          date: '2025-11-15',
          total_calls: 45,
          total_tokens: 125000,
          prompt_tokens: 75000,
          completion_tokens: 50000,
          total_bytes: 450000,
          total_cost_usd: 0.020625,
        },
      ],
      summary: {
        total_calls: 45,
        total_tokens: 125000,
        total_bytes: 450000,
        total_cost_usd: 0.020625,
        average_cost_per_call: 0.000458,
      },
    };

    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockData),
      })
    );

    render(<CostMonitoringPanel />);
    
    const loadButton = screen.getByRole('button', { name: /Load Statistics/i });
    fireEvent.click(loadButton);
    
    await waitFor(() => {
      expect(screen.getByText('45')).toBeInTheDocument();
    });
  });

  test('shows error message when API call fails', async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.reject(new Error('Network error'))
    );

    render(<CostMonitoringPanel />);
    
    const loadButton = screen.getByRole('button', { name: /Load Statistics/i });
    fireEvent.click(loadButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Failed to fetch usage stats/i)).toBeInTheDocument();
    });
  });

  test('displays chart titles after loading data', async () => {
    render(<CostMonitoringPanel />);
    
    const demoButton = screen.getByRole('button', { name: /Load Demo Data/i });
    fireEvent.click(demoButton);
    
    await waitFor(() => {
      expect(screen.getByText('376')).toBeInTheDocument();
    });
    
    expect(screen.getByText(/Total Calls Per Day/i)).toBeInTheDocument();
    expect(screen.getByText(/Token Usage Per Day/i)).toBeInTheDocument();
    expect(screen.getByText(/Bytes Usage Per Day/i)).toBeInTheDocument();
    expect(screen.getByText(/Cost Per Day \(USD\)/i)).toBeInTheDocument();
  });
});
