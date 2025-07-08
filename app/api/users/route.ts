import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
  try {
    const { data: users, error } = await supabase
      .from("users") // 'users' es el nombre de tu tabla de usuarios
      .select("*")

    if (error) {
      console.error("Error fetching users:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(users, { status: 200 })
  } catch (e: any) {
    console.error("Unexpected error in GET /api/users:", e)
    return NextResponse.json({ error: "Internal Server Error", details: e.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { nombre, email, password, rol, estado, permisos } = await request.json()

    // Aquí podrías añadir validaciones de entrada
    if (!nombre || !email || !password || !rol) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // En un entorno real, la contraseña debería ser hasheada antes de guardarse.
    // Supabase Auth maneja esto automáticamente si usas sus funciones de registro.
    const { data: newUser, error } = await supabase
      .from("users")
      .insert({
        nombre,
        email,
        password_hash: password, // Usar password_hash para almacenar la contraseña hasheada
        rol,
        estado,
        permisos,
        fecha_creacion: new Date().toISOString(),
        ultimo_acceso: null, // Se actualizará en el login
      })
      .select() // Retorna el usuario insertado

    if (error) {
      console.error("Error creating user:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(newUser[0], { status: 201 })
  } catch (e: any) {
    console.error("Unexpected error in POST /api/users:", e)
    return NextResponse.json({ error: "Internal Server Error", details: e.message }, { status: 500 })
  }
}
