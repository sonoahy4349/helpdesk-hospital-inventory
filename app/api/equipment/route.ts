import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
  try {
    const { data: equipment, error } = await supabase
      .from("equipment")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching equipment:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(equipment, { status: 200 })
  } catch (e: any) {
    console.error("Unexpected error in GET /api/equipment:", e)
    return NextResponse.json({ error: "Internal Server Error", details: e.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
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

    const { data: newEquipment, error } = await supabase
      .from("equipment")
      .insert({
        nombre: nombre || null,
        tipo,
        perfil: tipo === "impresora" ? perfil : null,
        tipo_impresora: tipo === "impresora" ? tipo_impresora : null,
        marca,
        modelo,
        numero_serie,
        estado,
      })
      .select()

    if (error) {
      console.error("Error creating equipment:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(newEquipment[0], { status: 201 })
  } catch (e: any) {
    console.error("Unexpected error in POST /api/equipment:", e)
    return NextResponse.json({ error: "Internal Server Error", details: e.message }, { status: 500 })
  }
}
