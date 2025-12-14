import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { articlesApi } from '../services/api';

interface Article {
  id: string;
  title: string;
  subtitle?: string;
  content: string;
  excerpt: string;
  authorName: string;
  category: string;
  featuredImage?: string;
  publishedAt: string;
  readTime: number;
  tags: string;
  brand: {
    id: string;
    name: string;
    logoUrl?: string;
    websiteUrl: string;
    primaryColor?: string;
    accentColor?: string;
  };
  template: {
    id: string;
    name: string;
    cssStyles: string;
    htmlStructure: string;
  };
}

export default function ArticleView() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticle = async () => {
      if (!slug) {
        setError('Article not found');
        setLoading(false);
        return;
      }

      try {
        const data = await articlesApi.getArticleBySlug(slug);
        setArticle(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load article');
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-600">Loading article...</p>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Article not found'}</p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const tags = article.tags ? JSON.parse(article.tags) : [];
  const primaryColor = article.brand.primaryColor || '#1e40af';
  const accentColor = article.brand.accentColor || '#3b82f6';

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: article.template.cssStyles }} />
      <div className="min-h-screen bg-gray-50">
        {/* Header with brand info */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {article.brand.logoUrl && (
                  <img
                    src={article.brand.logoUrl}
                    alt={article.brand.name}
                    className="h-10 w-10 object-contain"
                  />
                )}
                <div>
                  <h1 className="text-xl font-bold" style={{ color: primaryColor }}>
                    {article.brand.name}
                  </h1>
                  <a
                    href={article.brand.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    {article.brand.websiteUrl}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Article content */}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <article className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Featured image */}
            {article.featuredImage && (
              <div className="w-full h-96 overflow-hidden">
                <img
                  src={article.featuredImage}
                  alt={article.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Article header */}
            <div className="p-8">
              <div className="mb-4">
                <span
                  className="inline-block px-3 py-1 text-sm font-semibold rounded-full"
                  style={{ backgroundColor: accentColor, color: 'white' }}
                >
                  {article.category}
                </span>
              </div>

              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                {article.title}
              </h1>

              {article.subtitle && (
                <h2 className="text-xl text-gray-600 mb-6">
                  {article.subtitle}
                </h2>
              )}

              <div className="flex items-center justify-between text-sm text-gray-500 mb-6 pb-6 border-b">
                <div className="flex items-center space-x-4">
                  <span className="font-semibold">By {article.authorName}</span>
                  <span>•</span>
                  <span>
                    {new Date(article.publishedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                  <span>•</span>
                  <span>{article.readTime} min read</span>
                </div>
              </div>

              {/* Article content */}
              <div
                className="prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{ __html: article.content }}
              />

              {/* Tags */}
              {tags.length > 0 && (
                <div className="mt-8 pt-6 border-t">
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag: string, index: number) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </article>

          {/* Disclaimer */}
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-800">
              <strong>Disclaimer:</strong> This is a fictional article generated for
              demonstration purposes. All events, quotes, and statistics are entirely
              fabricated.
            </p>
          </div>
        </main>
      </div>
    </>
  );
}
