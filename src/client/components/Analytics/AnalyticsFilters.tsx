import { useState } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Filter parameters for analytics queries
 */
export interface AnalyticsFilters {
  startDate?: string;
  endDate?: string;
  brandId?: string;
  articleId?: string;
}

interface AnalyticsFiltersProps {
  onFilterChange: (filters: AnalyticsFilters) => void;
  brands?: Array<{ id: string; name: string }>;
  articles?: Array<{ id: string; title: string }>;
}

/**
 * Analytics filters component.
 *
 * This component:
 * - Provides date range selection
 * - Provides brand and article filters
 * - Emits filter changes to parent component
 * - Uses controlled inputs
 */
export default function AnalyticsFilters({
  onFilterChange,
  brands = [],
  articles = [],
}: AnalyticsFiltersProps) {
  const { t } = useTranslation();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [brandId, setBrandId] = useState('');
  const [articleId, setArticleId] = useState('');

  const handleApplyFilters = () => {
    const filters: AnalyticsFilters = {};
    if (startDate) filters.startDate = startDate;
    if (endDate) filters.endDate = endDate;
    if (brandId) filters.brandId = brandId;
    if (articleId) filters.articleId = articleId;
    onFilterChange(filters);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h3 className="text-lg font-semibold mb-4">
        {t('analytics.filters.title')}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
            {t('analytics.filters.startDate')}
          </label>
          <input
            type="date"
            id="startDate"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
            {t('analytics.filters.endDate')}
          </label>
          <input
            type="date"
            id="endDate"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label htmlFor="brand" className="block text-sm font-medium text-gray-700 mb-1">
            {t('analytics.filters.brand')}
          </label>
          <select
            id="brand"
            value={brandId}
            onChange={(e) => setBrandId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">{t('analytics.filters.allBrands')}</option>
            {brands.map((brand) => (
              <option key={brand.id} value={brand.id}>
                {brand.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="article" className="block text-sm font-medium text-gray-700 mb-1">
            {t('analytics.filters.article')}
          </label>
          <select
            id="article"
            value={articleId}
            onChange={(e) => setArticleId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">{t('analytics.filters.allArticles')}</option>
            {articles.map((article) => (
              <option key={article.id} value={article.id}>
                {article.title}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="mt-4">
        <button
          onClick={handleApplyFilters}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          {t('analytics.filters.apply')}
        </button>
      </div>
    </div>
  );
}
