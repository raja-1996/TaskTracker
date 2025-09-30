import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
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

        // Verify task exists and user owns it (through project ownership)
        const { data: task, error: taskError } = await supabase
            .from('tasks')
            .select(`
                *,
                projects!inner (*)
            `)
            .eq('id', taskId)
            .eq('projects.user_id', user.id)
            .single()

        if (taskError || !task) {
            return NextResponse.json({ error: 'Task not found' }, { status: 404 })
        }

        // Get all AI subtasks for this task
        const { data: aiSubtasks, error: getSubtasksError } = await supabase
            .from('subtasks')
            .select('id')
            .eq('task_id', taskId)
            .eq('source_type', 'ai')

        if (getSubtasksError) {
            return NextResponse.json({ error: 'Failed to get AI subtasks' }, { status: 500 })
        }

        const subtaskCount = aiSubtasks?.length || 0

        if (subtaskCount === 0) {
            return NextResponse.json({
                acceptedCount: 0,
                message: 'No AI subtasks found to accept'
            })
        }

        // Update all AI subtasks for this task to be user subtasks
        const { data: updatedSubtasks, error: updateError } = await supabase
            .from('subtasks')
            .update({
                source_type: 'user',
                updated_at: new Date().toISOString()
            })
            .eq('task_id', taskId)
            .eq('source_type', 'ai')
            .select()

        if (updateError) {
            return NextResponse.json({ error: 'Failed to accept subtasks' }, { status: 500 })
        }

        const acceptedCount = updatedSubtasks?.length || 0

        return NextResponse.json({
            acceptedCount,
            subtasks: updatedSubtasks,
            message: `Successfully accepted ${acceptedCount} AI subtask${acceptedCount === 1 ? '' : 's'}`
        })

    } catch (error) {
        console.error('Error accepting all subtasks:', error)
        return NextResponse.json(
            { error: 'Failed to accept subtasks' },
            { status: 500 }
        )
    }
}
