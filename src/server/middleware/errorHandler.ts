import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

/**
 * Global error handling middleware
 */
export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  console.error('Error:', error);
  console.log('Is ZodError?', error instanceof ZodError);

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    res.status(400).json({
      error: 'Validation error',
      details: error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
      })),
    });
    return;
  }

  // Handle known application errors
  if (error.message.includes('not found')) {
    res.status(404).json({ error: error.message });
    return;
  }

  if (error.message.includes('unauthorized') || error.message.includes('authentication')) {
    res.status(401).json({ error: error.message });
    return;
  }

  if (error.message.includes('forbidden') || error.message.includes('permission')) {
    res.status(403).json({ error: error.message });
    return;
  }

  // Default to 500 server error
  res.status(500).json({
    error: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : error.message,
  });
}
