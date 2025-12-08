import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { Request, Response } from 'express';
import { approveUser, deleteUser, updateUserRole, getAllUsers, getPendingUsers } from '../../../src/server/controllers/userController';
import prisma from '../../../src/server/config/database';

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

describe('User Controller', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
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
    jest.clearAllMocks();
  });

  describe('getAllUsers', () => {
    it('should return all users', async () => {
      const mockUsers = [{ id: '1', name: 'User 1' }, { id: '2', name: 'User 2' }];
      (prisma.user.findMany as jest.Mock).mockResolvedValue(mockUsers);

      await getAllUsers(req as Request, res as Response);

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({ users: mockUsers });
    });
  });

  describe('approveUser', () => {
    it('should approve a pending user', async () => {
      req.params = { id: 'user-id' };
      
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: 'user-id', isApproved: false });
      (prisma.user.update as jest.Mock).mockResolvedValue({ id: 'user-id', isApproved: true });

      await approveUser(req as Request, res as Response);

      expect(prisma.user.update).toHaveBeenCalledWith(expect.objectContaining({
        where: { id: 'user-id' },
        data: { isApproved: true },
      }));
      expect(mockStatus).toHaveBeenCalledWith(200);
    });

    it('should return 404 if user not found', async () => {
      req.params = { id: 'non-existent' };
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await approveUser(req as Request, res as Response);

      expect(mockStatus).toHaveBeenCalledWith(404);
    });

    it('should return 400 if user is already approved', async () => {
      req.params = { id: 'user-id' };
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: 'user-id', isApproved: true });

      await approveUser(req as Request, res as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({ error: 'User is already approved' });
    });
  });

  describe('deleteUser', () => {
    it('should delete a user', async () => {
      req.params = { id: 'user-id' };
      
      // User to delete is just a normal user
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: 'user-id', role: 'user' });

      await deleteUser(req as Request, res as Response);

      expect(prisma.user.delete).toHaveBeenCalledWith({ where: { id: 'user-id' } });
      expect(mockStatus).toHaveBeenCalledWith(200);
    });

    it('should prevent deleting own account', async () => {
      req.params = { id: 'admin-id' }; // Same as req.user.userId
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: 'admin-id', role: 'super_admin' });

      await deleteUser(req as Request, res as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({ error: 'Cannot delete your own account' });
    });

    it('should prevent deleting last super admin', async () => {
      req.params = { id: 'other-admin-id' };
      
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: 'other-admin-id', role: 'super_admin' });
      (prisma.user.count as jest.Mock).mockResolvedValue(1); // Only 1 super admin left (the one being deleted)

      await deleteUser(req as Request, res as Response);

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

      await updateUserRole(req as Request, res as Response);

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

      await updateUserRole(req as Request, res as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({ error: 'Cannot change your own role' });
    });
  });
});