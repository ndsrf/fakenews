import { db } from '../config/database.js';
import { z } from 'zod';
import { Response } from 'express';

/**
 * Zod schema for analytics filters
 */
export const AnalyticsFiltersSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  brandId: z.string().uuid().optional(),
  articleId: z.string().uuid().optional(),
  limit: z.number().int().positive().optional(),
  offset: z.number().int().nonnegative().optional(),
});

export type AnalyticsFilters = z.infer<typeof AnalyticsFiltersSchema>;

/**
 * Global statistics interface
 */
export interface GlobalStats {
  totalViews: number;
  totalArticles: number;
  totalBrands: number;
}

/**
 * Views over time interface
 */
export interface ViewsOverTime {
  date: string;
  views: number;
}

/**
 * Device breakdown interface
 */
export interface DeviceBreakdown {
  device: string;
  count: number;
  percentage: number;
}

/**
 * Geographic distribution interface
 */
export interface GeographicDistribution {
  country: string;
  count: number;
}

/**
 * Top article interface
 */
export interface TopArticle {
  id: string;
  title: string;
  brand: string;
  views: number;
  lastViewed: Date;
}

/**
 * Analytics service for data aggregation and reporting.
 *
 * This service:
 * - Uses Prisma aggregations for efficient queries
 * - Validates filters with Zod schemas
 * - Handles empty results gracefully
 * - Follows BrandService class pattern
 */
export class AnalyticsService {
  /**
   * Get global analytics statistics.
   *
   * @param filters - Optional filters (startDate, endDate, brandId, articleId)
   * @returns Global stats (total views, articles, brands)
   */
  static async getGlobalStats(filters: AnalyticsFilters = {}): Promise<GlobalStats> {
    try {
      // Build where clause for page views
      const pageViewWhere: any = {};
      if (filters.startDate) {
        pageViewWhere.timestamp = { ...pageViewWhere.timestamp, gte: new Date(filters.startDate) };
      }
      if (filters.endDate) {
        pageViewWhere.timestamp = { ...pageViewWhere.timestamp, lte: new Date(filters.endDate) };
      }
      if (filters.brandId) {
        pageViewWhere.brandId = filters.brandId;
      }
      if (filters.articleId) {
        pageViewWhere.articleId = filters.articleId;
      }

      // Get total views count with filters
      const totalViews = await db.pageView.count({
        where: Object.keys(pageViewWhere).length > 0 ? pageViewWhere : undefined,
      });

      // Build where clause for articles
      const articleWhere: any = {
        status: 'published',
      };
      if (filters.brandId) {
        articleWhere.brandId = filters.brandId;
      }
      if (filters.articleId) {
        articleWhere.id = filters.articleId;
      }

      // Get total published articles count with filters
      const totalArticles = await db.article.count({
        where: articleWhere,
      });

      // Build where clause for brands
      const brandWhere: any = {
        isActive: true,
      };
      if (filters.brandId) {
        brandWhere.id = filters.brandId;
      }

      // Get total active brands count with filters
      const totalBrands = await db.newsBrand.count({
        where: brandWhere,
      });

      return {
        totalViews,
        totalArticles,
        totalBrands,
      };
    } catch (error) {
      console.error('Error fetching global stats:', error);
      // Return zeros on error rather than throwing
      return {
        totalViews: 0,
        totalArticles: 0,
        totalBrands: 0,
      };
    }
  }

