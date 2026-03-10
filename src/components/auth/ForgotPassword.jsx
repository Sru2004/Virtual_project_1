import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { api } from '../../lib/api';
import { toastError, toastSuccess } from '../../lib/toast';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      toastError('Please enter your email address');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      toastError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setSuccess(false);
    
    try {
      console.log('Sending forgot password request for email:', email.trim());
      const response = await api.forgotPassword(email.trim());
      console.log('Forgot password response:', response);
      
      setSuccess(true);
      toastSuccess(response?.message || 'Reset link sent! Please check your email.');
    } catch (err) {
      console.error('Forgot password error:', err);
      toastError(err.message || 'Unable to process your request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
        <button
          onClick={() => navigate('/login')}
          className="text-gray-600 hover:text-gray-800 mb-6 flex items-center gap-2 transition-colors"
          type="button"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Login
        </button>

        {!success ? (
          <>
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-4">
                <Mail className="h-8 w-8 text-emerald-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Forgot Password?</h2>
              <p className="text-gray-600">
                No worries! Enter your email and we'll send you a reset link.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  required
                  autoFocus
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="h-5 w-5" />
                    Send Reset Link
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-600">
              <p>Remember your password?{' '}
                <button
                  onClick={() => navigate('/login')}
                  className="text-emerald-600 hover:text-emerald-700 font-semibold"
                  type="button"
                >
                  Sign in
                </button>
              </p>
            </div>
          </>
        ) : (
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">Check Your Email</h2>
            <p className="text-gray-600 mb-6">
              If an account exists with <strong>{email}</strong>, you will receive a password reset link shortly.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
              <p className="text-sm text-blue-800 font-semibold mb-2">📧 What to do next:</p>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Check your email inbox</li>
                <li>• Look in your spam/junk folder</li>
                <li>• Click the reset link (expires in 15 minutes)</li>
                <li>• Create your new password</li>
              </ul>
            </div>
            <button
              onClick={() => navigate('/login')}
              className="w-full py-3 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition-all"
            >
              Back to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
