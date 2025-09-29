import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { llmService } from '@/lib/services/llm-service'
import { Database } from '@/types/database'

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
                            // The `setAll` method was called from a Server Component.
                            // This can be ignored if you have middleware refreshing
                            // user sessions.
                        }
                    },
                },
            }
        )

        // Check authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { projectId } = body

        if (!projectId) {
            return NextResponse.json({ error: 'Project ID is required' }, { status: 400 })
        }

        // Verify user owns the project
        const { data: project, error: projectError } = await supabase
            .from('projects')
            .select('*')
            .eq('id', projectId)
            .eq('user_id', user.id)
            .single()

        if (projectError || !project) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 })
        }

        // Get project details
        const { data: projectDetails } = await supabase
            .from('project_details')
            .select('*')
            .eq('project_id', projectId)
            .single()

        // Get project comments
        const { data: projectComments } = await supabase
            .from('comments')
            .select('*')
            .eq('entity_type', 'project')
            .eq('entity_id', projectId)
            .order('created_at', { ascending: true })

        // Get existing user tasks (not AI-generated)
        const { data: existingUserTasks } = await supabase
            .from('tasks')
            .select(`
                *,
                task_details (*)
            `)
            .eq('project_id', projectId)
            .eq('source_type', 'user')
            .order('created_at', { ascending: true })

        // Get existing AI tasks for context (to avoid duplicates)
        const { data: existingAITasks } = await supabase
            .from('tasks')
            .select(`
                *,
                task_details (*)
            `)
            .eq('project_id', projectId)
            .eq('source_type', 'ai')
            .order('created_at', { ascending: true })

        // Combine all existing tasks for context
        const allExistingTasks = [...(existingUserTasks || []), ...(existingAITasks || [])]

        // Get existing user subtasks
        const { data: existingUserSubtasks } = await supabase
            .from('subtasks')
            .select(`
                *,
                subtask_details (*)
            `)
            .in('task_id', existingUserTasks?.map(t => t.id) || [])
            .eq('source_type', 'user')
            .order('created_at', { ascending: true })

        // Get existing AI subtasks for context
        const { data: existingAISubtasks } = await supabase
            .from('subtasks')
            .select(`
                *,
                subtask_details (*)
            `)
            .in('task_id', existingAITasks?.map(t => t.id) || [])
            .eq('source_type', 'ai')
            .order('created_at', { ascending: true })

        // Combine all existing subtasks for context
        const allExistingSubtasks = [...(existingUserSubtasks || []), ...(existingAISubtasks || [])]

        // Check if AI generation already exists for this project
        const { data: existingGeneration } = await supabase
            .from('ai_generations')
            .select('*')
            .eq('entity_type', 'project')
            .eq('entity_id', projectId)
            .eq('generation_type', 'tasks')
            .single()

        // Generate new tasks using LLM (will append to existing AI tasks unless refresh is requested)
        const generatedTasks = await llmService.generateTasks({
            projectTitle: project.name,
            projectDescription: projectDetails?.description || undefined,
            projectComments: projectComments?.map((c) => c.content).join('\n') || '',
            existingTasks: allExistingTasks?.map((t) => ({
                title: t.name,
                description: Array.isArray(t.task_details) && t.task_details.length > 0
                    ? t.task_details[0]?.description
                    : undefined,
                source: t.source_type || undefined
            })),
            existingSubtasks: allExistingSubtasks?.map((s) => ({
                title: s.name,
                description: Array.isArray(s.subtask_details) && s.subtask_details.length > 0
                    ? s.subtask_details[0]?.description
                    : undefined,
                source: s.source_type || undefined
            }))
        })

        // If refresh, delete existing AI-generated tasks
        if (body.refresh && existingGeneration) {
            await supabase
                .from('tasks')
                .delete()
                .eq('project_id', projectId)
                .eq('source_type', 'ai')
        }

        // Get the current max order_index
        const { data: maxOrderTask } = await supabase
            .from('tasks')
            .select('order_index')
            .eq('project_id', projectId)
            .order('order_index', { ascending: false })
            .limit(1)
            .single()

        let currentOrderIndex = (maxOrderTask?.order_index || 0) + 1

        // Insert generated tasks into database
        const insertedTasks = []
        for (const generatedTask of generatedTasks) {
            // Insert task
            const { data: insertedTask, error: taskError } = await supabase
                .from('tasks')
                .insert({
                    project_id: projectId,
                    name: generatedTask.title,
                    order_index: currentOrderIndex++,
                    source_type: 'ai',
                    status: 'To-Do'
                })
                .select()
                .single()

            if (taskError || !insertedTask) {
                console.error('Error inserting task:', taskError)
                continue
            }

            // Insert task details
            await supabase
                .from('task_details')
                .insert({
                    task_id: insertedTask.id,
                    description: generatedTask.description
                })

            // Get max subtask order_index for this task
            let subtaskOrderIndex = 1

            // Insert subtasks
            const insertedSubtasks = []
            for (const subtask of generatedTask.subtasks) {
                const { data: insertedSubtask, error: subtaskError } = await supabase
                    .from('subtasks')
                    .insert({
                        task_id: insertedTask.id,
                        name: subtask.title,
                        order_index: subtaskOrderIndex++,
                        source_type: 'ai',
                        status: 'To-Do'
                    })
                    .select()
                    .single()

                if (subtaskError || !insertedSubtask) {
                    console.error('Error inserting subtask:', subtaskError)
                    continue
                }

                // Insert subtask details
                await supabase
                    .from('subtask_details')
                    .insert({
                        subtask_id: insertedSubtask.id,
                        description: subtask.description
                    })

                insertedSubtasks.push({
                    ...insertedSubtask,
                    subtask_details: [{ description: subtask.description }]
                })
            }

            insertedTasks.push({
                ...insertedTask,
                task_details: [{ description: generatedTask.description }],
                subtasks: insertedSubtasks
            })
        }

        // Update AI generation tracking
        await supabase
            .from('ai_generations')
            .upsert({
                entity_type: 'project',
                entity_id: projectId,
                generation_type: 'tasks',
                generated_at: new Date().toISOString()
            })

        return NextResponse.json({
            tasks: insertedTasks,
            appended: !body.refresh
        })

    } catch (error) {
        console.error('Error generating tasks:', error)
        return NextResponse.json(
            { error: 'Failed to generate tasks' },
            { status: 500 }
        )
    }
}
