import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { supabaseApiClient } from '@/lib/supabase/api-client'
import {
    Project,
    Task,
    Subtask,
    ProjectDetails,
    TaskDetails,
    SubtaskDetails,
    Comment,
    ProjectInsert,
    TaskInsert,
    SubtaskInsert,
    CommentInsert,
    EntityType
} from '@/types/database'

interface AppState {
    // Data
    projects: Project[]
    tasks: Task[]
    subtasks: Subtask[]
    projectDetails: ProjectDetails | null
    taskDetails: TaskDetails | null
    subtaskDetails: SubtaskDetails | null
    comments: Comment[]

    // UI State
    selectedProjectId: string | null
    selectedTaskId: string | null
    selectedSubtaskId: string | null
    selectedEntityType: EntityType | null
    selectedEntityId: string | null
    showArchived: boolean

    // Loading states
    isLoading: boolean
    error: string | null

    // User state
    userId: string | null

    // Actions
    setUserId: (userId: string | null) => void
    setSelectedProject: (projectId: string | null) => void
    setSelectedTask: (taskId: string | null) => void
    setSelectedSubtask: (subtaskId: string | null) => void
    setSelectedEntity: (entityType: EntityType, entityId: string) => void
    setShowArchived: (show: boolean) => void

    // Project actions
    loadProjects: () => Promise<void>
    createProject: (project: Omit<ProjectInsert, 'user_id'>) => Promise<void>
    updateProject: (id: string, project: Partial<Project>) => Promise<void>
    deleteProject: (id: string) => Promise<void>
    archiveProject: (id: string, archived: boolean) => Promise<void>

    // Task actions
    loadTasks: (projectId: string) => Promise<void>
    createTask: (task: TaskInsert) => Promise<void>
    updateTask: (id: string, task: Partial<Task>) => Promise<void>
    deleteTask: (id: string) => Promise<void>
    reorderTasks: (tasks: Task[]) => Promise<void>

    // Subtask actions
    loadSubtasks: (taskId: string) => Promise<void>
    createSubtask: (subtask: SubtaskInsert) => Promise<void>
    updateSubtask: (id: string, subtask: Partial<Subtask>) => Promise<void>
    deleteSubtask: (id: string) => Promise<void>
    reorderSubtasks: (subtasks: Subtask[]) => Promise<void>

    // Project details actions
    loadProjectDetails: (projectId: string) => Promise<void>
    updateProjectDescription: (projectId: string, description: string) => Promise<void>

    // Task details actions
    loadTaskDetails: (taskId: string) => Promise<void>
    updateTaskDescription: (taskId: string, description: string) => Promise<void>

    // Subtask details actions
    loadSubtaskDetails: (subtaskId: string) => Promise<void>
    updateSubtaskDescription: (subtaskId: string, description: string) => Promise<void>

    // Comments actions (polymorphic)
    loadComments: (entityType: EntityType, entityId: string) => Promise<void>
    createComment: (comment: CommentInsert) => Promise<void>
    updateComment: (id: string, comment: Partial<Comment>) => Promise<void>
    deleteComment: (id: string) => Promise<void>

    // AI Generation actions
    generateAITasks: (projectId: string, refresh?: boolean) => Promise<any>
    generateAISubtasks: (taskId: string, refresh?: boolean) => Promise<any>

    // Utility actions
    setLoading: (loading: boolean) => void
    setError: (error: string | null) => void
    clearError: () => void
}

