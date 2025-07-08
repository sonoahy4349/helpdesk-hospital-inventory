import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function GET() {
  try {
    // Obtener conteos básicos
    const [
      { count: totalEquipment },
      { count: totalStations },
      { count: totalLocations },
      { count: totalResponsibles },
    ] = await Promise.all([
      supabaseAdmin.from("equipment").select("*", { count: "exact", head: true }),
      supabaseAdmin.from("workstations").select("*", { count: "exact", head: true }),
      supabaseAdmin.from("locations").select("*", { count: "exact", head: true }),
      supabaseAdmin.from("responsibles").select("*", { count: "exact", head: true }),
    ])

    // Obtener distribución por ubicaciones
    const { data: locations } = await supabaseAdmin.from("locations").select("servicio")

    const locationDistribution =
      locations?.reduce((acc: any, location: any) => {
        const servicio = location.servicio || "Sin servicio"
        acc[servicio] = (acc[servicio] || 0) + 1
        return acc
      }, {}) || {}

    // Obtener estados de equipos
    const { data: equipment } = await supabaseAdmin.from("equipment").select("tipo_equipo")

    const equipmentStatus =
      equipment?.reduce((acc: any, item: any) => {
        const tipo = item.tipo_equipo || "Otros"
        acc[tipo] = (acc[tipo] || 0) + 1
        return acc
      }, {}) || {}

    // Obtener actividad reciente
    const { data: recentActivity } = await supabaseAdmin
      .from("activity_log")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5)

    const summary = {
      totalEquipment: totalEquipment || 0,
      totalStations: totalStations || 0,
      totalLocations: totalLocations || 0,
      totalResponsibles: totalResponsibles || 0,
      locationDistribution,
      equipmentStatus,
      recentActivity: recentActivity || [],
    }

    return NextResponse.json(summary)
  } catch (error) {
    console.error("Error fetching dashboard summary:", error)

    // Datos de ejemplo en caso de error
    const fallbackSummary = {
      totalEquipment: 0,
      totalStations: 0,
      totalLocations: 0,
      totalResponsibles: 0,
      locationDistribution: {},
      equipmentStatus: {},
      recentActivity: [],
    }

    return NextResponse.json(fallbackSummary)
  }
}
