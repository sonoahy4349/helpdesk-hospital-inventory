import { createClient } from "@supabase/supabase-js"

// Valores de Supabase proporcionados directamente en el código
const supabaseUrl = "https://rxthbbplbhrfeehqeizc.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ4dGhiYnBsYmhyZmVlaHFlaXpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5NDQzOTksImV4cCI6MjA2NzUyMDM5OX0.HPmk19zhkhf3IXpWWzePnlqJgEQruzo19SjeIiIMqXA"

// NECESITAS AGREGAR TU SERVICE ROLE KEY (la encuentras en Supabase Dashboard > Settings > API)
// Por seguridad, deberías moverla a variables de entorno
const supabaseServiceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ4dGhiYnBsYmhyZmVlaHFlaXpjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTk0NDM5OSwiZXhwIjoyMDY3NTIwMzk5fQ.NqqCDBZPAQakoHC7sAciPJH9MOB5117foMWN0Ngz4DU" // REEMPLAZAR CON TU SERVICE ROLE KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase URL or Anon Key. Please ensure they are correctly set.")
}

// Cliente Supabase para uso en el cliente (componentes del navegador)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey)

// Cliente Supabase para uso en el servidor (API Routes) - CON PRIVILEGIOS DE ADMIN
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

export default supabase