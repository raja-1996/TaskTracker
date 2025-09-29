import { supabase } from '@/lib/supabase/client'
import { Database } from '@/types/database'

type Project = Database['public']['Tables']['projects']['Row']
type Task = Database['public']['Tables']['tasks']['Row']
type Subtask = Database['public']['Tables']['subtasks']['Row']
type ProjectDetails = Database['public']['Tables']['project_details']['Row']
type TaskDetails = Database['public']['Tables']['task_details']['Row']
type SubtaskDetails = Database['public']['Tables']['subtask_details']['Row']
type Comment = Database['public']['Tables']['comments']['Row']
type AiGeneration = Database['public']['Tables']['ai_generations']['Row']

class SupabaseApiClient {
    private userId: string | null = null

    setUserId(userId: string | null) {
        this.userId = userId
    }

    private async ensureUserExists(): Promise<void> {
        if (!this.userId) throw new Error('User not authenticated')

        // Check if user exists in users table
        const { data: existingUser, error: checkError } = await supabase
            .from('users')
            .select('id')
            .eq('id', this.userId)
            .single()

        if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "not found"
            throw checkError
        }

        // If user doesn't exist, create it
        if (!existingUser) {
            // Get user info from auth
            const { data: { user }, error: authError } = await supabase.auth.getUser()
            if (authError || !user) throw new Error('Failed to get user info from auth')

            // Create user record
            const { error: insertError } = await supabase
                .from('users')
                .insert({
                    id: user.id,
                    email: user.email || '',
                    name: user.user_metadata?.name || user.email?.split('@')[0] || 'User'
                })

            if (insertError) throw insertError
        }
    }

    // Projects
    async getProjects(): Promise<Project[]> {
        if (!this.userId) throw new Error('User not authenticated')

        const { data, error } = await supabase
            .from('projects')
            .select('*')
            .eq('user_id', this.userId)
            .order('created_at', { ascending: false })

        if (error) throw error
        return data || []
    }

    async createProject(project: Omit<Project, 'id' | 'created_at' | 'updated_at'>): Promise<Project[]> {
        // Ensure user record exists before creating project
        await this.ensureUserExists()

        const { data, error } = await supabase
            .from('projects')
            .insert(project)
            .select()

        if (error) throw error
        return data || []
    }

    async updateProject(id: string, updates: Partial<Project>): Promise<Project[]> {
        const { data, error } = await supabase
            .from('projects')
            .update(updates)
            .eq('id', id)
            .select()

        if (error) throw error
        return data || []
    }

    async deleteProject(id: string): Promise<void> {
        const { error } = await supabase
            .from('projects')
            .delete()
            .eq('id', id)

        if (error) throw error
    }

    // Tasks
    async getTasks(projectId?: string): Promise<Task[]> {
        let query = supabase.from('tasks').select('*')

        if (projectId) {
            query = query.eq('project_id', projectId).order('order_index', { ascending: true })
        } else {
            query = query.order('created_at', { ascending: false })
        }

        const { data, error } = await query
        if (error) throw error
        return data || []
    }

    async createTask(task: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Promise<Task[]> {
        const { data, error } = await supabase
            .from('tasks')
            .insert(task)
            .select()

        if (error) throw error
        return data || []
    }

    async updateTask(id: string, updates: Partial<Task>): Promise<Task[]> {
        const { data, error } = await supabase
            .from('tasks')
            .update(updates)
            .eq('id', id)
            .select()

        if (error) throw error
        return data || []
    }

    async deleteTask(id: string): Promise<void> {
        const { error } = await supabase
            .from('tasks')
            .delete()
            .eq('id', id)

        if (error) throw error
    }

    // Subtasks
    async getSubtasks(taskId?: string): Promise<Subtask[]> {
        let query = supabase.from('subtasks').select('*')

        if (taskId) {
            query = query.eq('task_id', taskId).order('order_index', { ascending: true })
        } else {
            query = query.order('created_at', { ascending: false })
        }

        const { data, error } = await query
        if (error) throw error
        return data || []
    }

    async createSubtask(subtask: Omit<Subtask, 'id' | 'created_at' | 'updated_at'>): Promise<Subtask[]> {
        const { data, error } = await supabase
            .from('subtasks')
            .insert(subtask)
            .select()

        if (error) throw error
        return data || []
    }

    async updateSubtask(id: string, updates: Partial<Subtask>): Promise<Subtask[]> {
        const { data, error } = await supabase
            .from('subtasks')
            .update(updates)
            .eq('id', id)
            .select()

        if (error) throw error
        return data || []
    }

    async deleteSubtask(id: string): Promise<void> {
        const { error } = await supabase
            .from('subtasks')
            .delete()
            .eq('id', id)

        if (error) throw error
    }

    // Project Details
    async getProjectDetails(projectId: string): Promise<ProjectDetails[]> {
        const { data, error } = await supabase
            .from('project_details')
            .select('*')
            .eq('project_id', projectId)

        if (error) throw error
        return data || []
    }

    async createProjectDetails(details: Omit<ProjectDetails, 'id' | 'updated_at'>): Promise<ProjectDetails[]> {
        const { data, error } = await supabase
            .from('project_details')
            .insert(details)
            .select()

        if (error) throw error
        return data || []
    }

    async updateProjectDetails(projectId: string, updates: Partial<ProjectDetails>): Promise<ProjectDetails[]> {
        const { data, error } = await supabase
            .from('project_details')
            .update(updates)
            .eq('project_id', projectId)
            .select()

        if (error) throw error
        return data || []
    }

    // Task Details
    async getTaskDetails(taskId: string): Promise<TaskDetails[]> {
        const { data, error } = await supabase
            .from('task_details')
            .select('*')
            .eq('task_id', taskId)

        if (error) throw error
        return data || []
    }

    async createTaskDetails(details: Omit<TaskDetails, 'id' | 'updated_at'>): Promise<TaskDetails[]> {
        const { data, error } = await supabase
            .from('task_details')
            .insert(details)
            .select()

        if (error) throw error
        return data || []
    }

    async updateTaskDetails(taskId: string, updates: Partial<TaskDetails>): Promise<TaskDetails[]> {
        const { data, error } = await supabase
            .from('task_details')
            .update(updates)
            .eq('task_id', taskId)
            .select()

        if (error) throw error
        return data || []
    }

    // Subtask Details
    async getSubtaskDetails(subtaskId: string): Promise<SubtaskDetails[]> {
        const { data, error } = await supabase
            .from('subtask_details')
            .select('*')
            .eq('subtask_id', subtaskId)

        if (error) throw error
        return data || []
    }

    async createSubtaskDetails(details: Omit<SubtaskDetails, 'id' | 'updated_at'>): Promise<SubtaskDetails[]> {
        const { data, error } = await supabase
            .from('subtask_details')
            .insert(details)
            .select()

        if (error) throw error
        return data || []
    }

    async updateSubtaskDetails(subtaskId: string, updates: Partial<SubtaskDetails>): Promise<SubtaskDetails[]> {
        const { data, error } = await supabase
            .from('subtask_details')
            .update(updates)
            .eq('subtask_id', subtaskId)
            .select()

        if (error) throw error
        return data || []
    }

    // Comments (polymorphic - supports projects, tasks, and subtasks)
    async getComments(entityType: 'project' | 'task' | 'subtask', entityId: string): Promise<Comment[]> {
        const { data, error } = await supabase
            .from('comments')
            .select('*')
            .eq('entity_type', entityType)
            .eq('entity_id', entityId)
            .order('created_at', { ascending: true })

        if (error) throw error
        return data || []
    }

    async createComment(comment: Omit<Comment, 'id' | 'created_at'>): Promise<Comment[]> {
        const { data, error } = await supabase
            .from('comments')
            .insert(comment)
            .select()

        if (error) throw error
        return data || []
    }

    async deleteComment(id: string): Promise<void> {
        const { error } = await supabase
            .from('comments')
            .delete()
            .eq('id', id)

        if (error) throw error
    }

    // AI Generation methods
    async generateTasks(projectId: string, refresh: boolean = false): Promise<{ tasks: Task[], appended: boolean }> {
        const response = await fetch('/api/ai/generate-tasks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ projectId, refresh }),
        })

        if (!response.ok) {
            throw new Error('Failed to generate tasks')
        }

        return response.json()
    }

    async generateSubtasks(taskId: string, refresh: boolean = false): Promise<{ subtasks: Subtask[], appended: boolean }> {
        const response = await fetch('/api/ai/generate-subtasks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ taskId, refresh }),
        })

        if (!response.ok) {
            throw new Error('Failed to generate subtasks')
        }

        return response.json()
    }

    // AI generation tracking
    async getAiGenerations(entityType: 'project' | 'task', entityId: string): Promise<AiGeneration[]> {
        const { data, error } = await supabase
            .from('ai_generations')
            .select('*')
            .eq('entity_type', entityType)
            .eq('entity_id', entityId)
            .order('generated_at', { ascending: false })

        if (error) throw error
        return data || []
    }
}

export const supabaseApiClient = new SupabaseApiClient()
export default supabaseApiClient
