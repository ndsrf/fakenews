import { Router } from 'express';
import { ConfigController } from '../controllers/configController.js';

const router = Router();

/**
 * Config routes
 * These routes provide public system configuration
 */

/**
 * GET /api/config/disclaimers
 * Get disclaimer configuration (banner and footer text in EN/ES)
 * Public route - no authentication required
 */
router.get('/disclaimers', ConfigController.getDisclaimers);

export default router;
