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
        const { taskId } = body

        if (!taskId) {
            return NextResponse.json({ error: 'Task ID is required' }, { status: 400 })
        }

        // Get task with project info to verify user ownership
        const { data: task, error: taskError } = await supabase
            .from('tasks')
            .select(`
                *,
                task_details (*),
                projects!inner (*)
            `)
            .eq('id', taskId)
            .eq('projects.user_id', user.id)
            .single()

        if (taskError || !task) {
            return NextResponse.json({ error: 'Task not found' }, { status: 404 })
        }

        // Get project details
        const { data: projectDetails } = await supabase
            .from('project_details')
            .select('*')
            .eq('project_id', task.projects.id)
            .single()

        // Get project comments
        const { data: projectComments } = await supabase
            .from('comments')
            .select('*')
            .eq('entity_type', 'project')
            .eq('entity_id', task.projects.id)
            .order('created_at', { ascending: true })

        // Get task comments
        const { data: taskComments } = await supabase
            .from('comments')
            .select('*')
            .eq('entity_type', 'task')
            .eq('entity_id', taskId)
            .order('created_at', { ascending: true })

        // Get existing user subtasks (not AI-generated)
        const { data: existingUserSubtasks } = await supabase
            .from('subtasks')
            .select(`
                *,
                subtask_details (*)
            `)
            .eq('task_id', taskId)
            .eq('source_type', 'user')
            .order('created_at', { ascending: true })

        // Get existing AI subtasks for context (to avoid duplicates)
        const { data: existingAISubtasks } = await supabase
            .from('subtasks')
            .select(`
                *,
                subtask_details (*)
            `)
            .eq('task_id', taskId)
            .eq('source_type', 'ai')
            .order('created_at', { ascending: true })

        // Combine all existing subtasks for context
        const allExistingSubtasks = [...(existingUserSubtasks || []), ...(existingAISubtasks || [])]

        // Check if AI generation already exists for this task
        const { data: existingGeneration } = await supabase
            .from('ai_generations')
            .select('*')
            .eq('entity_type', 'task')
            .eq('entity_id', taskId)
            .eq('generation_type', 'subtasks')
            .single()

        // Generate new subtasks using LLM (will append to existing AI subtasks unless refresh is requested)
        const generatedSubtasks = await llmService.generateSubtasks({
            projectTitle: task.projects.name,
            projectDescription: projectDetails?.description || undefined,
            projectComments: projectComments?.map((c: any) => c.content).join('\n') || '',
            taskTitle: task.name,
            taskDescription: Array.isArray(task.task_details) ? task.task_details[0]?.description : undefined,
            taskComments: taskComments?.map((c: any) => c.content).join('\n'),
            existingSubtasks: allExistingSubtasks?.map((s: any) => ({
                title: s.name,
                description: s.subtask_details?.[0]?.description,
                source: s.source_type
            }))
        })

        // If refresh, delete existing AI-generated subtasks
        if (body.refresh && existingGeneration) {
            await supabase
                .from('subtasks')
                .delete()
                .eq('task_id', taskId)
                .eq('source_type', 'ai')
        }

        // Get the current max order_index
        const { data: maxOrderSubtask } = await supabase
            .from('subtasks')
            .select('order_index')
            .eq('task_id', taskId)
            .order('order_index', { ascending: false })
            .limit(1)
            .single()

        let currentOrderIndex = (maxOrderSubtask?.order_index || 0) + 1

        // Insert generated subtasks into database
        const insertedSubtasks = []
        for (const generatedSubtask of generatedSubtasks) {
            // Insert subtask
            const { data: insertedSubtask, error: subtaskError } = await supabase
                .from('subtasks')
                .insert({
                    task_id: taskId,
                    name: generatedSubtask.title,
                    order_index: currentOrderIndex++,
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
                    description: generatedSubtask.description
                })

            insertedSubtasks.push({
                ...insertedSubtask,
                subtask_details: [{ description: generatedSubtask.description }]
            })
        }

        // Update AI generation tracking
        await supabase
            .from('ai_generations')
            .upsert({
                entity_type: 'task',
                entity_id: taskId,
                generation_type: 'subtasks',
                generated_at: new Date().toISOString()
            })

        return NextResponse.json({
            subtasks: insertedSubtasks,
            appended: !body.refresh
        })

    } catch (error) {
        console.error('Error generating subtasks:', error)
        return NextResponse.json(
            { error: 'Failed to generate subtasks' },
            { status: 500 }
        )
    }
}
