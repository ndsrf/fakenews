import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { brandsApi } from '../services/api';

interface Brand {
  id: string;
  name: string;
  tagline?: string;
  description: string;
  logoUrl?: string;
  websiteUrl: string;
  categories: string | string[];
  language: string;
  primaryColor: string;
  accentColor: string;
  isActive: boolean;
  createdAt: string;
}

interface BrandFormData {
  name: string;
  tagline: string;
  description: string;
  websiteUrl: string;
  categories: string;
  language: string;
  primaryColor: string;
  accentColor: string;
}

export default function Brands() {
  const { t } = useTranslation();
  const { user, logout, token, isSuperAdmin } = useAuth();
  const navigate = useNavigate();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [showLogoModal, setShowLogoModal] = useState(false);
  const [generatingLogo, setGeneratingLogo] = useState(false);

  const [formData, setFormData] = useState<BrandFormData>({
    name: '',
    tagline: '',
    description: '',
    websiteUrl: '',
    categories: '',
    language: 'en',
    primaryColor: '#1a1a1a',
    accentColor: '#0066cc',
  });

  const [logoFormData, setLogoFormData] = useState({
    brandName: '',
    tagline: '',
    style: 'modern',
    primaryColor: '#1a1a1a',
    accentColor: '#0066cc',
    aiProvider: 'openai' as 'openai' | 'anthropic' | 'gemini',
    useAI: false,
  });

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await brandsApi.getAllBrands(token!);
      setBrands(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch brands');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const openCreateModal = () => {
    setEditingBrand(null);
    setFormData({
      name: '',
      tagline: '',
      description: '',
      websiteUrl: '',
      categories: '',
      language: 'en',
      primaryColor: '#1a1a1a',
      accentColor: '#0066cc',
    });
    setShowModal(true);
  };

  const openEditModal = (brand: Brand) => {
    setEditingBrand(brand);
    setFormData({
      name: brand.name,
      tagline: brand.tagline || '',
      description: brand.description,
      websiteUrl: brand.websiteUrl,
      categories: Array.isArray(brand.categories)
        ? brand.categories.join(', ')
        : brand.categories,
      language: brand.language,
      primaryColor: brand.primaryColor,
      accentColor: brand.accentColor,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const brandData = {
        ...formData,
        categories: formData.categories.split(',').map(c => c.trim()).filter(Boolean),
      };

      if (editingBrand) {
        await brandsApi.updateBrand(editingBrand.id, brandData, token!);
      } else {
        await brandsApi.createBrand(brandData, token!);
      }

      setShowModal(false);
      fetchBrands();
    } catch (err: any) {
      setError(err.message || 'Failed to save brand');
    }
  };

  const handleDelete = async (brandId: string) => {
    if (!confirm('Are you sure you want to delete this brand?')) {
      return;
    }

    try {
      await brandsApi.deleteBrand(brandId, token!);
      fetchBrands();
    } catch (err: any) {
      setError(err.message || 'Failed to delete brand');
    }
  };

  const handleGenerateLogo = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneratingLogo(true);
    setError('');

    try {
      const result = await brandsApi.generateLogo(logoFormData, token!);

      // Find the brand by name and update it with logo variations
      const brand = brands.find(b => b.name === logoFormData.brandName);
      if (brand) {
        await brandsApi.updateBrand(
          brand.id,
          {
            logoUrl: result.variations.horizontal, // Set default to horizontal
            logoVariations: result.variations,
            logoMetadata: result.metadata,
          },
          token!
        );
      }

      const logoUrls = [
        `Horizontal: ${result.variations.horizontal}`,
        `Vertical: ${result.variations.vertical}`,
        `Icon Only: ${result.variations.iconOnly}`,
        `Monochrome: ${result.variations.monochrome}`,
      ];

      if (result.aiGenerated) {
        logoUrls.unshift(`AI Generated: ${result.aiGenerated}`);
      }

      alert('Logo generated and saved to brand successfully!\n\n' + logoUrls.join('\n'));
      setShowLogoModal(false);
      setLogoFormData({
        brandName: '',
        tagline: '',
        style: 'modern',
        primaryColor: '#1a1a1a',
        accentColor: '#0066cc',
        aiProvider: 'openai',
        useAI: false,
      });
      fetchBrands(); // Refresh brands to show updated logos
    } catch (err: any) {
      setError(err.message || 'Failed to generate logo');
    } finally {
      setGeneratingLogo(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Brands</h1>
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
              to="/templates"
              className="text-gray-600 hover:text-gray-900"
            >
              Templates
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
            <h2 className="text-xl font-semibold">Fictional News Brands</h2>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoModal(true)}
                className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors"
              >
                Generate Logo
              </button>
              {isSuperAdmin && (
                <button
                  onClick={openCreateModal}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Create Brand
                </button>
              )}
            </div>
          </div>

          {loading ? (
            <p className="text-gray-600">Loading brands...</p>
          ) : brands.length === 0 ? (
            <p className="text-gray-600">No brands found. Create your first brand!</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {brands.map((brand) => (
                <div
                  key={brand.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-lg">{brand.name}</h3>
                      {brand.tagline && (
                        <p className="text-sm text-gray-600 italic">{brand.tagline}</p>
                      )}
                    </div>
                    {brand.logoUrl && (
                      <img
                        src={brand.logoUrl}
                        alt={brand.name}
                        className="w-12 h-12 object-contain"
                      />
                    )}
                  </div>
                  <p className="text-sm text-gray-700 mb-3">{brand.description}</p>
                  <div className="text-xs text-gray-600 mb-3">
                    <p>Language: {brand.language.toUpperCase()}</p>
                    <p>Categories: {Array.isArray(brand.categories) ? brand.categories.join(', ') : brand.categories}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span>Colors:</span>
                      <div
                        className="w-6 h-6 rounded border border-gray-300"
                        style={{ backgroundColor: brand.primaryColor }}
                        title={brand.primaryColor}
                      />
                      <div
                        className="w-6 h-6 rounded border border-gray-300"
                        style={{ backgroundColor: brand.accentColor }}
                        title={brand.accentColor}
                      />
                    </div>
                  </div>
                  <a
                    href={brand.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm block mb-3"
                  >
                    {brand.websiteUrl}
                  </a>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditModal(brand)}
                      className="flex-1 bg-gray-100 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-200 transition-colors"
                    >
                      Edit
                    </button>
                    {isSuperAdmin && (
                      <button
                        onClick={() => handleDelete(brand.id)}
                        className="flex-1 bg-red-100 text-red-700 px-3 py-1 rounded text-sm hover:bg-red-200 transition-colors"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Brand Form Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">
              {editingBrand ? 'Edit Brand' : 'Create Brand'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Tagline</label>
                  <input
                    type="text"
                    value={formData.tagline}
                    onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description *</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    rows={3}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Website URL *</label>
                  <input
                    type="url"
                    value={formData.websiteUrl}
                    onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Categories (comma-separated) *
                  </label>
                  <input
                    type="text"
                    value={formData.categories}
                    onChange={(e) => setFormData({ ...formData, categories: e.target.value })}
                    placeholder="e.g., Technology, Science, Business"
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Language</label>
                    <select
                      value={formData.language}
                      onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                    >
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Primary Color</label>
                    <input
                      type="color"
                      value={formData.primaryColor}
                      onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 h-10"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Accent Color</label>
                  <input
                    type="color"
                    value={formData.accentColor}
                    onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 h-10"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  {editingBrand ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Logo Generation Modal */}
      {showLogoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full">
            <h2 className="text-2xl font-bold mb-4">Generate Logo</h2>
            <form onSubmit={handleGenerateLogo}>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Brand Name *</label>
                  <select
                    value={logoFormData.brandName}
                    onChange={(e) => setLogoFormData({ ...logoFormData, brandName: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    required
                  >
                    <option value="">Select a brand</option>
                    {brands.map((brand) => (
                      <option key={brand.id} value={brand.name}>
                        {brand.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Tagline</label>
                  <input
                    type="text"
                    value={logoFormData.tagline}
                    onChange={(e) => setLogoFormData({ ...logoFormData, tagline: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Style *</label>
                  <select
                    value={logoFormData.style}
                    onChange={(e) => setLogoFormData({ ...logoFormData, style: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="modern">Modern</option>
                    <option value="classic">Classic</option>
                    <option value="minimalist">Minimalist</option>
                    <option value="vintage">Vintage</option>
                    <option value="tech">Tech</option>
                    <option value="editorial">Editorial</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    <input
                      type="checkbox"
                      checked={logoFormData.useAI}
                      onChange={(e) => setLogoFormData({ ...logoFormData, useAI: e.target.checked })}
                      className="mr-2"
                    />
                    Use AI to generate logo (requires API key)
                  </label>
                  <p className="text-xs text-gray-600 mt-1">
                    When enabled, will use AI to create a unique logo. Otherwise, generates a simple text-based logo.
                  </p>
                </div>
                {logoFormData.useAI && (
                  <div>
                    <label className="block text-sm font-medium mb-1">AI Provider *</label>
                    <select
                      value={logoFormData.aiProvider}
                      onChange={(e) => setLogoFormData({ ...logoFormData, aiProvider: e.target.value as 'openai' | 'anthropic' | 'gemini' })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      required
                    >
                      <option value="openai">OpenAI (DALL-E 3)</option>
                      <option value="anthropic">Anthropic</option>
                      <option value="gemini">Google Gemini</option>
                    </select>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Primary Color</label>
                    <input
                      type="color"
                      value={logoFormData.primaryColor}
                      onChange={(e) => setLogoFormData({ ...logoFormData, primaryColor: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 h-10"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Accent Color</label>
                    <input
                      type="color"
                      value={logoFormData.accentColor}
                      onChange={(e) => setLogoFormData({ ...logoFormData, accentColor: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 h-10"
                    />
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  disabled={generatingLogo}
                  className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors disabled:opacity-50"
                >
                  {generatingLogo ? 'Generating...' : 'Generate'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowLogoModal(false)}
                  className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
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
