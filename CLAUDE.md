# Claude Code - Project Guide

## Commands

- **Development**: `npm run dev` (Runs both client and server in watch mode)
- **Build**: `npm run build` (Builds both client and server)
- **Start**: `npm start` (Runs the built server)
- **Test**: `npm test` (Runs unit and integration tests with coverage)
  - Unit only: `npm run test:unit`
  - Integration only: `npm run test:integration`
  - E2E: `npm run test:e2e` (Playwright)
- **Database**:
  - Migrate: `npm run prisma:migrate`
  - Generate Client: `npm run prisma:generate`
  - Seed: `npm run prisma:seed`
  - Studio: `npm run prisma:studio`

## Coding Conventions

### General
- **Stack**: React (Vite) + Express (Node.js) + TypeScript + Prisma + SQLite.
- **Strict Typing**: strict TypeScript usage is enforced; avoid `any`.
- **Modules**: Use ES Modules (`import`/`export`) throughout.
- **Styling**: Tailwind CSS for all styling needs.
- **State**: React Context for global client state; minimal local state.

### Structure
- `src/client`: Frontend application (React).
  - `components/`: Reusable UI components.
  - `pages/`: Route components.
  - `services/`: API client and external services.
- `src/server`: Backend application (Express).
  - `controllers/`: Request handlers.
  - `services/`: Business logic.
  - `routes/`: API route definitions.
  - `prisma/`: Database schema and migrations.

### Versioning & Releases
- Follow `VERSIONING.md` strictly.
- Use `npm run version:patch/minor/major` for local bumps.
- Use `npm run release:patch/minor/major` for releases (pushes tags).

## Git & Commits

**IMPORTANT**: This project enforces **Conventional Commits**.
All commit messages MUST follow the format:
`<type>(<scope>): <subject>`

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting, missing semi-colons, etc.
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `perf`: Performance improvement
- `test`: Adding missing tests
- `chore`: Maintenance, dependencies, build process

### Examples
- `feat(auth): implement jwt authentication`
- `fix(ui): correct button padding on mobile`
- `docs(readme): update installation instructions`
- `chore(deps): upgrade prisma to v5`

### Rules
- Subject must be lowercase.
- No period at the end of the subject.
- Use the imperative mood ("add" not "added").
