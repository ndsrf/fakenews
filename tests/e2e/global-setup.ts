import { chromium, FullConfig } from '@playwright/test';
import { existsSync, rmSync } from 'fs';
import { join } from 'path';

async function globalSetup(config: FullConfig) {
  console.log('🧹 Cleaning up test database...');

  // Remove test database if it exists
  const testDbPath = join(process.cwd(), 'data', 'fictional_news.db');
  if (existsSync(testDbPath)) {
    rmSync(testDbPath);
    console.log('  ✓ Removed old test database');
  }

  console.log('✅ Global setup complete');
}

export default globalSetup;
