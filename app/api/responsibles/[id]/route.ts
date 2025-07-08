import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    const { data: responsible, error } = await supabase.from("responsibles").select("*").eq("id", id).single()

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Responsible not found" }, { status: 404 })
      }
      console.error(`Error fetching responsible with ID ${id}:`, error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(responsible, { status: 200 })
  } catch (e: any) {
    console.error("Unexpected error in GET /api/responsibles/[id]:", e)
    return NextResponse.json({ error: "Internal Server Error", details: e.message }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const updates = await request.json()

    delete updates.id
    delete updates.fecha_registro // No permitir actualizar la fecha de registro directamente

    const { data: updatedResponsible, error } = await supabase
      .from("responsibles")
      .update(updates)
      .eq("id", id)
      .select()

    if (error) {
      console.error(`Error updating responsible with ID ${id}:`, error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!updatedResponsible || updatedResponsible.length === 0) {
      return NextResponse.json({ error: "Responsible not found or no changes made" }, { status: 404 })
    }

    return NextResponse.json(updatedResponsible[0], { status: 200 })
  } catch (e: any) {
    console.error("Unexpected error in PUT /api/responsibles/[id]:", e)
    return NextResponse.json({ error: "Internal Server Error", details: e.message }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    const { error, count } = await supabase.from("responsibles").delete().eq("id", id).select() // Select para verificar si se eliminó algo

    if (error) {
      console.error(`Error deleting responsible with ID ${id}:`, error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (count === 0) {
      return NextResponse.json({ error: "Responsible not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Responsible deleted successfully" }, { status: 200 })
  } catch (e: any) {
    console.error("Unexpected error in DELETE /api/responsibles/[id]:", e)
    return NextResponse.json({ error: "Internal Server Error", details: e.message }, { status: 500 })
  }
}
