"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Search, Edit, Eye, FileText, Monitor, Laptop, Printer, RotateCcw, Trash2 } from "lucide-react"
import { CreateStationDialog } from "@/components/create-station-dialog"
import { ResguardosDialog } from "@/components/resguardos-dialog"
import { EditStationDialog } from "@/components/edit-station-dialog"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

const stationTypes = [
  // { id: "todas", label: "Todas las Estaciones", icon: null }, ← ELIMINAR ESTA LÍNEA
  { id: "cpu-monitor", label: "CPU y Monitores", icon: Monitor },
  { id: "laptop", label: "Laptops", icon: Laptop },
  { id: "impresora", label: "Impresoras", icon: Printer },
]

export default function EstacionesPage() {
  const [selectedType, setSelectedType] = useState("cpu-monitor") // ← Cambiar de "todas" a "cpu-monitor"
  const [searchTerm, setSearchTerm] = useState("")
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showResguardosDialog, setShowResguardosDialog] = useState(false)
  const [selectedStation, setSelectedStation] = useState<any>(null)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editingStation, setEditingStation] = useState<any>(null)
  const [stations, setStations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [stationToDelete, setStationToDelete] = useState<any>(null)
  const { toast } = useToast()

  // Cargar estaciones desde la API
const fetchStations = async () => {
  try {
    setLoading(true)
    const response = await fetch("/api/stations")
    if (!response.ok) {
      throw new Error("Error al cargar estaciones")
    }
    const data = await response.json()
    
    // Los datos ya vienen transformados desde la API
    setStations(data)
  } catch (error) {
    console.error("Error fetching stations:", error)
    toast({
      title: "Error",
      description: "No se pudieron cargar las estaciones",
      variant: "destructive",
    })
  } finally {
    setLoading(false)
  }
}

  useEffect(() => {
    fetchStations()
  }, [])

  const filteredStations = stations.filter((item) => {
    const matchesType = selectedType === "todas" || item.tipo === selectedType
    const matchesSearch =
      item.equipoPrincipal?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.responsable?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.servicio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.nombreEquipo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.ubicacion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.area?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesType && matchesSearch
  })

  const handleViewResguardos = (station: any) => {
    setSelectedStation(station)
    setShowResguardosDialog(true)
  }

  const handleEditStation = (station: any) => {
    setEditingStation(station.originalData) // Pasar los datos originales para edición
    setShowEditDialog(true)
  }

  const handleDeleteStation = (station: any) => {
    setStationToDelete(station)
    setShowDeleteDialog(true)
  }

  const confirmDelete = async () => {
    if (!stationToDelete) return

    try {
      const response = await fetch(`/api/stations/${stationToDelete.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Error al eliminar estación")
      }

      toast({
        title: "Éxito",
        description: "Estación eliminada correctamente",
      })

      fetchStations() // Recargar datos
    } catch (error) {
      console.error("Error deleting station:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar la estación",
        variant: "destructive",
      })
    } finally {
      setShowDeleteDialog(false)
      setStationToDelete(null)
    }
  }

  const handleStationCreated = () => {
    fetchStations() // Recargar datos después de crear
    setShowCreateDialog(false)
  }

  const handleStationUpdated = () => {
    fetchStations() // Recargar datos después de editar
    setShowEditDialog(false)
  }

  // Función para renderizar el header de la tabla según el tipo
const renderTableHeader = () => {
  if (selectedType === "laptop") {
    return (
      <TableRow>
        <TableHead>ID</TableHead>
        <TableHead>Nombre del Equipo</TableHead>
        <TableHead>Marca</TableHead>
        <TableHead>Modelo</TableHead>
        <TableHead>Dirección</TableHead>
        <TableHead>Edificio</TableHead>
        <TableHead>Planta</TableHead>
        <TableHead>Servicio</TableHead>
        <TableHead>Ubicación Interna</TableHead>
        <TableHead>Responsable</TableHead>
        <TableHead>Resguardos</TableHead>
        <TableHead>Acciones</TableHead>
      </TableRow>
    )
  } else if (selectedType === "impresora") {
    return (
      <TableRow>
        <TableHead>ID</TableHead>
        <TableHead>Ubicación</TableHead>
        <TableHead>Área</TableHead>
        <TableHead>Perfil</TableHead>
        <TableHead>Tipo</TableHead>
        <TableHead>Marca</TableHead>
        <TableHead>Modelo</TableHead>
        <TableHead>No. de Serie</TableHead>
        <TableHead>Resguardos</TableHead>
        <TableHead>Acciones</TableHead>
      </TableRow>
    )
  } else {
    // CPU y Monitores o Todas las estaciones
    return (
      <TableRow>
        <TableHead>No.</TableHead>
        <TableHead>Equipo Principal</TableHead>
        <TableHead>Marca</TableHead>
        <TableHead>Modelo</TableHead>
        <TableHead>No. de serie</TableHead>
        <TableHead>Equipo Secundario</TableHead>
        <TableHead>Marca</TableHead>
        <TableHead>Modelo</TableHead>
        <TableHead>No. de serie</TableHead>
        <TableHead>Dirección</TableHead>
        <TableHead>Edificio</TableHead>
        <TableHead>Planta</TableHead>
        <TableHead>Servicio</TableHead>
        <TableHead>Ubicación Interna</TableHead>
        <TableHead>Responsable</TableHead>
        <TableHead>Resguardos</TableHead>
        <TableHead>Acciones</TableHead>
      </TableRow>
    )
  }
}

  // Función para renderizar las filas de la tabla según el tipo
  const renderTableRow = (station: any) => {
    if (selectedType === "laptop") {
      return (
        <TableRow key={station.id}>
          <TableCell className="font-medium">{station.id}</TableCell>
          <TableCell>{station.nombreEquipo}</TableCell>
          <TableCell>{station.marca}</TableCell>
          <TableCell>{station.modelo}</TableCell>
          <TableCell>{station.direccion}</TableCell>
          <TableCell>{station.edificio}</TableCell>
          <TableCell>{station.planta}</TableCell>
          <TableCell>{station.servicio}</TableCell>
          <TableCell>{station.ubicacionInterna}</TableCell>
          <TableCell>{station.responsable}</TableCell>
          <TableCell>
            <div className="flex gap-1 flex-wrap">
              {station.resguardos.split(", ").map((resguardo: string, index: number) => (
                <Badge
                  key={index}
                  variant={resguardo === "Firmado" ? "default" : resguardo === "Activo" ? "secondary" : "destructive"}
                  className="text-xs"
                >
                  {resguardo} ({index + 1})
                </Badge>
              ))}
            </div>
          </TableCell>
          <TableCell>
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" onClick={() => handleEditStation(station)}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => handleViewResguardos(station)}>
                <FileText className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Eye className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => handleDeleteStation(station)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </TableCell>
        </TableRow>
      )
    } else if (selectedType === "impresora") {
      return (
        <TableRow key={station.id}>
          <TableCell className="font-medium">{station.id}</TableCell>
          <TableCell>{station.ubicacion}</TableCell>
          <TableCell>{station.area}</TableCell>
          <TableCell>{station.perfil}</TableCell>
          <TableCell>{station.tipoImpresora}</TableCell>
          <TableCell>{station.marca}</TableCell>
          <TableCell>{station.modelo}</TableCell>
          <TableCell className="font-mono text-sm">{station.serie}</TableCell>
          <TableCell>
            <div className="flex gap-1 flex-wrap">
              {station.resguardos.split(", ").map((resguardo: string, index: number) => (
                <Badge
                  key={index}
                  variant={resguardo === "Firmado" ? "default" : resguardo === "Activo" ? "secondary" : "destructive"}
                  className="text-xs"
                >
                  {resguardo} ({index + 1})
                </Badge>
              ))}
            </div>
          </TableCell>
          <TableCell>
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" onClick={() => handleEditStation(station)}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => handleViewResguardos(station)}>
                <FileText className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Eye className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => handleDeleteStation(station)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </TableCell>
        </TableRow>
      )
    } else {
      // CPU y Monitores o Todas las estaciones
      return (
        <TableRow key={station.id}>
          <TableCell className="font-medium">{station.id}</TableCell>
          <TableCell>{station.equipoPrincipal}</TableCell>
          <TableCell>{station.marcaPrincipal}</TableCell>
          <TableCell>{station.modeloPrincipal}</TableCell>
          <TableCell className="font-mono text-sm">{station.seriePrincipal}</TableCell>
          <TableCell>{station.equipoSecundario}</TableCell>
          <TableCell>{station.marcaSecundario}</TableCell>
          <TableCell>{station.modeloSecundario}</TableCell>
          <TableCell className="font-mono text-sm">{station.serieSecundario}</TableCell>
          <TableCell>{station.direccion}</TableCell>
          <TableCell>{station.edificio}</TableCell>
          <TableCell>{station.planta}</TableCell>
          <TableCell>{station.servicio}</TableCell>
          <TableCell>{station.ubicacionInterna}</TableCell>
          <TableCell>{station.responsable}</TableCell>
          <TableCell>
            <div className="flex gap-1 flex-wrap">
              {station.resguardos.split(", ").map((resguardo: string, index: number) => (
                <Badge
                  key={index}
                  variant={resguardo === "Firmado" ? "default" : resguardo === "Activo" ? "secondary" : "destructive"}
                  className="text-xs"
                >
                  {resguardo} ({index + 1})
                </Badge>
              ))}
            </div>
          </TableCell>
          <TableCell>
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" onClick={() => handleEditStation(station)}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => handleViewResguardos(station)}>
                <FileText className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Eye className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => handleDeleteStation(station)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </TableCell>
        </TableRow>
      )
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Estaciones de Trabajo</h1>
            <p className="text-muted-foreground">Cargando estaciones...</p>
          </div>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Estaciones de Trabajo</h1>
          <p className="text-muted-foreground">Gestión integrada de estaciones y resguardos</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            Imprimir lista
          </Button>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Estación
          </Button>
        </div>
      </div>

      {/* Filtros por tipo de estación */}
      <div className="flex gap-2 flex-wrap">
        {stationTypes.map((type) => (
          <Button
            key={type.id}
            variant={selectedType === type.id ? "default" : "outline"}
            onClick={() => setSelectedType(type.id)}
            className="gap-2"
          >
            {type.icon && <type.icon className="h-4 w-4" />}
            {type.label}
          </Button>
        ))}
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select defaultValue="todas">
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Fecha</SelectItem>
                <SelectItem value="hoy">Hoy</SelectItem>
                <SelectItem value="semana">Esta semana</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="todos">
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Equipo</SelectItem>
                <SelectItem value="hp">HP</SelectItem>
                <SelectItem value="dell">Dell</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="todas">
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Marca</SelectItem>
                <SelectItem value="hp">HP</SelectItem>
                <SelectItem value="dell">Dell</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="todos">
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Estado</SelectItem>
                <SelectItem value="activo">Activo</SelectItem>
                <SelectItem value="inactivo">Inactivo</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm">
              <RotateCcw className="h-4 w-4 mr-2" />
              Reiniciar filtro
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de estaciones */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>{renderTableHeader()}</TableHeader>
            <TableBody>{filteredStations.map((station) => renderTableRow(station))}</TableBody>
          </Table>
        </CardContent>
      </Card>

      <CreateStationDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onStationCreated={handleStationCreated}
      />
      <ResguardosDialog open={showResguardosDialog} onOpenChange={setShowResguardosDialog} station={selectedStation} />
      <EditStationDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        station={editingStation}
        onStationUpdated={handleStationUpdated}
      />

      {/* Dialog de confirmación para eliminar */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente la estación
              {stationToDelete && ` #${stationToDelete.id}`} y todos sus datos asociados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
