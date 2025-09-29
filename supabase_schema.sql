-- Task Tracker Database Schema for Supabase
-- Version 1.1.0 - Base Schema - Updated 2025-09-28
-- 
-- INCLUDES AUTHENTICATION FIXES:
-- - Fixed trigger function with SECURITY DEFINER and proper error handling
-- - Fixed RLS policies to allow user creation during signup
-- - Resolves "Database error saving new user" issue
--
-- Run this script in your Supabase SQL Editor

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
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Bypass RLS for this specific insertion
    INSERT INTO public.users (id, email, name)
    VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'name', 'User'));
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log the error but don't fail the auth user creation
        RAISE WARNING 'Failed to create user record: %', SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql;

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

-- Allow user creation during signup (bypasses authentication requirement)
CREATE POLICY "Allow user creation during signup" ON users
    FOR INSERT
    WITH CHECK (true);

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

-- Project Details policies
CREATE POLICY "Users can view own project details" ON project_details FOR SELECT USING (
    auth.uid() = (SELECT user_id FROM projects WHERE projects.id = project_details.project_id)
);
CREATE POLICY "Users can insert own project details" ON project_details FOR INSERT WITH CHECK (
    auth.uid() = (SELECT user_id FROM projects WHERE projects.id = project_details.project_id)
);
CREATE POLICY "Users can update own project details" ON project_details FOR UPDATE USING (
    auth.uid() = (SELECT user_id FROM projects WHERE projects.id = project_details.project_id)
);
CREATE POLICY "Users can delete own project details" ON project_details FOR DELETE USING (
    auth.uid() = (SELECT user_id FROM projects WHERE projects.id = project_details.project_id)
);

-- Task Details policies
CREATE POLICY "Users can view own task details" ON task_details FOR SELECT USING (
    auth.uid() = (
        SELECT user_id FROM projects 
        WHERE projects.id = (SELECT project_id FROM tasks WHERE tasks.id = task_details.task_id)
    )
);
CREATE POLICY "Users can insert own task details" ON task_details FOR INSERT WITH CHECK (
    auth.uid() = (
        SELECT user_id FROM projects 
        WHERE projects.id = (SELECT project_id FROM tasks WHERE tasks.id = task_details.task_id)
    )
);
CREATE POLICY "Users can update own task details" ON task_details FOR UPDATE USING (
    auth.uid() = (
        SELECT user_id FROM projects 
        WHERE projects.id = (SELECT project_id FROM tasks WHERE tasks.id = task_details.task_id)
    )
);
CREATE POLICY "Users can delete own task details" ON task_details FOR DELETE USING (
    auth.uid() = (
        SELECT user_id FROM projects 
        WHERE projects.id = (SELECT project_id FROM tasks WHERE tasks.id = task_details.task_id)
    )
);

-- Subtask Details policies
CREATE POLICY "Users can view own subtask details" ON subtask_details FOR SELECT USING (
    auth.uid() = (
        SELECT user_id FROM projects 
        WHERE projects.id = (
            SELECT project_id FROM tasks 
            WHERE tasks.id = (SELECT task_id FROM subtasks WHERE subtasks.id = subtask_details.subtask_id)
        )
    )
);
CREATE POLICY "Users can insert own subtask details" ON subtask_details FOR INSERT WITH CHECK (
    auth.uid() = (
        SELECT user_id FROM projects 
        WHERE projects.id = (
            SELECT project_id FROM tasks 
            WHERE tasks.id = (SELECT task_id FROM subtasks WHERE subtasks.id = subtask_details.subtask_id)
        )
    )
);
CREATE POLICY "Users can update own subtask details" ON subtask_details FOR UPDATE USING (
    auth.uid() = (
        SELECT user_id FROM projects 
        WHERE projects.id = (
            SELECT project_id FROM tasks 
            WHERE tasks.id = (SELECT task_id FROM subtasks WHERE subtasks.id = subtask_details.subtask_id)
        )
    )
);
CREATE POLICY "Users can delete own subtask details" ON subtask_details FOR DELETE USING (
    auth.uid() = (
        SELECT user_id FROM projects 
        WHERE projects.id = (
            SELECT project_id FROM tasks 
            WHERE tasks.id = (SELECT task_id FROM subtasks WHERE subtasks.id = subtask_details.subtask_id)
        )
    )
);

-- Comments policies
CREATE POLICY "Users can view own comments" ON comments FOR SELECT USING (
    CASE 
        WHEN entity_type = 'project' THEN 
            auth.uid() = (SELECT user_id FROM projects WHERE projects.id = comments.entity_id)
        WHEN entity_type = 'task' THEN 
            auth.uid() = (
                SELECT user_id FROM projects 
                WHERE projects.id = (SELECT project_id FROM tasks WHERE tasks.id = comments.entity_id)
            )
        WHEN entity_type = 'subtask' THEN 
            auth.uid() = (
                SELECT user_id FROM projects 
                WHERE projects.id = (
                    SELECT project_id FROM tasks 
                    WHERE tasks.id = (SELECT task_id FROM subtasks WHERE subtasks.id = comments.entity_id)
                )
            )
        ELSE false
    END
);

CREATE POLICY "Users can insert own comments" ON comments FOR INSERT WITH CHECK (
    CASE 
        WHEN entity_type = 'project' THEN 
            auth.uid() = (SELECT user_id FROM projects WHERE projects.id = comments.entity_id)
        WHEN entity_type = 'task' THEN 
            auth.uid() = (
                SELECT user_id FROM projects 
                WHERE projects.id = (SELECT project_id FROM tasks WHERE tasks.id = comments.entity_id)
            )
        WHEN entity_type = 'subtask' THEN 
            auth.uid() = (
                SELECT user_id FROM projects 
                WHERE projects.id = (
                    SELECT project_id FROM tasks 
                    WHERE tasks.id = (SELECT task_id FROM subtasks WHERE subtasks.id = comments.entity_id)
                )
            )
        ELSE false
    END
);

CREATE POLICY "Users can update own comments" ON comments FOR UPDATE USING (
    CASE 
        WHEN entity_type = 'project' THEN 
            auth.uid() = (SELECT user_id FROM projects WHERE projects.id = comments.entity_id)
        WHEN entity_type = 'task' THEN 
            auth.uid() = (
                SELECT user_id FROM projects 
                WHERE projects.id = (SELECT project_id FROM tasks WHERE tasks.id = comments.entity_id)
            )
        WHEN entity_type = 'subtask' THEN 
            auth.uid() = (
                SELECT user_id FROM projects 
                WHERE projects.id = (
                    SELECT project_id FROM tasks 
                    WHERE tasks.id = (SELECT task_id FROM subtasks WHERE subtasks.id = comments.entity_id)
                )
            )
        ELSE false
    END
);

CREATE POLICY "Users can delete own comments" ON comments FOR DELETE USING (
    CASE 
        WHEN entity_type = 'project' THEN 
            auth.uid() = (SELECT user_id FROM projects WHERE projects.id = comments.entity_id)
        WHEN entity_type = 'task' THEN 
            auth.uid() = (
                SELECT user_id FROM projects 
                WHERE projects.id = (SELECT project_id FROM tasks WHERE tasks.id = comments.entity_id)
            )
        WHEN entity_type = 'subtask' THEN 
            auth.uid() = (
                SELECT user_id FROM projects 
                WHERE projects.id = (
                    SELECT project_id FROM tasks 
                    WHERE tasks.id = (SELECT task_id FROM subtasks WHERE subtasks.id = comments.entity_id)
                )
            )
        ELSE false
    END
);
