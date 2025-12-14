import { Request, Response, NextFunction } from 'express';
import { ZodError, ZodIssue } from 'zod';
import { errorHandler } from '../../../src/server/middleware/errorHandler';

describe('errorHandler middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  let consoleErrorSpy: jest.SpyInstance;
  let consoleLogSpy: jest.SpyInstance;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    consoleLogSpy.mockRestore();
  });

  describe('ZodError handling', () => {
    it('should handle ZodError with 400 status and formatted details', () => {
      const zodIssues: ZodIssue[] = [
        {
          code: 'invalid_type',
          expected: 'string',
          received: 'number',
          path: ['email'],
          message: 'Expected string, received number',
        },
        {
          code: 'too_small',
          minimum: 8,
          type: 'string',
          inclusive: true,
          exact: false,
          path: ['password'],
          message: 'String must contain at least 8 character(s)',
        },
      ];

      const zodError = new ZodError(zodIssues);

      errorHandler(
        zodError,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Validation error',
        details: [
          {
            field: 'email',
            message: 'Expected string, received number',
          },
          {
            field: 'password',
            message: 'String must contain at least 8 character(s)',
          },
        ],
      });
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error:', zodError);
    });

    it('should handle ZodError with nested path', () => {
      const zodIssues: ZodIssue[] = [
        {
          code: 'invalid_type',
          expected: 'string',
          received: 'undefined',
          path: ['user', 'profile', 'name'],
          message: 'Required',
        },
      ];

      const zodError = new ZodError(zodIssues);

      errorHandler(
        zodError,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Validation error',
        details: [
          {
            field: 'user.profile.name',
            message: 'Required',
          },
        ],
      });
    });
  });

  describe('not found errors', () => {
    it('should handle "not found" error with 404 status', () => {
      const error = new Error('User not found');

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'User not found',
      });
    });

    it('should handle "Article not found" error', () => {
      const error = new Error('Article not found');

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Article not found',
      });
    });
  });

  describe('unauthorized errors', () => {
    it('should handle "unauthorized" error with 401 status', () => {
      const error = new Error('Access unauthorized');

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Access unauthorized',
      });
    });

    it('should handle "authentication" error with 401 status', () => {
      const error = new Error('Invalid authentication token');

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Invalid authentication token',
      });
    });
  });

  describe('forbidden errors', () => {
    it('should handle "forbidden" error with 403 status', () => {
      const error = new Error('Access forbidden');

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Access forbidden',
      });
    });

    it('should handle "permission" error with 403 status', () => {
      const error = new Error('Insufficient permission to perform this action');

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Insufficient permission to perform this action',
      });
    });
  });

  describe('generic errors', () => {
    it('should handle generic error with 500 status in development', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const error = new Error('Something went wrong');

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Something went wrong',
      });

      process.env.NODE_ENV = originalEnv;
    });

    it('should handle generic error with generic message in production', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const error = new Error('Something went wrong');

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Internal server error',
      });

      process.env.NODE_ENV = originalEnv;
    });

    it('should handle database connection error', () => {
      const error = new Error('Database connection failed');

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error:', error);
    });
  });
});
