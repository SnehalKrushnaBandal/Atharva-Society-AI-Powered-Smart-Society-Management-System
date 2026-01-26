# Contributing to Rajarshi Darshan Society Management

Thank you for your interest in contributing!

## Development Setup

1. Fork and clone the repository
2. Install dependencies:
   ```bash
   cd client && npm install
   cd ../server && npm install
   ```
3. Copy environment files:
   ```bash
   cp server/.env.example server/.env
   cp client/.env.example client/.env.local
   ```
4. Start development servers:
   ```bash
   # Terminal 1 - Backend
   cd server && npm run dev
   
   # Terminal 2 - Frontend
   cd client && npm run dev
   ```

## Code Style

- Use ESLint and Prettier
- Follow existing patterns
- Write meaningful commit messages

## Pull Request Process

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## Questions?

Open an issue for any questions.
