import { Request, Response } from 'express';
import { db } from '../config/database.js';

/**
 * Controller for system configuration.
 *
 * This controller:
 * - Returns disclaimer configuration from SystemConfig table
 * - Returns public configuration (no authentication required)
 */
export class ConfigController {
  /**
   * Get disclaimer configuration.
   *
   * Route: GET /api/config/disclaimers
   *
   * @param req - Express request
   * @param res - Express response
   */
  static async getDisclaimers(req: Request, res: Response): Promise<void> {
    try {
      // Fetch all disclaimer configurations
      const disclaimers = await db.systemConfig.findMany({
        where: {
          key: {
            startsWith: 'disclaimer_',
          },
        },
      });

      // Transform to structured format
      const config = {
        banner: {
          en: '',
          es: '',
        },
        footer: {
          en: '',
          es: '',
        },
      };

      disclaimers.forEach((item) => {
        if (item.key === 'disclaimer_banner_en') {
          config.banner.en = item.value;
        } else if (item.key === 'disclaimer_banner_es') {
          config.banner.es = item.value;
        } else if (item.key === 'disclaimer_footer_en') {
          config.footer.en = item.value;
        } else if (item.key === 'disclaimer_footer_es') {
          config.footer.es = item.value;
        }
      });

      res.json(config);
    } catch (error) {
      console.error('Error fetching disclaimer config:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
