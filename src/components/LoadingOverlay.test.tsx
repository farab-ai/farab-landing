import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import LoadingOverlay from './LoadingOverlay';

describe('LoadingOverlay', () => {
  test('renders with default message', () => {
    render(<LoadingOverlay />);
    expect(screen.getByText('Creating course template...')).toBeInTheDocument();
  });

  test('renders with custom message', () => {
    render(<LoadingOverlay message="Please wait..." />);
    expect(screen.getByText('Please wait...')).toBeInTheDocument();
  });

  test('overlay has correct styling', () => {
    const { container } = render(<LoadingOverlay />);
    const overlay = container.firstChild as HTMLElement;
    
    expect(overlay).toHaveStyle({
      position: 'fixed',
      top: '0',
      left: '0',
      right: '0',
      bottom: '0',
    });
  });

  test('displays animation elements', () => {
    const { container } = render(<LoadingOverlay />);
    // Check that animation keyframes style is present
    const styleElement = container.querySelector('style');
    expect(styleElement?.textContent).toContain('@keyframes orbit');
  });
});
