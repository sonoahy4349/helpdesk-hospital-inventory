import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    const { data: user, error } = await supabase.from("users").select("*").eq("id", id).single() // Esperamos un solo resultado

    if (error) {
      if (error.code === "PGRST116") {
        // No rows found
        return NextResponse.json({ error: "User not found" }, { status: 404 })
      }
      console.error(`Error fetching user with ID ${id}:`, error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(user, { status: 200 })
  } catch (e: any) {
    console.error("Unexpected error in GET /api/users/[id]:", e)
    return NextResponse.json({ error: "Internal Server Error", details: e.message }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const updates = await request.json()

    // No permitir actualizar el ID o la fecha de creación directamente
    delete updates.id
    delete updates.fecha_creacion

    // Si se actualiza la contraseña, asegúrate de hashearla
    if (updates.password) {
      updates.password_hash = updates.password // En un entorno real, hashear aquí
      delete updates.password
    }

    const { data: updatedUser, error } = await supabase.from("users").update(updates).eq("id", id).select() // Retorna el usuario actualizado

    if (error) {
      console.error(`Error updating user with ID ${id}:`, error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!updatedUser || updatedUser.length === 0) {
      return NextResponse.json({ error: "User not found or no changes made" }, { status: 404 })
    }

    return NextResponse.json(updatedUser[0], { status: 200 })
  } catch (e: any) {
    console.error("Unexpected error in PUT /api/users/[id]:", e)
    return NextResponse.json({ error: "Internal Server Error", details: e.message }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    const { error, count } = await supabase.from("users").delete().eq("id", id).select() // Select para verificar si se eliminó algo

    if (error) {
      console.error(`Error deleting user with ID ${id}:`, error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Supabase delete retorna un array vacío si no encuentra el registro,
    // pero el error.code PGRST116 es más específico para "no rows found"
    // Si no hay error, pero no se eliminó nada, significa que no existía.
    if (count === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "User deleted successfully" }, { status: 200 })
  } catch (e: any) {
    console.error("Unexpected error in DELETE /api/users/[id]:", e)
    return NextResponse.json({ error: "Internal Server Error", details: e.message }, { status: 500 })
  }
}
