import { chromium, FullConfig } from '@playwright/test';
import { existsSync, rmSync } from 'fs';
import { join } from 'path';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

async function globalSetup(config: FullConfig) {
  console.log('🧹 Cleaning up test database...');

  // Remove test database and related files if they exist
  const dataDir = join(process.cwd(), 'data');
  const testDbPath = join(dataDir, 'fictional_news.db');
  const testDbJournalPath = join(dataDir, 'fictional_news.db-journal');
  const testDbShmPath = join(dataDir, 'fictional_news.db-shm');
  const testDbWalPath = join(dataDir, 'fictional_news.db-wal');

  [testDbPath, testDbJournalPath, testDbShmPath, testDbWalPath].forEach((file) => {
    if (existsSync(file)) {
      rmSync(file);
    }
  });
  console.log('  ✓ Removed old test database files');

  // Create test super admin user directly in database
  console.log('👤 Creating test super admin user...');
  const prisma = new PrismaClient();

  try {
    // Apply migrations to ensure schema is up to date
    const { execSync } = await import('child_process');
    execSync('npx prisma migrate deploy', { stdio: 'ignore' });

    // Check if super admin user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: 'super@example.com' },
    });

    if (existingUser) {
      // Update existing user to ensure super_admin role
      await prisma.user.update({
        where: { email: 'super@example.com' },
        data: {
          role: 'super_admin',
          isApproved: true,
        },
      });
      console.log('  ✓ Test super admin user verified');
    } else {
      // Hash password
      const hashedPassword = await bcrypt.hash('SuperSecure123!', 10);

      // Create super admin user
      await prisma.user.create({
        data: {
          email: 'super@example.com',
          password: hashedPassword,
          name: 'Super Admin User',
          language: 'en',
          role: 'super_admin',
          isApproved: true,
        },
      });

      console.log('  ✓ Test super admin user created');
    }

    // Create test brands
    console.log('🏢 Creating test brands...');

    // Delete existing test brands first
    await prisma.newsBrand.deleteMany({
      where: {
        name: { in: ['TechDaily News', 'Global Times Report'] }
      }
    });

    const techBrand = await prisma.newsBrand.create({
      data: {
        name: 'TechDaily News',
        tagline: 'Tomorrow\'s Technology, Today',
        description: 'A fictional technology news outlet covering innovations in AI, robotics, and software.',
        websiteUrl: 'https://techdaily.example.com',
        categories: JSON.stringify(['Technology', 'Science', 'Business', 'Innovation']),
        language: 'en',
        primaryColor: '#1e3a8a',
        accentColor: '#3b82f6',
        isActive: true,
      },
    });

    const worldBrand = await prisma.newsBrand.create({
      data: {
        name: 'Global Times Report',
        tagline: 'News Without Borders',
        description: 'A fictional international news outlet covering global affairs and politics.',
        websiteUrl: 'https://globaltimes.example.com',
        categories: JSON.stringify(['World News', 'Politics', 'Economy', 'Culture']),
        language: 'en',
        primaryColor: '#dc2626',
        accentColor: '#f59e0b',
        isActive: true,
      },
    });
    console.log('  ✓ Test brands created');

    // Create test templates
    console.log('🎨 Creating test templates...');

    // Delete existing test templates first
    await prisma.template.deleteMany({
      where: {
        name: { in: ['Modern News Layout', 'Classic Editorial', 'Generic News Template'] }
      }
    });

    await prisma.template.create({
      data: {
        name: 'Modern News Layout',
        type: 'article',
        brandId: techBrand.id,
        cssStyles: 'body { font-family: Arial, sans-serif; } .article { max-width: 800px; margin: 0 auto; }',
        htmlStructure: '<article class="article"><header><h1>{{title}}</h1></header><div class="content">{{content}}</div></article>',
        hasSidebar: true,
        language: 'en',
        isActive: true,
        sourceUrl: 'https://example.com/article',
        extractionMethod: 'manual',
      },
    });

    await prisma.template.create({
      data: {
        name: 'Classic Editorial',
        type: 'article',
        brandId: worldBrand.id,
        cssStyles: 'body { font-family: Georgia, serif; } .article { max-width: 700px; }',
        htmlStructure: '<article><h1>{{title}}</h1><p class="excerpt">{{excerpt}}</p><div>{{content}}</div></article>',
        hasSidebar: false,
        language: 'en',
        isActive: true,
        sourceUrl: 'https://example.com/editorial',
        extractionMethod: 'manual',
      },
    });

    await prisma.template.create({
      data: {
        name: 'Generic News Template',
        type: 'article',
        brandId: null,
        cssStyles: 'body { font-family: system-ui; } article { padding: 20px; }',
        htmlStructure: '<article><h1>{{title}}</h1><div>{{content}}</div></article>',
        hasSidebar: true,
        language: 'en',
        isActive: true,
      },
    });
    console.log('  ✓ Test templates created');

  } catch (error) {
    console.error('  ✗ Failed to create test data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }

  console.log('✅ Global setup complete');
}

export default globalSetup;
