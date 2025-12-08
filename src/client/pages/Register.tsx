import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';

export default function Register() {
  const { t, i18n } = useTranslation();
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    language: i18n.language,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate password length
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    try {
      await register(formData.email, formData.password, formData.name, formData.language);

      // Check if user is now authenticated (first user auto-approved)
      // We need to wait a moment for the auth state to update
      setTimeout(() => {
        const token = localStorage.getItem('token');
        if (token) {
          // First user - show success and navigate to dashboard
          setSuccess('Registration successful!');
          setTimeout(() => navigate('/dashboard'), 2000);
        } else {
          // Subsequent users - show pending approval message
          setSuccess(t('auth.pendingApproval'));
          setTimeout(() => navigate('/login'), 3000);
        }
      }, 100);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
      setLoading(false);
    }
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'es' : 'en';
    i18n.changeLanguage(newLang);
    setFormData({ ...formData, language: newLang });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full px-6">
        {/* Language toggle */}
        <div className="flex justify-end mb-8">
          <button
            onClick={toggleLanguage}
            className="text-sm text-gray-600 hover:text-gray-900 font-medium"
          >
            {i18n.language === 'en' ? 'ES' : 'EN'}
          </button>
        </div>

        {/* Register form card */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-2xl font-bold text-center mb-6 text-gray-900">
            {t('auth.register')}
          </h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name input */}
            <div>
              <label htmlFor="name" className="sr-only">
                {t('auth.name')}
              </label>
              <input
                id="name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder={t('auth.name')}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Email input */}
            <div>
              <label htmlFor="email" className="sr-only">
                {t('auth.email')}
              </label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder={t('auth.email')}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Password input */}
            <div>
              <label htmlFor="password" className="sr-only">
                {t('auth.password')}
              </label>
              <input
                id="password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder={t('auth.password')}
                required
                minLength={8}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Confirm password input */}
            <div>
              <label htmlFor="confirmPassword" className="sr-only">
                {t('auth.confirmPassword')}
              </label>
              <input
                id="confirmPassword"
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder={t('auth.confirmPassword')}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Language selector */}
            <div>
              <label htmlFor="language" className="sr-only">
                {t('common.language')}
              </label>
              <select
                id="language"
                name="language"
                value={formData.language}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="en">{t('common.en')}</option>
                <option value="es">{t('common.es')}</option>
              </select>
            </div>

            {/* Error message */}
            {error && (
              <div className="text-red-600 text-sm text-center">
                {error}
              </div>
            )}

            {/* Success message */}
            {success && (
              <div className="text-green-600 text-sm text-center">
                {success}
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {loading ? t('common.loading') : t('auth.register')}
            </button>

            {/* Login link */}
            <div className="text-center">
              <Link
                to="/login"
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                {t('auth.hasAccount')}
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
