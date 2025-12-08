import { jest, describe, it, expect, beforeAll, beforeEach } from '@jest/globals';
import request from 'supertest';
import { app, setupServer } from '../../../src/server/index';
import prisma from '../../../src/server/config/database';
import * as jwtUtils from '../../../src/server/utils/jwt';

// Mock dependencies
jest.mock('../../../src/server/config/database', () => {
  const mockPrisma = {
    newsBrand: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    }
  };

  return {
    __esModule: true,
    default: mockPrisma,
    db: mockPrisma,
  };
});
jest.mock('../../../src/server/utils/jwt');

describe('Brand Routes Integration', () => {
  beforeAll(async () => {
    await setupServer();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Helper to mock auth
  const mockAuth = (role = 'super_admin') => {
    (jwtUtils.verifyToken as jest.Mock).mockReturnValue({ userId: '1', role });
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: '1', role });
  };

  describe('POST /api/brands', () => {
    const validBrand = {
      name: 'Test Brand',
      description: 'A test brand',
      language: 'en',
      websiteUrl: 'https://test.com',
      categories: ['Technology'],
      primaryColor: '#000000',
      accentColor: '#ffffff'
    };

    it('should create a brand when admin', async () => {
      mockAuth('super_admin');
      (prisma.newsBrand.create as jest.Mock).mockResolvedValue({ id: 'brand-1', ...validBrand });

      const res = await request(app)
        .post('/api/brands')
        .set('Authorization', 'Bearer token')
        .send(validBrand);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id', 'brand-1');
    });

    it('should deny non-admin', async () => {
      mockAuth('user');
      
      const res = await request(app)
        .post('/api/brands')
        .set('Authorization', 'Bearer token')
        .send(validBrand);

      expect(res.status).toBe(403);
    });
  });

  describe('GET /api/brands', () => {
    it('should list brands', async () => {
      mockAuth('user');
      (prisma.newsBrand.findMany as jest.Mock).mockResolvedValue([{ id: '1', name: 'Brand' }]);

      const res = await request(app)
        .get('/api/brands')
        .set('Authorization', 'Bearer token');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('GET /api/brands/:id', () => {
    it('should get brand by id', async () => {
      mockAuth('user');
      (prisma.newsBrand.findUnique as jest.Mock).mockResolvedValue({ id: '1', name: 'Brand' });

      const res = await request(app)
        .get('/api/brands/1')
        .set('Authorization', 'Bearer token');

      expect(res.status).toBe(200);
      expect(res.body.id).toBe('1');
    });

    it('should return 404 if not found', async () => {
      mockAuth('user');
      (prisma.newsBrand.findUnique as jest.Mock).mockResolvedValue(null);

      const res = await request(app)
        .get('/api/brands/999')
        .set('Authorization', 'Bearer token');

      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/brands/:id', () => {
    it('should update brand if admin', async () => {
      mockAuth('admin');
      const updateData = { name: 'Updated Brand' };
      (prisma.newsBrand.update as jest.Mock).mockResolvedValue({ id: '1', ...updateData });

      const res = await request(app)
        .put('/api/brands/1')
        .set('Authorization', 'Bearer token')
        .send(updateData);

      expect(res.status).toBe(200);
      expect(res.body.name).toBe('Updated Brand');
    });
  });

  describe('DELETE /api/brands/:id', () => {
    it('should delete brand if super_admin', async () => {
      mockAuth('super_admin');
      (prisma.newsBrand.update as jest.Mock).mockResolvedValue({ id: '1', isActive: false });

      const res = await request(app)
        .delete('/api/brands/1')
        .set('Authorization', 'Bearer token');

      expect(res.status).toBe(200);
    });

    it('should deny admin (only super_admin can delete)', async () => {
      mockAuth('admin');
      
      const res = await request(app)
        .delete('/api/brands/1')
        .set('Authorization', 'Bearer token');

      expect(res.status).toBe(403);
    });
  });
});
