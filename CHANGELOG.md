# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased] - 2025-09-27

### Added

- Complete authentication system using NextAuth.js v4
- User registration and login with email/password credentials
- JWT-based session management with secure authentication flow
- Database schema updated with users, accounts, sessions, and verification_tokens tables
- User-specific data filtering - all projects, tasks, and subtasks now belong to authenticated users
- Authentication middleware to protect all routes except auth pages
- User profile header with logout functionality
- Demo user account (email: demo@tasktracker.local, password: demo123)

### Changed

- Projects table now requires user_id foreign key for multi-user support
- API client updated to include user authentication and filter data by user_id
- Application layout updated with NextAuth SessionProvider
- Main page now handles authentication state and redirects unauthenticated users
- Updated database types to include user-related tables and user_id fields
- Docker Compose configuration enhanced with environment variable support for all credentials
- External services README updated with security configuration instructions  
- Removed default fallback values from Docker Compose - all environment variables are now required

### Security

- Password hashing with bcryptjs using 12-round salting
- CSRF protection built into NextAuth.js
- Secure session management with JWT tokens
- Environment-based authentication secrets
- Protected API routes with user context
- Docker Compose configuration now supports environment variables for secure credential management
- Added .env.example template for secure database and PostgREST configuration

### Dependencies

- Added next-auth@4.24.10 for authentication
- Added bcryptjs for secure password hashing
- Added @types/bcryptjs for TypeScript support