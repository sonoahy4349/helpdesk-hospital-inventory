// app/api/equipment/available/route.ts
import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const stationType = searchParams.get('stationType')
    
    console.log('Fetching available equipment for:', { stationType })

    // Obtener todos los equipos (sin filtrar por estado primero)
    const { data: allEquipment, error: equipmentError } = await supabase
      .from("equipment")
      .select("*")
      .order("tipo", { ascending: true })
      .order("marca", { ascending: true })

    if (equipmentError) {
      console.error("Error fetching equipment:", equipmentError)
      return NextResponse.json({ error: equipmentError.message }, { status: 500 })
    }

    console.log('All equipment found:', allEquipment?.length)
    console.log('Equipment states:', [...new Set(allEquipment?.map(e => e.estado))])

    // Filtrar por estado disponible (detectar automáticamente el formato)
    const availableByState = allEquipment?.filter(item => 
      item.estado && 
      (item.estado.toLowerCase() === 'disponible' || item.estado.toLowerCase() === 'available')
    ) || []

    console.log('Available by state:', availableByState.length)

    // Obtener equipos ya asignados
    const { data: assignedEquipment, error: assignedError } = await supabase
      .from("workstation_equipment")
      .select("equipment_id")

    if (assignedError) {
      console.error("Error fetching assigned equipment:", assignedError)
    }

    const assignedIds = new Set(assignedEquipment?.map(item => item.equipment_id) || [])
    console.log('Assigned equipment IDs:', [...assignedIds])

    // Filtrar equipos disponibles (no asignados)
    const availableEquipment = availableByState.filter(item => !assignedIds.has(item.id)) || []
    
    console.log('Final available equipment:', availableEquipment.length)
    console.log('Available equipment by type:', 
      availableEquipment.reduce((acc, item) => {
        acc[item.tipo] = (acc[item.tipo] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    )

    // Transformar para compatibilidad con el frontend
    const transformedEquipment = availableEquipment.map(item => ({
      id: item.id,
      value: item.id,
      label: `${item.marca} ${item.modelo} (${item.numero_serie})`,
      tipo: item.tipo,
      tipo_equipo: item.tipo, // Para compatibilidad con el frontend actual
      marca: item.marca,
      modelo: item.modelo,
      numero_serie: item.numero_serie,
      estado: item.estado,
      perfil: item.perfil,
      tipo_impresora: item.tipo_impresora,
      originalData: item
    }))

    return NextResponse.json({
      equipment: transformedEquipment,
      total: transformedEquipment.length,
      debug: {
        totalEquipment: allEquipment?.length || 0,
        availableByState: availableByState.length,
        assignedCount: assignedIds.size,
        finalAvailable: transformedEquipment.length,
        states: [...new Set(allEquipment?.map(e => e.estado))],
        types: [...new Set(availableEquipment.map(e => e.tipo))]
      }
    })

  } catch (error) {
    console.error("Error in GET /api/equipment/available:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}