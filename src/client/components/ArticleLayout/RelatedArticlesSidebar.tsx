import { useTranslation } from 'react-i18next';
import { RelatedArticlesSidebarProps } from '../../types/articleLayout';

/**
 * RelatedArticlesSidebar Component
 *
 * Displays a list of related articles in a sidebar (sticky on desktop).
 * Shows article thumbnails, titles, and category badges with brand colors.
 * Responsive: sticky on desktop, horizontal scrollable or stacked on mobile/tablet.
 *
 * @example
 * <RelatedArticlesSidebar
 *   articles={relatedArticles}
 *   brandColor="#cc0000"
 *   onArticleClick={(id) => navigate(`/article/${id}`)}
 * />
 */
export default function RelatedArticlesSidebar({
  articles,
  brandColor,
  onArticleClick,
}: RelatedArticlesSidebarProps) {
  const { t } = useTranslation();

  if (!articles || articles.length === 0) {
    return null;
  }

  const handleClick = (articleId: string) => {
    if (onArticleClick) {
      onArticleClick(articleId);
    }
  };

  return (
    <aside className="related-articles lg:sticky lg:top-24">
      <h2 className="text-2xl font-bold mb-4 font-sans">
        {t('common:relatedArticles', 'Related Articles')}
      </h2>

      {/* Desktop: Stacked cards */}
      <div className="hidden lg:flex flex-col gap-4">
        {articles.map((article) => (
          <button
            key={article.id}
            onClick={() => handleClick(article.id)}
            className="related-article-card text-left transition-shadow hover:shadow-md"
          >
            {article.featuredImage && (
              <img
                src={article.featuredImage}
                alt={article.title}
                className="related-article-thumbnail mb-2"
              />
            )}
            <h3 className="text-base font-semibold mb-1 line-clamp-2">
              {article.title}
            </h3>
            <span
              className="inline-block text-xs px-2 py-0.5 rounded text-white"
              style={brandColor ? { backgroundColor: brandColor } : undefined}
            >
              {article.category}
            </span>
          </button>
        ))}
      </div>

      {/* Mobile/Tablet: Horizontal scroll */}
      <div className="lg:hidden overflow-x-auto">
        <div className="flex gap-4 pb-2">
          {articles.map((article) => (
            <button
              key={article.id}
              onClick={() => handleClick(article.id)}
              className="related-article-card flex-shrink-0 w-64 text-left"
            >
              {article.featuredImage && (
                <img
                  src={article.featuredImage}
                  alt={article.title}
                  className="related-article-thumbnail mb-2"
                />
              )}
              <h3 className="text-base font-semibold mb-1 line-clamp-2">
                {article.title}
              </h3>
              <span
                className="inline-block text-xs px-2 py-0.5 rounded text-white"
                style={brandColor ? { backgroundColor: brandColor } : undefined}
              >
                {article.category}
              </span>
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
