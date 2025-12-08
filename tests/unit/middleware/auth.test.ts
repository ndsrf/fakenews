import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { Request, Response, NextFunction } from 'express';
import { authenticate, requireSuperAdmin, requireAdmin } from '../../../src/server/middleware/auth';
import * as jwtUtils from '../../../src/server/utils/jwt';

// Mock dependencies
jest.mock('../../../src/server/utils/jwt');

describe('Auth Middleware', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;
  const mockJson = jest.fn();
  const mockStatus = jest.fn().mockReturnValue({ json: mockJson });

  beforeEach(() => {
    req = {
      headers: {},
    };
    res = {
      status: mockStatus,
      json: mockJson,
    } as unknown as Response; // Cast to Response to satisfy type check but keep our mocks
    next = jest.fn() as unknown as NextFunction;
    jest.clearAllMocks();
  });

  describe('authenticate', () => {
    it('should call next() and attach user to req if token is valid', () => {
      req.headers = { authorization: 'Bearer valid-token' };
      const mockPayload = { userId: '1', email: 'test@test.com', role: 'user' };
      (jwtUtils.verifyToken as jest.Mock).mockReturnValue(mockPayload);

      authenticate(req as Request, res as Response, next);

      expect(jwtUtils.verifyToken).toHaveBeenCalledWith('valid-token');
      expect((req as Request).user).toEqual(mockPayload);
      expect(next).toHaveBeenCalled();
    });

    it('should return 401 if no auth header', () => {
      req.headers = {};
      authenticate(req as Request, res as Response, next);

      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith({ error: 'Authentication required' });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 if token is invalid', () => {
      req.headers = { authorization: 'Bearer invalid-token' };
      (jwtUtils.verifyToken as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      authenticate(req as Request, res as Response, next);

      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith({ error: 'Invalid or expired token' });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('requireSuperAdmin', () => {
    it('should call next() if user is super_admin', () => {
      req.user = { userId: '1', email: 'admin@test.com', role: 'super_admin' };
      requireSuperAdmin(req as Request, res as Response, next);
      expect(next).toHaveBeenCalled();
    });

    it('should return 403 if user is not super_admin', () => {
      req.user = { userId: '1', email: 'user@test.com', role: 'user' };
      requireSuperAdmin(req as Request, res as Response, next);
      expect(mockStatus).toHaveBeenCalledWith(403);
      expect(mockJson).toHaveBeenCalledWith({ error: 'Super admin access required' });
    });

    it('should return 401 if req.user is missing', () => {
      req.user = undefined;
      requireSuperAdmin(req as Request, res as Response, next);
      expect(mockStatus).toHaveBeenCalledWith(401);
    });
  });

  describe('requireAdmin', () => {
    it('should call next() if user is admin', () => {
      req.user = { userId: '1', email: 'admin@test.com', role: 'admin' };
      requireAdmin(req as Request, res as Response, next);
      expect(next).toHaveBeenCalled();
    });

    it('should call next() if user is super_admin', () => {
      req.user = { userId: '1', email: 'admin@test.com', role: 'super_admin' };
      requireAdmin(req as Request, res as Response, next);
      expect(next).toHaveBeenCalled();
    });

    it('should return 403 if user is just a user', () => {
      req.user = { userId: '1', email: 'user@test.com', role: 'user' };
      requireAdmin(req as Request, res as Response, next);
      expect(mockStatus).toHaveBeenCalledWith(403);
    });
  });
});