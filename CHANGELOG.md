# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
