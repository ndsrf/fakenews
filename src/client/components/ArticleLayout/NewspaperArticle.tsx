import { NewspaperArticleProps } from '../../types/articleLayout';
import ArticleHeader from './ArticleHeader';
import ColumnLayout from './ColumnLayout';
import RelatedArticlesSidebar from './RelatedArticlesSidebar';

/**
 * NewspaperArticle Component
 *
 * Main orchestration component that composes all newspaper layout elements
 * into a complete article presentation. Uses responsive grid layout with
 * main content (2/3 width) and sidebar (1/3 width) on desktop, stacked on mobile.
 *
 * @example
 * <NewspaperArticle article={article} />
 */
export default function NewspaperArticle({ article }: NewspaperArticleProps) {
  const { brand, relatedArticles } = article;
  const brandColor = brand.primaryColor;

  return (
    <article className="newspaper-article bg-white rounded-lg shadow-lg p-8 max-w-7xl mx-auto">
      <ArticleHeader
        title={article.title}
        subtitle={article.subtitle}
        author={article.authorName}
        publishedAt={article.publishedAt}
        category={article.category}
        featuredImage={article.featuredImage}
        brandColor={brandColor}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content area */}
        <div className="lg:col-span-2">
          <ColumnLayout
            content={article.content}
            brandColor={brandColor}
            includeDropCap={true}
          />
        </div>

        {/* Related articles sidebar - only show if there are related articles */}
        {relatedArticles && relatedArticles.length > 0 && (
          <div className="lg:col-span-1">
            <RelatedArticlesSidebar
              articles={relatedArticles}
              brandColor={brandColor}
            />
          </div>
        )}
      </div>
    </article>
  );
}
