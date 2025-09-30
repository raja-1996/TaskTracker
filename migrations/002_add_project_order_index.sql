-- Add order_index column to projects table
ALTER TABLE projects ADD COLUMN order_index INTEGER NOT NULL DEFAULT 0;

-- Set order_index based on created_at for existing projects
UPDATE projects 
SET order_index = subquery.row_number - 1
FROM (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at) as row_number
  FROM projects
) as subquery
WHERE projects.id = subquery.id;

-- Create index for better query performance
CREATE INDEX idx_projects_user_order ON projects(user_id, order_index);
