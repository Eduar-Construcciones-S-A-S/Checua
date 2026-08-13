import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Evitar que la app falle si las variables no están definidas
const safeUrl = supabaseUrl || 'https://placeholder.supabase.co'
const safeKey = supabaseAnonKey || 'placeholder-key'

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Advertencia: Credenciales de Supabase no detectadas. Usando modo de respaldo (fallback).')
}

export const supabase = createClient(safeUrl, safeKey)
