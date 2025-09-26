# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2025-09-26] - Platform-Agnostic Deployment with Nixpacks

### Added
- Nixpacks configuration for zero-config deployments
- Platform-agnostic deployment setup supporting Railway, Render, Vercel, DigitalOcean
- External services separation for clean local development workflow
- Automated development scripts for starting local services
- Comprehensive platform-neutral deployment documentation

### Changed
- Restructured project with external services moved to separate folder
- Updated Next.js configuration with standalone output for optimal deployment
- Enhanced package.json with development workflow scripts
- Migrated from platform-specific configurations to universal Nixpacks approach

### Removed
- Platform-specific deployment files (Docker Compose, Nginx configs)
- Coolify-specific configuration and documentation
- Complex multi-service production deployment setup
- Custom Dockerfile in favor of Nixpacks auto-detection

### Fixed
- Eliminated repository coupling to specific deployment platforms
- Simplified deployment process while maintaining flexibility
- Reduced configuration complexity for new contributors

## [2025-09-26] - Resizable Column Layout

### Added
- ResizableLayout component with drag-to-resize functionality for column widths
- Persistent column width preferences using localStorage
- Visual resize handles with hover effects between columns
- Minimum width constraints to prevent columns from becoming unusable

### Changed
- Increased default width for Tasks column from 320px to 480px
- Increased default width for Subtasks column from 320px to 480px
- Replaced fixed-width column layout with dynamic resizable layout system
- Enhanced user experience with adjustable workspace layout

### Fixed
- Limited space in Tasks and Subtasks columns
- Inflexible layout that couldn't adapt to user preferences

## [2025-09-26] - Auto-Highlight Feature

### Added
- Auto-highlighting functionality for newly created projects, tasks and subtasks
- Automatic selection of projects upon creation for immediate visibility
- Automatic selection of tasks upon creation for immediate visibility
- Automatic selection of subtasks upon creation with details panel activation

### Changed
- Enhanced `createProject` function in app store to auto-select newly created projects
- Enhanced `createTask` function in app store to auto-select newly created tasks
- Enhanced `createSubtask` function in app store to auto-select newly created subtasks
- Improved user experience by immediately highlighting new items after creation

## [2025-09-26] - Delete Operations Fix

### Fixed
- Fixed "Unexpected end of JSON input" error when deleting projects, tasks, and subtasks
- Enhanced API client to properly handle empty responses from DELETE operations
- Added dedicated `deleteRequest` method for DELETE operations in API client

### Added  
- Delete option to task dropdown menus with confirmation dialog
- Delete option to subtask dropdown menus with confirmation dialog
- Proper error handling for empty API responses

### Changed
- Updated `request` method in API client to check content-length and content-type headers
- Enhanced all delete methods (`deleteProject`, `deleteTask`, `deleteSubtask`, `deleteComment`) to use new approach

## [1.5.0] - 2025-09-26

### Changed

- **Details Panel UI Optimization**: Complete redesign of the details panel for significantly improved space utilization
- Replaced bulky Card components with streamlined inline sections
- Moved comment input to persistent bottom position for better accessibility
- Description section now uses inline editing with click-to-edit functionality
- Reduced vertical spacing throughout the panel by 40-50%
- Comments display in more compact format with smaller text and padding
- Status badges and buttons optimized for smaller footprint
- Enhanced UX with auto-focus, smart button states, and improved visual hierarchy

### Added

- Inline description editing with Save/Cancel actions
- Persistent comment input section at bottom of details panel
- Auto-focus functionality for description textarea when editing
- Enhanced loading states for comment additions

### Fixed

- Space wastage in description and comments sections
- Scrolling issues when adding comments
- Visual clutter from excessive card wrapping
- Button and input sizing for better mobile experience

## [1.4.0] - 2025-09-26

### Changed

- **BREAKING**: Migrated from Supabase to PostgreSQL-only architecture
- Replaced Supabase client with direct local API client for simplified database access
- Updated all database operations to use local PostgreSQL via PostgREST
- Simplified environment configuration by removing Supabase-specific variables
- Streamlined codebase by eliminating Supabase wrapper and dual-mode complexity

