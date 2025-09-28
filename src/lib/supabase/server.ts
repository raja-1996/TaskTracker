import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

export function createServerClient() {
    return createClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
}