  /**
   * Get views over time (time series data).
   *
   * @param filters - Optional filters (startDate, endDate, brandId, articleId)
   * @returns Array of {date, views} objects
   */
  static async getViewsOverTime(filters: AnalyticsFilters = {}): Promise<ViewsOverTime[]> {
    try {
      // Build the where clause based on filters
      const where: any = {};

      if (filters.startDate || filters.endDate) {
        where.timestamp = {};
        if (filters.startDate) {
          where.timestamp.gte = new Date(filters.startDate);
        }
        if (filters.endDate) {
          where.timestamp.lte = new Date(filters.endDate);
        }
      }

      if (filters.articleId) {
        where.articleId = filters.articleId;
      }

      if (filters.brandId) {
        // Join through article to filter by brand
        where.article = {
          brandId: filters.brandId,
        };
      }

      // Get page views grouped by date
      // SQLite doesn't have native DATE() function, so we'll fetch all and group in JavaScript
      const pageViews = await db.pageView.findMany({
        where,
        select: {
          timestamp: true,
        },
        orderBy: {
          timestamp: 'asc',
        },
      });

      // Group by date (YYYY-MM-DD)
      const viewsByDate = pageViews.reduce((acc, view) => {
        const date = view.timestamp.toISOString().split('T')[0]; // Get YYYY-MM-DD
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Convert to array format
      const result: ViewsOverTime[] = Object.entries(viewsByDate).map(([date, views]) => ({
        date,
        views,
      }));

      return result;
    } catch (error) {
      console.error('Error fetching views over time:', error);
      // Return empty array on error rather than throwing
      return [];
    }
  }

  /**
   * Get device breakdown (distribution by device type).
   *
   * @param filters - Optional filters (startDate, endDate, brandId, articleId)
   * @returns Array of {device, count, percentage} objects
   */
  static async getDeviceBreakdown(filters: AnalyticsFilters = {}): Promise<DeviceBreakdown[]> {
    try {
      // Build the where clause based on filters
      const where: any = {};

      if (filters.startDate || filters.endDate) {
        where.timestamp = {};
        if (filters.startDate) {
          where.timestamp.gte = new Date(filters.startDate);
        }
        if (filters.endDate) {
          where.timestamp.lte = new Date(filters.endDate);
        }
      }

      if (filters.articleId) {
        where.articleId = filters.articleId;
      }

      if (filters.brandId) {
        where.article = {
          brandId: filters.brandId,
        };
      }

      // Get all page views with device information
      const pageViews = await db.pageView.findMany({
        where,
        select: {
          device: true,
        },
      });

      // Group by device and count
      const deviceCounts = pageViews.reduce((acc, view) => {
        const device = view.device || 'unknown';
        acc[device] = (acc[device] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const totalViews = pageViews.length;

      // Convert to array format with percentages
      const result: DeviceBreakdown[] = Object.entries(deviceCounts).map(([device, count]) => ({
        device,
        count,
        percentage: totalViews > 0 ? (count / totalViews) * 100 : 0,
      }));

      // Sort by count descending
      result.sort((a, b) => b.count - a.count);

      return result;
    } catch (error) {
      console.error('Error fetching device breakdown:', error);
      return [];
    }
  }

  /**
   * Get geographic distribution (by country).
   *
   * @param filters - Optional filters (startDate, endDate, brandId, articleId)
   * @returns Array of {country, count} objects
   */
  static async getGeographicDistribution(filters: AnalyticsFilters = {}): Promise<GeographicDistribution[]> {
    try {
      // Build the where clause based on filters
      const where: any = {};

      if (filters.startDate || filters.endDate) {
        where.timestamp = {};
        if (filters.startDate) {
          where.timestamp.gte = new Date(filters.startDate);
        }
        if (filters.endDate) {
          where.timestamp.lte = new Date(filters.endDate);
        }
      }

      if (filters.articleId) {
        where.articleId = filters.articleId;
      }

      if (filters.brandId) {
        where.article = {
          brandId: filters.brandId,
        };
      }

      // Get all page views with country information
      const pageViews = await db.pageView.findMany({
        where,
        select: {
          country: true,
        },
      });

      // Group by country and count
      const countryCounts = pageViews.reduce((acc, view) => {
        const country = view.country || 'unknown';
        acc[country] = (acc[country] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Convert to array format
      const result: GeographicDistribution[] = Object.entries(countryCounts).map(([country, count]) => ({
        country,
        count,
      }));

      // Sort by count descending
      result.sort((a, b) => b.count - a.count);

      return result;
    } catch (error) {
      console.error('Error fetching geographic distribution:', error);
      return [];
    }
  }

  /**
   * Get top articles by view count.
   *
   * @param filters - Optional filters (startDate, endDate, brandId, limit)
   * @returns Array of top articles with view counts
   */
  static async getTopArticles(filters: AnalyticsFilters = {}): Promise<TopArticle[]> {
    try {
      // Build the where clause based on filters
      const where: any = {};

      if (filters.startDate || filters.endDate) {
        where.timestamp = {};
        if (filters.startDate) {
          where.timestamp.gte = new Date(filters.startDate);
        }
        if (filters.endDate) {
          where.timestamp.lte = new Date(filters.endDate);
        }
      }

      if (filters.brandId) {
        where.article = {
          brandId: filters.brandId,
        };
      }

      // Get all page views with article information
      const pageViews = await db.pageView.findMany({
        where,
        include: {
          article: {
            include: {
              brand: true,
            },
          },
        },
        orderBy: {
          timestamp: 'desc',
        },
      });

      // Group by article and count views
      const articleStats = pageViews.reduce((acc, view) => {
        const articleId = view.articleId;
        if (!acc[articleId]) {
          acc[articleId] = {
            id: articleId,
            title: view.article.title,
            brand: view.article.brand.name,
            views: 0,
            lastViewed: view.timestamp,
          };
        }
        acc[articleId].views += 1;
        // Update last viewed if this view is more recent
        if (view.timestamp > acc[articleId].lastViewed) {
          acc[articleId].lastViewed = view.timestamp;
        }
        return acc;
      }, {} as Record<string, TopArticle>);

      // Convert to array and sort by views
      const result = Object.values(articleStats);
      result.sort((a, b) => b.views - a.views);

      // Apply limit if specified
      const limit = filters.limit || 10;
      return result.slice(0, limit);
    } catch (error) {
      console.error('Error fetching top articles:', error);
      return [];
    }
  }

  /**
   * Stream analytics data as CSV.
   *
   * This method:
   * - Streams data in batches of 1000 records to avoid memory issues
   * - Sets appropriate CSV headers
   * - Escapes CSV values properly
   * - Does NOT include raw or hashed IPs in the export
   *
   * @param res - Express response object to stream to
   * @param filters - Optional filters (startDate, endDate, brandId, articleId)
   */
  static async streamAnalyticsCSV(res: Response, filters: AnalyticsFilters = {}): Promise<void> {
    try {
      // Set CSV headers
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename=analytics.csv');

      // Build the where clause based on filters
      const where: any = {};

      if (filters.startDate || filters.endDate) {
        where.timestamp = {};
        if (filters.startDate) {
          where.timestamp.gte = new Date(filters.startDate);
        }
        if (filters.endDate) {
          where.timestamp.lte = new Date(filters.endDate);
        }
      }

      if (filters.articleId) {
        where.articleId = filters.articleId;
      }

      if (filters.brandId) {
        where.article = {
          brandId: filters.brandId,
        };
      }

      // Write CSV header row
      res.write('Timestamp,Article,Brand,Country,City,Browser,OS,Device,Referrer\n');

      // Stream data in batches
      let skip = 0;
      const take = 1000;

      while (true) {
        const batch = await db.pageView.findMany({
          where,
          take,
          skip,
          include: {
            article: {
              include: {
                brand: true,
              },
            },
          },
          orderBy: {
            timestamp: 'desc',
          },
        });

        // If no more records, break
        if (batch.length === 0) {
          break;
        }

        // Write each record as a CSV row
        for (const view of batch) {
          const row = [
            view.timestamp.toISOString(),
            this.escapeCsvValue(view.article.title),
            this.escapeCsvValue(view.article.brand.name),
            this.escapeCsvValue(view.country || ''),
            this.escapeCsvValue(view.city || ''),
            this.escapeCsvValue(view.browser || ''),
            this.escapeCsvValue(view.os || ''),
            this.escapeCsvValue(view.device || ''),
            this.escapeCsvValue(view.referrer || ''),
          ].join(',');

          res.write(row + '\n');
        }

        skip += take;

        // If we got fewer records than requested, we're done
        if (batch.length < take) {
          break;
        }
      }

      // End the response
      res.end();
    } catch (error) {
      console.error('Error streaming CSV:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Failed to export analytics data' });
      }
    }
  }

  /**
   * Escape CSV values to prevent injection and handle special characters.
   *
   * @param value - Value to escape
   * @returns Escaped CSV value
   */
  private static escapeCsvValue(value: string): string {
    if (!value) {
      return '';
    }

    // If value contains comma, quote, or newline, wrap in quotes and escape quotes
    if (value.includes(',') || value.includes('"') || value.includes('\n') || value.includes('\r')) {
      return `"${value.replace(/"/g, '""')}"`;
    }

    return value;
  }
}
