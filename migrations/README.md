# Database Migrations

This directory contains SQL migration files for the Fictional News Generator application.

## Directory Structure

```
migrations/
├── 1.0.0/
│   ├── 001_initial_schema.sql
│   └── 002_seed_default_brands.sql
├── 1.1.0/
│   └── (future migrations)
└── README.md
```

## Migration Naming Convention

Migrations are organized by version number following Semantic Versioning (MAJOR.MINOR.PATCH).

Each migration file follows the pattern: `{number}_{description}.sql`

Examples:
- `001_initial_schema.sql`
- `002_seed_default_brands.sql`
- `003_add_user_preferences.sql`

## How Migrations Work

1. The `MigrationService` runs on application startup
2. It checks the current database version from the `AppVersion` table
3. Compares it with the application version from `package.json`
4. Applies any pending migrations in order (by version, then by file number)
5. Updates the `AppVersion` table with the new version

## Creating a New Migration

1. Create a new directory for the version (e.g., `1.1.0/`)
2. Create numbered SQL files (e.g., `001_add_feature.sql`)
3. Include a comment header with:
   - Description
   - Version
   - Date
4. Bump the version in `package.json`
5. Test locally before committing

Example:

```sql
-- migrations/1.1.0/001_add_logo_variations.sql
-- Description: Add logo variations support to NewsBrand
-- Version: 1.1.0
-- Date: 2024-12-08

ALTER TABLE NewsBrand ADD COLUMN logoVariations TEXT;
ALTER TABLE NewsBrand ADD COLUMN logoMetadata TEXT;
```

## Important Notes

- Migrations are idempotent (safe to run multiple times)
- Never modify existing migration files after they've been deployed
- Always test migrations with a backup of your database
- Migrations run automatically on application startup
- The first migration creates the `AppVersion` table for tracking
