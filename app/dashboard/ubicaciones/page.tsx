"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge" // Import Badge
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Search, Edit, Trash2, Building } from "lucide-react"
import { AddLocationDialog } from "@/components/add-location-dialog"
import { AddDirectionDialog } from "@/components/add-direction-dialog"
import { EditLocationDialog } from "@/components/edit-location-dialog"
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

interface Location {
  id: string
  edificio: string
  planta: string
  servicio: string
  ubicacion_interna: string | null
  estaciones_asignadas: number // From the view
  created_at: string
  updated_at: string
}

export default function UbicacionesPage() {
  const [locations, setLocations] = useState<Location[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showDirectionDialog, setShowDirectionDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [locationToDelete, setLocationToDelete] = useState<Location | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const fetchLocations = async (query = "") => {
    setLoading(true)
    try {
      const response = await fetch(`/api/locations?query=${query}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      setLocations(data)
    } catch (error) {
      console.error("Error fetching locations:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar las ubicaciones.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLocations()
  }, [])

  const handleSearch = () => {
    fetchLocations(searchTerm)
  }

  const handleAddLocation = async (
    newLocation: Omit<Location, "id" | "estaciones_asignadas" | "created_at" | "updated_at">,
  ) => {
    try {
      const response = await fetch("/api/locations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newLocation),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to add location")
      }

      toast({
        title: "Éxito",
        description: "Ubicación añadida correctamente.",
      })
      setShowAddDialog(false)
      fetchLocations() // Refresh the list
    } catch (error: any) {
      console.error("Error adding location:", error)
      toast({
        title: "Error",
        description: `No se pudo añadir la ubicación: ${error.message}`,
        variant: "destructive",
      })
    }
  }

  const handleEditLocation = async (
    updatedLocation: Omit<Location, "estaciones_asignadas" | "created_at" | "updated_at">,
  ) => {
    try {
      const response = await fetch(`/api/locations/${updatedLocation.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedLocation),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update location")
      }

      toast({
        title: "Éxito",
        description: "Ubicación actualizada correctamente.",
      })
      setShowEditDialog(false)
      setSelectedLocation(null)
      fetchLocations() // Refresh the list
    } catch (error: any) {
      console.error("Error updating location:", error)
      toast({
        title: "Error",
        description: `No se pudo actualizar la ubicación: ${error.message}`,
        variant: "destructive",
      })
    }
  }

  const handleDeleteLocation = async () => {
    if (!locationToDelete) return

    try {
      const response = await fetch(`/api/locations/${locationToDelete.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to delete location")
      }

      toast({
        title: "Éxito",
        description: "Ubicación eliminada correctamente.",
      })
      setIsDeleteDialogOpen(false)
      setLocationToDelete(null)
      fetchLocations() // Refresh the list
    } catch (error: any) {
      console.error("Error deleting location:", error)
      toast({
        title: "Error",
        description: `No se pudo eliminar la ubicación: ${error.message}`,
        variant: "destructive",
      })
    }
  }

  const openEditDialog = (location: Location) => {
    setSelectedLocation(location)
    setShowEditDialog(true)
  }

  const openDeleteDialog = (location: Location) => {
    setLocationToDelete(location)
    setIsDeleteDialogOpen(true)
  }

  const filteredLocations = useMemo(() => {
    if (!searchTerm) {
      return locations
    }
    return locations.filter(
      (location) =>
        location.edificio.toLowerCase().includes(searchTerm.toLowerCase()) ||
        location.planta.toLowerCase().includes(searchTerm.toLowerCase()) ||
        location.servicio.toLowerCase().includes(searchTerm.toLowerCase()) ||
        location.ubicacion_interna?.toLowerCase().includes(searchTerm.toLowerCase()),
    )
  }, [locations, searchTerm])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Ubicaciones</h1>
          <p className="text-muted-foreground">Gestión de ubicaciones del hospital</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowDirectionDialog(true)}>
            <Building className="h-4 w-4 mr-2" />
            Agregar Dirección
          </Button>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Agregar Ubicación
          </Button>
        </div>
      </div>
      {/* Barra de búsqueda */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar ubicaciones..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <Button onClick={handleSearch} variant="outline">
              Buscar
            </Button>
          </div>
        </CardContent>
      </Card>
      {/* Tabla de ubicaciones */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Ubicaciones</CardTitle>
          <CardDescription>{filteredLocations.length} ubicaciones registradas</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Cargando ubicaciones...</div>
          ) : locations.length === 0 && searchTerm === "" ? (
            <div className="text-center py-8 text-gray-500">No hay ubicaciones registradas. ¡Añade la primera!</div>
          ) : filteredLocations.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No se encontraron ubicaciones para "{searchTerm}".</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Edificio</TableHead>
                    <TableHead>Planta</TableHead>
                    <TableHead>Servicio</TableHead>
                    <TableHead>Ubicación Interna</TableHead>
                    <TableHead>Estaciones Asignadas</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLocations.map((location) => (
                    <TableRow key={location.id}>
                      <TableCell className="font-medium">{location.edificio}</TableCell>
                      <TableCell>{location.planta}</TableCell>
                      <TableCell>{location.servicio}</TableCell>
                      <TableCell>{location.ubicacion_interna || "N/A"}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{location.estaciones_asignadas}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => openEditDialog(location)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => openDeleteDialog(location)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      <AddLocationDialog open={showAddDialog} onOpenChange={setShowAddDialog} onAdd={handleAddLocation} />
      <AddDirectionDialog open={showDirectionDialog} onOpenChange={setShowDirectionDialog} />
      {selectedLocation && (
        <EditLocationDialog
          open={showEditDialog}
          onOpenChange={(open) => {
            setShowEditDialog(open)
            if (!open) setSelectedLocation(null)
          }}
          location={selectedLocation}
          onEdit={handleEditLocation}
        />
      )}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente la ubicación{" "}
              <span className="font-semibold">
                {locationToDelete?.edificio} - {locationToDelete?.planta} - {locationToDelete?.servicio}
              </span>{" "}
              de nuestros servidores.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setLocationToDelete(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteLocation} className="bg-red-500 hover:bg-red-600">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
