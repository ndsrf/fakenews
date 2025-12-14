import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function Dashboard() {
  const { t } = useTranslation();
  const { user, logout, isSuperAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Fictional News Generator
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-700">{user?.name}</span>
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
            >
              {t('auth.logout')}
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Welcome, {user?.name}!</h2>
          <p className="text-gray-600 mb-4">Role: {user?.role}</p>

          {/* Quick Actions */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link
                to="/articles/create"
                className="block bg-blue-600 text-white p-4 rounded-md hover:bg-blue-700 transition-colors text-center"
              >
                <div className="text-2xl mb-2">✍️</div>
                <div className="font-semibold">Generate Article</div>
                <div className="text-sm opacity-90">Create fictional news</div>
              </Link>
              <Link
                to="/articles"
                className="block bg-green-600 text-white p-4 rounded-md hover:bg-green-700 transition-colors text-center"
              >
                <div className="text-2xl mb-2">📰</div>
                <div className="font-semibold">Articles</div>
                <div className="text-sm opacity-90">Manage articles</div>
              </Link>
              <Link
                to="/brands"
                className="block bg-purple-600 text-white p-4 rounded-md hover:bg-purple-700 transition-colors text-center"
              >
                <div className="text-2xl mb-2">🏢</div>
                <div className="font-semibold">Brands</div>
                <div className="text-sm opacity-90">Manage news brands</div>
              </Link>
              <Link
                to="/templates"
                className="block bg-orange-600 text-white p-4 rounded-md hover:bg-orange-700 transition-colors text-center"
              >
                <div className="text-2xl mb-2">🎨</div>
                <div className="font-semibold">Templates</div>
                <div className="text-sm opacity-90">Extract layouts</div>
              </Link>
            </div>
          </div>

          {isSuperAdmin && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-3">Admin Actions</h3>
              <Link
                to="/users"
                className="inline-block bg-gray-700 text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors"
              >
                {t('users.title')}
              </Link>
            </div>
          )}

          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-800 font-semibold mb-1">Phase 2 Complete!</p>
            <p className="text-sm text-green-800">
              Authentication, user management, article generation, templates, and brands are now functional.
              Phase 3 features (public display, analytics) coming soon.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
