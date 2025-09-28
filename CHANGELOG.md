# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2025-09-28

### Fixed
- **CRITICAL**: Fixed authentication system completely failing during signup with "Database error saving new user"
- **CRITICAL**: Fixed signin redirect issue where users were sent back to signin page instead of main app
- Fixed database trigger function being blocked by RLS policies during user creation
- Fixed duplicate user insertion causing conflicts between database trigger and application code
- Fixed session persistence issues between client-side authentication and server-side middleware

### Changed
- Updated Supabase client to use SSR-compatible `createBrowserClient` instead of regular `createClient`
- Improved database trigger function with proper error handling and `SECURITY DEFINER` permissions
- Updated RLS policies to allow trigger-based user insertions during signup
- Changed authentication form to use `window.location.href` for reliable session refresh after signin/signup
- Removed duplicate manual user insertion code from auth form (trigger handles it automatically)
- **Updated `supabase_schema.sql` with all authentication fixes** - prevents same issues on fresh deployments

### Added
- Comprehensive Playwright-based authentication testing
- Enhanced error handling in database trigger functions
- Better session management for Next.js SSR compatibility

### Technical Details
- Root cause: Database trigger was blocked by RLS policy requiring authenticated users, but trigger runs before user is authenticated
- Solution: Updated trigger function to use `SECURITY DEFINER` and bypass RLS for user creation
- Additional fix: Replaced regular Supabase client with SSR-compatible browser client for proper cookie handling
- Testing: Full end-to-end authentication flow verified with Playwright automation

## [Unreleased] - 2025-09-28

### Fixed
- Fixed foreign key constraint violation "projects_user_id_fkey" during project creation by adding automatic user record creation in `ensureUserExists()` method
- Added fallback mechanism to create missing user records in the database when the signup trigger fails or user was created before trigger setup

### Added
- Created `supabase_schema.sql` - Complete database schema setup script for Supabase

- Complete migration from PostgreSQL + NextAuth to Supabase for both authentication and database
- Supabase client configuration with browser and server-side support
- New Supabase API client with identical interface to previous PostgreSQL client
- Environment variable configuration for Supabase project URL and anonymous key
- Supabase Auth integration with automatic session management

### Changed

- **BREAKING**: Migrated from local PostgreSQL to Supabase cloud database
- **BREAKING**: Replaced NextAuth.js authentication with Supabase Auth
- Database client now uses Supabase client instead of PostgREST/PostgreSQL
- Authentication flow now uses Supabase Auth with email/password sign-in and sign-up
- User sessions now managed by Supabase Auth with automatic token refresh
- Middleware updated to use Supabase Auth session management
- Auth forms updated to use Supabase Auth methods
- User header component updated for Supabase user metadata
- Main application page updated to use Supabase Auth state management

### Removed

- NextAuth.js dependency and all related configuration
- Local PostgreSQL client and PostgREST API layer
- Local Docker-based database setup (external/ directory completely removed)
- NextAuth-specific database tables (accounts, sessions, verification_tokens)
- Password hashing with bcryptjs (handled by Supabase)
- Custom credential provider and session management

### Dependencies

- Added @supabase/supabase-js@2.47.12 for Supabase client
- Added @supabase/ssr@0.7.0 for server-side rendering support
- Removed next-auth@5.0.0-beta.29 
- Removed bcryptjs and @types/bcryptjs
- Removed pg and @types/pg PostgreSQL dependencies

### Security

- Authentication now handled by Supabase with built-in security features
- Row Level Security (RLS) policies handled by Supabase
- OAuth providers available through Supabase Auth
- Secure token-based authentication with automatic refresh

## [1.0.0] - 2025-09-27

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