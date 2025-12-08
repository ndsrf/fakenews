-- migrations/1.0.0/001_initial_schema.sql
-- Description: Create initial database schema with all tables
-- Version: 1.0.0
-- Date: 2024-12-08

-- CreateTable: AppVersion
CREATE TABLE IF NOT EXISTS "AppVersion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "version" TEXT NOT NULL UNIQUE,
    "appliedAt" TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "description" TEXT NOT NULL,
    "migrations" TEXT NOT NULL
);

-- CreateTable: User
CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL UNIQUE,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "isApproved" INTEGER NOT NULL DEFAULT 0,
    "language" TEXT NOT NULL DEFAULT 'en',
    "createdAt" TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable: NewsBrand
CREATE TABLE IF NOT EXISTS "NewsBrand" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "tagline" TEXT,
    "description" TEXT NOT NULL,
    "logoUrl" TEXT,
    "logoVariations" TEXT,
    "logoMetadata" TEXT,
    "primaryColor" TEXT NOT NULL DEFAULT '#1a1a1a',
    "accentColor" TEXT NOT NULL DEFAULT '#0066cc',
    "language" TEXT NOT NULL DEFAULT 'en',
    "websiteUrl" TEXT NOT NULL,
    "categories" TEXT NOT NULL,
    "isActive" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable: Template
CREATE TABLE IF NOT EXISTS "Template" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "brandId" TEXT,
    "cssStyles" TEXT NOT NULL,
    "htmlStructure" TEXT NOT NULL,
    "hasSidebar" INTEGER NOT NULL DEFAULT 1,
    "language" TEXT NOT NULL DEFAULT 'en',
    "isActive" INTEGER NOT NULL DEFAULT 1,
    "previewImage" TEXT,
    "sourceUrl" TEXT,
    "extractionMethod" TEXT,
    "layoutMetadata" TEXT,
    "createdAt" TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("brandId") REFERENCES "NewsBrand" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable: Article
CREATE TABLE IF NOT EXISTS "Article" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "content" TEXT NOT NULL,
    "excerpt" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "authorName" TEXT NOT NULL,
    "slug" TEXT NOT NULL UNIQUE,
    "metadata" TEXT NOT NULL,
    "images" TEXT NOT NULL,
    "charts" TEXT NOT NULL,
    "relatedArticles" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "publishedAt" TEXT,
    "featuredImage" TEXT,
    "readTime" INTEGER,
    "tags" TEXT NOT NULL,
    "createdAt" TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("templateId") REFERENCES "Template" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY ("brandId") REFERENCES "NewsBrand" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable: PageView
CREATE TABLE IF NOT EXISTS "PageView" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "articleId" TEXT NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "country" TEXT,
    "city" TEXT,
    "browser" TEXT,
    "os" TEXT,
    "device" TEXT,
    "referrer" TEXT,
    "timestamp" TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("articleId") REFERENCES "Article" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable: AIConfig
CREATE TABLE IF NOT EXISTS "AIConfig" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "provider" TEXT NOT NULL UNIQUE,
    "apiKey" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "isActive" INTEGER NOT NULL DEFAULT 1,
    "updatedAt" TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Insert initial version record
INSERT OR IGNORE INTO AppVersion (id, version, description, migrations)
VALUES (
    lower(hex(randomblob(16))),
    '1.0.0',
    'Initial database schema with authentication and user management',
    '["001_initial_schema.sql", "002_seed_default_brands.sql"]'
);
