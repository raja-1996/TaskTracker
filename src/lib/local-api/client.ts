// Simple local API client for PostgREST
import { Database } from '@/types/database'

type Project = Database['public']['Tables']['projects']['Row']
type Task = Database['public']['Tables']['tasks']['Row']
type Subtask = Database['public']['Tables']['subtasks']['Row']
type ProjectDetails = Database['public']['Tables']['project_details']['Row']
type TaskDetails = Database['public']['Tables']['task_details']['Row']
type SubtaskDetails = Database['public']['Tables']['subtask_details']['Row']
type Comment = Database['public']['Tables']['comments']['Row']

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003'

class LocalApiClient {
    private userId: string | null = null

    setUserId(userId: string | null) {
        this.userId = userId
    }

    private async request<T>(endpoint: string, options?: RequestInit): Promise<T[]> {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                'X-User-ID': this.userId || '',
                ...options?.headers,
            },
        })

        if (!response.ok) {
            throw new Error(`API Error: ${response.status} ${response.statusText}`)
        }

        // Handle empty responses (e.g., DELETE operations)
        const contentLength = response.headers.get('content-length')
        const contentType = response.headers.get('content-type')

        if (contentLength === '0' || !contentType?.includes('application/json')) {
            return [] as T[]
        }

        const text = await response.text()
        if (!text) {
            return [] as T[]
        }

        return JSON.parse(text)
    }

    private async deleteRequest(endpoint: string): Promise<void> {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        })

        if (!response.ok) {
            throw new Error(`API Error: ${response.status} ${response.statusText}`)
        }
    }

    // Projects
    async getProjects(): Promise<Project[]> {
        if (!this.userId) throw new Error('User not authenticated')
        return this.request<Project>(`/projects?user_id=eq.${this.userId}&order=created_at.desc`)
    }

    async createProject(project: Omit<Project, 'id' | 'created_at' | 'updated_at'>): Promise<Project[]> {
        return this.request<Project>('/projects', {
            method: 'POST',
            body: JSON.stringify(project),
            headers: { 'Prefer': 'return=representation' },
        })
    }

    async updateProject(id: string, updates: Partial<Project>): Promise<Project[]> {
        return this.request<Project>(`/projects?id=eq.${id}`, {
            method: 'PATCH',
            body: JSON.stringify(updates),
            headers: { 'Prefer': 'return=representation' },
        })
    }

    async deleteProject(id: string): Promise<void> {
        await this.deleteRequest(`/projects?id=eq.${id}`)
    }

    // Tasks
    async getTasks(projectId?: string): Promise<Task[]> {
        const filter = projectId ? `?project_id=eq.${projectId}&order=order_index.asc` : '?order=created_at.desc'
        return this.request<Task>(`/tasks${filter}`)
    }

    async createTask(task: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Promise<Task[]> {
        return this.request<Task>('/tasks', {
            method: 'POST',
            body: JSON.stringify(task),
            headers: { 'Prefer': 'return=representation' },
        })
    }

    async updateTask(id: string, updates: Partial<Task>): Promise<Task[]> {
        return this.request<Task>(`/tasks?id=eq.${id}`, {
            method: 'PATCH',
            body: JSON.stringify(updates),
            headers: { 'Prefer': 'return=representation' },
        })
    }

    async deleteTask(id: string): Promise<void> {
        await this.deleteRequest(`/tasks?id=eq.${id}`)
    }

    // Subtasks
    async getSubtasks(taskId?: string): Promise<Subtask[]> {
        const filter = taskId ? `?task_id=eq.${taskId}&order=order_index.asc` : '?order=created_at.desc'
        return this.request<Subtask>(`/subtasks${filter}`)
    }

    async createSubtask(subtask: Omit<Subtask, 'id' | 'created_at' | 'updated_at'>): Promise<Subtask[]> {
        return this.request<Subtask>('/subtasks', {
            method: 'POST',
            body: JSON.stringify(subtask),
            headers: { 'Prefer': 'return=representation' },
        })
    }

    async updateSubtask(id: string, updates: Partial<Subtask>): Promise<Subtask[]> {
        return this.request<Subtask>(`/subtasks?id=eq.${id}`, {
            method: 'PATCH',
            body: JSON.stringify(updates),
            headers: { 'Prefer': 'return=representation' },
        })
    }

    async deleteSubtask(id: string): Promise<void> {
        await this.deleteRequest(`/subtasks?id=eq.${id}`)
    }

    // Project Details
    async getProjectDetails(projectId: string): Promise<ProjectDetails[]> {
        return this.request<ProjectDetails>(`/project_details?project_id=eq.${projectId}`)
    }

    async createProjectDetails(details: Omit<ProjectDetails, 'id' | 'updated_at'>): Promise<ProjectDetails[]> {
        return this.request<ProjectDetails>('/project_details', {
            method: 'POST',
            body: JSON.stringify(details),
            headers: { 'Prefer': 'return=representation' },
        })
    }

    async updateProjectDetails(projectId: string, updates: Partial<ProjectDetails>): Promise<ProjectDetails[]> {
        return this.request<ProjectDetails>(`/project_details?project_id=eq.${projectId}`, {
            method: 'PATCH',
            body: JSON.stringify(updates),
            headers: { 'Prefer': 'return=representation' },
        })
    }

    // Task Details
    async getTaskDetails(taskId: string): Promise<TaskDetails[]> {
        return this.request<TaskDetails>(`/task_details?task_id=eq.${taskId}`)
    }

    async createTaskDetails(details: Omit<TaskDetails, 'id' | 'updated_at'>): Promise<TaskDetails[]> {
        return this.request<TaskDetails>('/task_details', {
            method: 'POST',
            body: JSON.stringify(details),
            headers: { 'Prefer': 'return=representation' },
        })
    }

    async updateTaskDetails(taskId: string, updates: Partial<TaskDetails>): Promise<TaskDetails[]> {
        return this.request<TaskDetails>(`/task_details?task_id=eq.${taskId}`, {
            method: 'PATCH',
            body: JSON.stringify(updates),
            headers: { 'Prefer': 'return=representation' },
        })
    }

    // Subtask Details
    async getSubtaskDetails(subtaskId: string): Promise<SubtaskDetails[]> {
        return this.request<SubtaskDetails>(`/subtask_details?subtask_id=eq.${subtaskId}`)
    }

    async createSubtaskDetails(details: Omit<SubtaskDetails, 'id' | 'updated_at'>): Promise<SubtaskDetails[]> {
        return this.request<SubtaskDetails>('/subtask_details', {
            method: 'POST',
            body: JSON.stringify(details),
            headers: { 'Prefer': 'return=representation' },
        })
    }

    async updateSubtaskDetails(subtaskId: string, updates: Partial<SubtaskDetails>): Promise<SubtaskDetails[]> {
        return this.request<SubtaskDetails>(`/subtask_details?subtask_id=eq.${subtaskId}`, {
            method: 'PATCH',
            body: JSON.stringify(updates),
            headers: { 'Prefer': 'return=representation' },
        })
    }

    // Comments (polymorphic - supports projects, tasks, and subtasks)
    async getComments(entityType: 'project' | 'task' | 'subtask', entityId: string): Promise<Comment[]> {
        return this.request<Comment>(`/comments?entity_type=eq.${entityType}&entity_id=eq.${entityId}&order=created_at.asc`)
    }

    async createComment(comment: Omit<Comment, 'id' | 'created_at'>): Promise<Comment[]> {
        return this.request<Comment>('/comments', {
            method: 'POST',
            body: JSON.stringify(comment),
            headers: { 'Prefer': 'return=representation' },
        })
    }

    async deleteComment(id: string): Promise<void> {
        await this.deleteRequest(`/comments?id=eq.${id}`)
    }
}

export const localApiClient = new LocalApiClient()
export default localApiClient
