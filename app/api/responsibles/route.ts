import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
  try {
    const { data: responsibles, error } = await supabase
      .from("responsibles") // Nombre de tu tabla de responsables
      .select("*")

    if (error) {
      console.error("Error fetching responsibles:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(responsibles, { status: 200 })
  } catch (e: any) {
    console.error("Unexpected error in GET /api/responsibles:", e)
    return NextResponse.json({ error: "Internal Server Error", details: e.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { nombre_completo, cargo, email, telefono } = await request.json()

    if (!nombre_completo || !cargo) {
      return NextResponse.json({ error: "Missing required fields: nombre_completo, cargo" }, { status: 400 })
    }

    const { data: newResponsible, error } = await supabase
      .from("responsibles")
      .insert({
        nombre_completo,
        cargo,
        email,
        telefono,
        fecha_registro: new Date().toISOString(),
      })
      .select()

    if (error) {
      console.error("Error creating responsible:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(newResponsible[0], { status: 201 })
  } catch (e: any) {
    console.error("Unexpected error in POST /api/responsibles:", e)
    return NextResponse.json({ error: "Internal Server Error", details: e.message }, { status: 500 })
  }
}
