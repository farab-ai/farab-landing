import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ContactSupport from './ContactSupport';
import * as api from '../utils/api';

// Mock the API module
jest.mock('../utils/api');

const mockedSubmitSupportRequest = api.submitSupportRequest as jest.MockedFunction<
  typeof api.submitSupportRequest
>;

describe('ContactSupport', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders contact support card with title and description', () => {
    render(<ContactSupport />);
    
    expect(screen.getByText('Reach out to us')).toBeInTheDocument();
    expect(screen.getByText(/Have a question, found a bug, or need help with Farab AI?/)).toBeInTheDocument();
    expect(screen.getByText(/We usually respond within 24–48 hours/)).toBeInTheDocument();
  });

  test('renders all form fields', () => {
    render(<ContactSupport />);
    
    expect(screen.getByLabelText(/Email address/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Subject/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Message/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Contact Support/i })).toBeInTheDocument();
  });

  test('shows validation error for empty email', async () => {
    render(<ContactSupport />);
    
    const submitButton = screen.getByRole('button', { name: /Contact Support/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Email address is required')).toBeInTheDocument();
    });
  });

  test('shows validation error for invalid email format', async () => {
    render(<ContactSupport />);
    
    const emailInput = screen.getByLabelText(/Email address/);
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    
    const submitButton = screen.getByRole('button', { name: /Contact Support/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Invalid email address')).toBeInTheDocument();
    });
  });

  test('shows validation error for empty message', async () => {
    render(<ContactSupport />);
    
    const emailInput = screen.getByLabelText(/Email address/);
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    
    const submitButton = screen.getByRole('button', { name: /Contact Support/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Message is required')).toBeInTheDocument();
    });
  });

  test('shows validation error for short message', async () => {
    render(<ContactSupport />);
    
    const emailInput = screen.getByLabelText(/Email address/);
    const messageInput = screen.getByLabelText(/Message/);
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(messageInput, { target: { value: 'Short' } });
    
    const submitButton = screen.getByRole('button', { name: /Contact Support/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Message must be at least 10 characters')).toBeInTheDocument();
    });
  });

  test('successfully submits form with valid data', async () => {
    mockedSubmitSupportRequest.mockResolvedValue({
      success: true,
      message: 'Support request received'
    });

    render(<ContactSupport />);
    
    const emailInput = screen.getByLabelText(/Email address/);
    const subjectInput = screen.getByLabelText(/Subject/);
    const messageInput = screen.getByLabelText(/Message/);
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(subjectInput, { target: { value: 'Test Subject' } });
    fireEvent.change(messageInput, { target: { value: 'This is a test message with enough characters' } });
    
    const submitButton = screen.getByRole('button', { name: /Contact Support/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Thanks! Your message has been sent to our support team/)).toBeInTheDocument();
    });

    expect(mockedSubmitSupportRequest).toHaveBeenCalledWith({
      email: 'test@example.com',
      subject: 'Test Subject',
      message: 'This is a test message with enough characters',
      platform: 'web',
      source: 'landing_page',
      locale: expect.any(String)
    });
  });

  test('handles API error gracefully', async () => {
    mockedSubmitSupportRequest.mockResolvedValue({
      success: false,
      error: 'Server error occurred'
    });

    render(<ContactSupport />);
    
    const emailInput = screen.getByLabelText(/Email address/);
    const messageInput = screen.getByLabelText(/Message/);
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(messageInput, { target: { value: 'This is a test message with enough characters' } });
    
    const submitButton = screen.getByRole('button', { name: /Contact Support/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Server error occurred')).toBeInTheDocument();
    });
  });

  test('clears form after successful submission', async () => {
    mockedSubmitSupportRequest.mockResolvedValue({
      success: true,
      message: 'Support request received'
    });

    render(<ContactSupport />);
    
    const emailInput = screen.getByLabelText(/Email address/) as HTMLInputElement;
    const messageInput = screen.getByLabelText(/Message/) as HTMLTextAreaElement;
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(messageInput, { target: { value: 'This is a test message' } });
    
    const submitButton = screen.getByRole('button', { name: /Contact Support/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Thanks! Your message has been sent/)).toBeInTheDocument();
    });

    // Click "Send Another Message" button
    const anotherMessageButton = screen.getByRole('button', { name: /Send Another Message/i });
    fireEvent.click(anotherMessageButton);

    // Form should be visible again and cleared
    await waitFor(() => {
      const newEmailInput = screen.getByLabelText(/Email address/) as HTMLInputElement;
      const newMessageInput = screen.getByLabelText(/Message/) as HTMLTextAreaElement;
      expect(newEmailInput.value).toBe('');
      expect(newMessageInput.value).toBe('');
    });
  });

  test('disables form inputs while submitting', async () => {
    mockedSubmitSupportRequest.mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({ success: true }), 1000))
    );

    render(<ContactSupport />);
    
    const emailInput = screen.getByLabelText(/Email address/);
    const messageInput = screen.getByLabelText(/Message/);
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(messageInput, { target: { value: 'This is a test message' } });
    
    const submitButton = screen.getByRole('button', { name: /Contact Support/i });
    fireEvent.click(submitButton);
    
    // Check that inputs are disabled during submission
    await waitFor(() => {
      expect(emailInput).toBeDisabled();
      expect(messageInput).toBeDisabled();
      expect(submitButton).toBeDisabled();
    });
  });

  test('renders email link for App Store support', () => {
    render(<ContactSupport />);
    
    const emailLink = screen.getByRole('link', { name: /support@farab.xyz/i });
    expect(emailLink).toBeInTheDocument();
    expect(emailLink).toHaveAttribute('href', 'mailto:support@farab.xyz');
  });
});
