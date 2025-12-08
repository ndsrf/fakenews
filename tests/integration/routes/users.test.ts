import { jest, describe, it, expect, beforeAll, beforeEach } from '@jest/globals';
import request from 'supertest';
import { app, setupServer } from '../../../src/server/index';
import prisma from '../../../src/server/config/database';
import * as jwtUtils from '../../../src/server/utils/jwt';

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
jest.mock('../../../src/server/utils/jwt');

describe('User Routes Integration', () => {
  beforeAll(async () => {
    await setupServer();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/users', () => {
    it('should return all users for super_admin', async () => {
      // Mock auth middleware success
      (jwtUtils.verifyToken as jest.Mock).mockReturnValue({
        userId: 'admin-id',
        role: 'super_admin',
      });
      
      const mockUsers = [{ id: '1', name: 'User 1' }];
      (prisma.user.findMany as jest.Mock).mockResolvedValue(mockUsers);

      const res = await request(app)
        .get('/api/users')
        .set('Authorization', 'Bearer admin-token');

      expect(res.status).toBe(200);
      expect(res.body.users).toHaveLength(1);
    });

    it('should return 403 for normal user', async () => {
      (jwtUtils.verifyToken as jest.Mock).mockReturnValue({
        userId: 'user-id',
        role: 'user',
      });

      const res = await request(app)
        .get('/api/users')
        .set('Authorization', 'Bearer user-token');

      expect(res.status).toBe(403);
    });
  });

  describe('PUT /api/users/:id/approve', () => {
    it('should approve user', async () => {
      (jwtUtils.verifyToken as jest.Mock).mockReturnValue({
        userId: 'admin-id',
        role: 'super_admin',
      });

      (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: 'target-id', isApproved: false });
      (prisma.user.update as jest.Mock).mockResolvedValue({ id: 'target-id', isApproved: true });

      const res = await request(app)
        .put('/api/users/target-id/approve')
        .set('Authorization', 'Bearer admin-token');

      expect(res.status).toBe(200);
      expect(res.body.user.isApproved).toBe(true);
    });
  });
});