-- migrations/1.1.0/002_add_template_extraction.sql
-- Description: Add template extraction metadata to Template model
-- Version: 1.1.0
-- Date: 2024-12-10
-- Phase: 2 - Template Extraction Feature

-- Since SQLite doesn't support conditional column additions, and the columns already exist
-- in the Prisma schema, we skip the actual ALTER TABLE statements
-- The columns are already present in the database

-- Note: These columns support the Phase 2 template extraction feature
-- Columns added via Prisma schema:
-- - sourceUrl: stores the URL from which template was extracted
-- - extractionMethod: stores the method used ('manual', 'puppeteer', 'ai-assisted')
-- - layoutMetadata: stores extracted layout information as JSON
-- - previewImage: stores base64 or URL of template screenshot

-- The extraction process uses Puppeteer to:
-- 1. Navigate to sourceUrl
-- 2. Extract computed CSS styles
-- 3. Analyze HTML structure
-- 4. Generate layoutMetadata
-- 5. Capture screenshot as previewImage
-- 6. Store extraction method used

-- This migration is kept for version tracking purposes only
-- The actual schema changes were applied via Prisma migrations
