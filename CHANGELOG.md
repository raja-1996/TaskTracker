# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased] - 2025-09-30

### Fixed
- **CRITICAL Build Errors**: Fixed TypeScript and ESLint errors preventing production deployment
- Replaced `any` types with proper TypeScript types (Project, Task, Subtask, Comment, Details types) in enhance-description API route
- Removed unused `statusConfig` variable in projects-sidebar component
- Fixed subtask and task interfaces to use proper Subtask and Task types instead of any
- Removed unused `subtaskName` parameter from `handleAcceptSubtask` function
- Added null check for entity before accessing properties in enhance-description route
- All linter errors resolved and build now compiles successfully

### Added
- **AI-Powered Description Enhancement**: Added functionality to enhance descriptions using LLM with structured formatting
- "Enhance" button in details panel for projects, tasks, and subtasks to improve descriptions with AI
- LLM-generated descriptions with markdown formatting (headers, subheaders, bullet points)
- Enhanced descriptions include sections like Overview, Key Features, Objectives, Requirements, and Technical Details
- Backend API endpoint `/api/ai/enhance-description` for processing description enhancements
- `enhanceDescription` method in LLM service with structured prompt templates
- Context-aware enhancement considering entity title, current description, and related comments
- Automatic save and UI update after successful description enhancement
- Loading states and error handling for enhancement operations
- **Markdown Preview in Rich Text Editor**: Added Edit/Preview toggle to properly render markdown formatted descriptions
- Preview mode displays formatted markdown with proper headers, lists, and styling
- Edit mode shows raw markdown for editing
- Integrated react-markdown for markdown rendering with custom component styling
- **Projects Drag and Drop**: Added drag and drop functionality for projects similar to tasks and subtasks
- Visual drag handles (grip vertical icon) for easy project reordering
- Smooth drag animations with opacity changes during dragging
- Automatic order persistence - reordered projects maintain their position across sessions
- Keyboard accessibility support for project drag and drop operations
- Database migration (`002_add_project_order_index.sql`) to add `order_index` column to projects table
- `reorderProjects` method in app store for handling project reordering
- Projects now ordered by `order_index` instead of `created_at`
- **Accept AI-Generated Tasks/Subtasks Feature**: Added comprehensive functionality to accept AI-generated content and convert it to user-generated
- "Accept Task" and "Accept Subtask" options in dropdown menus for individual AI-generated items
- "Accept All AI Tasks" and "Accept All AI Subtasks" buttons in column headers when AI items are present
- Confirmation dialogs for individual and bulk accept operations with clear messaging
- Backend API endpoints: `/api/ai/accept-task`, `/api/ai/accept-subtask`, `/api/ai/accept-all-tasks`, `/api/ai/accept-all-subtasks`
- Database source_type conversion from 'ai' to 'user' when accepting AI-generated content
- Real-time UI updates showing icon changes from AI (blue bot) to User (green user) after acceptance
- Loading states and error handling for all accept operations
- API client methods for accepting individual and bulk AI items
- App store integration with accept methods and optimistic UI updates

### Changed
- **Projects Sidebar Redesign**: Completely redesigned projects sidebar with integrated drag and drop
- Merged `project-item.tsx` functionality into `projects-sidebar.tsx` for better maintainability
- Projects now use sortable list pattern similar to tasks and subtasks
- Inline editing for project names directly in the sidebar
- Removed status icon circle from project items for cleaner UI
- Updated database types to include `order_index` field for projects
- API client now assigns proper `order_index` when creating new projects
- Updated TasksColumn and SubtasksColumn components to include accept functionality
- Enhanced dropdown menus for AI items with accept options
- Modified app store with new accept actions and proper state management
- Expanded API client with comprehensive accept methods
- Updated component interfaces to support accept operations and loading states
- **Description Box Height**: Increased minimum height from 80px to 200px for better readability and easier editing
- **Subtask Accept UX**: Removed confirmation popup for accepting individual AI-generated subtasks for smoother user experience

### Fixed
- **CRITICAL Resizable Layout Slider Bug**: Fixed subtasks and description panel slider not working properly
- Corrected widths array initialization to always include the last flex column element (0)
- Updated resize logic to handle the last flex column correctly - only adjusts the width of the resizable column before it
- The last column (Details panel) now properly maintains its flex behavior while resizing adjacent columns
- Reordering disabled while search filters are active to prevent order_index corruption (applies to all entities)
- Proper error handling for accept operations with user feedback
- Loading state management during accept processes
- Real-time state updates after successful accept operations

