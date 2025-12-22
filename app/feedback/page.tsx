'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import toast, { Toaster } from 'react-hot-toast';
import Link from 'next/link';

export default function FeedbackPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    names: '',
    email: '',
    role: 'Student',
    feedback_type: 'General Feedback',
    message: ''
  });

  const supabase = createClient();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('feedback_table')
        .insert([
          {
            names: formData.names,
            email: formData.email,
            role: formData.role,
            feedback_type: formData.feedback_type,
            message: formData.message
          }
        ]);

      if (error) throw error;

      setSuccess(true);
      setFormData({
        names: '',
        email: '',
        role: 'Student',
        feedback_type: 'General Feedback',
        message: ''
      });
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error('Failed to submit feedback. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] flex flex-col">
        <header className="w-full p-4 flex justify-end">
          <Link href="/" className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors" title="Back to Home">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </Link>
        </header>
        <main className="flex-grow flex items-center justify-center p-4">
          <div className="bg-[#222] p-8 rounded-2xl shadow-2xl max-w-md w-full text-center border border-white/10">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Feedback Received!</h2>
            <p className="text-gray-400 mb-8">Thank you for helping us improve the Unilak Community platform.</p>
            <Link
              href="/"
              className="block bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-xl transition-colors w-full"
            >
              Exit
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1a1a] flex flex-col">
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: '#333',
            color: '#fff',
          },
        }}
      />
      <header className="w-full p-4 flex justify-end">
        <Link href="/" className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors" title="Back to Home">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        </Link>
      </header>
      <main className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl w-full space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
              We Value Your Feedback
            </h1>
            <p className="mt-4 text-lg text-gray-400">
              Have a suggestion, found a bug, or just want to share your thoughts? Let us know!
            </p>
          </div>

          <div className="bg-[#222] py-8 px-4 shadow-2xl sm:rounded-2xl sm:px-10 border border-white/5">
            <form className="space-y-6" onSubmit={handleSubmit}>
              
              {/* Names & Email Row */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="names" className="block text-sm font-medium text-gray-300">
                    Full Name
                  </label>
                  <div className="mt-1">
                    <input
                      id="names"
                      name="names"
                      type="text"
                      required
                      value={formData.names}
                      onChange={handleChange}
                      className="appearance-none block w-full px-3 py-3 border border-gray-700 rounded-xl shadow-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-[#1a1a1a] text-white sm:text-sm"
                      placeholder="John Doe"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                    Email Address
                  </label>
                  <div className="mt-1">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="appearance-none block w-full px-3 py-3 border border-gray-700 rounded-xl shadow-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-[#1a1a1a] text-white sm:text-sm"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>
              </div>

              {/* Role & Type Row */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-300">
                    I am a...
                  </label>
                  <div className="mt-1">
                    <select
                      id="role"
                      name="role"
                      required
                      value={formData.role}
                      onChange={handleChange}
                      className="block w-full px-3 py-3 border border-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-[#1a1a1a] text-white sm:text-sm"
                    >
                      <option value="Student">Student</option>
                      <option value="Lecturer">Lecturer</option>
                      <option value="Staff">Staff</option>
                      <option value="Alumni">Alumni</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="feedback_type" className="block text-sm font-medium text-gray-300">
                    Feedback Type
                  </label>
                  <div className="mt-1">
                    <select
                      id="feedback_type"
                      name="feedback_type"
                      required
                      value={formData.feedback_type}
                      onChange={handleChange}
                      className="block w-full px-3 py-3 border border-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-[#1a1a1a] text-white sm:text-sm"
                    >
                      <option value="General Feedback">General Feedback</option>
                      <option value="Bug Report">Bug Report</option>
                      <option value="Feature Request">Feature Request</option>
                      <option value="Complaint">Complaint</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Message */}
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-300">
                  Message
                </label>
                <div className="mt-1">
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    required
                    value={formData.message}
                    onChange={handleChange}
                    className="appearance-none block w-full px-3 py-3 border border-gray-700 rounded-xl shadow-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-[#1a1a1a] text-white sm:text-sm resize-none"
                    placeholder="Tell us more..."
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all ${
                    loading ? 'opacity-75 cursor-not-allowed' : ''
                  }`}
                >
                  {loading ? 'Submitting...' : 'Submit Feedback'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}