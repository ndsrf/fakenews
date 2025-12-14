import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { articlesApi } from '../services/api';
import MDEditor from '@uiw/react-md-editor';
import '@uiw/react-md-editor/markdown-editor.css';
import '@uiw/react-markdown-preview/markdown.css';

interface Article {
  id: string;
  title: string;
  subtitle?: string;
  content: string;
  excerpt: string;
  category: string;
  authorName: string;
  tags: string | string[];
  status: string;
  brandId: string;
  templateId: string;
  language: string;
}

export default function EditArticle() {
  const { t } = useTranslation();
  const { user, logout, token } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState<Partial<Article>>({
    title: '',
    subtitle: '',
    content: '',
    excerpt: '',
    authorName: '',
    tags: [],
  });

  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (id) {
      fetchArticle(id);
    }
  }, [id]);

  const fetchArticle = async (articleId: string) => {
    try {
      setLoading(true);
      setError('');
      const article = await articlesApi.getArticle(articleId, token!);
      
      // Normalize tags
      const tags = typeof article.tags === 'string' ? JSON.parse(article.tags) : (article.tags || []);
      
      setFormData({
        ...article,
        tags,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to fetch article');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      await articlesApi.updateArticle(id, formData, token!);
      setSuccess('Article updated successfully!');
      setTimeout(() => navigate('/articles'), 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to update article');
    } finally {
      setSaving(false);
    }
  };

  const handleAddTag = () => {
    if (!tagInput.trim()) return;
    const currentTags = Array.isArray(formData.tags) ? formData.tags : [];
    if (!currentTags.includes(tagInput.trim())) {
      setFormData({ ...formData, tags: [...currentTags, tagInput.trim()] });
    }
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const currentTags = Array.isArray(formData.tags) ? formData.tags : [];
    setFormData({ 
      ...formData, 
      tags: currentTags.filter(tag => tag !== tagToRemove) 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-600">Loading article...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Edit Article</h1>
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="text-gray-600 hover:text-gray-900">
              Dashboard
            </Link>
            <Link to="/articles" className="text-gray-600 hover:text-gray-900">
              Articles
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
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

        <form onSubmit={handleSave} className="bg-white rounded-lg shadow p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              value={formData.title || ''}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Subtitle</label>
            <input
              type="text"
              value={formData.subtitle || ''}
              onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Author Name</label>
              <input
                type="text"
                value={formData.authorName || ''}
                onChange={(e) => setFormData({ ...formData, authorName: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <input
                type="text"
                value={formData.category || ''}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Excerpt</label>
            <textarea
              value={formData.excerpt || ''}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              rows={3}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Content (Markdown)</label>
            <div data-color-mode="light">
              <MDEditor
                value={formData.content || ''}
                onChange={(val) => setFormData({ ...formData, content: val || '' })}
                height={400}
                preview="live"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Tags</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                placeholder="Add a tag..."
                className="flex-1 border border-gray-300 rounded-md px-3 py-2"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {(Array.isArray(formData.tags) ? formData.tags : []).map((tag, i) => (
                <span
                  key={i}
                  className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-sm flex items-center gap-2"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="text-blue-500 hover:text-blue-700 font-bold"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="flex gap-4 pt-4 border-t">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <Link
              to="/articles"
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors text-center"
            >
              Cancel
            </Link>
          </div>
        </form>
      </main>
    </div>
  );
}
