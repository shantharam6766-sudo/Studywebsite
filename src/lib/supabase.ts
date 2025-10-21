import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database Types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
        }
        Update: {
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          updated_at?: string
        }
      }
      syllabi: {
        Row: {
          id: string
          user_id: string
          title: string
          subjects: any[]
          is_placeholder: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          subjects?: any[]
          is_placeholder?: boolean
        }
        Update: {
          title?: string
          subjects?: any[]
          is_placeholder?: boolean
          updated_at?: string
        }
      }
      notes: {
        Row: {
          id: string
          user_id: string
          title: string
          content: string
          is_pinned: boolean
          is_archived: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          content: string
          is_pinned?: boolean
          is_archived?: boolean
        }
        Update: {
          title?: string
          content?: string
          is_pinned?: boolean
          is_archived?: boolean
          updated_at?: string
        }
      }
      daily_tasks: {
        Row: {
          id: string
          user_id: string
          date: string
          tasks: any[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          tasks: any[]
        }
        Update: {
          tasks?: any[]
          updated_at?: string
        }
      }
      exams: {
        Row: {
          id: string
          user_id: string
          title: string
          date: string
          is_placeholder: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          date: string
          is_placeholder?: boolean
        }
        Update: {
          title?: string
          date?: string
          is_placeholder?: boolean
          updated_at?: string
        }
      }
      pomodoro_sessions: {
        Row: {
          id: string
          user_id: string
          date: string
          count: number
          total_minutes: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          count: number
          total_minutes: number
        }
        Update: {
          count?: number
          total_minutes?: number
          updated_at?: string
        }
      }
    }
  }
}</parameter>