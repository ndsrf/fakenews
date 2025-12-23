# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.0] - 2025-12-17

### Added - Phase 3: Public Display, Analytics & Production
- Public article viewing with SEO-friendly URLs (/:brandSlug/article/:year/:month/:slug)
- Sticky disclaimer banner on all public articles
- Semi-transparent "FICTIONAL" watermark overlay on articles
- Footer disclaimer with full explanation text
- Meta tags for search engines (noindex, nofollow, OG tags with [FICTIONAL] prefix)
- Related articles sidebar on public article pages
- Analytics tracking middleware for automatic page view recording
- IP anonymization utility using SHA-256 hashing for GDPR compliance
- User agent parser for browser, OS, and device detection
- GeoIP lookup service for country and city information
- Analytics dashboard with global statistics (total views, articles, brands)
- Views over time chart with date range filtering
- Device breakdown pie chart with percentages
- Geographic distribution by country
- Top articles table sorted by view count
- Analytics filtering by date range, brand, and article
- CSV export functionality for analytics data with streaming (handles large datasets)
- Rate limiting middleware (100 req/15min per IP for API, 5 req/hour per user for AI generation)
- Editable disclaimer configuration via SystemConfig table
- Disclaimer service for loading and caching disclaimer content
- Health check endpoint with database status verification
- Winston logging with file and console transports (error.log, combined.log)
- Helmet.js security headers (CSP, HSTS)
- Database backup script with 7-day retention
- Graceful shutdown handling (SIGTERM/SIGINT)
- Comprehensive test coverage:
  - Unit tests for utilities (IP anonymizer, UA parser) - 24 tests
  - Unit tests for services (analytics, GeoIP) - 50 tests
  - Integration tests for API endpoints (public, analytics)
  - E2E tests with Playwright (14 scenarios covering disclaimers, analytics, language switching)

### Changed
- Enhanced internationalization support for analytics and disclaimer content
- Updated navigation to include Analytics link in dashboard
- Improved error handling across all new endpoints
- Database indexes added for analytics query performance optimization

### Database
- Added SystemConfig table for editable disclaimer configuration
- Added indexes on PageView (timestamp, articleId, country)
- Added indexes on Article (status, publishedAt)

### Security
- Implemented IP anonymization for privacy compliance
- Added rate limiting to prevent API abuse
- Security headers via Helmet.js (CSP, HSTS)
- No raw or hashed IPs in CSV exports

### Performance
- Streaming CSV export for large datasets (>10MB)
- Database indexes for analytics queries (target: <2s dashboard load)
- Analytics tracking runs asynchronously (<100ms impact)
- GeoIP lookup with internal caching

### Production Hardening
- Winston logging for production environments
- Health check endpoint for monitoring
- Database backup automation
- Graceful shutdown handling
- Docker-ready configuration

## [v1.0.1] - 2025-12-08

## [1.0.0] - 2024-12-08

### Added
- Initial release with Phase 1 features
- User authentication system with JWT
- User registration with approval workflow
- First user automatically becomes super admin
- Role-based access control (super_admin, admin, user)
- Minimal login page with email/password fields
- Registration page with language selection
- User management dashboard for super admins
- Multilingual support (English and Spanish)
- i18n implementation with react-i18next
- Database migration system with automatic version tracking
- Version display on login page
- Health check endpoint
- Version API endpoint
- Prisma ORM with SQLite database
- Custom SQL migration runner
- Docker and Docker Compose configuration
- Comprehensive README documentation
- Environment variable configuration
- Graceful error handling
- Input validation with Zod
- Security middleware (helmet, cors)
- bcrypt password hashing
- Protected routes and authentication middleware

### Database
- AppVersion table for migration tracking
- User table with approval workflow
- NewsBrand table (prepared for Phase 2)
- Article table (prepared for Phase 2)
- Template table (prepared for Phase 2)
- PageView table (prepared for Phase 3)
- AIConfig table (prepared for Phase 2)

### Migrations
- 1.0.0/001_initial_schema.sql - Database schema creation
- 1.0.0/002_seed_default_brands.sql - Seed 5 fictional news brands

### Security
- JWT-based authentication
- Password hashing with bcrypt
- Protected API routes
- Role-based authorization
- CORS and helmet security headers

### Infrastructure
- Express.js backend server
- React 18+ frontend with TypeScript
- Vite for frontend build
- Tailwind CSS for styling
- ESM modules throughout
- Hot reload in development
- Production build optimization

### Documentation
- Complete README with installation instructions
- API endpoint documentation
- Migration system guide
- Environment variable reference
- Docker deployment instructions
- NPM scripts reference

## [Unreleased]

### Planned for Phase 2
- AI-powered article generation
- Custom template extraction from URLs
- AI logo generator for brands
- Rich markdown editor
- Article management system (CRUD)
- Draft/publish workflow
- Related article generation

### Planned for Phase 3
- Public article viewing with disclaimers
- Analytics dashboard
- Geographic distribution tracking
- Export functionality (CSV)
- Performance optimizations
- Security hardening
- Accessibility improvements
