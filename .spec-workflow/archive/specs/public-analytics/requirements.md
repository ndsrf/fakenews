# Requirements Document

## Introduction

Phase 3 introduces public-facing article display with comprehensive disclaimers, analytics tracking and visualization, and production hardening. This phase transforms the application from an internal content generation tool into a production-ready system with public access controls, privacy-compliant analytics, and multilingual support.

The primary value is enabling users to safely share fictional news articles with proper disclaimers while gaining insights into content performance through detailed analytics.

## Alignment with Product Vision

This feature completes the fictional news article generator by:

* Enabling safe public consumption of fictional content with prominent disclaimers
* Providing data-driven insights to content creators about article performance
* Ensuring production-grade security, reliability, and compliance (GDPR)
* Supporting multilingual audiences (EN/ES) throughout the entire application

## Requirements

### Requirement 1: Public Article Viewing with Disclaimers

**User Story:** As a public visitor, I want to view fictional news articles with clear disclaimers, so that I understand the content is fictional and not real news.

#### Acceptance Criteria

1. WHEN a visitor accesses a public article URL THEN the system SHALL display the article with a sticky top banner containing "FICTIONAL CONTENT" warning
2. WHEN viewing an article THEN the system SHALL render a semi-transparent "FICTIONAL" watermark overlay at -45deg rotation with 3% opacity
3. WHEN scrolling the article THEN the top disclaimer banner SHALL remain visible (sticky positioning)
4. WHEN reaching the end of the article THEN the system SHALL display a footer disclaimer explaining the fictional nature
5. WHEN the article is indexed by search engines THEN the system SHALL include `<meta name="robots" content="noindex, nofollow">` tags
6. WHEN the article is shared on social media THEN Open Graph tags SHALL include `[FICTIONAL]` prefix in title and description
7. WHEN accessing an article URL THEN the system SHALL follow the pattern `/{brand-slug}/article/{year}/{month}/{slug}`
8. IF the article status is "draft" THEN the system SHALL return 404 for public access
9. WHEN viewing an article THEN the system SHALL display related article titles in a sidebar (generated during article creation)

### Requirement 2: Analytics Tracking

**User Story:** As a content creator, I want to track how my articles are performing, so that I can understand audience engagement.

#### Acceptance Criteria

1. WHEN a visitor views an article THEN the system SHALL record a page view with anonymized IP (SHA-256 hash)
2. WHEN recording a page view THEN the system SHALL extract and store: country, city, browser, OS, device type, referrer
3. WHEN extracting geographic data THEN the system SHALL use GeoIP lookup based on IP address
4. WHEN parsing user agent THEN the system SHALL identify browser name/version, OS, and device type
5. WHEN storing IP addresses THEN the system SHALL hash them before database storage (GDPR compliance)
6. WHEN recording multiple views from same IP THEN the system SHALL record each view (not deduplicated)
7. IF GeoIP lookup fails THEN the system SHALL store NULL for geographic fields and continue tracking

### Requirement 3: Analytics Dashboard

**User Story:** As a content creator, I want to visualize analytics data, so that I can gain insights into content performance.

#### Acceptance Criteria

1. WHEN accessing the analytics dashboard THEN the system SHALL display global statistics (total views, articles, brands)
2. WHEN viewing analytics THEN the system SHALL render a line chart showing views over time using Recharts
3. WHEN viewing analytics THEN the system SHALL render a pie chart showing device breakdown (desktop, mobile, tablet)
4. WHEN viewing analytics THEN the system SHALL render a bar chart showing geographic distribution by country
5. WHEN viewing analytics THEN the system SHALL display a table of top articles sorted by view count
6. WHEN filtering analytics by brand THEN the system SHALL show only data for selected brand
7. WHEN filtering analytics by article THEN the system SHALL show detailed stats for that article
8. WHEN filtering analytics by date range THEN the system SHALL limit data to selected timeframe
9. IF no data exists THEN the system SHALL display empty state messages, not errors

### Requirement 4: Analytics Export

**User Story:** As a super admin, I want to export analytics data, so that I can perform custom analysis in external tools.

#### Acceptance Criteria

1. WHEN requesting analytics export THEN the system SHALL generate a CSV file with all page view records
2. WHEN exporting THEN the CSV SHALL include columns: timestamp, article title, brand, country, city, browser, OS, device, referrer
3. WHEN exporting THEN the system SHALL NOT include raw IP addresses or hashed IPs in the CSV
4. WHEN export completes THEN the system SHALL trigger browser download of the CSV file
5. IF export includes large datasets THEN the system SHALL stream the CSV (not load all in memory)
6. WHEN filtering analytics before export THEN the system SHALL apply the same filters to CSV output

