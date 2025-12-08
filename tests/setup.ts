// Test setup file
// This file runs before all tests

// Set environment variables for testing
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'file:./data/fictional_news_test.db';
process.env.JWT_SECRET = 'test-secret-key';
process.env.JWT_EXPIRY = '1h';

// Add any global test utilities here
