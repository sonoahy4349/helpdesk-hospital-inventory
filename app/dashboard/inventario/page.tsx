"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Search, Edit, Eye, Trash2, Monitor, Laptop, Printer } from "lucide-react"
import { AddEquipmentDialog } from "@/components/add-equipment-dialog"
import { EditEquipmentDialog } from "@/components/edit-equipment-dialog"
import { useToast } from "@/hooks/use-toast"

const equipmentTypes = [
  { id: "todos", label: "Todos los equipos", icon: null },
  { id: "cpu", label: "CPU y Monitores", icon: Monitor },
  { id: "laptop", label: "Laptops", icon: Laptop },
  { id: "impresora", label: "Impresoras", icon: Printer },
]

export default function InventarioPage() {
  const { toast } = useToast()
  const [selectedType, setSelectedType] = useState("todos")
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editingEquipment, setEditingEquipment] = useState<any>(null)
  const [equipmentData, setEquipmentData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Cargar datos desde la API
  const loadEquipment = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/equipment")
      if (!response.ok) {
        throw new Error("Error al cargar equipos")
      }
      const data = await response.json()

      // Transformar los datos para que coincidan con el formato esperado por la UI
      const transformedData = data.map((item: any) => ({
        id: item.id,
        equipo: item.tipo.charAt(0).toUpperCase() + item.tipo.slice(1), // Capitalizar primera letra
        marca: item.marca,
        modelo: item.modelo,
        serie: item.numero_serie,
        estado: item.estado,
        estacion: "Sin asignar", // Por ahora hardcodeado, se puede cambiar después
        tipo: item.tipo,
        perfil: item.perfil,
        tipoImpresora: item.tipo_impresora,
        // Mantener los datos originales para la edición
        originalData: item,
      }))

      setEquipmentData(transformedData)
    } catch (error) {
      console.error("Error loading equipment:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los equipos",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadEquipment()
  }, [])

const filteredEquipment = equipmentData.filter((item) => {
  let matchesType = false
  
  switch (selectedType) {
    case "todos":
      matchesType = true
      break
    case "cpu":
      // CPU y Monitores
      matchesType = item.tipo === "CPU" || item.tipo === "MONITOR"
      break
    case "laptop":
      matchesType = item.tipo === "LAPTOP"
      break
    case "impresora":
      matchesType = item.tipo === "IMPRESORA"
      break
    default:
      matchesType = false
  }
  
  const matchesSearch =
    item.equipo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.marca.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.modelo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.serie.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.perfil?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.tipoImpresora?.toLowerCase().includes(searchTerm.toLowerCase())
  
  return matchesType && matchesSearch
})

  const renderTableHeader = () => {
    if (selectedType === "impresora") {
      return (
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Perfil</TableHead>
          <TableHead>Tipo</TableHead>
          <TableHead>Marca</TableHead>
          <TableHead>Modelo</TableHead>
          <TableHead>No. de Serie</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead>Acciones</TableHead>
        </TableRow>
      )
    } else {
      return (
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Equipo</TableHead>
          <TableHead>Marca</TableHead>
          <TableHead>Modelo</TableHead>
          <TableHead>No. de Serie</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead>Estación Asignada</TableHead>
          <TableHead>Acciones</TableHead>
        </TableRow>
      )
    }
  }

  const handleEditEquipment = (equipment: any) => {
    // Pasar los datos originales de la base de datos para la edición
    setEditingEquipment(equipment.originalData)
    setShowEditDialog(true)
  }

  const handleDeleteEquipment = async (equipment: any) => {
    if (confirm("¿Estás seguro de que deseas eliminar este equipo?")) {
      try {
        const response = await fetch(`/api/equipment/${equipment.id}`, {
          method: "DELETE",
        })

        if (!response.ok) {
          throw new Error("Error al eliminar equipo")
        }

        toast({
          title: "Éxito",
          description: "Equipo eliminado correctamente",
        })

        // Recargar los datos
        loadEquipment()
      } catch (error) {
        console.error("Error deleting equipment:", error)
        toast({
          title: "Error",
          description: "No se pudo eliminar el equipo",
          variant: "destructive",
        })
      }
    }
  }

  const handleSuccess = () => {
    // Recargar los datos cuando se agregue o edite un equipo
    loadEquipment()
  }

  const renderTableRow = (item: any) => {
    if (selectedType === "impresora") {
      return (
        <TableRow key={item.id}>
          <TableCell className="font-medium">{item.id}</TableCell>
          <TableCell>{item.perfil || "N/A"}</TableCell>
          <TableCell>{item.tipoImpresora || "N/A"}</TableCell>
          <TableCell>{item.marca}</TableCell>
          <TableCell>{item.modelo}</TableCell>
          <TableCell className="font-mono text-sm">{item.serie}</TableCell>
          <TableCell>
            <Badge variant={item.estado === "En uso" ? "default" : "secondary"}>{item.estado}</Badge>
          </TableCell>
          <TableCell>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => handleEditEquipment(item)}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Eye className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => handleDeleteEquipment(item)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </TableCell>
        </TableRow>
      )
    } else {
      return (
        <TableRow key={item.id}>
          <TableCell className="font-medium">{item.id}</TableCell>
          <TableCell>{item.equipo}</TableCell>
          <TableCell>{item.marca}</TableCell>
          <TableCell>{item.modelo}</TableCell>
          <TableCell className="font-mono text-sm">{item.serie}</TableCell>
          <TableCell>
            <Badge variant={item.estado === "En uso" ? "default" : "secondary"}>{item.estado}</Badge>
          </TableCell>
          <TableCell>
            <Badge variant="outline">{item.estacion}</Badge>
          </TableCell>
          <TableCell>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => handleEditEquipment(item)}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Eye className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => handleDeleteEquipment(item)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </TableCell>
        </TableRow>
      )
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Inventario</h1>
            <p className="text-muted-foreground">Gestión de equipos en el inventario del hospital</p>
          </div>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center h-32">
              <p className="text-muted-foreground">Cargando equipos...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Inventario</h1>
          <p className="text-muted-foreground">Gestión de equipos en el inventario del hospital</p>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Agregar Equipo
        </Button>
      </div>

      {/* Filtros por tipo de equipo */}
      <div className="flex gap-2 flex-wrap">
        {equipmentTypes.map((type) => (
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

      {/* Barra de búsqueda y filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre o ID"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select defaultValue="todos">
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="en-uso">En uso</SelectItem>
                <SelectItem value="disponible">Disponible</SelectItem>
                <SelectItem value="mantenimiento">En mantenimiento</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de inventario */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Equipos</CardTitle>
          <CardDescription>{filteredEquipment.length} equipos encontrados</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>{renderTableHeader()}</TableHeader>
            <TableBody>
              {filteredEquipment.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No se encontraron equipos
                  </TableCell>
                </TableRow>
              ) : (
                filteredEquipment.map((item) => renderTableRow(item))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AddEquipmentDialog open={showAddDialog} onOpenChange={setShowAddDialog} onSuccess={handleSuccess} />
      <EditEquipmentDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        equipment={editingEquipment}
        onSuccess={handleSuccess}
      />
    </div>
  )
}
