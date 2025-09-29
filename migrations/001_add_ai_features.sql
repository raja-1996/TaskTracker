-- Migration: Add AI Features
-- Version: 001
-- Date: 2025-09-29
-- Description: Adds AI generation capabilities to existing Task Tracker database
--
-- This migration adds:
-- - source_type column to tasks and subtasks tables
-- - ai_generations table for caching AI responses
-- - appropriate indexes for performance
--
-- Prerequisites: Existing Task Tracker database with base schema
-- Run this ONLY if you have an existing database that needs AI features

-- Add source_type column to tasks table
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS source_type TEXT DEFAULT 'user' CHECK (source_type IN ('user', 'ai'));

-- Add source_type column to subtasks table  
ALTER TABLE subtasks 
ADD COLUMN IF NOT EXISTS source_type TEXT DEFAULT 'user' CHECK (source_type IN ('user', 'ai'));

-- Create AI generations tracking table
CREATE TABLE IF NOT EXISTS ai_generations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type TEXT NOT NULL CHECK (entity_type IN ('project', 'task')),
    entity_id UUID NOT NULL,
    generation_type TEXT NOT NULL CHECK (generation_type IN ('tasks', 'subtasks')),
    generated_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(entity_type, entity_id, generation_type)
);

-- Add indexes for AI features
CREATE INDEX IF NOT EXISTS idx_tasks_source_type ON tasks(source_type);
CREATE INDEX IF NOT EXISTS idx_subtasks_source_type ON subtasks(source_type);
CREATE INDEX IF NOT EXISTS idx_ai_generations_entity ON ai_generations(entity_type, entity_id, generation_type);

-- Enable RLS for new table
ALTER TABLE ai_generations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for ai_generations table
CREATE POLICY "Users can view own ai generations" ON ai_generations FOR SELECT USING (
    CASE 
        WHEN entity_type = 'project' THEN 
            auth.uid() = (SELECT user_id FROM projects WHERE projects.id = ai_generations.entity_id)
        WHEN entity_type = 'task' THEN 
            auth.uid() = (
                SELECT user_id FROM projects 
                WHERE projects.id = (SELECT project_id FROM tasks WHERE tasks.id = ai_generations.entity_id)
            )
        ELSE false
    END
);

CREATE POLICY "Users can insert own ai generations" ON ai_generations FOR INSERT WITH CHECK (
    CASE 
        WHEN entity_type = 'project' THEN 
            auth.uid() = (SELECT user_id FROM projects WHERE projects.id = ai_generations.entity_id)
        WHEN entity_type = 'task' THEN 
            auth.uid() = (
                SELECT user_id FROM projects 
                WHERE projects.id = (SELECT project_id FROM tasks WHERE tasks.id = ai_generations.entity_id)
            )
        ELSE false
    END
);

CREATE POLICY "Users can update own ai generations" ON ai_generations FOR UPDATE USING (
    CASE 
        WHEN entity_type = 'project' THEN 
            auth.uid() = (SELECT user_id FROM projects WHERE projects.id = ai_generations.entity_id)
        WHEN entity_type = 'task' THEN 
            auth.uid() = (
                SELECT user_id FROM projects 
                WHERE projects.id = (SELECT project_id FROM tasks WHERE tasks.id = ai_generations.entity_id)
            )
        ELSE false
    END
);

CREATE POLICY "Users can delete own ai generations" ON ai_generations FOR DELETE USING (
    CASE 
        WHEN entity_type = 'project' THEN 
            auth.uid() = (SELECT user_id FROM projects WHERE projects.id = ai_generations.entity_id)
        WHEN entity_type = 'task' THEN 
            auth.uid() = (
                SELECT user_id FROM projects 
                WHERE projects.id = (SELECT project_id FROM tasks WHERE tasks.id = ai_generations.entity_id)
            )
        ELSE false
    END
);

-- Set existing tasks and subtasks as user-created (backfill data)
UPDATE tasks SET source_type = 'user' WHERE source_type IS NULL;
UPDATE subtasks SET source_type = 'user' WHERE source_type IS NULL;

-- Migration completed successfully
-- Next: Your AI features should now work correctly!
