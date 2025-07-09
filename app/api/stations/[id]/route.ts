import { type NextRequest, NextResponse } from "next/server"

// Debug de la importación de Supabase
let supabaseAdmin: any = null;

try {
  const supabaseModule = require("@/lib/supabase");
  supabaseAdmin = supabaseModule.supabaseAdmin;
  console.log("Supabase admin loaded:", !!supabaseAdmin);
} catch (error) {
  console.error("Error importing supabase:", error);
}

export async function GET() {
  try {
    // Verificar que supabaseAdmin existe
    if (!supabaseAdmin) {
      console.error("supabaseAdmin is not defined");
      return NextResponse.json({ 
        error: "Database connection not available",
        debug: "supabaseAdmin is undefined"
      }, { status: 500 });
    }

    console.log("Attempting to fetch stations...");

    // Consulta simple primero
    const { data: stations, error } = await supabaseAdmin
      .from("workstations")
      .select("*")

    if (error) {
      console.error("Error fetching stations:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log("Stations fetched:", stations?.length || 0);

    // Si no hay estaciones, devolver array vacío
    if (!stations || stations.length === 0) {
      return NextResponse.json([])
    }

    // Transformación simple sin joins complejos
    const transformedStations = stations.map(station => ({
      id: station.id,
      tipo: station.station_type || 'unknown',
      direccion: station.direccion || '',
      status: station.status || 'unknown',
      resguardos: station.status === "active" ? "Firmado" : "Pendiente",
      created_at: station.created_at,
      // Campos básicos para cada tipo
      nombreEquipo: "Equipo",
      marca: "N/A",
      modelo: "N/A",
      serie: "N/A",
      equipoPrincipal: "Equipo Principal",
      marcaPrincipal: "N/A",
      modeloPrincipal: "N/A",
      seriePrincipal: "N/A",
      equipoSecundario: "Monitor",
      marcaSecundario: "N/A",
      modeloSecundario: "N/A",
      serieSecundario: "N/A",
      responsable: "N/A",
      edificio: "N/A",
      planta: "N/A",
      servicio: "N/A",
      ubicacionInterna: "N/A",
      originalData: station
    }));

    return NextResponse.json(transformedStations)
  } catch (error) {
    console.error("Error in GET /api/stations:", error)
    return NextResponse.json({ 
      error: "Internal server error",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ 
        error: "Database connection not available" 
      }, { status: 500 });
    }

    const body = await request.json()
    console.log("Creating station with data:", body)

    // Validar datos mínimos
    if (!body.stationType) {
      return NextResponse.json({ error: "stationType is required" }, { status: 400 })
    }

    // Crear la estación con datos mínimos
    const insertData: any = {
      station_type: body.stationType,
      status: "active"
    }

    // Agregar campos opcionales si existen
    if (body.formData?.direccion) insertData.direccion = body.formData.direccion;
    if (body.formData?.ubicacion) insertData.ubicacion_id = body.formData.ubicacion;
    if (body.formData?.responsable) insertData.responsable_id = body.formData.responsable;
    if (body.formData?.autorizacion) insertData.authorized_by = body.formData.autorizacion;
    if (body.formData?.descripcion) insertData.descripcion = body.formData.descripcion;

    console.log("Inserting station with data:", insertData);

    const { data: station, error: stationError } = await supabaseAdmin
      .from("workstations")
      .insert(insertData)
      .select()
      .single()

    if (stationError) {
      console.error("Error creating station:", stationError)
      return NextResponse.json({ error: stationError.message }, { status: 500 })
    }

    console.log("Station created:", station)

    // Agregar equipos si se proporcionaron
    if (body.formData?.equipoPrincipal) {
      const equipmentInserts = []

      // Equipo principal
      equipmentInserts.push({
        workstation_id: station.id,
        equipment_id: body.formData.equipoPrincipal,
        equipment_type: "primary",
        cantidad: 1
      })

      // Equipo secundario (solo para CPU+Monitor)
      if (body.stationType === "cpu-monitor" && body.formData.equipoSecundario) {
        equipmentInserts.push({
          workstation_id: station.id,
          equipment_id: body.formData.equipoSecundario,
          equipment_type: "secondary",
          cantidad: 1
        })
      }

      // Equipo terciario (opcional)
      if (body.formData.equipoTercero) {
        equipmentInserts.push({
          workstation_id: station.id,
          equipment_id: body.formData.equipoTercero,
          equipment_type: "tertiary",
          cantidad: 1
        })
      }

      console.log("Adding equipment:", equipmentInserts)

      const { error: equipmentError } = await supabaseAdmin
        .from("workstation_equipment")
        .insert(equipmentInserts)

      if (equipmentError) {
        console.error("Error adding equipment:", equipmentError)
        // Eliminar la estación si falló agregar equipos
        await supabaseAdmin.from("workstations").delete().eq("id", station.id)
        return NextResponse.json({ error: "Failed to assign equipment: " + equipmentError.message }, { status: 500 })
      }
    }

    return NextResponse.json({
      success: true,
      station: station,
      message: "Station created successfully"
    })
    
  } catch (error) {
    console.error("Error in POST /api/stations:", error)
    return NextResponse.json({ 
      error: "Internal server error",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ 
        error: "Database connection not available" 
      }, { status: 500 });
    }

    const url = new URL(request.url)
    const stationId = url.pathname.split('/').pop()

    if (!stationId) {
      return NextResponse.json({ error: "Station ID required" }, { status: 400 })
    }

    console.log("Deleting station:", stationId);

    const { error: deleteError } = await supabaseAdmin
      .from("workstations")
      .delete()
      .eq("id", stationId)

    if (deleteError) {
      console.error("Error deleting station:", deleteError)
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
    
  } catch (error) {
    console.error("Error in DELETE /api/stations:", error)
    return NextResponse.json({ 
      error: "Internal server error",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}