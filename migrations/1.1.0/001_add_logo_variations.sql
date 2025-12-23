-- migrations/1.1.0/001_add_logo_variations.sql
-- Description: Add logo variations and metadata support to NewsBrand
-- Version: 1.1.0
-- Date: 2024-12-10
-- Phase: 2 - Logo Generator Feature

-- Check if columns already exist and only add if they don't
-- This makes the migration idempotent

-- Add logo variations column (stores 4 variations: horizontal, vertical, icon, monochrome)
-- This column was added to support the AI logo generator feature
-- Format: JSON with structure { horizontal: string, vertical: string, icon: string, monochrome: string }
-- Check if column exists by querying pragma_table_info
-- SQLite doesn't support IF NOT EXISTS for ALTER TABLE, so we use a workaround
-- We'll check if the column exists in the application code before running this

-- Since SQLite doesn't support conditional column additions, and the columns already exist
-- in the Prisma schema, we skip the actual ALTER TABLE statements
-- The columns are already present in the database

-- Add logo metadata column (stores generation parameters and style information)
-- Format: JSON with structure { style: string, colors: {...}, generatedAt: string, provider?: string }
-- Already exists in schema

-- Note: These columns support the Phase 2 logo generation feature
-- The logoUrl field (existing) stores the primary/default logo
-- The logoVariations field stores all 4 generated variations as JSON
-- The logoMetadata field stores the generation parameters for reproducibility

-- This migration is kept for version tracking purposes only
-- The actual schema changes were applied via Prisma migrations
