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

    // Agregar información de asignación para cada equipo
    const equipmentWithAssignment = await Promise.all(
      equipment?.map(async (item) => {
        // Verificar si está asignado a alguna workstation
        const { data: assignment } = await supabase
          .from("workstation_equipment")
          .select(`
            workstation_id,
            equipment_type,
            workstations (
              id,
              station_type,
              status,
              direccion
            )
          `)
          .eq("equipment_id", item.id)
          .single()

        return {
          ...item,
          isAssigned: !!assignment,
          assignedTo: assignment ? {
            workstation_id: assignment.workstation_id,
            equipment_type: assignment.equipment_type,
            station_type: assignment.workstations?.station_type,
            station_status: assignment.workstations?.status,
            station_direccion: assignment.workstations?.direccion
          } : null,
          // Para compatibilidad con tu frontend actual
          estacion: assignment 
            ? `${assignment.workstations?.station_type} (${assignment.equipment_type})` 
            : "Sin asignar"
        }
      }) || []
    )

    return NextResponse.json(equipmentWithAssignment, { status: 200 })
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

    if (tipo === "IMPRESORA") {
      if (!perfil || !tipo_impresora) {
        return NextResponse.json(
          { error: "For 'IMPRESORA' type, 'perfil' and 'tipo_impresora' are required." },
          { status: 400 },
        )
      }
    }

    // Normalizar el tipo a mayúsculas para consistencia
    const normalizedTipo = tipo.toUpperCase()

    const { data: newEquipment, error } = await supabase
      .from("equipment")
      .insert({
        nombre: nombre || null,
        tipo: normalizedTipo,
        perfil: tipo === "IMPRESORA" ? perfil : null,
        tipo_impresora: tipo === "IMPRESORA" ? tipo_impresora : null,
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

export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url)
    const equipmentId = url.pathname.split('/').pop()

    if (!equipmentId) {
      return NextResponse.json({ error: "Equipment ID is required" }, { status: 400 })
    }

    // Verificar si el equipo está asignado a alguna workstation
    const { data: assignment } = await supabase
      .from("workstation_equipment")
      .select("workstation_id")
      .eq("equipment_id", equipmentId)
      .single()

    if (assignment) {
      return NextResponse.json(
        { error: "Cannot delete equipment that is assigned to a workstation. Please unassign it first." },
        { status: 400 }
      )
    }

    // Eliminar el equipo
    const { error: deleteError } = await supabase
      .from("equipment")
      .delete()
      .eq("id", equipmentId)

    if (deleteError) {
      console.error("Error deleting equipment:", deleteError)
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (e: any) {
    console.error("Unexpected error in DELETE /api/equipment:", e)
    return NextResponse.json({ error: "Internal Server Error", details: e.message }, { status: 500 })
  }
}