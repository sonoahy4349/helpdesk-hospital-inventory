import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    const { data: location, error } = await supabase
      .from("view_locations_with_station_count")
      .select("*")
      .eq("id", id)
      .single()

    if (error) {
      if (error.code === "PGRST116") {
        // No rows found
        return NextResponse.json({ error: "Ubicación no encontrada" }, { status: 404 })
      }
      console.error("Error fetching location by ID:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(location, { status: 200 })
  } catch (error) {
    console.error("Unexpected error in GET /api/locations/[id]:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const { edificio, planta, servicio, ubicacion_interna } = await request.json()

    if (!edificio || !planta || !servicio) {
      return NextResponse.json({ error: "Edificio, Planta y Servicio son obligatorios." }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("locations")
      .update({ edificio, planta, servicio, ubicacion_interna, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()

    if (error) {
      console.error("Error updating location:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ error: "Ubicación no encontrada para actualizar" }, { status: 404 })
    }

    return NextResponse.json(data[0], { status: 200 })
  } catch (error) {
    console.error("Unexpected error in PUT /api/locations/[id]:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const { error } = await supabase.from("locations").delete().eq("id", id)

    if (error) {
      console.error("Error deleting location:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ message: "Ubicación eliminada correctamente" }, { status: 200 })
  } catch (error) {
    console.error("Unexpected error in DELETE /api/locations/[id]:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
