import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || ""
    const type = searchParams.get("type") || ""
    const user = searchParams.get("user") || ""
    const date = searchParams.get("date") || ""

    let query = supabaseAdmin.from("activity_log").select("*").order("created_at", { ascending: false })

    // Aplicar filtros si existen
    if (search) {
      query = query.or(`details.ilike.%${search}%,action.ilike.%${search}%`)
    }

    if (type) {
      query = query.eq("action", type)
    }

    if (user) {
      query = query.eq("user_id", user)
    }

    if (date) {
      const startDate = new Date(date)
      const endDate = new Date(date)
      endDate.setDate(endDate.getDate() + 1)

      query = query.gte("created_at", startDate.toISOString()).lt("created_at", endDate.toISOString())
    }

    const { data: activities, error } = await query

    if (error) {
      console.error("Error fetching activity log:", error)
      return NextResponse.json({ activities: [] })
    }

    return NextResponse.json({ activities: activities || [] })
  } catch (error) {
    console.error("Error in activity log API:", error)
    return NextResponse.json({ activities: [] })
  }
}
