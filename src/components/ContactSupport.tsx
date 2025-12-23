import React, { useState } from 'react';
import { submitSupportRequest } from '../utils/api';

interface ContactSupportProps {
  className?: string;
}

interface FormData {
  email: string;
  subject: string;
  message: string;
}

interface FormErrors {
  email?: string;
  message?: string;
}

const ContactSupport: React.FC<ContactSupportProps> = ({ className = '' }) => {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    subject: '',
    message: ''
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email address is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Invalid email address';
    }

    if (!formData.message) {
      newErrors.message = 'Message is required';
    } else if (formData.message.length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      const result = await submitSupportRequest({
        email: formData.email,
        subject: formData.subject || undefined,
        message: formData.message,
        platform: 'web',
        source: 'landing_page',
        locale: navigator.language || 'en'
      });

      if (result.success) {
        setSubmitStatus('success');
        setFormData({ email: '', subject: '', message: '' });
      } else {
        setSubmitStatus('error');
        setErrorMessage(result.error || 'Failed to send message. Please try again.');
      }
    } catch (error) {
      setSubmitStatus('error');
      setErrorMessage('Failed to send message. Please try again.');
      console.error('Error submitting support request:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  return (
    <div className={`rounded-3xl p-12 ${className}`} style={{ background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.05) 0%, rgba(52, 211, 153, 0.08) 100%)', border: '2px solid rgba(20, 184, 166, 0.15)' }}>
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">💬</div>
          <h2 className="text-4xl font-black mb-4" style={{ color: '#2d3748', fontFamily: 'Georgia, Cambria, "Times New Roman", Times, serif', letterSpacing: '-1px' }}>
            Reach out to us
          </h2>
          <p className="text-lg mb-2" style={{ color: '#4a5568', lineHeight: '1.7' }}>
            Have a question, found a bug, or need help with Farab AI?
            <br />
            Send us a message and our support team will get back to you as soon as possible.
          </p>
          <p className="text-sm" style={{ color: '#718096' }}>
            We usually respond within 24–48 hours.
          </p>
        </div>

        {submitStatus === 'success' ? (
          <div className="text-center p-8 rounded-2xl" style={{ background: 'rgba(16, 185, 129, 0.1)', border: '2px solid rgba(16, 185, 129, 0.3)' }}>
            <div className="text-5xl mb-4">✅</div>
            <h3 className="text-2xl font-bold mb-2" style={{ color: '#059669' }}>
              Thanks! Your message has been sent to our support team.
            </h3>
            <p style={{ color: '#4a5568' }}>
              We'll get back to you as soon as possible.
            </p>
            <button
              onClick={() => setSubmitStatus('idle')}
              className="mt-6 px-6 py-3 rounded-xl font-semibold transition-all hover:scale-105"
              style={{ background: 'rgba(20, 184, 166, 0.1)', border: '2px solid rgba(20, 184, 166, 0.3)', color: '#14b8a6' }}
            >
              Send Another Message
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold mb-2" style={{ color: '#2d3748' }}>
                Email address *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-2 transition-all"
                style={{
                  borderColor: errors.email ? '#ef4444' : 'rgba(20, 184, 166, 0.2)',
                  background: 'white',
                  color: '#2d3748'
                }}
                placeholder="your.email@example.com"
                disabled={isSubmitting}
              />
              {errors.email && (
                <p className="text-sm mt-1" style={{ color: '#ef4444' }}>
                  {errors.email}
                </p>
              )}
            </div>

            {/* Subject Field */}
            <div>
              <label htmlFor="subject" className="block text-sm font-semibold mb-2" style={{ color: '#2d3748' }}>
                Subject <span style={{ color: '#718096', fontWeight: 'normal' }}>(optional)</span>
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-2 transition-all"
                style={{
                  borderColor: 'rgba(20, 184, 166, 0.2)',
                  background: 'white',
                  color: '#2d3748'
                }}
                placeholder="What's this about?"
                disabled={isSubmitting}
              />
            </div>

            {/* Message Field */}
            <div>
              <label htmlFor="message" className="block text-sm font-semibold mb-2" style={{ color: '#2d3748' }}>
                Message *
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={6}
                className="w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-2 transition-all resize-none"
                style={{
                  borderColor: errors.message ? '#ef4444' : 'rgba(20, 184, 166, 0.2)',
                  background: 'white',
                  color: '#2d3748'
                }}
                placeholder="Describe your question or issue..."
                disabled={isSubmitting}
              />
              {errors.message && (
                <p className="text-sm mt-1" style={{ color: '#ef4444' }}>
                  {errors.message}
                </p>
              )}
            </div>

            {/* Error Message */}
            {submitStatus === 'error' && (
              <div className="p-4 rounded-xl" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '2px solid rgba(239, 68, 68, 0.3)' }}>
                <p className="text-sm" style={{ color: '#dc2626' }}>
                  {errorMessage}
                </p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full px-8 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: isSubmitting ? '#9ca3af' : 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)',
                color: 'white',
                boxShadow: isSubmitting ? 'none' : '0 8px 24px rgba(20, 184, 166, 0.3)'
              }}
            >
              {isSubmitting ? 'Sending...' : 'Contact Support'}
            </button>
          </form>
        )}

        {/* Additional Contact Info */}
        <div className="mt-8 pt-6 text-center" style={{ borderTop: '1px solid rgba(0, 0, 0, 0.1)' }}>
          <p className="text-sm" style={{ color: '#718096' }}>
            For App Store-related support inquiries, please contact us at{' '}
            <a 
              href="mailto:support@farab.xyz"
              className="font-semibold hover:underline"
              style={{ color: '#14b8a6' }}
            >
              support@farab.xyz
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ContactSupport;
