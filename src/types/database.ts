export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export type Database = {
    public: {
        Tables: {
            users: {
                Row: {
                    id: string
                    email: string
                    password_hash: string
                    name: string
                    created_at: string | null
                    updated_at: string | null
                }
                Insert: {
                    id?: string
                    email: string
                    password_hash: string
                    name: string
                    created_at?: string | null
                    updated_at?: string | null
                }
                Update: {
                    id?: string
                    email?: string
                    password_hash?: string
                    name?: string
                    created_at?: string | null
                    updated_at?: string | null
                }
                Relationships: []
            }
            accounts: {
                Row: {
                    id: string
                    userId: string
                    type: string
                    provider: string
                    providerAccountId: string
                    refresh_token: string | null
                    access_token: string | null
                    expires_at: number | null
                    token_type: string | null
                    scope: string | null
                    id_token: string | null
                    session_state: string | null
                    created_at: string | null
                    updated_at: string | null
                }
                Insert: {
                    id?: string
                    userId: string
                    type: string
                    provider: string
                    providerAccountId: string
                    refresh_token?: string | null
                    access_token?: string | null
                    expires_at?: number | null
                    token_type?: string | null
                    scope?: string | null
                    id_token?: string | null
                    session_state?: string | null
                    created_at?: string | null
                    updated_at?: string | null
                }
                Update: {
                    id?: string
                    userId?: string
                    type?: string
                    provider?: string
                    providerAccountId?: string
                    refresh_token?: string | null
                    access_token?: string | null
                    expires_at?: number | null
                    token_type?: string | null
                    scope?: string | null
                    id_token?: string | null
                    session_state?: string | null
                    created_at?: string | null
                    updated_at?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "accounts_userId_fkey"
                        columns: ["userId"]
                        isOneToOne: false
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    }
                ]
            }
            sessions: {
                Row: {
                    id: string
                    sessionToken: string
                    userId: string
                    expires: string
                    created_at: string | null
                    updated_at: string | null
                }
                Insert: {
                    id?: string
                    sessionToken: string
                    userId: string
                    expires: string
                    created_at?: string | null
                    updated_at?: string | null
                }
                Update: {
                    id?: string
                    sessionToken?: string
                    userId?: string
                    expires?: string
                    created_at?: string | null
                    updated_at?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "sessions_userId_fkey"
                        columns: ["userId"]
                        isOneToOne: false
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    }
                ]
            }
            verification_tokens: {
                Row: {
                    token: string
                    identifier: string
                    expires: string
                }
                Insert: {
                    token: string
                    identifier: string
                    expires: string
                }
                Update: {
                    token?: string
                    identifier?: string
                    expires?: string
                }
                Relationships: []
            }
            comments: {
                Row: {
                    content: string
                    created_at: string | null
                    entity_id: string
                    entity_type: string
                    id: string
                }
                Insert: {
                    content: string
                    created_at?: string | null
                    entity_id: string
                    entity_type: string
                    id?: string
                }
                Update: {
                    content?: string
                    created_at?: string | null
                    entity_id?: string
                    entity_type?: string
                    id?: string
                }
                Relationships: []
            }
            project_details: {
                Row: {
                    description: string | null
                    id: string
                    project_id: string
                    updated_at: string | null
                }
                Insert: {
                    description?: string | null
                    id?: string
                    project_id: string
                    updated_at?: string | null
                }
                Update: {
                    description?: string | null
                    id?: string
                    project_id?: string
                    updated_at?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "project_details_project_id_fkey"
                        columns: ["project_id"]
                        isOneToOne: true
                        referencedRelation: "projects"
                        referencedColumns: ["id"]
                    },
                ]
            }
            projects: {
                Row: {
                    archived: boolean | null
                    created_at: string | null
                    due_date: string | null
                    id: string
                    user_id: string
                    name: string
                    owner: string | null
                    status: string | null
                    updated_at: string | null
                }
                Insert: {
                    archived?: boolean | null
                    created_at?: string | null
                    due_date?: string | null
                    id?: string
                    user_id: string
                    name: string
                    owner?: string | null
                    status?: string | null
                    updated_at?: string | null
                }
                Update: {
                    archived?: boolean | null
                    created_at?: string | null
                    due_date?: string | null
                    id?: string
                    user_id?: string
                    name?: string
                    owner?: string | null
                    status?: string | null
                    updated_at?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "projects_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    }
                ]
            }
            task_details: {
                Row: {
                    description: string | null
                    id: string
                    task_id: string
                    updated_at: string | null
                }
                Insert: {
                    description?: string | null
                    id?: string
                    task_id: string
                    updated_at?: string | null
                }
                Update: {
                    description?: string | null
                    id?: string
                    task_id?: string
                    updated_at?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "task_details_task_id_fkey"
                        columns: ["task_id"]
                        isOneToOne: true
                        referencedRelation: "tasks"
                        referencedColumns: ["id"]
                    },
                ]
            }
            subtask_details: {
                Row: {
                    description: string | null
                    id: string
                    subtask_id: string
                    updated_at: string | null
                }
                Insert: {
                    description?: string | null
                    id?: string
                    subtask_id: string
                    updated_at?: string | null
                }
                Update: {
                    description?: string | null
                    id?: string
                    subtask_id?: string
                    updated_at?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "subtask_details_subtask_id_fkey"
                        columns: ["subtask_id"]
                        isOneToOne: true
                        referencedRelation: "subtasks"
                        referencedColumns: ["id"]
                    },
                ]
            }
            subtasks: {
                Row: {
                    created_at: string | null
                    id: string
                    name: string
                    order_index: number
                    status: string | null
                    task_id: string
                    updated_at: string | null
                }
                Insert: {
                    created_at?: string | null
                    id?: string
                    name: string
                    order_index: number
                    status?: string | null
                    task_id: string
                    updated_at?: string | null
                }
                Update: {
                    created_at?: string | null
                    id?: string
                    name?: string
                    order_index?: number
                    status?: string | null
                    task_id?: string
                    updated_at?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "subtasks_task_id_fkey"
                        columns: ["task_id"]
                        isOneToOne: false
                        referencedRelation: "tasks"
                        referencedColumns: ["id"]
                    },
                ]
            }
            tasks: {
                Row: {
                    created_at: string | null
                    id: string
                    name: string
                    order_index: number
                    project_id: string
                    status: string | null
                    updated_at: string | null
                }
                Insert: {
                    created_at?: string | null
                    id?: string
                    name: string
                    order_index: number
                    project_id: string
                    status?: string | null
                    updated_at?: string | null
                }
                Update: {
                    created_at?: string | null
                    id?: string
                    name?: string
                    order_index?: number
                    project_id?: string
                    status?: string | null
                    updated_at?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "tasks_project_id_fkey"
                        columns: ["project_id"]
                        isOneToOne: false
                        referencedRelation: "projects"
                        referencedColumns: ["id"]
                    },
                ]
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            [_ in never]: never
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}