### Removed
- Removed standalone `project-item.tsx` component (functionality integrated into `projects-sidebar.tsx`)

## [Unreleased] - 2025-09-29

### Added
- **Always-Editable Descriptions**: Description sections are now always in edit mode with save button
- Created reusable `RichTextEditor` component with enhanced textarea styling
- **Drag and Drop Reordering**: Added drag and drop functionality for tasks and subtasks
- Users can now drag tasks up and down within the tasks column to reorder them
- Users can now drag subtasks up and down within the subtasks column to reorder them
- Visual drag handles (grip vertical icon) for easy identification of draggable items
- Smooth drag animations with opacity changes during dragging
- Automatic order persistence - reordered items maintain their position across sessions
- Keyboard accessibility support for drag and drop operations
- Immediate UI updates - reordered items reflect changes instantly without page refresh

### Fixed
- **Subtask Description Issue**: Fixed subtasks displaying the same description across different subtasks
- Improved state management to properly clear and reload subtask details when switching between subtasks
- Enhanced entity selection flow with immediate state clearing to prevent stale data display
- Added debugging logs to track subtask details loading and updating process
- **Rich Text Editor Display Issue**: Fixed character-by-character display bug in description editor
- Replaced complex Lexical editor with simple, styled textarea for better reliability
- Description text now displays properly as continuous text instead of separated characters
- **Drag and Drop UI Update**: Fixed issue where drag and drop reordering only worked after page refresh
- Drag operations now update the UI immediately with correct visual order
- **CRITICAL Drag and Drop Persistence Fix**: Fixed order_index corruption when reordering with active search filters
- Drag and drop changes now properly persist to database and maintain correct ordering after page refresh
- Reordering is temporarily disabled while search filters are active to prevent order corruption
- Fixed order_index calculation to update all items based on their new positions in the complete array
- **CRITICAL**: Fixed production deployment failing due to TypeScript/ESLint errors
- Replaced all `any` types with proper TypeScript types in API routes and store files
- Fixed unused variable warnings in authentication components
- Ensured proper type safety for Supabase database operations and AI generation APIs

### Changed
- **Description Editing UX**: Removed toggle-based editing in favor of always-visible editor
- Descriptions are now permanently editable with dedicated save button instead of edit/cancel toggle
- Simplified description editor with enhanced textarea styling for better user experience
- Removed `isEditingDescription` state and related toggle logic from details panel
- **AI Generation Behavior**: Modified AI task and subtask generation to use append mode instead of replacement
- AI-generated items are now appended to existing ones when clicking "AI Tasks" or "AI Subtasks" buttons
- "Refresh AI Tasks/Subtasks" option still replaces existing AI items (only available through dropdown menu)
- Removed caching behavior that prevented new AI generations when items already existed
- **Anti-Duplication System**: Enhanced AI prompts to prevent duplicate task/subtask generation
- LLM now receives complete context of ALL existing items (both user-created and AI-generated)
- Improved prompts with explicit uniqueness requirements and creative diversity strategies
- Added source labels ([USER]/[AI]) in LLM context for better differentiation

### Added
- AI-powered task and subtask generation using Google Gemini LLM
- LangChain integration for structured AI prompts and responses
- Context-aware task generation considering project details and existing content
- Visual indicators to distinguish between user-created and AI-generated items
- Refresh functionality for regenerating AI suggestions
- Smart ordering: user items displayed before AI-generated items
- New database tables and columns for tracking AI generations and source types
- Comprehensive API endpoints for AI task and subtask generation
- Environment configuration for Google AI API integration

### Changed  
- Updated database schema with `source_type` column for tasks and subtasks
- Enhanced UI components with AI generation buttons and indicators
- Modified task and subtask columns to show proper source-based ordering
- Updated TypeScript types to include AI-related fields
- Expanded API client with AI generation methods

### Fixed
- Proper error handling for AI generation failures
- Loading states during AI content generation
- Database constraints and indexes for AI-related tables

## [Unreleased] - 2025-09-28

### Added
- **Performance Analysis**: Comprehensive Supabase endpoint performance monitoring and analysis report
- Automated performance testing using Playwright MCP with network request monitoring
- Performance metrics collection using browser Performance API
- Detailed analysis of 9 Supabase API endpoints with response time measurements
- Performance recommendations with prioritized action items for optimization

### Analysis
- Identified critical performance bottleneck in initial projects load (1055ms response time)
- Documented performance variance across different endpoint operations (295ms to 1055ms)
- Created actionable recommendations for database optimization and caching implementation
- Average Supabase response time: 437ms (needs improvement for optimal user experience)

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