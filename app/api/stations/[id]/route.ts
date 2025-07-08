import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params
  try {
    const { data: station, error } = await supabase
      .from("workstations")
      .select(
        `
        *,
        workstation_equipment (
          equipment_id,
          equipment_type,
          equipment (
            id,
            marca,
            modelo,
            numero_serie,
            tipo_equipo,
            perfil,
            tipo_impresora
          )
        ),
        workstation_accessories (*),
        locations (
          id,
          edificio,
          planta,
          servicio,
          ubicacion_interna
        ),
        responsibles (
          id,
          nombre,
          apellido
        )
      `,
      )
      .eq("id", id)
      .single()

    if (error) {
      console.error(`Error fetching station with ID ${id}:`, error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!station) {
      return NextResponse.json({ error: "Station not found" }, { status: 404 })
    }

    return NextResponse.json(station)
  } catch (error) {
    console.error(`Error in GET /api/stations/${id}:`, error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params
  try {
    const body = await request.json()

    // Actualizar la estación
    const { data: updatedStation, error: stationError } = await supabase
      .from("workstations")
      .update({
        station_type: body.stationType,
        direccion: body.formData.direccion,
        location_id: body.formData.ubicacion,
        responsible_id: body.formData.responsable,
        authorized_by: body.formData.autorizacion,
        status: body.formData.status, // Asumiendo que el estado puede ser actualizado
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (stationError) {
      console.error(`Error updating station with ID ${id}:`, stationError)
      return NextResponse.json({ error: stationError.message }, { status: 500 })
    }

    // Eliminar equipos y accesorios existentes para reinsertar
    await supabase.from("workstation_equipment").delete().eq("workstation_id", id)
    await supabase.from("workstation_accessories").delete().eq("workstation_id", id)

    // Re-insertar equipos
    const equipmentInserts = []
    if (body.formData.equipoPrincipal) {
      equipmentInserts.push({
        workstation_id: id,
        equipment_id: body.formData.equipoPrincipal,
        equipment_type: "primary",
      })
    }
    if (body.formData.equipoSecundario) {
      equipmentInserts.push({
        workstation_id: id,
        equipment_id: body.formData.equipoSecundario,
        equipment_type: "secondary",
      })
    }
    if (body.formData.equipoTercero) {
      equipmentInserts.push({
        workstation_id: id,
        equipment_id: body.formData.equipoTercero,
        equipment_type: "tertiary",
      })
    }

    if (equipmentInserts.length > 0) {
      const { error: equipmentError } = await supabase.from("workstation_equipment").insert(equipmentInserts)
      if (equipmentError) {
        console.error("Error re-adding equipment to station:", equipmentError)
      }
    }

    // Re-insertar accesorios
    const accessoryInserts = Object.entries(body.accessories)
      .filter(([_, value]) => value === true)
      .map(([key, _]) => ({
        workstation_id: id,
        accessory_type: key,
        included: true,
      }))

    if (accessoryInserts.length > 0) {
      const { error: accessoryError } = await supabase.from("workstation_accessories").insert(accessoryInserts)
      if (accessoryError) {
        console.error("Error re-adding accessories to station:", accessoryError)
      }
    }

    // Registrar actividad
    await supabase.from("activity_log").insert({
      user_id: 1, // TODO: obtener del usuario autenticado
      action: "update",
      table_name: "workstations",
      record_id: id,
      details: `Estación actualizada: ${id}`,
    })

    return NextResponse.json(updatedStation)
  } catch (error) {
    console.error(`Error in PUT /api/stations/${id}:`, error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params
  try {
    const { error } = await supabase.from("workstations").delete().eq("id", id)

    if (error) {
      console.error(`Error deleting station with ID ${id}:`, error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Registrar actividad
    await supabase.from("activity_log").insert({
      user_id: 1, // TODO: obtener del usuario autenticado
      action: "delete",
      table_name: "workstations",
      record_id: id,
      details: `Estación eliminada: ${id}`,
    })

    return NextResponse.json({ message: "Station deleted successfully" })
  } catch (error) {
    console.error(`Error in DELETE /api/stations/${id}:`, error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
