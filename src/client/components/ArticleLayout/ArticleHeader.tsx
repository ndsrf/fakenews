import { ArticleHeaderProps } from '../../types/articleLayout';

/**
 * ArticleHeader Component
 *
 * Displays article title, subtitle, byline metadata, and optional featured image
 * with gradient overlay. Applies brand color to category.
 *
 * @example
 * <ArticleHeader
 *   title="Major News Event Occurs"
 *   subtitle="Details are still emerging"
 *   author="Jane Reporter"
 *   publishedAt="2025-01-15T10:00:00Z"
 *   category="World News"
 *   readTime={5}
 *   featuredImage="/images/featured.jpg"
 *   brandColor="#cc0000"
 * />
 */
export default function ArticleHeader({
  title,
  subtitle,
  author,
  publishedAt,
  category,
  readTime,
  featuredImage,
  brandColor,
}: ArticleHeaderProps) {
  const formattedDate = new Date(publishedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <header className="article-header mb-8">
      {featuredImage && (
        <div className="relative w-full h-96 mb-6 rounded-lg overflow-hidden">
          <img
            src={featuredImage}
            alt={title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
            <h1 className="text-5xl font-bold mb-2 font-sans">{title}</h1>
            {subtitle && (
              <p className="text-2xl font-light opacity-90">{subtitle}</p>
            )}
          </div>
        </div>
      )}

      {!featuredImage && (
        <>
          <h1 className="text-4xl font-bold mb-3 font-sans text-gray-900">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xl text-gray-700 mb-4 font-light">{subtitle}</p>
          )}
        </>
      )}

      <div className="article-byline flex flex-wrap items-center gap-2 text-sm text-gray-600">
        <span className="font-medium text-gray-900">{author}</span>
        <span>•</span>
        <time dateTime={publishedAt}>{formattedDate}</time>
        <span>•</span>
        <span
          className="px-2 py-0.5 rounded text-white font-medium"
          style={brandColor ? { backgroundColor: brandColor } : undefined}
        >
          {category}
        </span>
        {readTime && (
          <>
            <span>•</span>
            <span>{readTime} min read</span>
          </>
        )}
      </div>
    </header>
  );
}
