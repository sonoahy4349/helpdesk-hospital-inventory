"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Users,
  Monitor,
  MapPin,
  UserCheck,
  TrendingUp,
  Activity,
  Calendar,
  Eye,
  BarChart3,
  PieChart,
} from "lucide-react"
import { MovimientosDialog } from "@/components/movimientos-dialog"

interface DashboardSummary {
  totalEquipment: number
  totalStations: number
  totalLocations: number
  totalResponsibles: number
  locationDistribution: Record<string, number>
  equipmentStatus: Record<string, number>
  recentActivity: Array<{
    id: number
    action: string
    details: string
    created_at: string
    user_id: number
  }>
}

export default function DashboardPage() {
  const [showMovimientosDialog, setShowMovimientosDialog] = useState(false)
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [loadingSummary, setLoadingSummary] = useState(true)
  const [errorSummary, setErrorSummary] = useState("")

  const fetchSummary = async () => {
    try {
      setLoadingSummary(true)
      setErrorSummary("")

      const response = await fetch("/api/dashboard/summary")
      if (!response.ok) {
        throw new Error("Error al cargar resumen del dashboard")
      }

      const data = await response.json()
      setSummary(data)
    } catch (error) {
      console.error("Error fetching dashboard summary:", error)
      setErrorSummary("No se pudo cargar el resumen del dashboard")

      // Datos de ejemplo en caso de error
      setSummary({
        totalEquipment: 0,
        totalStations: 0,
        totalLocations: 0,
        totalResponsibles: 0,
        locationDistribution: {},
        equipmentStatus: {},
        recentActivity: [],
      })
    } finally {
      setLoadingSummary(false)
    }
  }

  useEffect(() => {
    fetchSummary()
  }, [])

  const getActionIcon = (action: string) => {
    switch (action) {
      case "create":
        return <Activity className="h-4 w-4 text-green-600" />
      case "update":
        return <Activity className="h-4 w-4 text-blue-600" />
      case "delete":
        return <Activity className="h-4 w-4 text-red-600" />
      default:
        return <Activity className="h-4 w-4 text-gray-600" />
    }
  }

  const getActionLabel = (action: string) => {
    switch (action) {
      case "create":
        return "Creación"
      case "update":
        return "Actualización"
      case "delete":
        return "Eliminación"
      default:
        return action
    }
  }

  if (loadingSummary) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Cargando información del sistema...</p>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    )
  }

  if (!summary) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground text-red-600">{errorSummary}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Resumen general del sistema de inventario hospitalario</p>
      </div>

      {/* Tarjetas de resumen */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Equipos</CardTitle>
            <Monitor className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalEquipment}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 inline mr-1" />
              Equipos registrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estaciones</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalStations}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 inline mr-1" />
              Estaciones activas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ubicaciones</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalLocations}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 inline mr-1" />
              Ubicaciones registradas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Responsables</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalResponsibles}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 inline mr-1" />
              Personal responsable
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos y estadísticas */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Distribución por Servicios
            </CardTitle>
            <CardDescription>Equipos distribuidos por servicio hospitalario</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(summary.locationDistribution).length > 0 ? (
              Object.entries(summary.locationDistribution).map(([servicio, count]) => (
                <div key={servicio} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{servicio}</span>
                    <span className="font-medium">{count}</span>
                  </div>
                  <Progress
                    value={(count / Math.max(...Object.values(summary.locationDistribution))) * 100}
                    className="h-2"
                  />
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No hay datos disponibles</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Tipos de Equipos
            </CardTitle>
            <CardDescription>Distribución por tipo de equipo</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(summary.equipmentStatus).length > 0 ? (
              Object.entries(summary.equipmentStatus).map(([tipo, count]) => (
                <div key={tipo} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{tipo}</span>
                    <span className="font-medium">{count}</span>
                  </div>
                  <Progress
                    value={(count / Math.max(...Object.values(summary.equipmentStatus))) * 100}
                    className="h-2"
                  />
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No hay datos disponibles</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Actividad del Sistema */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Actividad del Sistema
              </CardTitle>
              <CardDescription>Últimas acciones realizadas en el sistema</CardDescription>
            </div>
            <Button variant="outline" onClick={() => setShowMovimientosDialog(true)} className="gap-2">
              <Eye className="h-4 w-4" />
              Ver todos los movimientos
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {summary.recentActivity.length > 0 ? (
            <div className="space-y-4">
              {summary.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg border">
                  {getActionIcon(activity.action)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs">
                        {getActionLabel(activity.action)}
                      </Badge>
                      <span className="text-xs text-muted-foreground">Usuario {activity.user_id}</span>
                    </div>
                    <p className="text-sm font-medium mb-1">{activity.details}</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {new Date(activity.created_at).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay actividad reciente registrada</p>
            </div>
          )}
        </CardContent>
      </Card>

      <MovimientosDialog open={showMovimientosDialog} onOpenChange={setShowMovimientosDialog} />
    </div>
  )
}
