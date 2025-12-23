# Migration Guide: Version 1.2.0 - Phase 3: Public Display, Analytics & Production

## Overview

Version 1.2.0 introduces public article viewing, comprehensive analytics tracking, security hardening, and production readiness features.

## Migration Steps

### 1. Database Migrations

The following migrations will run automatically on server startup:

#### 001_add_analytics_indexes.sql
- Adds performance indexes for analytics queries
- Indexes on `PageView` table: `timestamp`, `articleId`, `country`
- Indexes on `Article` table: `status`, `publishedAt`
- **Impact**: Improves analytics dashboard load time to <2 seconds

#### 002_add_system_config.sql
- Creates `SystemConfig` table for editable disclaimers
- Seeds default disclaimer content in English and Spanish
- **Impact**: Enables customizable disclaimer text via admin interface

### 2. Environment Variables

No new required environment variables for Phase 3.

**Optional**: Review and update existing variables:
- `NODE_ENV`: Set to `production` for production deployments
- `JWT_SECRET`: Ensure strong secret in production
- `PORT`: Default 3000, adjust if needed

### 3. Prisma Client Generation

After pulling the latest code, regenerate the Prisma client:

```bash
npm run prisma:generate
```

This ensures the new `SystemConfig` model is available.

### 4. Dependencies

Install new dependencies:

```bash
npm install
```

New packages added in 1.2.0:
- `geoip-lite`: IP geolocation lookup
- `ua-parser-js`: User agent parsing
- `winston`: Production logging
- `helmet`: Security headers
- `express-rate-limit`: API rate limiting

### 5. Database Backup (Recommended)

Before upgrading, backup your database:

```bash
cp fictional_news.db fictional_news.db.backup
```

Or use the automated backup script:

```bash
chmod +x scripts/backup-db.sh
./scripts/backup-db.sh
```

### 6. Migration Execution

**Automatic (Recommended)**:
Migrations run automatically when the server starts. Simply restart the application:

```bash
npm run build
npm start
```

**Manual (If needed)**:
```bash
sqlite3 fictional_news.db < migrations/1.2.0/001_add_analytics_indexes.sql
sqlite3 fictional_news.db < migrations/1.2.0/002_add_system_config.sql
```

### 7. Verify Migration

1. Check server logs for migration success messages
2. Verify health endpoint: `curl http://localhost:3000/health`
3. Check database version:
```sql
SELECT * FROM AppVersion ORDER BY installedAt DESC LIMIT 1;
```
Should show version 1.2.0

4. Verify new tables exist:
```sql
SELECT name FROM sqlite_master WHERE type='table' AND name='SystemConfig';
```

### 8. Test New Features

#### Public Article Viewing
1. Publish an article (set status to 'published')
2. Access via: `http://localhost:3000/{brand-slug}/article/{year}/{month}/{article-slug}`
3. Verify disclaimers appear (banner, watermark, footer)
4. Check meta tags in page source (noindex, nofollow)

#### Analytics Dashboard
1. Login as authenticated user
2. Navigate to `/analytics` from dashboard
3. Verify charts display (may be empty initially)
4. Generate some page views by visiting public articles
5. Refresh analytics to see data

#### CSV Export (Super Admin Only)
1. Login as super admin
2. Go to analytics page
3. Click "Export CSV" button
4. Verify download starts with `.csv` file

### 9. Production Hardening

#### Enable Winston Logging
Logs are automatically written to:
- `error.log`: Error level logs
- `combined.log`: All logs (info and above)

No configuration needed; logs start automatically in production.

#### Configure Automated Backups
Set up daily database backups using cron:

```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * /path/to/fakenews/scripts/backup-db.sh >> /var/log/fakenews-backup.log 2>&1
```

#### Verify Security Headers
Check Helmet.js headers are active:

```bash
curl -I http://localhost:3000
```

Should see headers like:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Strict-Transport-Security: max-age=31536000`
- `Content-Security-Policy: ...`

### 10. Rate Limiting

New rate limits are automatically enforced:
- **API endpoints**: 100 requests per 15 minutes per IP
- **AI generation**: 5 requests per hour per authenticated user

Monitor logs for rate limit violations:
```bash
grep "429" combined.log
```

## Rollback Procedure

If issues occur, rollback to previous version:

1. Stop the application
2. Restore database backup:
```bash
cp fictional_news.db.backup fictional_news.db
```

3. Checkout previous version:
```bash
git checkout v1.1.0
npm install
npm run build
npm start
```

## Breaking Changes

None. Version 1.2.0 is fully backward compatible with 1.1.0.

## Known Issues

- Integration tests for new endpoints may need adjustment for specific environments
- E2E tests assume published articles exist; seed data recommended for testing
- First-time analytics dashboard may be empty (requires page views to public articles)

## Support

For issues or questions:
- Check logs in `error.log` and `combined.log`
- Verify health endpoint: `/health`
- Review CHANGELOG.md for full feature list
- Open issue on GitHub repository

## Post-Migration Checklist

- [ ] Server starts without errors
- [ ] Health check returns 200
- [ ] Database migrations applied (check AppVersion table)
- [ ] Public article URLs accessible
- [ ] Disclaimers visible on public articles
- [ ] Analytics dashboard accessible to authenticated users
- [ ] Analytics tracking recording page views
- [ ] CSV export works for super admin
- [ ] Rate limiting active (check headers)
- [ ] Security headers present (Helmet.js)
- [ ] Winston logs being written
- [ ] Backup script executable and tested
