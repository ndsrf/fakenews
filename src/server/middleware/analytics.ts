import { Request, Response, NextFunction } from 'express';
import { db } from '../config/database.js';
import { anonymizeIP } from '../utils/ipAnonymizer.js';
import { parseUserAgent } from '../utils/userAgentParser.js';
import { geoipService } from '../services/geoipService.js';
import logger from '../config/logger.js';

/**
 * Middleware to track page views on public articles.
 *
 * This middleware:
 * - Runs asynchronously without blocking the response
 * - Uses IP anonymization for GDPR compliance
 * - Extracts browser, OS, device from user agent
 * - Looks up geographic location from IP
 * - Handles all errors gracefully (logs but doesn't fail the request)
 */
export function trackPageView(req: Request, res: Response, next: NextFunction): void {
  // Continue to the next middleware immediately
  next();

  // Track the page view after the response is sent
  // This ensures tracking doesn't block the response
  res.on('finish', async () => {
    // Extract article ID from request params outside try block
    // so it's available in the catch block for error logging
    const articleSlug = req.params.slug;

    try {
      // The route should have :slug or article ID in params

      if (!articleSlug) {
        // No article slug, skip tracking
        return;
      }

      // Get the raw IP address (before anonymization)
      const rawIP = req.ip || req.socket.remoteAddress || null;

      // Anonymize the IP address for GDPR compliance
      const anonymizedIP = anonymizeIP(rawIP);

      // Parse user agent
      const userAgent = req.headers['user-agent'];
      const uaInfo = parseUserAgent(userAgent);

      // Look up geographic location
      const geoInfo = geoipService.lookup(rawIP);

      // Get referrer
      const referrerHeader = req.headers.referer || req.headers.referrer;
      const referrer = Array.isArray(referrerHeader) ? referrerHeader[0] : referrerHeader || null;

      // Find the article by slug
      // We need to find the article first to get its ID
      const article = await db.article.findFirst({
        where: {
          slug: articleSlug,
          status: 'published', // Only track published articles
        },
      });

      if (!article) {
        // Article not found or not published, skip tracking
        return;
      }

      // Create the page view record
      await db.pageView.create({
        data: {
          articleId: article.id,
          ipAddress: anonymizedIP || 'unknown',
          country: geoInfo.country,
          city: geoInfo.city,
          browser: uaInfo.browser,
          os: uaInfo.os,
          device: uaInfo.device,
          referrer: referrer || null,
        },
      });

      // Successfully tracked the page view
    } catch (error) {
      // Log the error but don't fail the request
      // We don't want tracking failures to affect the user experience
      logger.error('Page view tracking error', {
        message: error instanceof Error ? error.message : 'Unknown error',
        articleSlug,
        path: req.path,
      });
    }
  });
}
