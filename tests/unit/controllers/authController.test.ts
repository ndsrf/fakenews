import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { Request, Response } from 'express';
import { register, login, getCurrentUser } from '../../../src/server/controllers/authController';
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

describe('Auth Controller', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  const mockJson = jest.fn();
  const mockStatus = jest.fn().mockReturnValue({ json: mockJson });

  beforeEach(() => {
    req = {
      body: {},
    };
    res = {
      status: mockStatus,
      json: mockJson,
    } as unknown as Response;
    jest.clearAllMocks();
  });

  describe('register', () => {
    const validRegisterData = {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
      language: 'en',
    };

    it('should register first user as super_admin and approve immediately', async () => {
      req.body = validRegisterData;
      
      // Mocks
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null); // No existing user
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');
      (prisma.user.count as jest.Mock).mockResolvedValue(0); // 0 users -> first user
      (prisma.user.create as jest.Mock).mockResolvedValue({
        id: '1',
        ...validRegisterData,
        role: 'super_admin',
        isApproved: true,
      });
      (jwtUtils.generateToken as jest.Mock).mockReturnValue('mock-token');

      await register(req as Request, res as Response);

      expect(prisma.user.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({
          role: 'super_admin',
          isApproved: true,
        }),
      }));
      expect(mockStatus).toHaveBeenCalledWith(201);
      expect(mockJson).toHaveBeenCalledWith(expect.objectContaining({
        token: 'mock-token',
      }));
    });

    it('should register subsequent user as user and require approval', async () => {
      req.body = validRegisterData;
      
      // Mocks
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');
      (prisma.user.count as jest.Mock).mockResolvedValue(1); // 1 user exists
      (prisma.user.create as jest.Mock).mockResolvedValue({
        id: '2',
        ...validRegisterData,
        role: 'user',
        isApproved: false,
      });

      await register(req as Request, res as Response);

      expect(prisma.user.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({
          role: 'user',
          isApproved: false,
        }),
      }));
      expect(mockStatus).toHaveBeenCalledWith(201);
      // Should NOT return token
      expect(mockJson).toHaveBeenCalledWith(expect.not.objectContaining({
        token: expect.any(String),
      }));
      expect(mockJson).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.stringContaining('wait for admin approval'),
      }));
    });

    it('should return 400 if user already exists', async () => {
      req.body = validRegisterData;
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: '1' });

      await register(req as Request, res as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({ error: 'User with this email already exists' });
    });
  });

  describe('login', () => {
    const validLoginData = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should login successfully if credentials are valid and user is approved', async () => {
      req.body = validLoginData;
      
      const mockUser = {
        id: '1',
        email: validLoginData.email,
        password: 'hashed_password',
        isApproved: true,
        role: 'user',
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwtUtils.generateToken as jest.Mock).mockReturnValue('mock-token');

      await login(req as Request, res as Response);

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith(expect.objectContaining({
        token: 'mock-token',
      }));
    });

    it('should return 403 if user is not approved', async () => {
      req.body = validLoginData;
      
      const mockUser = {
        id: '1',
        email: validLoginData.email,
        password: 'hashed_password',
        isApproved: false, // Not approved
        role: 'user',
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      await login(req as Request, res as Response);

      expect(mockStatus).toHaveBeenCalledWith(403);
      expect(mockJson).toHaveBeenCalledWith({ error: 'Your account is pending approval' });
    });

    it('should return 401 if password is invalid', async () => {
      req.body = validLoginData;
      
      const mockUser = {
        id: '1',
        email: validLoginData.email,
        password: 'hashed_password',
        isApproved: true,
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false); // Invalid password

      await login(req as Request, res as Response);

      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith({ error: 'Invalid email or password' });
    });
  });

  describe('getCurrentUser', () => {
    it('should return user data', async () => {
      req.user = { userId: '1', email: 'test@test.com', role: 'user' };
      
      const mockUser = { id: '1', email: 'test@test.com', name: 'Test' };
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      await getCurrentUser(req as Request, res as Response);

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({ user: mockUser });
    });

    it('should return 401 if not authenticated (no req.user)', async () => {
      req.user = undefined;
      await getCurrentUser(req as Request, res as Response);
      expect(mockStatus).toHaveBeenCalledWith(401);
    });
  });
});