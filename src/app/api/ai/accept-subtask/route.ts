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
        const { subtaskId } = body

        if (!subtaskId) {
            return NextResponse.json({ error: 'Subtask ID is required' }, { status: 400 })
        }

        // Verify subtask exists and user owns it (through project ownership via task)
        const { data: subtask, error: subtaskError } = await supabase
            .from('subtasks')
            .select(`
                *,
                tasks!inner (
                    *,
                    projects!inner (*)
                )
            `)
            .eq('id', subtaskId)
            .eq('tasks.projects.user_id', user.id)
            .eq('source_type', 'ai')
            .single()

        if (subtaskError || !subtask) {
            return NextResponse.json({ error: 'AI subtask not found' }, { status: 404 })
        }

        // Update subtask source_type from 'ai' to 'user'
        const { data: updatedSubtask, error: updateError } = await supabase
            .from('subtasks')
            .update({
                source_type: 'user',
                updated_at: new Date().toISOString()
            })
            .eq('id', subtaskId)
            .select()
            .single()

        if (updateError || !updatedSubtask) {
            return NextResponse.json({ error: 'Failed to accept subtask' }, { status: 500 })
        }

        return NextResponse.json({
            subtask: updatedSubtask,
            message: 'Subtask accepted successfully'
        })

    } catch (error) {
        console.error('Error accepting subtask:', error)
        return NextResponse.json(
            { error: 'Failed to accept subtask' },
            { status: 500 }
        )
    }
}