### Requirement 5: Internationalization (i18n)

**User Story:** As a user, I want to use the application in my preferred language, so that I can work more efficiently.

#### Acceptance Criteria

1. WHEN accessing the application THEN the system SHALL support English (EN) and Spanish (ES) languages
2. WHEN switching language THEN all UI text (buttons, labels, messages) SHALL update immediately
3. WHEN a user sets language preference THEN the system SHALL persist it in their user profile
4. WHEN logging in THEN the system SHALL load the user's preferred language from profile
5. WHEN viewing public articles THEN the disclaimer text SHALL display in the article's language
6. WHEN generating articles THEN the content SHALL be in the specified target language
7. WHEN viewing analytics labels THEN chart axes and legends SHALL display in current language
8. IF a translation is missing THEN the system SHALL fall back to English

### Requirement 6: Production Hardening

**User Story:** As a system administrator, I want the application to be production-ready, so that it can handle real-world traffic reliably.

#### Acceptance Criteria

1. WHEN deploying THEN the system SHALL run in Docker containers via docker-compose
2. WHEN the application starts THEN the migration service SHALL run before routes are registered
3. WHEN the database is modified THEN the system SHALL create daily backup files
4. WHEN errors occur THEN the system SHALL log events using Winston or Pino
5. WHEN critical errors occur THEN the system SHALL send notifications (optional Sentry integration)
6. WHEN returning errors to clients THEN the system SHALL provide graceful error messages (not stack traces)
7. IF the database file is corrupted THEN the system SHALL fail to start with clear error message
8. WHEN health check endpoint is called THEN the system SHALL return version info and database status

### Requirement 7: Security Enhancements

**User Story:** As a security-conscious administrator, I want the application to prevent common attacks, so that user data remains safe.

#### Acceptance Criteria

1. WHEN receiving AI generation requests THEN the system SHALL enforce rate limit of 5 requests/hour per user
2. WHEN receiving API requests THEN the system SHALL enforce rate limit of 100 requests/15min per IP address
3. WHEN accepting user input THEN the system SHALL validate using Zod schemas
4. WHEN storing markdown content THEN the system SHALL sanitize to prevent XSS attacks
5. WHEN accepting URL inputs THEN the system SHALL validate format and restrict protocols to http/https
6. WHEN serving HTTP responses THEN the system SHALL include security headers via helmet.js (CSP, X-Frame-Options, HSTS)
7. WHEN rate limits are exceeded THEN the system SHALL return 429 Too Many Requests status
8. IF authentication token is invalid THEN the system SHALL return 401 and clear client-side token

### Requirement 8: Disclaimer configuration

**User Story:** As a system administrator, I want to be able to edit the disclaimers.

#### Acceptance Criteria

1. WHEN the system runs THEN disclaimers SHALL be generated from a clear set of files (markdown, HTML, config... whatever but clearly identifiable and editable)

## Non-Functional Requirements

### Code Architecture and Modularity

* **Single Responsibility Principle**: Separate analytics tracking, data aggregation, and visualization into distinct services
* **Modular Design**: GeoIP, IP anonymization, and user agent parsing should be isolated utility functions
* **Dependency Management**: Analytics service should not depend on article generation services
* **Clear Interfaces**: Define TypeScript interfaces for PageView, AnalyticsStats, ExportOptions

### Performance

* Page view tracking must complete in \< 100ms (non-blocking for article viewing)
* Analytics dashboard should load within 2 seconds with up to 100,000 page views
* CSV export must stream data for datasets > 10MB to prevent memory issues
* Public article pages should achieve Lighthouse score > 90
* Analytics charts should render within 500ms

### Security

* All IP addresses must be hashed (SHA-256) before database storage
* No Personally Identifiable Information (PII) in analytics data
* Rate limiting on all public endpoints
* Input validation using Zod on all API endpoints
* Helmet.js security headers on all responses
* Content Security Policy (CSP) configured to prevent XSS

### Reliability

* 99.9% uptime target for public article viewing
* Graceful degradation if GeoIP service is unavailable
* Database backups automated daily
* Error logging for all failures with context
* Health check endpoint for monitoring

### Usability

* Analytics dashboard responsive on mobile, tablet, desktop
* Empty states for analytics with no data
* Loading states for all async operations
* Error messages in user's selected language
* CSV export with user-friendly column headers
* Disclaimer banners readable and non-intrusive