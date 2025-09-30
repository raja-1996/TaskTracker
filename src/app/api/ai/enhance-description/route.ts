import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { llmService } from '@/lib/services/llm-service'
import { Database, Project, Task, Subtask, ProjectDetails, TaskDetails, SubtaskDetails, Comment } from '@/types/database'

export async function POST(request: NextRequest) {
    try {
        const cookieStore = await cookies()
        const supabase = createServerClient<Database>(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return cookieStore.getAll()
                    },
                    setAll(cookiesToSet) {
                        try {
                            cookiesToSet.forEach(({ name, value, options }) =>
                                cookieStore.set(name, value, options)
                            )
                        } catch {
                        }
                    },
                },
            }
        )

        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { entityId, entityType } = body

        if (!entityId || !entityType) {
            return NextResponse.json({ error: 'Entity ID and type are required' }, { status: 400 })
        }

        if (!['project', 'task', 'subtask'].includes(entityType)) {
            return NextResponse.json({ error: 'Invalid entity type' }, { status: 400 })
        }

        let entity: Project | Task | Subtask | null = null
        let details: ProjectDetails | TaskDetails | SubtaskDetails | null = null
        let comments: Comment[] = []

        if (entityType === 'project') {
            const { data: project, error: projectError } = await supabase
                .from('projects')
                .select('*')
                .eq('id', entityId)
                .eq('user_id', user.id)
                .single()

            if (projectError || !project) {
                return NextResponse.json({ error: 'Project not found' }, { status: 404 })
            }

            entity = project

            const { data: projectDetails } = await supabase
                .from('project_details')
                .select('*')
                .eq('project_id', entityId)
                .single()

            details = projectDetails

            const { data: projectComments } = await supabase
                .from('comments')
                .select('*')
                .eq('entity_type', 'project')
                .eq('entity_id', entityId)
                .order('created_at', { ascending: true })

            comments = projectComments || []

        } else if (entityType === 'task') {
            const { data: task, error: taskError } = await supabase
                .from('tasks')
                .select(`
                    *,
                    projects!inner(user_id)
                `)
                .eq('id', entityId)
                .single()

            if (taskError || !task || task.projects.user_id !== user.id) {
                return NextResponse.json({ error: 'Task not found' }, { status: 404 })
            }

            entity = task

            const { data: taskDetails } = await supabase
                .from('task_details')
                .select('*')
                .eq('task_id', entityId)
                .single()

            details = taskDetails

            const { data: taskComments } = await supabase
                .from('comments')
                .select('*')
                .eq('entity_type', 'task')
                .eq('entity_id', entityId)
                .order('created_at', { ascending: true })

            comments = taskComments || []

        } else if (entityType === 'subtask') {
            const { data: subtask, error: subtaskError } = await supabase
                .from('subtasks')
                .select(`
                    *,
                    tasks!inner(
                        project_id,
                        projects!inner(user_id)
                    )
                `)
                .eq('id', entityId)
                .single()

            if (subtaskError || !subtask || subtask.tasks.projects.user_id !== user.id) {
                return NextResponse.json({ error: 'Subtask not found' }, { status: 404 })
            }

            entity = subtask

            const { data: subtaskDetails } = await supabase
                .from('subtask_details')
                .select('*')
                .eq('subtask_id', entityId)
                .single()

            details = subtaskDetails

            const { data: subtaskComments } = await supabase
                .from('comments')
                .select('*')
                .eq('entity_type', 'subtask')
                .eq('entity_id', entityId)
                .order('created_at', { ascending: true })

            comments = subtaskComments || []
        }

        if (!entity) {
            return NextResponse.json({ error: 'Entity not found' }, { status: 404 })
        }

        const additionalContext = comments.length > 0
            ? comments.map(c => c.content).join('\n')
            : undefined

        const enhancedDescription = await llmService.enhanceDescription({
            entityType,
            entityTitle: entity.name,
            currentDescription: details?.description || '',
            additionalContext
        })

        if (entityType === 'project') {
            if (details) {
                await supabase
                    .from('project_details')
                    .update({ description: enhancedDescription })
                    .eq('project_id', entityId)
            } else {
                await supabase
                    .from('project_details')
                    .insert({
                        project_id: entityId,
                        description: enhancedDescription
                    })
            }
        } else if (entityType === 'task') {
            if (details) {
                await supabase
                    .from('task_details')
                    .update({ description: enhancedDescription })
                    .eq('task_id', entityId)
            } else {
                await supabase
                    .from('task_details')
                    .insert({
                        task_id: entityId,
                        description: enhancedDescription
                    })
            }
        } else if (entityType === 'subtask') {
            if (details) {
                await supabase
                    .from('subtask_details')
                    .update({ description: enhancedDescription })
                    .eq('subtask_id', entityId)
            } else {
                await supabase
                    .from('subtask_details')
                    .insert({
                        subtask_id: entityId,
                        description: enhancedDescription
                    })
            }
        }

        return NextResponse.json({ description: enhancedDescription })

    } catch (error) {
        console.error('Error enhancing description:', error)
        return NextResponse.json(
            { error: 'Failed to enhance description' },
            { status: 500 }
        )
    }
}
