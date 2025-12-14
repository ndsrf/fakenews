import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { articlesApi, brandsApi, templatesApi } from '../services/api';
import ReactMarkdown from 'react-markdown';

interface Brand {
  id: string;
  name: string;
  categories: string | string[];
}

interface Template {
  id: string;
  name: string;
  isActive: boolean;
}

interface GenerationFormData {
  brandId: string;
  templateId: string;
  topic: string;
  tone: 'serious' | 'satirical' | 'dramatic' | 'investigative';
  length: 'short' | 'medium' | 'long';
  category: string;
  includeQuotes: boolean;
  includeStatistics: boolean;
  includeCharts: boolean;
  generateRelatedTitles: number;
  language: 'en' | 'es';
  aiProvider: 'openai' | 'anthropic' | 'gemini';
}

export default function CreateArticle() {
  const { t } = useTranslation();
  const { user, logout, token } = useAuth();
  const navigate = useNavigate();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [generatedArticle, setGeneratedArticle] = useState<any>(null);

  const [formData, setFormData] = useState<GenerationFormData>({
    brandId: '',
    templateId: '',
    topic: '',
    tone: 'serious',
    length: 'medium',
    category: '',
    includeQuotes: true,
    includeStatistics: true,
    includeCharts: false,
    generateRelatedTitles: 3,
    language: 'en',
    aiProvider: 'openai',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const [brandsData, templatesData] = await Promise.all([
        brandsApi.getAllBrands(token!),
        templatesApi.getAllTemplates(token!),
      ]);
      setBrands(brandsData);
      const activeTemplates = templatesData.filter((t: Template) => t.isActive);
      setTemplates(activeTemplates);

      // Auto-select first template if available
      if (activeTemplates.length > 0 && !formData.templateId) {
        setFormData(prev => ({ ...prev, templateId: activeTemplates[0].id }));
      }
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

  const getAvailableCategories = () => {
    if (!formData.brandId) return [];
    const brand = brands.find(b => b.id === formData.brandId);
    if (!brand) return [];
    return Array.isArray(brand.categories) ? brand.categories : JSON.parse(brand.categories || '[]');
  };

  const handleGenerateArticle = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.brandId) {
      setError('Please select a brand.');
      return;
    }

    if (!formData.category) {
      setError('Please select a category.');
      return;
    }

    if (!formData.topic) {
      setError('Please enter a topic.');
      return;
    }

    if (!formData.templateId) {
      setError('Please select a template.');
      return;
    }

    setGenerating(true);
    setError('');
    setSuccess('');
    setGeneratedArticle(null);

    try {
      console.log('Generating article with data:', formData);
      const result = await articlesApi.generateArticle(formData, token!);
      
      // Normalize data structure from API
      const normalizedResult = {
        ...result,
        tags: typeof result.tags === 'string' ? JSON.parse(result.tags) : result.tags,
        relatedTitles: result.relatedArticles && typeof result.relatedArticles === 'string' 
          ? JSON.parse(result.relatedArticles) 
          : (result.relatedTitles || []),
        // Keep relatedArticles as array for consistency
        relatedArticles: result.relatedArticles && typeof result.relatedArticles === 'string'
          ? JSON.parse(result.relatedArticles)
          : result.relatedArticles
      };

      setGeneratedArticle(normalizedResult);
      setSuccess('Article generated successfully! You can now edit and publish it.');
    } catch (err: any) {
      console.error('Generation error:', err);
      setError(err.message || 'Failed to generate article');
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveArticle = async () => {
    if (!generatedArticle) return;

    if (!formData.brandId) {
      setError('Please select a brand.');
      return;
    }

    if (!formData.templateId) {
      setError('Please select a template.');
      return;
    }

    try {
      const tags = typeof generatedArticle.tags === 'string' 
        ? JSON.parse(generatedArticle.tags) 
        : generatedArticle.tags;
        
      const relatedArticles = typeof generatedArticle.relatedArticles === 'string'
        ? JSON.parse(generatedArticle.relatedArticles)
        : generatedArticle.relatedArticles;

      await articlesApi.createArticle({
        ...generatedArticle,
        tags,
        relatedArticles,
        templateId: formData.templateId,
        brandId: formData.brandId,
      }, token!);
      setSuccess('Article saved successfully!');
      setTimeout(() => navigate('/articles'), 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to save article');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Generate Article</h1>
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="text-gray-600 hover:text-gray-900">
              Dashboard
            </Link>
            <Link to="/articles" className="text-gray-600 hover:text-gray-900">
              Articles
            </Link>
            <Link to="/brands" className="text-gray-600 hover:text-gray-900">
              Brands
            </Link>
            <Link to="/templates" className="text-gray-600 hover:text-gray-900">
              Templates
            </Link>
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

        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
            <p className="text-green-800">{success}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Generation Form */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Article Parameters</h2>
            <form onSubmit={handleGenerateArticle}>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Template *</label>
                  <select
                    value={formData.templateId}
                    onChange={(e) => setFormData({ ...formData, templateId: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    required
                  >
                    <option value="">Select a template</option>
                    {templates.map((template) => (
                      <option key={template.id} value={template.id}>
                        {template.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Brand *</label>
                  <select
                    value={formData.brandId}
                    onChange={(e) => setFormData({ ...formData, brandId: e.target.value, category: '' })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    required
                  >
                    <option value="">Select a brand</option>
                    {brands.map((brand) => (
                      <option key={brand.id} value={brand.id}>
                        {brand.name}
                      </option>
                    ))}
                  </select>
                </div>

                {formData.brandId && (
                  <div>
                    <label className="block text-sm font-medium mb-1">Category *</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      required
                    >
                      <option value="">Select a category</option>
                      {getAvailableCategories().map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium mb-1">Topic *</label>
                  <input
                    type="text"
                    value={formData.topic}
                    onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                    placeholder="e.g., Latest developments in quantum computing"
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Tone</label>
                    <select
                      value={formData.tone}
                      onChange={(e) => setFormData({ ...formData, tone: e.target.value as any })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                    >
                      <option value="serious">Serious</option>
                      <option value="satirical">Satirical</option>
                      <option value="dramatic">Dramatic</option>
                      <option value="investigative">Investigative</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Length</label>
                    <select
                      value={formData.length}
                      onChange={(e) => setFormData({ ...formData, length: e.target.value as any })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                    >
                      <option value="short">Short (~300 words)</option>
                      <option value="medium">Medium (~800 words)</option>
                      <option value="long">Long (~1500+ words)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Language</label>
                    <select
                      value={formData.language}
                      onChange={(e) => setFormData({ ...formData, language: e.target.value as any })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                    >
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">AI Provider</label>
                    <select
                      value={formData.aiProvider}
                      onChange={(e) => setFormData({ ...formData, aiProvider: e.target.value as any })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                    >
                      <option value="openai">OpenAI (GPT-4)</option>
                      <option value="anthropic">Anthropic (Claude)</option>
                      <option value="gemini">Google (Gemini)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Related Titles</label>
                  <input
                    type="number"
                    min="3"
                    max="5"
                    value={formData.generateRelatedTitles}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      setFormData({ 
                        ...formData, 
                        generateRelatedTitles: isNaN(val) ? 3 : val 
                      });
                    }}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                  <p className="text-xs text-gray-600 mt-1">Number of related article titles for sidebar (3-5)</p>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.includeQuotes}
                      onChange={(e) => setFormData({ ...formData, includeQuotes: e.target.checked })}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm">Include quotes</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.includeStatistics}
                      onChange={(e) => setFormData({ ...formData, includeStatistics: e.target.checked })}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm">Include statistics</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.includeCharts}
                      onChange={(e) => setFormData({ ...formData, includeCharts: e.target.checked })}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm">Include charts</span>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={generating || loading}
                className="w-full mt-6 bg-blue-600 text-white px-4 py-3 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 font-semibold"
              >
                {generating ? 'Generating Article...' : 'Generate Article'}
              </button>
            </form>
          </div>

          {/* Preview Panel */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Preview</h2>
            {generating && (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Generating your article...</p>
                  <p className="text-sm text-gray-500 mt-2">This may take 30-60 seconds</p>
                </div>
              </div>
            )}

            {!generating && !generatedArticle && (
              <div className="text-center py-12 text-gray-500">
                <p>Fill out the form and click "Generate Article" to see your generated content here.</p>
              </div>
            )}

            {generatedArticle && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-2xl font-bold mb-2">{generatedArticle.title}</h3>
                  {generatedArticle.subtitle && (
                    <p className="text-lg text-gray-600 mb-3">{generatedArticle.subtitle}</p>
                  )}
                  <p className="text-sm text-gray-500">
                    By {generatedArticle.authorName} | Read time: {generatedArticle.readTime || 0} min
                  </p>
                </div>

                <div className="border-t pt-4">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Excerpt:</p>
                  <p className="text-gray-700 italic">{generatedArticle.excerpt}</p>
                </div>

                <div className="border-t pt-4">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Content Preview:</p>
                  <div className="prose max-w-none text-sm max-h-64 overflow-y-auto border border-gray-200 rounded p-3 bg-gray-50">
                    <ReactMarkdown>{generatedArticle.content}</ReactMarkdown>
                  </div>
                </div>

                {generatedArticle.relatedTitles && generatedArticle.relatedTitles.length > 0 && (
                  <div className="border-t pt-4">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Related Articles:</p>
                    <ul className="list-disc list-inside text-sm text-gray-700">
                      {generatedArticle.relatedTitles.map((title: any, i: number) => (
                        <li key={i}>{typeof title === 'string' ? title : title.title}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {generatedArticle.tags && generatedArticle.tags.length > 0 && (
                  <div className="border-t pt-4">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Tags:</p>
                    <div className="flex flex-wrap gap-2">
                      {generatedArticle.tags.map((tag: string, i: number) => (
                        <span
                          key={i}
                          className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="border-t pt-4 flex gap-3">
                  <button
                    onClick={handleSaveArticle}
                    className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                  >
                    Save Article
                  </button>
                  <button
                    onClick={() => setGeneratedArticle(null)}
                    className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
                  >
                    Clear
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Warning Box */}
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-sm text-yellow-800 font-semibold mb-1">IMPORTANT: Fictional Content</p>
          <p className="text-sm text-yellow-800">
            All generated articles are completely fictional. They will be clearly marked with disclaimers
            when published. Generated content includes fictional author names, quotes, and statistics.
          </p>
        </div>
      </main>
    </div>
  );
}
