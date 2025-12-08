import { jest, describe, it, expect, beforeAll, beforeEach } from '@jest/globals';
import request from 'supertest';
import { app, setupServer } from '../../../src/server/index';
import prisma from '../../../src/server/config/database';
import bcrypt from 'bcrypt';
import * as jwtUtils from '../../../src/server/utils/jwt';

// Mock dependencies
jest.mock('../../../src/server/config/database', () => ({
  __esModule: true,
  default: {
    user: {
      findUnique: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
    },
  },
}));
jest.mock('bcrypt');
jest.mock('../../../src/server/utils/jwt');

describe('Auth Routes Integration', () => {
  beforeAll(async () => {
    await setupServer();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    const validData = {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
      language: 'en',
    };

    it('should register a new user', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.user.count as jest.Mock).mockResolvedValue(0); // First user
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
      (prisma.user.create as jest.Mock).mockResolvedValue({
        id: '1',
        ...validData,
        role: 'super_admin',
        isApproved: true,
      });
      (jwtUtils.generateToken as jest.Mock).mockReturnValue('token');

      const res = await request(app)
        .post('/api/auth/register')
        .send(validData);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user).toHaveProperty('role', 'super_admin');
    });

    it('should return 400 for invalid data', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'invalid-email' }); // Missing password, name

      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login user', async () => {
      const loginData = { email: 'test@example.com', password: 'password' };
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: '1',
        email: 'test@example.com',
        password: 'hashed',
        isApproved: true,
        role: 'user',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwtUtils.generateToken as jest.Mock).mockReturnValue('token');

      const res = await request(app)
        .post('/api/auth/login')
        .send(loginData);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token', 'token');
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return current user profile', async () => {
      (jwtUtils.verifyToken as jest.Mock).mockReturnValue({ userId: '1', role: 'user' });
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: '1',
        email: 'test@example.com',
      });

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer valid-token');

      expect(res.status).toBe(200);
      expect(res.body.user).toHaveProperty('email', 'test@example.com');
    });

    it('should return 401 without token', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.status).toBe(401);
    });
  });
});