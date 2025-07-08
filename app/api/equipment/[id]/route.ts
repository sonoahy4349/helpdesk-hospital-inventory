import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const { id } = params
  try {
    const { data: equipment, error } = await supabase.from("equipment").select("*").eq("id", id).single()

    if (error) {
      console.error(`Error fetching equipment with ID ${id}:`, error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!equipment) {
      return NextResponse.json({ error: "Equipment not found" }, { status: 404 })
    }

    return NextResponse.json(equipment, { status: 200 })
  } catch (e: any) {
    console.error(`Unexpected error in GET /api/equipment/${id}:`, e)
    return NextResponse.json({ error: "Internal Server Error", details: e.message }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const { id } = params
  try {
    const { nombre, tipo, perfil, tipo_impresora, marca, modelo, numero_serie, estado } = await request.json()

    // Validaciones en el backend
    if (!tipo || !marca || !modelo || !numero_serie || !estado) {
      return NextResponse.json(
        { error: "Missing required fields: tipo, marca, modelo, numero_serie, estado" },
        { status: 400 },
      )
    }

    if (tipo === "impresora") {
      if (!perfil || !tipo_impresora) {
        return NextResponse.json(
          { error: "For 'impresora' type, 'perfil' and 'tipo_impresora' are required." },
          { status: 400 },
        )
      }
    }

    const { data: updatedEquipment, error } = await supabase
      .from("equipment")
      .update({
        nombre: nombre || null,
        tipo,
        perfil: tipo === "impresora" ? perfil : null,
        tipo_impresora: tipo === "impresora" ? tipo_impresora : null,
        marca,
        modelo,
        numero_serie,
        estado,
      })
      .eq("id", id)
      .select()

    if (error) {
      console.error(`Error updating equipment with ID ${id}:`, error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!updatedEquipment || updatedEquipment.length === 0) {
      return NextResponse.json({ error: "Equipment not found or no changes made" }, { status: 404 })
    }

    return NextResponse.json(updatedEquipment[0], { status: 200 })
  } catch (e: any) {
    console.error(`Unexpected error in PUT /api/equipment/${id}:`, e)
    return NextResponse.json({ error: "Internal Server Error", details: e.message }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const { id } = params
  try {
    const { error } = await supabase.from("equipment").delete().eq("id", id)

    if (error) {
      console.error(`Error deleting equipment with ID ${id}:`, error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ message: "Equipment deleted successfully" }, { status: 200 })
  } catch (e: any) {
    console.error(`Unexpected error in DELETE /api/equipment/${id}:`, e)
    return NextResponse.json({ error: "Internal Server Error", details: e.message }, { status: 500 })
  }
}
