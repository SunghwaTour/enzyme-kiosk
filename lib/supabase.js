// Supabase 클라이언트 설정 (JavaScript 버전)
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Supabase 클라이언트 생성
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
