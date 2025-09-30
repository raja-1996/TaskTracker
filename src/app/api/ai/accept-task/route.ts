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
            .eq('source_type', 'ai')
            .single()

        if (taskError || !task) {
            return NextResponse.json({ error: 'AI task not found' }, { status: 404 })
        }

        // Update task source_type from 'ai' to 'user'
        const { data: updatedTask, error: updateError } = await supabase
            .from('tasks')
            .update({
                source_type: 'user',
                updated_at: new Date().toISOString()
            })
            .eq('id', taskId)
            .select()
            .single()

        if (updateError || !updatedTask) {
            return NextResponse.json({ error: 'Failed to accept task' }, { status: 500 })
        }

        return NextResponse.json({
            task: updatedTask,
            message: 'Task accepted successfully'
        })

    } catch (error) {
        console.error('Error accepting task:', error)
        return NextResponse.json(
            { error: 'Failed to accept task' },
            { status: 500 }
        )
    }
}
