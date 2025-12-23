// API utility functions
// In production, replace this with actual backend API calls

export interface SupportRequest {
  email: string;
  subject?: string;
  message: string;
  platform?: string;
  appVersion?: string;
  locale?: string;
  source?: string;
}

export interface ApiResponse {
  success: boolean;
  message?: string;
  error?: string;
}

/**
 * Submit a support request
 * 
 * This is a mock implementation for development.
 * In production, replace this with actual API endpoint:
 * POST https://api.farab.xyz/api/support-request
 */
export async function submitSupportRequest(data: SupportRequest): Promise<ApiResponse> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Basic validation
  if (!data.email || !data.message) {
    return {
      success: false,
      error: 'Email and message are required'
    };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.email)) {
    return {
      success: false,
      error: 'Invalid email address'
    };
  }

  if (data.message.length < 10) {
    return {
      success: false,
      error: 'Message must be at least 10 characters'
    };
  }

  // Log the request (in production, this would be sent to backend)
  console.log('Support Request Submitted:', {
    ...data,
    timestamp: new Date().toISOString(),
  });

  // Store in localStorage for demonstration (in production, use backend database)
  try {
    const existingRequests = JSON.parse(localStorage.getItem('supportRequests') || '[]');
    // Generate a simple unique ID that works in all browsers
    const generateId = () => {
      if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
      }
      // Fallback for browsers without crypto.randomUUID
      return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
    };
    
    existingRequests.push({
      id: generateId(),
      ...data,
      status: 'open',
      createdAt: new Date().toISOString(),
    });
    localStorage.setItem('supportRequests', JSON.stringify(existingRequests));
  } catch (error) {
    console.error('Failed to store support request:', error);
  }

  // Simulate success
  return {
    success: true,
    message: 'Support request received'
  };
}

/**
 * Backend API integration instructions:
 * 
 * 1. Deploy a backend API with this endpoint:
 *    POST /api/support-request
 * 
 * 2. Database schema (PostgreSQL example):
 *    CREATE TABLE support_requests (
 *      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 *      email VARCHAR(255) NOT NULL,
 *      subject VARCHAR(255),
 *      message TEXT NOT NULL,
 *      platform VARCHAR(50),
 *      app_version VARCHAR(50),
 *      source VARCHAR(50),
 *      status VARCHAR(20) DEFAULT 'open',
 *      created_at TIMESTAMP DEFAULT NOW()
 *    );
 * 
 * 3. Replace this function with:
 *    export async function submitSupportRequest(data: SupportRequest): Promise<ApiResponse> {
 *      const response = await fetch('https://api.farab.xyz/api/support-request', {
 *        method: 'POST',
 *        headers: { 'Content-Type': 'application/json' },
 *        body: JSON.stringify(data),
 *      });
 *      return response.json();
 *    }
 */
