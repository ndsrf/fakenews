import { Request, Response } from 'express';
import { db } from '../config/database.js';
import { z } from 'zod';
import { marked } from 'marked';

/**
 * Zod schema for public article request params
 */
const viewArticleParamsSchema = z.object({
  brandSlug: z.string().min(1),
  year: z.string().regex(/^\d{4}$/),
  month: z.string().regex(/^(0[1-9]|1[0-2])$/),
  slug: z.string().min(1),
});

/**
 * Controller for public article viewing.
 *
 * This controller:
 * - Returns 404 for draft articles or not found
 * - Parses URL params (brandSlug, year, month, slug)
 * - Includes brand and related articles in response
 * - Follows ArticleController class pattern with Zod validation
 */
export class PublicController {
  /**
   * View a published article by URL params.
   *
   * Route: GET /:brandSlug/article/:year/:month/:slug
   *
   * @param req - Express request with params
   * @param res - Express response
   */
  static async viewArticle(req: Request, res: Response): Promise<void> {
    try {
      // Validate params
      const params = viewArticleParamsSchema.parse(req.params);

      // Find the brand by slug
      // Generate brand slug by lowercasing and replacing spaces with hyphens
      const brand = await db.newsBrand.findFirst({
        where: {
          name: {
            // SQLite doesn't have great slug support, so we'll search by name
            // and filter by slug logic in JavaScript
            contains: params.brandSlug.replace(/-/g, ' '),
          },
        },
      });

      if (!brand) {
        res.status(404).json({ error: 'Article not found' });
        return;
      }

      // Find the article by slug and brand
      const article = await db.article.findFirst({
        where: {
          slug: params.slug,
          brandId: brand.id,
          status: 'published', // Only show published articles
        },
        include: {
          brand: true,
          template: true,
        },
      });

      if (!article) {
        res.status(404).json({ error: 'Article not found' });
        return;
      }

      // Parse the publishedAt date to check if year/month match
      if (article.publishedAt) {
        const publishDate = new Date(article.publishedAt);
        const year = publishDate.getFullYear().toString();
        const month = (publishDate.getMonth() + 1).toString().padStart(2, '0');

        // Check if the URL year/month match the article's published date
        if (year !== params.year || month !== params.month) {
          res.status(404).json({ error: 'Article not found' });
          return;
        }
      }

      // Parse related articles if they exist
      let relatedArticles = [];
      if (article.relatedArticles && typeof article.relatedArticles === 'string') {
        try {
          relatedArticles = JSON.parse(article.relatedArticles);
        } catch (e) {
          // If parsing fails, leave as empty array
          relatedArticles = [];
        }
      }

      // Convert markdown content to HTML
      const htmlContent = await marked(article.content, { breaks: true, gfm: true });

      // Return the article with brand and related articles
      res.json({
        id: article.id,
        title: article.title,
        subtitle: article.subtitle,
        content: htmlContent,
        excerpt: article.excerpt,
        slug: article.slug,
        language: article.language,
        category: article.category,
        authorName: article.authorName,
        featuredImage: article.featuredImage,
        tags: typeof article.tags === 'string' ? JSON.parse(article.tags) : article.tags,
        publishedAt: article.publishedAt,
        brand: {
          id: brand.id,
          name: brand.name,
          tagline: brand.tagline,
          description: brand.description,
          logoUrl: brand.logoUrl,
          primaryColor: brand.primaryColor,
          accentColor: brand.accentColor,
          websiteUrl: brand.websiteUrl,
        },
        relatedArticles,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Invalid request parameters', details: error.errors });
        return;
      }

      console.error('Error fetching public article:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
