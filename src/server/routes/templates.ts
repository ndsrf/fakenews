import { Router } from 'express';
import { TemplateController } from '../controllers/templateController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.post('/extract', authMiddleware, TemplateController.extractTemplate);
router.post('/', authMiddleware, TemplateController.createTemplate);
router.get('/', authMiddleware, TemplateController.listTemplates);
router.get('/:id', authMiddleware, TemplateController.getTemplate);
router.put('/:id', authMiddleware, TemplateController.updateTemplate);
router.delete('/:id', authMiddleware, TemplateController.deleteTemplate);

export default router;
