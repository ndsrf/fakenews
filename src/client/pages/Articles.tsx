import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { articlesApi, brandsApi } from '../services/api';

interface Article {
  id: string;
  title: string;
  subtitle?: string;
  excerpt: string;
  category: string;
  brandId: string;
  authorName: string;
  slug: string;
  status: string;
  publishedAt?: string;
  readTime?: number;
  tags: string | string[];
  createdAt: string;
  updatedAt: string;
}

interface Brand {
  id: string;
  name: string;
}

export default function Articles() {
  const { t } = useTranslation();
  const { user, logout, token, isSuperAdmin } = useAuth();
  const navigate = useNavigate();
  const [articles, setArticles] = useState<Article[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterBrand, setFilterBrand] = useState('');

  useEffect(() => {
    fetchData();
  }, [filterStatus, filterBrand]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const [articlesData, brandsData] = await Promise.all([
        articlesApi.getAllArticles(token!, {
          status: filterStatus || undefined,
          brandId: filterBrand || undefined,
        }),
        brandsApi.getAllBrands(token!),
      ]);
      setArticles(articlesData);
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

  const handlePublish = async (articleId: string) => {
    if (!confirm('Are you sure you want to publish this article?')) {
      return;
    }

    try {
      await articlesApi.publishArticle(articleId, token!);
      fetchData();
    } catch (err: any) {
      setError(err.message || 'Failed to publish article');
    }
  };

  const handleDelete = async (articleId: string) => {
    if (!confirm('Are you sure you want to delete this article?')) {
      return;
    }

    try {
      await articlesApi.deleteArticle(articleId, token!);
      fetchData();
    } catch (err: any) {
      setError(err.message || 'Failed to delete article');
    }
  };

  const getBrandName = (brandId: string) => {
    const brand = brands.find(b => b.id === brandId);
    return brand ? brand.name : 'Unknown';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Articles</h1>
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="text-gray-600 hover:text-gray-900">
              Dashboard
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

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Your Articles</h2>
            <Link
              to="/articles/create"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Generate New Article
            </Link>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-1">Filter by Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="">All Statuses</option>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Filter by Brand</label>
              <select
                value={filterBrand}
                onChange={(e) => setFilterBrand(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="">All Brands</option>
                {brands.map((brand) => (
                  <option key={brand.id} value={brand.id}>
                    {brand.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <p className="text-gray-600">Loading articles...</p>
          ) : articles.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">No articles found. Generate your first article!</p>
              <Link
                to="/articles/create"
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
              >
                Generate New Article
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {articles.map((article) => (
                <div
                  key={article.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{article.title}</h3>
                        <span
                          className={`px-2 py-1 text-xs rounded ${
                            article.status === 'published'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {article.status}
                        </span>
                        <span className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-800">
                          {article.category}
                        </span>
                      </div>
                      {article.subtitle && (
                        <p className="text-sm text-gray-600 mb-2">{article.subtitle}</p>
                      )}
                      <p className="text-sm text-gray-700 mb-3">{article.excerpt}</p>
                      <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                        <p>Brand: {getBrandName(article.brandId)}</p>
                        <p>Author: {article.authorName}</p>
                        <p>Read Time: {article.readTime || 0} min</p>
                        <p>Created: {formatDate(article.createdAt)}</p>
                      </div>
                      {article.publishedAt && (
                        <p className="text-xs text-gray-600 mt-1">
                          Published: {formatDate(article.publishedAt)}
                        </p>
                      )}
                      {article.tags && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {(Array.isArray(article.tags) ? article.tags : JSON.parse(article.tags || '[]')).map((tag: string, i: number) => (
                            <span
                              key={i}
                              className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-2 ml-4">
                      {article.status === 'draft' && (
                        <button
                          onClick={() => handlePublish(article.id)}
                          className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200 transition-colors"
                        >
                          Publish
                        </button>
                      )}
                      {article.status === 'published' && (
                        <a
                          href={`/${article.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200 transition-colors text-center"
                        >
                          View
                        </a>
                      )}
                      <button
                        onClick={() => navigate(`/articles/edit/${article.id}`)}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(article.id)}
                        className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <h3 className="font-semibold text-blue-900 mb-2">About Articles</h3>
          <p className="text-sm text-blue-800">
            Articles remain in "draft" status until you publish them. Once published, they will be
            viewable at their public URL with prominent fictional content disclaimers. All content
            (author names, quotes, statistics) is completely fictional.
          </p>
        </div>
      </main>
    </div>
  );
}