// Helper types
export type User = Database['public']['Tables']['users']['Row']
export type UserInsert = Database['public']['Tables']['users']['Insert']
export type UserUpdate = Database['public']['Tables']['users']['Update']

export type Account = Database['public']['Tables']['accounts']['Row']
export type AccountInsert = Database['public']['Tables']['accounts']['Insert']
export type AccountUpdate = Database['public']['Tables']['accounts']['Update']

export type Session = Database['public']['Tables']['sessions']['Row']
export type SessionInsert = Database['public']['Tables']['sessions']['Insert']
export type SessionUpdate = Database['public']['Tables']['sessions']['Update']

export type VerificationToken = Database['public']['Tables']['verification_tokens']['Row']
export type VerificationTokenInsert = Database['public']['Tables']['verification_tokens']['Insert']
export type VerificationTokenUpdate = Database['public']['Tables']['verification_tokens']['Update']

export type Project = Database['public']['Tables']['projects']['Row']
export type ProjectInsert = Database['public']['Tables']['projects']['Insert']
export type ProjectUpdate = Database['public']['Tables']['projects']['Update']

export type Task = Database['public']['Tables']['tasks']['Row']
export type TaskInsert = Database['public']['Tables']['tasks']['Insert']
export type TaskUpdate = Database['public']['Tables']['tasks']['Update']

export type Subtask = Database['public']['Tables']['subtasks']['Row']
export type SubtaskInsert = Database['public']['Tables']['subtasks']['Insert']
export type SubtaskUpdate = Database['public']['Tables']['subtasks']['Update']

export type SubtaskDetails = Database['public']['Tables']['subtask_details']['Row']
export type SubtaskDetailsInsert = Database['public']['Tables']['subtask_details']['Insert']
export type SubtaskDetailsUpdate = Database['public']['Tables']['subtask_details']['Update']

export type ProjectDetails = Database['public']['Tables']['project_details']['Row']
export type ProjectDetailsInsert = Database['public']['Tables']['project_details']['Insert']
export type ProjectDetailsUpdate = Database['public']['Tables']['project_details']['Update']

export type TaskDetails = Database['public']['Tables']['task_details']['Row']
export type TaskDetailsInsert = Database['public']['Tables']['task_details']['Insert']
export type TaskDetailsUpdate = Database['public']['Tables']['task_details']['Update']

export type Comment = Database['public']['Tables']['comments']['Row']
export type CommentInsert = Database['public']['Tables']['comments']['Insert']
export type CommentUpdate = Database['public']['Tables']['comments']['Update']

// Status types
export type ProjectStatus = 'Active' | 'Completed' | 'Archived'
export type TaskStatus = 'To-Do' | 'In Progress' | 'Done'
export type SubtaskStatus = 'To-Do' | 'In Progress' | 'Done'
export type EntityType = 'project' | 'task' | 'subtask'
