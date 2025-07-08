import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("query") || ""

    let queryBuilder = supabase.from("view_locations_with_station_count").select("*")

    if (query) {
      queryBuilder = queryBuilder.or(
        `edificio.ilike.%${query}%,planta.ilike.%${query}%,servicio.ilike.%${query}%,ubicacion_interna.ilike.%${query}%`,
      )
    }

    const { data: locations, error } = await queryBuilder
      .order("edificio", { ascending: true })
      .order("planta", { ascending: true })
      .order("servicio", { ascending: true })

    if (error) {
      console.error("Error fetching locations:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(locations, { status: 200 })
  } catch (error) {
    console.error("Unexpected error in GET /api/locations:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { edificio, planta, servicio, ubicacion_interna } = await request.json()

    if (!edificio || !planta || !servicio) {
      return NextResponse.json({ error: "Edificio, Planta y Servicio son obligatorios." }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("locations")
      .insert([{ edificio, planta, servicio, ubicacion_interna }])
      .select()

    if (error) {
      console.error("Error creating location:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data[0], { status: 201 })
  } catch (error) {
    console.error("Unexpected error in POST /api/locations:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
