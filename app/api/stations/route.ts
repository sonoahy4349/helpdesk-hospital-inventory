import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function GET() {
  try {
    // Obtener estaciones con sus equipos y accesorios
    const { data: stations, error } = await supabaseAdmin.from("workstations").select(`
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
      `)

    if (error) {
      console.error("Error fetching stations:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(stations || [])
  } catch (error) {
    console.error("Error in GET /api/stations:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Crear la estación
    const { data: station, error: stationError } = await supabaseAdmin
      .from("workstations")
      .insert({
        station_type: body.stationType,
        direccion: body.formData.direccion,
        location_id: body.formData.ubicacion,
        responsible_id: body.formData.responsable,
        authorized_by: body.formData.autorizacion,
        status: "active",
      })
      .select()
      .single()

    if (stationError) {
      console.error("Error creating station:", stationError)
      return NextResponse.json({ error: stationError.message }, { status: 500 })
    }

    // Agregar equipos a la estación
    const equipmentInserts = []
    if (body.formData.equipoPrincipal) {
      equipmentInserts.push({
        workstation_id: station.id,
        equipment_id: body.formData.equipoPrincipal,
        equipment_type: "primary",
      })
    }
    if (body.formData.equipoSecundario) {
      equipmentInserts.push({
        workstation_id: station.id,
        equipment_id: body.formData.equipoSecundario,
        equipment_type: "secondary",
      })
    }
    if (body.formData.equipoTercero) {
      equipmentInserts.push({
        workstation_id: station.id,
        equipment_id: body.formData.equipoTercero,
        equipment_type: "tertiary",
      })
    }

    if (equipmentInserts.length > 0) {
      const { error: equipmentError } = await supabaseAdmin.from("workstation_equipment").insert(equipmentInserts)

      if (equipmentError) {
        console.error("Error adding equipment to station:", equipmentError)
      }
    }

    // Agregar accesorios
    const accessoryInserts = Object.entries(body.accessories)
      .filter(([_, value]) => value === true)
      .map(([key, _]) => ({
        workstation_id: station.id,
        accessory_type: key,
        included: true,
      }))

    if (accessoryInserts.length > 0) {
      const { error: accessoryError } = await supabaseAdmin.from("workstation_accessories").insert(accessoryInserts)

      if (accessoryError) {
        console.error("Error adding accessories to station:", accessoryError)
      }
    }

    // Registrar actividad
    await supabaseAdmin.from("activity_log").insert({
      user_id: 1, // TODO: obtener del usuario autenticado
      action: "create",
      table_name: "workstations",
      record_id: station.id,
      details: `Nueva estación creada: ${body.stationType}`,
    })

    return NextResponse.json(station)
  } catch (error) {
    console.error("Error in POST /api/stations:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
