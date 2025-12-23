import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import AnalyticsFilters, { AnalyticsFilters as FilterType } from '../components/Analytics/AnalyticsFilters';
import AnalyticsCharts, { AnalyticsData } from '../components/Analytics/AnalyticsCharts';
import TopArticlesTable, { TopArticle } from '../components/Analytics/TopArticlesTable';

interface AnalyticsStats {
  totalViews: number;
  totalArticles: number;
  totalBrands: number;
}

interface Brand {
  id: string;
  name: string;
}

interface Article {
  id: string;
  title: string;
}

/**
 * Analytics dashboard page.
 *
 * This component:
 * - Integrates filters, charts, and table components
 * - Fetches analytics data from API with filters
 * - Implements CSV export functionality
 * - Restricts access to authenticated users
 */
export default function Analytics() {
  const { t } = useTranslation();
  const { user, logout, isSuperAdmin } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [topArticles, setTopArticles] = useState<TopArticle[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterType>({});

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Fetch brands and articles for filters
  useEffect(() => {
    const fetchFilterData = async () => {
      try {
        const [brandsRes, articlesRes] = await Promise.all([
          fetch('/api/brands', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          }),
          fetch('/api/articles', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          }),
        ]);

        if (brandsRes.ok) {
          const brandsData = await brandsRes.json();
          setBrands(brandsData.map((b: any) => ({ id: b.id, name: b.name })));
        }
        if (articlesRes.ok) {
          const articlesData = await articlesRes.json();
          // Handle paginated response format {articles: [...], pagination: {...}}
          const articles = Array.isArray(articlesData) ? articlesData : articlesData.articles || [];
          setArticles(articles.map((a: any) => ({ id: a.id, title: a.title })));
        }
      } catch (error) {
        console.error('Failed to fetch filter data:', error);
      }
    };

    if (user) {
      fetchFilterData();
    }
  }, [user]);

  // Fetch analytics data
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const queryParams = new URLSearchParams();
        if (filters.startDate) queryParams.append('startDate', filters.startDate);
        if (filters.endDate) queryParams.append('endDate', filters.endDate);
        if (filters.brandId) queryParams.append('brandId', filters.brandId);
        if (filters.articleId) queryParams.append('articleId', filters.articleId);

        const [overviewRes, viewsRes, deviceRes, geoRes, topRes] = await Promise.all([
          fetch(`/api/analytics/overview?${queryParams}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          }),
          fetch(`/api/analytics/views-over-time?${queryParams}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          }),
          fetch(`/api/analytics/device-breakdown?${queryParams}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          }),
          fetch(`/api/analytics/geographic?${queryParams}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          }),
          fetch(`/api/analytics/top-articles?${queryParams}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          }),
        ]);

        if (overviewRes.ok) {
          const data = await overviewRes.json();
          setStats(data);
        }

        const chartsData: AnalyticsData = {
          viewsOverTime: viewsRes.ok ? await viewsRes.json() : [],
          deviceBreakdown: deviceRes.ok ? await deviceRes.json() : [],
          geographicDistribution: geoRes.ok ? await geoRes.json() : [],
        };
        setAnalyticsData(chartsData);

        if (topRes.ok) {
          setTopArticles(await topRes.json());
        }
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchAnalytics();
    }
  }, [user, filters]);

  const handleExport = async () => {
    try {
      const response = await fetch('/api/analytics/export', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Failed to export analytics:', error);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">{t('analytics.title')}</h1>
          <div className="bg-white shadow rounded-lg p-6">
            <p className="text-gray-600">{t('analytics.loginRequired')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">{t('analytics.title')}</h1>
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
        <div className="flex justify-between items-center mb-8">
          {isSuperAdmin && (
            <button
              onClick={handleExport}
              className="ml-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {t('analytics.export')}
            </button>
          )}
        </div>

        {/* Filters */}
        <AnalyticsFilters
          onFilterChange={setFilters}
          brands={brands}
          articles={articles}
        />

        {/* Overview Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">
                {t('analytics.totalViews')}
              </h3>
              <p className="text-3xl font-bold text-blue-600">
                {(stats.totalViews ?? 0).toLocaleString()}
              </p>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">
                {t('analytics.totalArticles')}
              </h3>
              <p className="text-3xl font-bold text-green-600">
                {(stats.totalArticles ?? 0).toLocaleString()}
              </p>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">
                {t('analytics.totalBrands')}
              </h3>
              <p className="text-3xl font-bold text-purple-600">
                {(stats.totalBrands ?? 0).toLocaleString()}
              </p>
            </div>
          </div>
        )}

        {/* Charts */}
        <div className="mb-6">
          <AnalyticsCharts data={analyticsData} loading={loading} />
        </div>

        {/* Top Articles Table */}
        <TopArticlesTable articles={topArticles} />
      </main>
    </div>
  );
}
