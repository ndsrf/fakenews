import rateLimit from 'express-rate-limit';
import { Request } from 'express';

/**
 * Rate limiter for general API endpoints
 * Limit: 100 requests per 15 minutes per IP address
 */
export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  // Add retry-after header
  handler: (req, res) => {
    const retryAfter = 900; // Default 15 minutes in seconds
    res.status(429).json({
      error: 'Too many requests, please try again later',
      retryAfter,
    });
  },
});

/**
 * Rate limiter for AI generation endpoints
 * Limit: 5 requests per hour per authenticated user
 */
export const aiGenerationRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit each user to 5 requests per windowMs
  message: 'AI generation limit exceeded, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  // Use user ID as the key for authenticated users
  keyGenerator: (req: Request) => {
    // If user is authenticated, use their user ID
    if (req.user?.userId) {
      return `user:${req.user.userId}`;
    }
    // This shouldn't happen due to skip function, but return a safe fallback
    return 'unauthenticated';
  },
  // Add retry-after header
  handler: (req, res) => {
    const retryAfter = 3600; // 1 hour in seconds
    res.status(429).json({
      error: 'AI generation limit exceeded (5 requests per hour)',
      retryAfter,
    });
  },
  // Skip rate limiting for non-authenticated requests (will be handled by auth middleware)
  skip: (req) => !req.user,
});
