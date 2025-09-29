# Database Migrations

This directory contains incremental database migrations for the Task Tracker application.

## Migration Files

### `001_add_ai_features.sql`
- **Purpose**: Adds AI generation capabilities to existing database
- **Date**: 2025-09-29
- **Changes**:
  - Adds `source_type` column to `tasks` and `subtasks` tables
  - Creates `ai_generations` table for caching AI responses
  - Adds performance indexes
  - Sets up RLS policies for AI features
  - Backfills existing data with `source_type = 'user'`

## How to Use

### For Fresh Database Setup
Use the main schema file: `supabase_schema.sql`

### For Existing Database
Run migration files in order:
1. `001_add_ai_features.sql` - Adds AI capabilities

## Migration Best Practices

- ✅ **Incremental**: Each migration builds on the previous state
- ✅ **Idempotent**: Safe to run multiple times (`IF NOT EXISTS`, etc.)
- ✅ **Versioned**: Clear numbering system (001, 002, etc.)
- ✅ **Focused**: Each migration has a single purpose
- ✅ **Documented**: Clear description of changes and purpose

## Running Migrations

1. Open your Supabase Dashboard
2. Go to SQL Editor
3. Copy and paste the migration file content
4. Click "Run"
5. Verify success before proceeding