export const useAppStore = create<AppState>()(
    devtools(
        (set, get) => ({
            // Initial state
            projects: [],
            tasks: [],
            subtasks: [],
            projectDetails: null,
            taskDetails: null,
            subtaskDetails: null,
            comments: [],
            selectedProjectId: null,
            selectedTaskId: null,
            selectedSubtaskId: null,
            selectedEntityType: null,
            selectedEntityId: null,
            showArchived: false,
            isLoading: false,
            error: null,
            userId: null,

            // Auth Actions
            setUserId: (userId) => {
                set({ userId })
                supabaseApiClient.setUserId(userId)
            },

            // UI Actions
            setSelectedProject: async (projectId) => {
                set({
                    selectedProjectId: projectId,
                    selectedTaskId: null,
                    selectedSubtaskId: null,
                    selectedEntityType: null,
                    selectedEntityId: null
                })
                if (projectId) {
                    await get().loadTasks(projectId)
                    // Auto-select first task if available
                    const tasks = get().tasks
                    if (tasks.length > 0) {
                        await get().setSelectedTask(tasks[0].id)
                    }
                } else {
                    set({
                        tasks: [],
                        subtasks: [],
                        projectDetails: null,
                        taskDetails: null,
                        subtaskDetails: null,
                        comments: []
                    })
                }
            },

            setSelectedTask: async (taskId) => {
                set({
                    selectedTaskId: taskId,
                    selectedSubtaskId: null,
                    selectedEntityType: null,
                    selectedEntityId: null
                })
                if (taskId) {
                    await get().loadSubtasks(taskId)
                    // Auto-select first subtask if available
                    const subtasks = get().subtasks
                    if (subtasks.length > 0) {
                        await get().setSelectedSubtask(subtasks[0].id)
                    }
                } else {
                    set({
                        subtasks: [],
                        taskDetails: null,
                        subtaskDetails: null,
                        comments: []
                    })
                }
            },

            setSelectedSubtask: async (subtaskId) => {
                set({ selectedSubtaskId: subtaskId })
                if (subtaskId) {
                    await get().setSelectedEntity('subtask', subtaskId)
                } else {
                    set({
                        subtaskDetails: null,
                        comments: [],
                        selectedEntityType: null,
                        selectedEntityId: null
                    })
                }
            },

            setSelectedEntity: async (entityType, entityId) => {
                set({
                    selectedEntityType: entityType,
                    selectedEntityId: entityId,
                    projectDetails: null,
                    taskDetails: null,
                    subtaskDetails: null,
                    comments: []
                })

                // Load appropriate details and comments based on entity type
                if (entityType === 'project') {
                    await Promise.all([
                        get().loadProjectDetails(entityId),
                        get().loadComments(entityType, entityId)
                    ])
                } else if (entityType === 'task') {
                    await Promise.all([
                        get().loadTaskDetails(entityId),
                        get().loadComments(entityType, entityId)
                    ])
                } else if (entityType === 'subtask') {
                    await Promise.all([
                        get().loadSubtaskDetails(entityId),
                        get().loadComments(entityType, entityId)
                    ])
                }
            },

            setShowArchived: (show) => set({ showArchived: show }),

            // Project Actions
            loadProjects: async () => {
                try {
                    set({ isLoading: true, error: null })
                    const data = await supabaseApiClient.getProjects()
                    set({ projects: data || [] })
                } catch (error) {
                    set({ error: (error as Error).message })
                } finally {
                    set({ isLoading: false })
                }
            },

            createProject: async (project) => {
                try {
                    const { userId } = get()
                    if (!userId) throw new Error('User not authenticated')

                    set({ isLoading: true, error: null })
                    // Ensure optional properties are null instead of undefined and include user_id
                    const sanitizedProject = {
                        ...project,
                        user_id: userId,
                        status: project.status ?? null,
                        archived: project.archived ?? null,
                        due_date: project.due_date ?? null,
                        owner: project.owner ?? null
                    }
                    const data = await supabaseApiClient.createProject(sanitizedProject)
                    const createdProject = data && data.length > 0 ? data[0] : null
                    if (!createdProject) throw new Error('Failed to create project')

                    const projects = get().projects
                    set({ projects: [createdProject, ...projects] })

                    // Auto-select the newly created project
                    await get().setSelectedProject(createdProject.id)
                } catch (error) {
                    set({ error: (error as Error).message })
                } finally {
                    set({ isLoading: false })
                }
            },

            updateProject: async (id, project) => {
                try {
                    set({ isLoading: true, error: null })
                    const data = await supabaseApiClient.updateProject(id, { ...project, updated_at: new Date().toISOString() })
                    const updatedProject = data && data.length > 0 ? data[0] : null
                    if (!updatedProject) throw new Error('Failed to update project')

                    const projects = get().projects
                    set({
                        projects: projects.map(p => p.id === id ? updatedProject : p)
                    })
                } catch (error) {
                    set({ error: (error as Error).message })
                } finally {
                    set({ isLoading: false })
                }
            },

            deleteProject: async (id) => {
                try {
                    set({ isLoading: true, error: null })
                    await supabaseApiClient.deleteProject(id)

                    const projects = get().projects
                    set({
                        projects: projects.filter(p => p.id !== id)
                    })

                    // Clear selection if deleted project was selected
                    if (get().selectedProjectId === id) {
                        get().setSelectedProject(null)
                    }
                } catch (error) {
                    set({ error: (error as Error).message })
                } finally {
                    set({ isLoading: false })
                }
            },

            archiveProject: async (id, archived) => {
                await get().updateProject(id, { archived })
            },

            // Project Details Actions
            loadProjectDetails: async (projectId) => {
                try {
                    set({ isLoading: true, error: null })
                    const data = await supabaseApiClient.getProjectDetails(projectId)
                    const details = data && data.length > 0 ? data[0] : null
                    set({ projectDetails: details })
                } catch (error) {
                    set({ error: (error as Error).message })
                } finally {
                    set({ isLoading: false })
                }
            },

            updateProjectDescription: async (projectId, description) => {
                try {
                    set({ isLoading: true, error: null })

                    let data = await supabaseApiClient.updateProjectDetails(projectId, {
                        project_id: projectId,
                        description,
                        updated_at: new Date().toISOString()
                    })

                    if (!data || data.length === 0) {
                        data = await supabaseApiClient.createProjectDetails({
                            project_id: projectId,
                            description,
                        })
                    }

                    const details = data && data.length > 0 ? data[0] : null
                    set({ projectDetails: details })
                } catch (error) {
                    set({ error: (error as Error).message })
                } finally {
                    set({ isLoading: false })
                }
            },

            // Task Actions
            loadTasks: async (projectId) => {
                try {
                    set({ isLoading: true, error: null })
                    const data = await supabaseApiClient.getTasks(projectId)
                    set({ tasks: data || [] })
                } catch (error) {
                    set({ error: (error as Error).message })
                } finally {
                    set({ isLoading: false })
                }
            },

            createTask: async (task) => {
                try {
                    set({ isLoading: true, error: null })
                    // Ensure status is null instead of undefined
                    const sanitizedTask = {
                        ...task,
                        status: task.status ?? null
                    }
                    const data = await supabaseApiClient.createTask(sanitizedTask)
                    const createdTask = data && data.length > 0 ? data[0] : null
                    if (!createdTask) throw new Error('Failed to create task')

                    const tasks = get().tasks
                    set({ tasks: [...tasks, createdTask] })

                    // Auto-select the newly created task
                    await get().setSelectedTask(createdTask.id)
                } catch (error) {
                    set({ error: (error as Error).message })
                } finally {
                    set({ isLoading: false })
                }
            },

            updateTask: async (id, task) => {
                try {
                    set({ isLoading: true, error: null })
                    const data = await supabaseApiClient.updateTask(id, { ...task, updated_at: new Date().toISOString() })
                    const updatedTask = data && data.length > 0 ? data[0] : null
                    if (!updatedTask) throw new Error('Failed to update task')

                    const tasks = get().tasks
                    set({
                        tasks: tasks.map(t => t.id === id ? updatedTask : t)
                    })
                } catch (error) {
                    set({ error: (error as Error).message })
                } finally {
                    set({ isLoading: false })
                }
            },

            deleteTask: async (id) => {
                try {
                    set({ isLoading: true, error: null })
                    await supabaseApiClient.deleteTask(id)

                    const tasks = get().tasks
                    set({
                        tasks: tasks.filter(t => t.id !== id)
                    })

                    // Clear selection if deleted task was selected
                    if (get().selectedTaskId === id) {
                        get().setSelectedTask(null)
                    }
                } catch (error) {
                    set({ error: (error as Error).message })
                } finally {
                    set({ isLoading: false })
                }
            },

            reorderTasks: async (tasks) => {
                try {
                    set({ isLoading: true, error: null })

                    // Update order_index for each task
                    const updates = tasks.map((task, index) => ({
                        id: task.id,
                        order_index: index,
                        updated_at: new Date().toISOString()
                    }))

                    // Update each task individually
                    await Promise.all(updates.map(async (update: { id: string; order_index: number; updated_at: string }) =>
                        supabaseApiClient.updateTask(update.id, update)
                    ))

                    set({ tasks })
                } catch (error) {
                    set({ error: (error as Error).message })
                } finally {
                    set({ isLoading: false })
                }
            },

            // Task Details Actions
            loadTaskDetails: async (taskId) => {
                try {
                    set({ isLoading: true, error: null })
                    const data = await supabaseApiClient.getTaskDetails(taskId)
                    const details = data && data.length > 0 ? data[0] : null
                    set({ taskDetails: details })
                } catch (error) {
                    set({ error: (error as Error).message })
                } finally {
                    set({ isLoading: false })
                }
            },

            updateTaskDescription: async (taskId, description) => {
                try {
                    set({ isLoading: true, error: null })

                    let data = await supabaseApiClient.updateTaskDetails(taskId, {
                        task_id: taskId,
                        description,
                        updated_at: new Date().toISOString()
                    })

                    if (!data || data.length === 0) {
                        data = await supabaseApiClient.createTaskDetails({
                            task_id: taskId,
                            description,
                        })
                    }

                    const details = data && data.length > 0 ? data[0] : null
                    set({ taskDetails: details })
                } catch (error) {
                    set({ error: (error as Error).message })
                } finally {
                    set({ isLoading: false })
                }
            },

            // Subtask Actions
            loadSubtasks: async (taskId) => {
                try {
                    set({ isLoading: true, error: null })
                    const data = await supabaseApiClient.getSubtasks(taskId)
                    set({ subtasks: data || [] })
                } catch (error) {
                    set({ error: (error as Error).message })
                } finally {
                    set({ isLoading: false })
                }
            },

            createSubtask: async (subtask) => {
                try {
                    set({ isLoading: true, error: null })
                    // Ensure status is null instead of undefined
                    const sanitizedSubtask = {
                        ...subtask,
                        status: subtask.status ?? null
                    }
                    const data = await supabaseApiClient.createSubtask(sanitizedSubtask)
                    const createdSubtask = data && data.length > 0 ? data[0] : null
                    if (!createdSubtask) throw new Error('Failed to create subtask')

                    const subtasks = get().subtasks
                    set({ subtasks: [...subtasks, createdSubtask] })

                    // Auto-select the newly created subtask
                    await get().setSelectedSubtask(createdSubtask.id)
                } catch (error) {
                    set({ error: (error as Error).message })
                } finally {
                    set({ isLoading: false })
                }
            },

            updateSubtask: async (id, subtask) => {
                try {
                    set({ isLoading: true, error: null })
                    const data = await supabaseApiClient.updateSubtask(id, { ...subtask, updated_at: new Date().toISOString() })
                    const updatedSubtask = data && data.length > 0 ? data[0] : null
                    if (!updatedSubtask) throw new Error('Failed to update subtask')

                    const subtasks = get().subtasks
                    set({
                        subtasks: subtasks.map(s => s.id === id ? updatedSubtask : s)
                    })
                } catch (error) {
                    set({ error: (error as Error).message })
                } finally {
                    set({ isLoading: false })
                }
            },

            deleteSubtask: async (id) => {
                try {
                    set({ isLoading: true, error: null })
                    await supabaseApiClient.deleteSubtask(id)

                    const subtasks = get().subtasks
                    set({
                        subtasks: subtasks.filter(s => s.id !== id)
                    })

                    // Clear selection if deleted subtask was selected
                    if (get().selectedSubtaskId === id) {
                        get().setSelectedSubtask(null)
                    }
                } catch (error) {
                    set({ error: (error as Error).message })
                } finally {
                    set({ isLoading: false })
                }
            },

            reorderSubtasks: async (subtasks) => {
                try {
                    set({ isLoading: true, error: null })

                    // Update order_index for each subtask
                    const updates = subtasks.map((subtask, index) => ({
                        id: subtask.id,
                        order_index: index,
                        updated_at: new Date().toISOString()
                    }))

                    // Update each subtask individually
                    await Promise.all(updates.map(async (update: { id: string; order_index: number; updated_at: string }) =>
                        supabaseApiClient.updateSubtask(update.id, update)
                    ))

                    set({ subtasks })
                } catch (error) {
                    set({ error: (error as Error).message })
                } finally {
                    set({ isLoading: false })
                }
            },

            // Subtask Details Actions
            loadSubtaskDetails: async (subtaskId) => {
                try {
                    set({ isLoading: true, error: null })
                    const data = await supabaseApiClient.getSubtaskDetails(subtaskId)
                    const details = data && data.length > 0 ? data[0] : null
                    set({ subtaskDetails: details })
                } catch (error) {
                    set({ error: (error as Error).message })
                } finally {
                    set({ isLoading: false })
                }
            },

            updateSubtaskDescription: async (subtaskId, description) => {
                try {
                    set({ isLoading: true, error: null })

                    // First try to update existing record
                    let data = await supabaseApiClient.updateSubtaskDetails(subtaskId, {
                        subtask_id: subtaskId,
                        description,
                        updated_at: new Date().toISOString()
                    })

                    // If no record was updated, create a new one
                    if (!data || data.length === 0) {
                        data = await supabaseApiClient.createSubtaskDetails({
                            subtask_id: subtaskId,
                            description,
                        })
                    }

                    const details = data && data.length > 0 ? data[0] : null
                    set({ subtaskDetails: details })
                } catch (error) {
                    set({ error: (error as Error).message })
                } finally {
                    set({ isLoading: false })
                }
            },

            // Comments Actions (polymorphic)
            loadComments: async (entityType, entityId) => {
                try {
                    set({ isLoading: true, error: null })
                    const data = await supabaseApiClient.getComments(entityType, entityId)
                    set({ comments: data || [] })
                } catch (error) {
                    set({ error: (error as Error).message })
                } finally {
                    set({ isLoading: false })
                }
            },

            createComment: async (comment) => {
                try {
                    set({ isLoading: true, error: null })
                    const data = await supabaseApiClient.createComment(comment)
                    const createdComment = data && data.length > 0 ? data[0] : null
                    if (!createdComment) throw new Error('Failed to create comment')

                    const comments = get().comments
                    set({ comments: [...comments, createdComment] })
                } catch (error) {
                    set({ error: (error as Error).message })
                } finally {
                    set({ isLoading: false })
                }
            },

            updateComment: async (id, comment) => {
                try {
                    set({ isLoading: true, error: null })
                    // For comments we would need to add an updateComment method to supabaseApiClient
                    // For now, just update the state directly since comment updates are rare
                    const comments = get().comments
                    set({
                        comments: comments.map(c => c.id === id ? { ...c, ...comment } : c)
                    })
                } catch (error) {
                    set({ error: (error as Error).message })
                } finally {
                    set({ isLoading: false })
                }
            },

            deleteComment: async (id) => {
                try {
                    set({ isLoading: true, error: null })
                    await supabaseApiClient.deleteComment(id)

                    const comments = get().comments
                    set({
                        comments: comments.filter(c => c.id !== id)
                    })
                } catch (error) {
                    set({ error: (error as Error).message })
                } finally {
                    set({ isLoading: false })
                }
            },

            // AI Generation Actions
            generateAITasks: async (projectId: string, refresh: boolean = false) => {
                try {
                    set({ isLoading: true, error: null })
                    const result = await supabaseApiClient.generateTasks(projectId, refresh)

                    // Refresh tasks for the project to include the new AI-generated tasks
                    await get().loadTasks(projectId)

                    return result
                } catch (error) {
                    set({ error: (error as Error).message })
                    throw error
                } finally {
                    set({ isLoading: false })
                }
            },

            generateAISubtasks: async (taskId: string, refresh: boolean = false) => {
                try {
                    set({ isLoading: true, error: null })
                    const result = await supabaseApiClient.generateSubtasks(taskId, refresh)

                    // Refresh subtasks for the task to include the new AI-generated subtasks
                    await get().loadSubtasks(taskId)

                    return result
                } catch (error) {
                    set({ error: (error as Error).message })
                    throw error
                } finally {
                    set({ isLoading: false })
                }
            },

            // Utility Actions
            setLoading: (loading) => set({ isLoading: loading }),
            setError: (error) => set({ error }),
            clearError: () => set({ error: null }),
        }),
        {
            name: 'app-store',
        }
    )
)
