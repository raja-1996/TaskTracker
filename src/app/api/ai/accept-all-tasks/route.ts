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
        const { projectId } = body

        if (!projectId) {
            return NextResponse.json({ error: 'Project ID is required' }, { status: 400 })
        }

        // Verify project exists and user owns it
        const { data: project, error: projectError } = await supabase
            .from('projects')
            .select('*')
            .eq('id', projectId)
            .eq('user_id', user.id)
            .single()

        if (projectError || !project) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 })
        }

        // Get all AI tasks for this project
        const { data: aiTasks, error: getTasksError } = await supabase
            .from('tasks')
            .select('id')
            .eq('project_id', projectId)
            .eq('source_type', 'ai')

        if (getTasksError) {
            return NextResponse.json({ error: 'Failed to get AI tasks' }, { status: 500 })
        }

        const taskCount = aiTasks?.length || 0

        if (taskCount === 0) {
            return NextResponse.json({
                acceptedCount: 0,
                message: 'No AI tasks found to accept'
            })
        }

        // Update all AI tasks for this project to be user tasks
        const { data: updatedTasks, error: updateError } = await supabase
            .from('tasks')
            .update({
                source_type: 'user',
                updated_at: new Date().toISOString()
            })
            .eq('project_id', projectId)
            .eq('source_type', 'ai')
            .select()

        if (updateError) {
            return NextResponse.json({ error: 'Failed to accept tasks' }, { status: 500 })
        }

        const acceptedCount = updatedTasks?.length || 0

        return NextResponse.json({
            acceptedCount,
            tasks: updatedTasks,
            message: `Successfully accepted ${acceptedCount} AI task${acceptedCount === 1 ? '' : 's'}`
        })

    } catch (error) {
        console.error('Error accepting all tasks:', error)
        return NextResponse.json(
            { error: 'Failed to accept tasks' },
            { status: 500 }
        )
    }
}
