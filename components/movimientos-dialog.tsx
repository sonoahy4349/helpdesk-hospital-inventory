"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Search, Download, Filter, Calendar, User, Activity } from "lucide-react"

interface MovimientosDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface Movimiento {
  id: number
  action: string
  details: string
  table_name: string
  user_id: number
  created_at: string
  record_id?: number
}

export function MovimientosDialog({ open, onOpenChange }: MovimientosDialogProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("todos")
  const [userFilter, setUserFilter] = useState("todos")
  const [dateFilter, setDateFilter] = useState("")
  const [movimientos, setMovimientos] = useState<Movimiento[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const fetchMovimientos = async () => {
    try {
      setLoading(true)
      setError("")

      const params = new URLSearchParams()
      if (searchTerm) params.append("search", searchTerm)
      if (typeFilter !== "todos") params.append("type", typeFilter)
      if (userFilter !== "todos") params.append("user", userFilter)
      if (dateFilter) params.append("date", dateFilter)

      const response = await fetch(`/api/activity-log?${params.toString()}`)
      if (!response.ok) {
        throw new Error("Error al cargar movimientos")
      }

      const data = await response.json()
      setMovimientos(data.activities || [])
    } catch (error) {
      console.error("Error fetching movimientos:", error)
      setError("No se pudieron cargar los movimientos")
      setMovimientos([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (open) {
      fetchMovimientos()
    }
  }, [open, searchTerm, typeFilter, userFilter, dateFilter])

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

  const getActionVariant = (action: string): "default" | "secondary" | "destructive" => {
    switch (action) {
      case "create":
        return "default"
      case "update":
        return "secondary"
      case "delete":
        return "destructive"
      default:
        return "secondary"
    }
  }

  const exportMovimientos = () => {
    const csvContent = [
      ["Fecha", "Usuario", "Acción", "Detalle", "Tabla"].join(","),
      ...movimientos.map((mov) =>
        [
          new Date(mov.created_at).toLocaleString(),
          `Usuario ${mov.user_id}`,
          getActionLabel(mov.action),
          mov.details,
          mov.table_name,
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `movimientos_${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Historial de Movimientos del Sistema
          </DialogTitle>
        </DialogHeader>

        {/* Filtros */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-4 items-center flex-wrap">
              <div className="flex-1 min-w-[200px] relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar movimientos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[140px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los tipos</SelectItem>
                  <SelectItem value="create">Creación</SelectItem>
                  <SelectItem value="update">Actualización</SelectItem>
                  <SelectItem value="delete">Eliminación</SelectItem>
                </SelectContent>
              </Select>

              <Select value={userFilter} onValueChange={setUserFilter}>
                <SelectTrigger className="w-[140px]">
                  <User className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los usuarios</SelectItem>
                  <SelectItem value="1">Usuario 1</SelectItem>
                  <SelectItem value="2">Usuario 2</SelectItem>
                </SelectContent>
              </Select>

              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="pl-10 w-[160px]"
                />
              </div>

              <Button onClick={exportMovimientos} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Lista de movimientos */}
        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-32 text-red-600">{error}</div>
          ) : movimientos.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-muted-foreground">
              No se encontraron movimientos
            </div>
          ) : (
            <div className="space-y-2">
              {movimientos.map((movimiento) => (
                <Card key={movimiento.id} className="hover:bg-muted/50 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        {getActionIcon(movimiento.action)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant={getActionVariant(movimiento.action)} className="text-xs">
                              {getActionLabel(movimiento.action)}
                            </Badge>
                            <span className="text-sm text-muted-foreground">en {movimiento.table_name}</span>
                          </div>
                          <p className="text-sm font-medium mb-1">{movimiento.details}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              Usuario {movimiento.user_id}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(movimiento.created_at).toLocaleString()}
                            </span>
                            {movimiento.record_id && <span>ID: {movimiento.record_id}</span>}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Footer con estadísticas */}
        <div className="border-t pt-4">
          <div className="flex justify-between items-center text-sm text-muted-foreground">
            <span>Total de movimientos: {movimientos.length}</span>
            <span>Última actualización: {new Date().toLocaleString()}</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
