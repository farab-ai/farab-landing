// API utility functions for Farab support requests

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
 * Submit a support request to the backend API
 * 
 * POST /api/support-request
 * Rate limited to one request per IP every 5 minutes
 */
export async function submitSupportRequest(data: SupportRequest): Promise<ApiResponse> {
  try {
    const response = await fetch('/api/support-request', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    // Try to parse JSON response, handle non-JSON responses gracefully
    let result;
    try {
      result = await response.json();
    } catch (parseError) {
      // Handle non-JSON responses (e.g., HTML error pages)
      console.error('Failed to parse response as JSON:', parseError);
      if (!response.ok) {
        return {
          success: false,
          error: `Server error (${response.status}). Please try again later.`,
        };
      }
      // If response was OK but not JSON, treat as success
      return {
        success: true,
        message: 'Support request received',
      };
    }

    // Handle different response status codes
    if (response.status === 429) {
      // Rate limit exceeded
      return {
        success: false,
        error: result.error || 'Too many requests. Please try again in a few minutes.',
      };
    }

    if (response.status === 400) {
      // Bad request - validation error
      return {
        success: false,
        error: result.error || 'Invalid email or message too short.',
      };
    }

    if (response.status === 500) {
      // Internal server error
      return {
        success: false,
        error: result.error || 'Server error. Please try again later.',
      };
    }

    if (!response.ok) {
      // Other error
      return {
        success: false,
        error: result.error || 'Failed to submit support request.',
      };
    }

    // Success - use the success field from response if provided, otherwise assume true for 200
    return {
      success: result.success !== false, // Treat as success unless explicitly false
      message: result.message || 'Support request received',
    };
  } catch (error) {
    // Network error or other exception
    console.error('Error submitting support request:', error);
    return {
      success: false,
      error: 'Network error. Please check your connection and try again.',
    };
  }
}

/**
 * Backend API Documentation:
 * 
 * Endpoint: POST /api/support-request
 * Rate limit: One request per IP address every 5 minutes
 * 
 * Request body (CreateSupportRequestRequest):
 * - email: string (required)
 * - message: string (required, minLength: 10)
 * - subject: string (optional)
 * - platform: string (optional)
 * - appVersion: string (optional)
 * - locale: string (optional)
 * - source: string (optional)
 * 
 * Response (SupportRequestResponse):
 * - success: boolean
 * - message: string (optional)
 * - error: string (optional)
 * 
 * Status codes:
 * - 200: Success
 * - 400: Bad request (invalid email or message too short)
 * - 429: Rate limit exceeded
 * - 500: Internal server error
 */
