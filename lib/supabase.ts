import { createClient } from "@supabase/supabase-js"

// Valores de Supabase proporcionados directamente en el código
const supabaseUrl = "https://rxthbbplbhrfeehqeizc.supabase.co"
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ4dGhiYnBsYmhyZmVlaHFlaXpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5NDQzOTksImV4cCI6MjA2NzUyMDM5OX0.HPmk19zhkhf3IXpWWzePnlqJgEQruzo19SjeIiIMqXA"

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase URL or Anon Key. Please ensure they are correctly set.")
}

// Cliente Supabase para uso en el servidor (API Routes, Server Actions)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Cliente Supabase para uso en el cliente (componentes del navegador)
export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey)
