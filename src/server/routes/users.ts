import { Router } from 'express';
import * as userController from '../controllers/userController.js';
import { authenticate, requireSuperAdmin } from '../middleware/auth.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Update own profile
router.put('/profile', userController.updateProfile);

// Super admin only routes
router.get('/', requireSuperAdmin, userController.getAllUsers);
router.get('/pending', requireSuperAdmin, userController.getPendingUsers);
router.put('/:id/approve', requireSuperAdmin, userController.approveUser);
router.put('/:id/role', requireSuperAdmin, userController.updateUserRole);
router.delete('/:id', requireSuperAdmin, userController.deleteUser);

export default router;
