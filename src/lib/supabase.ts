import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
export const GROUP_ID = import.meta.env.VITE_GROUP_ID

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
