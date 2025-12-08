import { jest, describe, it, expect, beforeAll, beforeEach } from '@jest/globals';
import request from 'supertest';
import { app, setupServer } from '../../../src/server/index';
import prisma from '../../../src/server/config/database';
import * as jwtUtils from '../../../src/server/utils/jwt';

// Mock dependencies
jest.mock('../../../src/server/config/database', () => {
  const mockPrisma = {
    template: {
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

describe('Template Routes Integration', () => {
  beforeAll(async () => {
    await setupServer();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockAuth = (role = 'super_admin') => {
    (jwtUtils.verifyToken as jest.Mock).mockReturnValue({ userId: '1', role });
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: '1', role });
  };

  describe('POST /api/templates', () => {
    const validTemplate = {
      name: 'Test Template',
      type: 'default',
      cssStyles: 'body {}',
      htmlStructure: '<div></div>',
      language: 'en',
    };

    it('should create template when admin', async () => {
      mockAuth('admin');
      (prisma.template.create as jest.Mock).mockResolvedValue({ id: 'temp-1', ...validTemplate });

      const res = await request(app)
        .post('/api/templates')
        .set('Authorization', 'Bearer token')
        .send(validTemplate);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id', 'temp-1');
    });
  });

  describe('GET /api/templates', () => {
    it('should list templates', async () => {
      mockAuth('user');
      (prisma.template.findMany as jest.Mock).mockResolvedValue([{ id: '1', name: 'Template' }]);

      const res = await request(app)
        .get('/api/templates')
        .set('Authorization', 'Bearer token');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('GET /api/templates/:id', () => {
    it('should get template by id', async () => {
      mockAuth('user');
      (prisma.template.findUnique as jest.Mock).mockResolvedValue({ id: '1', name: 'Template' });

      const res = await request(app)
        .get('/api/templates/1')
        .set('Authorization', 'Bearer token');

      expect(res.status).toBe(200);
    });
  });

  describe('PUT /api/templates/:id', () => {
    it('should update template when admin', async () => {
      mockAuth('admin');
      const updateData = { name: 'Updated' };
      (prisma.template.update as jest.Mock).mockResolvedValue({ id: '1', ...updateData });

      const res = await request(app)
        .put('/api/templates/1')
        .set('Authorization', 'Bearer token')
        .send(updateData);

      expect(res.status).toBe(200);
    });
  });

  describe('DELETE /api/templates/:id', () => {
    it('should delete template when super_admin', async () => {
      mockAuth('super_admin');
      (prisma.template.update as jest.Mock).mockResolvedValue({ id: '1', isActive: false });

      const res = await request(app)
        .delete('/api/templates/1')
        .set('Authorization', 'Bearer token');

      expect(res.status).toBe(200);
    });
  });
});
