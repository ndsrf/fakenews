# Fictional News Generator

An AI-powered web application for generating fictional news-style articles with custom templates, analytics, and multilingual support (EN/ES).

**⚠️ IMPORTANT: All content generated is FICTIONAL and includes prominent disclaimers.**

## Features

### Phase 1 (✅ Completed)
- ✅ User authentication (JWT-based)
- ✅ User registration with approval workflow
- ✅ First user becomes super admin automatically
- ✅ Role-based access control (super_admin, admin, user)
- ✅ Minimal login page with version display
- ✅ Multilingual support (EN/ES)
- ✅ Database migration system
- ✅ Version tracking

### Phase 2 (Coming Soon)
- AI-powered article generation
- Custom template extraction from URLs
- AI logo generator for brands
- Rich markdown editor
- Article management system

### Phase 3 (Coming Soon)
- Public article viewing with disclaimers
- Analytics dashboard
- Export functionality
- Production optimizations

## Tech Stack

- **Frontend**: React 18+, TypeScript, Tailwind CSS, react-i18next
- **Backend**: Node.js, Express.js
- **Database**: SQLite with Prisma ORM
- **Migrations**: Custom SQL migration system
- **Testing**: Jest, Playwright
- **Containerization**: Docker, Docker Compose

## Installation

### Prerequisites

- Node.js 20+
- npm or yarn

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd fakenews
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env and add your configuration
   ```

4. **Generate Prisma client**
   ```bash
   npm run prisma:generate
   ```

5. **Start development servers**
   ```bash
   npm run dev
   ```

   This will start:
   - Backend server on http://localhost:3000
   - Frontend dev server on http://localhost:5173

6. **Access the application**
   - Open http://localhost:5173 in your browser
   - Register the first user (automatically becomes super admin)

### Docker Deployment

1. **Build and start with Docker Compose**
   ```bash
   docker-compose up -d
   ```

2. **View logs**
   ```bash
   docker-compose logs -f
   ```

3. **Stop the application**
   ```bash
   docker-compose down
   ```

## Versioning

This project follows [Semantic Versioning](https://semver.org/).

### Version Management

```bash
# Patch version (bug fixes)
npm run version:patch

# Minor version (new features)
npm run version:minor

# Major version (breaking changes)
npm run version:major
```

### Version with Git Push

```bash
npm run version:patch:push
npm run version:minor:push
npm run version:major:push
```

## Migration System

Migrations run automatically on application startup.

### Creating Migrations

1. Create a version directory: `migrations/X.Y.Z/`
2. Add SQL files: `001_description.sql`, `002_description.sql`
3. Bump version in `package.json`

Example:
```bash
mkdir migrations/1.1.0
echo "ALTER TABLE..." > migrations/1.1.0/001_add_feature.sql
npm run version:minor
```

See [migrations/README.md](migrations/README.md) for details.

## NPM Scripts

### Development
- `npm run dev` - Start development servers (backend + frontend)
- `npm run server:dev` - Start backend only
- `npm run client:dev` - Start frontend only

### Build
- `npm run build` - Build for production
- `npm run build:client` - Build frontend only
- `npm run build:server` - Build backend only
- `npm start` - Start production server

### Database
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run Prisma migrations
- `npm run prisma:studio` - Open Prisma Studio

### Testing
- `npm test` - Run all tests with coverage
- `npm run test:unit` - Run unit tests only
- `npm run test:integration` - Run integration tests only
- `npm run test:e2e` - Run E2E tests with Playwright
- `npm run test:watch` - Run tests in watch mode
- `npm run test:ci` - Run all tests for CI

### Docker
- `npm run docker:build` - Build Docker image
- `npm run docker:up` - Start Docker containers
- `npm run docker:down` - Stop Docker containers
- `npm run docker:logs` - View Docker logs

## Environment Variables

See [.env.example](.env.example) for all available configuration options.

Key variables:
- `DATABASE_URL` - SQLite database path
- `JWT_SECRET` - Secret key for JWT tokens
- `JWT_EXPIRY` - Token expiration time
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (development/production)

## Project Structure

```
fakenews/
├── migrations/           # Database migrations
├── prisma/              # Prisma schema and config
├── src/
│   ├── server/          # Backend code
│   │   ├── config/      # Configuration
│   │   ├── controllers/ # Request handlers
│   │   ├── middleware/  # Express middleware
│   │   ├── routes/      # API routes
│   │   ├── services/    # Business logic
│   │   └── utils/       # Utilities
│   └── client/          # Frontend code
│       ├── components/  # React components
│       ├── pages/       # Page components
│       ├── contexts/    # React contexts
│       ├── services/    # API and i18n
│       └── locales/     # Translations
├── tests/               # Test files
├── data/                # SQLite database
├── uploads/             # Uploaded files
└── generated_articles/  # Generated content
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout user

### User Management (Super Admin Only)
- `GET /api/users` - List all users
- `GET /api/users/pending` - List pending approvals
- `PUT /api/users/:id/approve` - Approve user
- `PUT /api/users/:id/role` - Update user role
- `DELETE /api/users/:id` - Delete user

### System
- `GET /health` - Health check
- `GET /api/version` - Get application version

## Testing

Run tests with:
```bash
npm test              # All tests with coverage
npm run test:unit     # Unit tests only
npm run test:e2e      # E2E tests only
```

Coverage requirements: 70%+ for Phase 1

## Contributing

1. Create a feature branch: `git checkout -b feat/my-feature`
2. Make changes with conventional commits
3. Run tests: `npm test`
4. Submit a pull request

### Commit Message Format

```
<type>(<scope>): <subject>

Types: feat, fix, docs, style, refactor, perf, test, build, ci, chore
```

## License

ISC

## Support

For issues and questions, please open a GitHub issue.
