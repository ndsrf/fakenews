import { Router } from 'express';
import { BrandController } from '../controllers/brandController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.post('/generate-logo', authMiddleware, BrandController.generateLogo);
router.post('/', authMiddleware, BrandController.createBrand);
router.get('/', authMiddleware, BrandController.listBrands);
router.get('/:id', authMiddleware, BrandController.getBrand);
router.put('/:id', authMiddleware, BrandController.updateBrand);
router.delete('/:id', authMiddleware, BrandController.deleteBrand);

export default router;
