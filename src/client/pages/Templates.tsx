import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { templatesApi, brandsApi } from '../services/api';

interface Template {
  id: string;
  name: string;
  type: string;
  brandId?: string;
  brand?: {
    id: string;
    name: string;
    logoUrl?: string;
  };
  cssStyles: string;
  htmlStructure: string;
  hasSidebar: boolean;
  language: string;
  isActive: boolean;
  sourceUrl?: string;
  extractionMethod?: string;
  createdAt: string;
}

interface Brand {
  id: string;
  name: string;
}

export default function Templates() {
  const { t } = useTranslation();
  const { user, logout, token, isSuperAdmin } = useAuth();
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showExtractModal, setShowExtractModal] = useState(false);
  const [extracting, setExtracting] = useState(false);

  const [extractFormData, setExtractFormData] = useState({
    url: '',
    name: '',
    brandId: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const [templatesData, brandsData] = await Promise.all([
        templatesApi.getAllTemplates(token!),
        brandsApi.getAllBrands(token!),
      ]);
      setTemplates(templatesData);
      setBrands(brandsData);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleExtractTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    setExtracting(true);
    setError('');

    try {
      const dataToSend = {
        url: extractFormData.url,
        name: extractFormData.name,
        ...(extractFormData.brandId && { brandId: extractFormData.brandId }),
      };
      await templatesApi.extractTemplate(dataToSend, token!);
      alert('Template extracted successfully!');
      setShowExtractModal(false);
      setExtractFormData({ url: '', name: '', brandId: '' });
      fetchData();
    } catch (err: any) {
      setError(err.message || 'Failed to extract template');
    } finally {
      setExtracting(false);
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm('Are you sure you want to delete this template?')) {
      return;
    }

    try {
      await templatesApi.deleteTemplate(templateId, token!);
      fetchData();
    } catch (err: any) {
      setError(err.message || 'Failed to delete template');
    }
  };

  const handleToggleActive = async (templateId: string, currentStatus: boolean) => {
    try {
      await templatesApi.updateTemplate(templateId, { isActive: !currentStatus }, token!);
      fetchData();
    } catch (err: any) {
      setError(err.message || 'Failed to update template');
    }
  };

  const getBrandName = (template: Template) => {
    if (!template.brandId) return 'Generic';
    if (template.brand) return template.brand.name;
    const brand = brands.find(b => b.id === template.brandId);
    return brand ? brand.name : 'Unknown';
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Templates</h1>
          <div className="flex items-center gap-4">
            <Link
              to="/dashboard"
              className="text-gray-600 hover:text-gray-900"
            >
              Dashboard
            </Link>
            <Link
              to="/articles"
              className="text-gray-600 hover:text-gray-900"
            >
              Articles
            </Link>
            <Link
              to="/brands"
              className="text-gray-600 hover:text-gray-900"
            >
              Brands
            </Link>
            {isSuperAdmin && (
              <Link
                to="/analytics"
                className="text-gray-600 hover:text-gray-900"
              >
                Analytics
              </Link>
            )}
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
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Article Templates</h2>
            <button
              onClick={() => setShowExtractModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Extract from URL
            </button>
          </div>

          {loading ? (
            <p className="text-gray-600">Loading templates...</p>
          ) : templates.length === 0 ? (
            <p className="text-gray-600">No templates found. Extract your first template from a website!</p>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {template.brand?.logoUrl && (
                          <img
                            src={template.brand.logoUrl}
                            alt={`${template.brand.name} Logo`}
                            className="w-10 h-10 object-contain"
                          />
                        )}
                        <h3 className="font-semibold text-lg">{template.name}</h3>
                        <span
                          className={`px-2 py-1 text-xs rounded ${
                            template.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {template.isActive ? 'Active' : 'Inactive'}
                        </span>
                        <span className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-800">
                          {template.type}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-2">
                        <p>Brand: {getBrandName(template)}</p>
                        <p>Language: {template.language.toUpperCase()}</p>
                        <p>Sidebar: {template.hasSidebar ? 'Yes' : 'No'}</p>
                        <p>Method: {template.extractionMethod || 'Manual'}</p>
                      </div>
                      {template.sourceUrl && (
                        <a
                          href={template.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-sm block mb-2"
                        >
                          Source: {template.sourceUrl}
                        </a>
                      )}
                      <details className="mt-2">
                        <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-900">
                          View CSS Styles
                        </summary>
                        <pre className="mt-2 p-3 bg-gray-50 rounded text-xs overflow-x-auto max-h-40">
                          {template.cssStyles.substring(0, 500)}
                          {template.cssStyles.length > 500 ? '...' : ''}
                        </pre>
                      </details>
                    </div>
                    <div className="flex flex-col gap-2 ml-4">
                      <button
                        onClick={() => handleToggleActive(template.id, template.isActive)}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200 transition-colors"
                      >
                        {template.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      {isSuperAdmin && (
                        <button
                          onClick={() => handleDeleteTemplate(template.id)}
                          className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200 transition-colors"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <h3 className="font-semibold text-blue-900 mb-2">About Template Extraction</h3>
          <p className="text-sm text-blue-800">
            Template extraction uses Puppeteer to analyze a website's layout, CSS, and structure.
            The AI then generates a reusable template that can be applied to generated articles.
            This allows you to create articles that look like they come from real news websites.
          </p>
        </div>
      </main>

      {/* Extract Template Modal */}
      {showExtractModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full">
            <h2 className="text-2xl font-bold mb-4">Extract Template from Website</h2>
            <form onSubmit={handleExtractTemplate}>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Website URL *</label>
                  <input
                    type="url"
                    value={extractFormData.url}
                    onChange={(e) => setExtractFormData({ ...extractFormData, url: e.target.value })}
                    placeholder="https://example.com/article/sample"
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    required
                  />
                  <p className="text-xs text-gray-600 mt-1">
                    Enter the URL of an article page to extract its layout and styling
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Template Name *</label>
                  <input
                    type="text"
                    value={extractFormData.name}
                    onChange={(e) => setExtractFormData({ ...extractFormData, name: e.target.value })}
                    placeholder="e.g., Modern News Layout"
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Associated Brand (Optional)</label>
                  <select
                    value={extractFormData.brandId}
                    onChange={(e) => setExtractFormData({ ...extractFormData, brandId: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="">None (Generic Template)</option>
                    {brands.map((brand) => (
                      <option key={brand.id} value={brand.id}>
                        {brand.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                <p className="text-xs text-yellow-800">
                  Note: Template extraction may take 30-60 seconds as it analyzes the website's structure.
                  Make sure you have permission to extract templates from the target website.
                </p>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  disabled={extracting}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {extracting ? 'Extracting...' : 'Extract Template'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowExtractModal(false)}
                  disabled={extracting}
                  className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
