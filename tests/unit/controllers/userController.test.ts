import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { Request, Response, NextFunction } from 'express';
import { approveUser, deleteUser, updateUserRole, getAllUsers, getPendingUsers, updateProfile } from '../../../src/server/controllers/userController';
import prisma from '../../../src/server/config/database';
import bcrypt from 'bcrypt';

// Mock dependencies
jest.mock('../../../src/server/config/database', () => ({
  __esModule: true,
  default: {
    user: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
  },
}));

jest.mock('bcrypt');

describe('User Controller', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;
  const mockJson = jest.fn();
  const mockStatus = jest.fn().mockReturnValue({ json: mockJson });

  beforeEach(() => {
    req = {
      params: {},
      body: {},
      user: { userId: 'admin-id', email: 'admin@test.com', role: 'super_admin' },
    };
    res = {
      status: mockStatus,
      json: mockJson,
    } as unknown as Response;
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('getAllUsers', () => {
    it('should return all users', async () => {
      const mockUsers = [{ id: '1', name: 'User 1' }, { id: '2', name: 'User 2' }];
      (prisma.user.findMany as jest.Mock).mockResolvedValue(mockUsers);

      await getAllUsers(req as Request, res as Response, next);

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({ users: mockUsers });
    });
  });

  describe('approveUser', () => {
    it('should approve a pending user', async () => {
      req.params = { id: 'user-id' };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: 'user-id', isApproved: false });
      (prisma.user.update as jest.Mock).mockResolvedValue({ id: 'user-id', isApproved: true });

      await approveUser(req as Request, res as Response, next);

      expect(prisma.user.update).toHaveBeenCalledWith(expect.objectContaining({
        where: { id: 'user-id' },
        data: { isApproved: true },
      }));
      expect(mockStatus).toHaveBeenCalledWith(200);
    });

    it('should return 404 if user not found', async () => {
      req.params = { id: 'non-existent' };
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await approveUser(req as Request, res as Response, next);

      expect(mockStatus).toHaveBeenCalledWith(404);
    });

    it('should return 400 if user is already approved', async () => {
      req.params = { id: 'user-id' };
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: 'user-id', isApproved: true });

      await approveUser(req as Request, res as Response, next);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({ error: 'User is already approved' });
    });
  });

  describe('deleteUser', () => {
    it('should delete a user', async () => {
      req.params = { id: 'user-id' };

      // User to delete is just a normal user
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: 'user-id', role: 'user' });

      await deleteUser(req as Request, res as Response, next);

      expect(prisma.user.delete).toHaveBeenCalledWith({ where: { id: 'user-id' } });
      expect(mockStatus).toHaveBeenCalledWith(200);
    });

    it('should prevent deleting own account', async () => {
      req.params = { id: 'admin-id' }; // Same as req.user.userId
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: 'admin-id', role: 'super_admin' });

      await deleteUser(req as Request, res as Response, next);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({ error: 'Cannot delete your own account' });
    });

    it('should prevent deleting last super admin', async () => {
      req.params = { id: 'other-admin-id' };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: 'other-admin-id', role: 'super_admin' });
      (prisma.user.count as jest.Mock).mockResolvedValue(1); // Only 1 super admin left (the one being deleted)

      await deleteUser(req as Request, res as Response, next);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({ error: 'Cannot delete the last super admin' });
    });
  });

  describe('updateUserRole', () => {
    it('should update user role', async () => {
      req.params = { id: 'user-id' };
      req.body = { role: 'admin' };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: 'user-id', role: 'user' });
      (prisma.user.update as jest.Mock).mockResolvedValue({ id: 'user-id', role: 'admin' });

      await updateUserRole(req as Request, res as Response, next);

      expect(prisma.user.update).toHaveBeenCalledWith(expect.objectContaining({
        where: { id: 'user-id' },
        data: { role: 'admin' },
      }));
      expect(mockStatus).toHaveBeenCalledWith(200);
    });

    it('should prevent changing own role', async () => {
      req.params = { id: 'admin-id' }; // Same as req.user.userId
      req.body = { role: 'user' };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: 'admin-id', role: 'super_admin' });

      await updateUserRole(req as Request, res as Response, next);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({ error: 'Cannot change your own role' });
    });

    it('should return 404 if user not found', async () => {
      req.params = { id: 'non-existent' };
      req.body = { role: 'admin' };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await updateUserRole(req as Request, res as Response, next);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({ error: 'User not found' });
    });

    it('should call next on error', async () => {
      req.params = { id: 'user-id' };
      req.body = { role: 'admin' };

      const error = new Error('Database error');
      (prisma.user.findUnique as jest.Mock).mockRejectedValue(error);

      await updateUserRole(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getPendingUsers', () => {
    it('should return pending users', async () => {
      const mockPendingUsers = [
        { id: '1', name: 'User 1', isApproved: false },
        { id: '2', name: 'User 2', isApproved: false },
      ];
      (prisma.user.findMany as jest.Mock).mockResolvedValue(mockPendingUsers);

      await getPendingUsers(req as Request, res as Response, next);

      expect(prisma.user.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: { isApproved: false },
      }));
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({ users: mockPendingUsers });
    });

    it('should call next on error', async () => {
      const error = new Error('Database error');
      (prisma.user.findMany as jest.Mock).mockRejectedValue(error);

      await getPendingUsers(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('updateProfile', () => {
    it('should update user profile with name only', async () => {
      req.body = { name: 'Updated Name' };

      (prisma.user.update as jest.Mock).mockResolvedValue({
        id: 'admin-id',
        name: 'Updated Name',
        email: 'admin@test.com',
        role: 'super_admin',
        language: 'en',
      });

      await updateProfile(req as Request, res as Response, next);

      expect(prisma.user.update).toHaveBeenCalledWith(expect.objectContaining({
        where: { id: 'admin-id' },
        data: { name: 'Updated Name' },
      }));
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Profile updated successfully',
      }));
    });

    it('should update user profile with language', async () => {
      req.body = { language: 'es' };

      (prisma.user.update as jest.Mock).mockResolvedValue({
        id: 'admin-id',
        email: 'admin@test.com',
        language: 'es',
      });

      await updateProfile(req as Request, res as Response, next);

      expect(prisma.user.update).toHaveBeenCalledWith(expect.objectContaining({
        where: { id: 'admin-id' },
        data: { language: 'es' },
      }));
      expect(mockStatus).toHaveBeenCalledWith(200);
    });

    it('should update user profile with password', async () => {
      req.body = { password: 'newpassword123' };
      const hashedPassword = 'hashed_password';

      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      (prisma.user.update as jest.Mock).mockResolvedValue({
        id: 'admin-id',
        email: 'admin@test.com',
      });

      await updateProfile(req as Request, res as Response, next);

      expect(bcrypt.hash).toHaveBeenCalledWith('newpassword123', 10);
      expect(prisma.user.update).toHaveBeenCalledWith(expect.objectContaining({
        where: { id: 'admin-id' },
        data: { password: hashedPassword },
      }));
      expect(mockStatus).toHaveBeenCalledWith(200);
    });

    it('should update user profile with all fields', async () => {
      req.body = { name: 'New Name', language: 'en', password: 'newpassword123' };
      const hashedPassword = 'hashed_password';

      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      (prisma.user.update as jest.Mock).mockResolvedValue({
        id: 'admin-id',
        name: 'New Name',
        email: 'admin@test.com',
        language: 'en',
      });

      await updateProfile(req as Request, res as Response, next);

      expect(prisma.user.update).toHaveBeenCalledWith(expect.objectContaining({
        where: { id: 'admin-id' },
        data: { name: 'New Name', language: 'en', password: hashedPassword },
      }));
      expect(mockStatus).toHaveBeenCalledWith(200);
    });

    it('should return 401 if no user in request', async () => {
      req.user = undefined;

      await updateProfile(req as Request, res as Response, next);

      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith({ error: 'Authentication required' });
    });

    it('should call next on error', async () => {
      req.body = { name: 'New Name' };
      const error = new Error('Database error');

      (prisma.user.update as jest.Mock).mockRejectedValue(error);

      await updateProfile(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('error handling', () => {
    it('should call next on getAllUsers error', async () => {
      const error = new Error('Database error');
      (prisma.user.findMany as jest.Mock).mockRejectedValue(error);

      await getAllUsers(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });

    it('should call next on approveUser error', async () => {
      req.params = { id: 'user-id' };
      const error = new Error('Database error');
      (prisma.user.findUnique as jest.Mock).mockRejectedValue(error);

      await approveUser(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });

    it('should call next on deleteUser error', async () => {
      req.params = { id: 'user-id' };
      const error = new Error('Database error');
      (prisma.user.findUnique as jest.Mock).mockRejectedValue(error);

      await deleteUser(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });

    it('should return 404 on deleteUser when user not found', async () => {
      req.params = { id: 'non-existent' };
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await deleteUser(req as Request, res as Response, next);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({ error: 'User not found' });
    });
  });
});