-- migrations/1.1.0/001_add_logo_variations.sql
-- Description: Add logo variations and metadata support to NewsBrand
-- Version: 1.1.0
-- Date: 2024-12-10
-- Phase: 2 - Logo Generator Feature

-- Add logo variations column (stores 4 variations: horizontal, vertical, icon, monochrome)
-- This column was added to support the AI logo generator feature
-- Format: JSON with structure { horizontal: string, vertical: string, icon: string, monochrome: string }
ALTER TABLE NewsBrand ADD COLUMN logoVariations TEXT;

-- Add logo metadata column (stores generation parameters and style information)
-- Format: JSON with structure { style: string, colors: {...}, generatedAt: string, provider?: string }
ALTER TABLE NewsBrand ADD COLUMN logoMetadata TEXT;

-- Note: These columns support the Phase 2 logo generation feature
-- The logoUrl field (existing) stores the primary/default logo
-- The logoVariations field stores all 4 generated variations as JSON
-- The logoMetadata field stores the generation parameters for reproducibility
