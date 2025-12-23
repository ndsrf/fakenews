import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import DisclaimerBanner from '../components/PublicArticle/DisclaimerBanner';
import Watermark from '../components/PublicArticle/Watermark';
import DisclaimerFooter from '../components/PublicArticle/DisclaimerFooter';
import NewspaperArticle from '../components/ArticleLayout/NewspaperArticle';

interface Article {
  id: string;
  title: string;
  subtitle?: string;
  content: string;
  excerpt: string;
  slug: string;
  language: string;
  category: string;
  authorName: string;
  featuredImage?: string;
  tags: string[];
  publishedAt: string;
  brand: {
    id: string;
    name: string;
    tagline?: string;
    logoUrl?: string;
    primaryColor: string;
    accentColor: string;
  };
  relatedArticles: Array<{ title: string }>;
}

/**
 * Public article viewing page.
 *
 * This page:
 * - Displays published articles to the public
 * - Includes all disclaimer components (banner, watermark, footer)
 * - Adds SEO meta tags with noindex/nofollow
 * - Shows related articles in sidebar
 * - Handles loading and error states
 */
export default function PublicArticle() {
  const { brandSlug, year, month, slug } = useParams<{
    brandSlug: string;
    year: string;
    month: string;
    slug: string;
  }>();
  const { t } = useTranslation();

  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/${brandSlug}/article/${year}/${month}/${slug}`);

        if (!response.ok) {
          if (response.status === 404) {
            setError(t('public.notFound'));
          } else {
            setError('Failed to load article');
          }
          return;
        }

        const data = await response.json();
        setArticle(data);
      } catch (err) {
        setError('Failed to load article');
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [brandSlug, year, month, slug, t]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-xl">{t('common.loading')}</p>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">404</h1>
          <p className="text-xl text-gray-600">{error || t('public.notFound')}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>[FICTIONAL] {article.title}</title>
        <meta name="robots" content="noindex, nofollow" />
        <meta property="og:title" content={`[FICTIONAL] ${article.title}`} />
        <meta property="og:description" content={`[FICTIONAL] ${article.excerpt}`} />
        <meta property="og:type" content="article" />
      </Helmet>

      <DisclaimerBanner />
      <Watermark />

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <NewspaperArticle article={article} />
      </div>

      <DisclaimerFooter />
    </>
  );
}
