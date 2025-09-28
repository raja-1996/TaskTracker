-- Task Tracker Database Schema
-- This will be executed when the PostgreSQL container starts for the first time

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create accounts table for NextAuth
CREATE TABLE IF NOT EXISTS accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    provider TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    refresh_token TEXT,
    access_token TEXT,
    expires_at BIGINT,
    token_type TEXT,
    scope TEXT,
    id_token TEXT,
    session_state TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create sessions table for NextAuth
CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "sessionToken" TEXT NOT NULL UNIQUE,
    "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create verification tokens table for NextAuth
CREATE TABLE IF NOT EXISTS verification_tokens (
    token TEXT NOT NULL,
    identifier TEXT NOT NULL,
    expires TIMESTAMPTZ NOT NULL,
    PRIMARY KEY (identifier, token)
);

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    status TEXT DEFAULT 'To-Do' CHECK (status IN ('To-Do', 'In Progress', 'Done')),
    order_index INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create subtasks table
CREATE TABLE IF NOT EXISTS subtasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    status TEXT DEFAULT 'To-Do' CHECK (status IN ('To-Do', 'In Progress', 'Done')),
    order_index INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create project_details table
CREATE TABLE IF NOT EXISTS project_details (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL UNIQUE REFERENCES projects(id) ON DELETE CASCADE,
    description TEXT DEFAULT '',
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create task_details table
CREATE TABLE IF NOT EXISTS task_details (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID NOT NULL UNIQUE REFERENCES tasks(id) ON DELETE CASCADE,
    description TEXT DEFAULT '',
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create subtask_details table
CREATE TABLE IF NOT EXISTS subtask_details (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subtask_id UUID NOT NULL UNIQUE REFERENCES subtasks(id) ON DELETE CASCADE,
    description TEXT DEFAULT '',
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create polymorphic comments table
CREATE TABLE IF NOT EXISTS comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_type TEXT NOT NULL CHECK (entity_type IN ('project', 'task', 'subtask')),
    entity_id UUID NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts("userId");
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions("userId");
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions("sessionToken");

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
CREATE INDEX IF NOT EXISTS idx_project_details_updated_at ON project_details(updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_task_details_task_id ON task_details(task_id);
CREATE INDEX IF NOT EXISTS idx_task_details_updated_at ON task_details(updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_subtask_details_subtask_id ON subtask_details(subtask_id);
CREATE INDEX IF NOT EXISTS idx_subtask_details_updated_at ON subtask_details(updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_comments_entity_type ON comments(entity_type);
CREATE INDEX IF NOT EXISTS idx_comments_entity_id ON comments(entity_id);
CREATE INDEX IF NOT EXISTS idx_comments_entity_type_id ON comments(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at ASC);

-- Insert sample data
-- First create a demo user (password: demo123)
INSERT INTO users (id, email, password_hash, name) VALUES 
('450e8400-e29b-41d4-a716-446655440000', 'demo@tasktracker.local', '$2b$12$pKtpS0l2mY0YjY9Mq0cacOhqJ3JUJ2/PkPwhbgsm7.Nj6jdlsAYe6', 'Demo User');

INSERT INTO projects (id, user_id, name, due_date, status, archived) VALUES 
('550e8400-e29b-41d4-a716-446655440000', '450e8400-e29b-41d4-a716-446655440000', 'Task Tracker Development', '2025-12-31', 'Active', false),
('550e8400-e29b-41d4-a716-446655440001', '450e8400-e29b-41d4-a716-446655440000', 'Mobile App Project', '2025-10-15', 'Active', false),
('550e8400-e29b-41d4-a716-446655440002', '450e8400-e29b-41d4-a716-446655440000', 'Legacy System Migration', '2025-06-30', 'Completed', true);

-- Insert sample tasks
INSERT INTO tasks (id, project_id, name, status, order_index) VALUES 
('660e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', 'Setup Database Schema', 'Done', 0),
('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'Build Core Components', 'In Progress', 1),
('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', 'Add Drag and Drop', 'To-Do', 2),
('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', 'Design UI Mockups', 'Done', 0),
('660e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440001', 'Implement Authentication', 'In Progress', 1);

-- Insert sample subtasks
INSERT INTO subtasks (id, task_id, name, status, order_index) VALUES 
('770e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440001', 'Create Projects Sidebar', 'Done', 0),
('770e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', 'Build Tasks Column', 'In Progress', 1),
('770e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440001', 'Implement Details Panel', 'To-Do', 2),
('770e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440002', 'Research Drag Libraries', 'To-Do', 0),
('770e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440004', 'Setup Auth Provider', 'In Progress', 0),
('770e8400-e29b-41d4-a716-446655440005', '660e8400-e29b-41d4-a716-446655440004', 'Create Login Components', 'To-Do', 1);

-- Insert sample subtask details
INSERT INTO subtask_details (subtask_id, description) VALUES 
('770e8400-e29b-41d4-a716-446655440000', 'Successfully implemented the projects sidebar with full CRUD operations, search functionality, and archive support. Features include project creation, editing, status management, and visual indicators.'),
('770e8400-e29b-41d4-a716-446655440001', 'Currently working on the tasks column with status management and filtering capabilities. Need to add drag and drop functionality next.'),
('770e8400-e29b-41d4-a716-446655440004', 'Setting up authentication using Supabase Auth. Configuring OAuth providers and session management.');

-- Insert sample project details
INSERT INTO project_details (project_id, description) VALUES 
('550e8400-e29b-41d4-a716-446655440000', 'A comprehensive task tracking application built with Next.js, TypeScript, and PostgreSQL. Features include project management, task organization, subtask tracking, and collaborative commenting system.'),
('550e8400-e29b-41d4-a716-446655440001', 'Mobile application project for iOS and Android platforms using React Native. Focuses on user experience and performance optimization.');

-- Insert sample task details
INSERT INTO task_details (task_id, description) VALUES 
('660e8400-e29b-41d4-a716-446655440001', 'Building the core React components for the task tracker including sidebar navigation, task columns, and details panel. Focus on reusable components and proper state management.'),
('660e8400-e29b-41d4-a716-446655440004', 'Implementing secure authentication system with multiple OAuth providers and session management.');

-- Insert sample comments for different entity types
INSERT INTO comments (entity_type, entity_id, content) VALUES 
-- Project comments
('project', '550e8400-e29b-41d4-a716-446655440000', 'Project kickoff meeting completed. All stakeholders aligned on requirements and timeline.'),
('project', '550e8400-e29b-41d4-a716-446655440000', 'Database schema finalized and reviewed by the team.'),
-- Task comments  
('task', '660e8400-e29b-41d4-a716-446655440001', 'Core components architecture defined. Starting with projects sidebar.'),
('task', '660e8400-e29b-41d4-a716-446655440004', 'Researching different auth providers. Supabase Auth looks promising.'),
-- Subtask comments
('subtask', '770e8400-e29b-41d4-a716-446655440000', 'Completed the projects sidebar implementation with all required features.'),
('subtask', '770e8400-e29b-41d4-a716-446655440000', 'Added proper error handling and loading states.'),
('subtask', '770e8400-e29b-41d4-a716-446655440000', 'Testing shows all CRUD operations working correctly.'),
('subtask', '770e8400-e29b-41d4-a716-446655440001', 'Started implementing the tasks column layout and basic functionality.'),
('subtask', '770e8400-e29b-41d4-a716-446655440001', 'Need to integrate with drag and drop library next week.'),
('subtask', '770e8400-e29b-41d4-a716-446655440004', 'Setting up OAuth with Google and GitHub.');

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subtasks_updated_at BEFORE UPDATE ON subtasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_project_details_updated_at BEFORE UPDATE ON project_details FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_task_details_updated_at BEFORE UPDATE ON task_details FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subtask_details_updated_at BEFORE UPDATE ON subtask_details FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions (optional, for future user management)
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO tasktracker_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO tasktracker_user;
