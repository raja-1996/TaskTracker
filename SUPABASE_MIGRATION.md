# Supabase Migration Guide

This document outlines the migration from local PostgreSQL + NextAuth to Supabase for both authentication and database operations.

## Overview

The task tracker application has been completely migrated from:
- **From**: Local PostgreSQL + PostgREST + NextAuth.js
- **To**: Supabase (Database + Authentication)

## What Changed

### Authentication
- Replaced NextAuth.js with Supabase Auth
- No more custom credential providers or password hashing
- Automatic session management with token refresh
- Built-in support for OAuth providers (Google, GitHub, etc.)

### Database
- Migrated from local PostgreSQL to Supabase cloud database
- Replaced PostgREST API calls with Supabase client
- Removed NextAuth-specific tables (accounts, sessions, verification_tokens)
- Simplified user table (removed password_hash field)

### Code Changes
- New Supabase client configuration
- Updated authentication middleware
- Refactored auth components and forms
- Updated all CRUD operations to use Supabase client
- Updated user session management

## Setup Instructions

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new account
2. Create a new project
3. Get your project URL and anonymous key from Settings > API

### 2. Environment Variables

Create a `.env.local` file with:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Database Setup

Run the following SQL in your Supabase SQL editor to create the required tables:

```sql
-- Create users table (Supabase auth handles password)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    due_date DATE,
    owner TEXT DEFAULT 'user',
    status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'Completed', 'Archived')),
    archived BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    status TEXT DEFAULT 'To-Do' CHECK (status IN ('To-Do', 'In Progress', 'Done')),
    order_index INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create subtasks table
CREATE TABLE IF NOT EXISTS subtasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    status TEXT DEFAULT 'To-Do' CHECK (status IN ('To-Do', 'In Progress', 'Done')),
    order_index INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create details tables
CREATE TABLE IF NOT EXISTS project_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL UNIQUE REFERENCES projects(id) ON DELETE CASCADE,
    description TEXT DEFAULT '',
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS task_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL UNIQUE REFERENCES tasks(id) ON DELETE CASCADE,
    description TEXT DEFAULT '',
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS subtask_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subtask_id UUID NOT NULL UNIQUE REFERENCES subtasks(id) ON DELETE CASCADE,
    description TEXT DEFAULT '',
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type TEXT NOT NULL CHECK (entity_type IN ('project', 'task', 'subtask')),
    entity_id UUID NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_archived ON projects(archived);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_order_index ON tasks(project_id, order_index);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_subtasks_task_id ON subtasks(task_id);
CREATE INDEX IF NOT EXISTS idx_subtasks_status ON subtasks(status);
CREATE INDEX IF NOT EXISTS idx_subtasks_order_index ON subtasks(task_id, order_index);
CREATE INDEX IF NOT EXISTS idx_subtasks_created_at ON subtasks(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_project_details_project_id ON project_details(project_id);
CREATE INDEX IF NOT EXISTS idx_task_details_task_id ON task_details(task_id);
CREATE INDEX IF NOT EXISTS idx_subtask_details_subtask_id ON subtask_details(subtask_id);

CREATE INDEX IF NOT EXISTS idx_comments_entity_type_id ON comments(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at ASC);

-- Create function to automatically insert user data on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO users (id, email, name)
    VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'name', 'User'));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to call the function
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE subtasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE subtask_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
-- Users can only see their own data
CREATE POLICY "Users can view own data" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (auth.uid() = id);

-- Projects policies
CREATE POLICY "Users can view own projects" ON projects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own projects" ON projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own projects" ON projects FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own projects" ON projects FOR DELETE USING (auth.uid() = user_id);

-- Tasks policies
CREATE POLICY "Users can view own tasks" ON tasks FOR SELECT USING (
    auth.uid() = (SELECT user_id FROM projects WHERE projects.id = tasks.project_id)
);
CREATE POLICY "Users can insert own tasks" ON tasks FOR INSERT WITH CHECK (
    auth.uid() = (SELECT user_id FROM projects WHERE projects.id = tasks.project_id)
);
CREATE POLICY "Users can update own tasks" ON tasks FOR UPDATE USING (
    auth.uid() = (SELECT user_id FROM projects WHERE projects.id = tasks.project_id)
);
CREATE POLICY "Users can delete own tasks" ON tasks FOR DELETE USING (
    auth.uid() = (SELECT user_id FROM projects WHERE projects.id = tasks.project_id)
);

-- Subtasks policies  
CREATE POLICY "Users can view own subtasks" ON subtasks FOR SELECT USING (
    auth.uid() = (
        SELECT user_id FROM projects 
        WHERE projects.id = (SELECT project_id FROM tasks WHERE tasks.id = subtasks.task_id)
    )
);
CREATE POLICY "Users can insert own subtasks" ON subtasks FOR INSERT WITH CHECK (
    auth.uid() = (
        SELECT user_id FROM projects 
        WHERE projects.id = (SELECT project_id FROM tasks WHERE tasks.id = subtasks.task_id)
    )
);
CREATE POLICY "Users can update own subtasks" ON subtasks FOR UPDATE USING (
    auth.uid() = (
        SELECT user_id FROM projects 
        WHERE projects.id = (SELECT project_id FROM tasks WHERE tasks.id = subtasks.task_id)
    )
);
CREATE POLICY "Users can delete own subtasks" ON subtasks FOR DELETE USING (
    auth.uid() = (
        SELECT user_id FROM projects 
        WHERE projects.id = (SELECT project_id FROM tasks WHERE tasks.id = subtasks.task_id)
    )
);

-- Similar policies for details and comments tables...
-- (Add similar RLS policies for project_details, task_details, subtask_details, and comments)
```

### 4. Install Dependencies

The migration has already updated `package.json`. Run:

```bash
npm install
```

### 5. Start Development

```bash
npm run dev
```

## Features

### Authentication
- Email/password registration and login
- Automatic session management
- Protected routes with middleware
- User profile management

### Database Operations
- All CRUD operations now use Supabase client
- Real-time subscriptions available (not implemented yet)
- Row Level Security for data isolation
- Automatic user data creation on signup

## Migration Benefits

1. **Simplified Infrastructure**: No need to manage PostgreSQL, PostgREST, or authentication servers
2. **Built-in Security**: Row Level Security, automatic password hashing, CSRF protection
3. **Scalability**: Automatic scaling with Supabase cloud infrastructure
4. **Real-time Features**: Built-in support for real-time subscriptions
5. **OAuth Support**: Easy integration with Google, GitHub, etc.
6. **Backup & Recovery**: Automatic backups and point-in-time recovery
7. **Performance**: Built-in caching and CDN distribution

## Next Steps

1. Set up your Supabase project
2. Run the database schema SQL
3. Configure environment variables
4. Test the application
5. Consider adding OAuth providers
6. Implement real-time features if needed

## Troubleshooting

### Common Issues

1. **Environment Variables**: Make sure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are correctly set
2. **RLS Policies**: Ensure Row Level Security policies are properly configured
3. **User Creation**: The trigger should automatically create user records on signup
4. **Session Issues**: Clear browser storage if experiencing authentication issues

### Support

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Discord](https://discord.supabase.com)
- [Next.js + Supabase Guide](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