### Removed

- Supabase JavaScript client dependencies (@supabase/supabase-js, @supabase/ssr)  
- Supabase client wrapper and abstraction layer
- Remote Supabase configuration and environment variables
- Multi-environment database switching (local vs remote)

### Fixed

- Reduced application complexity by using single database connection method
- Eliminated potential configuration issues with dual database setups
- Improved development experience with consistent local-only database access

## [1.3.0] - 2025-09-26

### Added

- Complete local development database setup using Docker Compose
- PostgreSQL 17 with PostgREST API for local development
- Automatic environment switching between local and remote databases
- PgAdmin interface for database administration (optional)
- Comprehensive local database setup documentation
- Sample data pre-loaded in local database for immediate testing
- Database initialization scripts with complete schema and relationships

### Changed

- Enhanced Supabase client to support local PostgREST endpoints
- Updated environment configuration for local/remote database switching
- Modified docker-compose.yml to include complete database stack

### Fixed

- Resolved network connectivity issues with corporate firewalls/proxies
- Eliminated dependency on external Supabase connectivity for development
- Provided offline-capable development environment

## [1.2.0] - 2025-09-26

### Added

- Complete database setup using Supabase MCP server integration
- Live database schema with all required tables (projects, tasks, subtasks, subtask_details, comments)
- Sample data population for immediate testing and development
- Real Supabase project connection with proper authentication
- Missing dependency (@radix-ui/react-icons) installation and resolution

### Fixed

- Resolved missing @radix-ui/react-icons dependency causing application errors
- Updated environment variables with actual Supabase project credentials
- Application now successfully connects to live database

### Changed

- Updated TypeScript types to match actual database schema from Supabase
- Environment configuration now points to live Supabase project instead of placeholders

## [1.1.0] - 2025-09-26

### Added

- Task Tracker application foundation with 4-column layout architecture
- Comprehensive database schema for hierarchical task management (projects → tasks → subtasks → details)
- Supabase integration with TypeScript type safety
- Zustand store for centralized application state management
- Projects sidebar with full CRUD operations and archive functionality
- Task and subtask column scaffolding with status management
- Details panel for subtask descriptions and comments system
- Real-time data synchronization capabilities
- Form validation using react-hook-form and zod
- Environment configuration template for Supabase connection
- Error handling with user-friendly error banner component
- Status badges and visual indicators for all hierarchy levels
- Search functionality across projects, tasks, and subtasks
- Additional shadcn/ui components: dropdown-menu, dialog, form, textarea

### Dependencies Added

- @supabase/supabase-js and @supabase/ssr for database integration
- @dnd-kit/core and @dnd-kit/sortable for drag-and-drop functionality
- zustand for state management
- react-hook-form and @hookform/resolvers for form handling
- zod for schema validation
- date-fns for date formatting

### Changed

- Completely restructured main page from demo template to Task Tracker application
- Established component architecture with feature-based organization
- Implemented comprehensive TypeScript types for database schema

### Fixed

- Environment variable configuration for Supabase client
- Component import paths and dependencies

## [1.0.0] - 2025-09-26

### Added

- Initial Next.js 15 project setup with TypeScript support
- Tailwind CSS v4 integration with custom CSS variables
- shadcn/ui component library configuration
- Pre-installed UI components: Button, Card, Input
- Interactive task manager demo showcasing component usage
- Component showcase with button variants and sizes
- Responsive design with dark mode support
- Comprehensive README with setup and deployment instructions
- Modern project structure with proper import aliases
- CSS variables for consistent theming
- Development and production build scripts

### Changed

- Updated globals.css with shadcn/ui theming system
- Replaced default Next.js homepage with custom template showcase

### Fixed

- Proper shadcn/ui configuration for Next.js v15 compatibility
- CSS variable integration with Tailwind CSS v4
