"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Search, Edit, Eye, Trash2, Loader2 } from "lucide-react" // Import Loader2 for loading state
import { AddResponsibleDialog } from "@/components/add-responsible-dialog"
import { EditResponsibleDialog } from "@/components/edit-responsible-dialog"
import { ResponsibleDetailsDialog } from "@/components/responsible-details-dialog"
import { useToast } from "@/hooks/use-toast" // Assuming you have a useToast hook for notifications

export default function ResponsablesPage() {
  const [responsibles, setResponsibles] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [editingResponsible, setEditingResponsible] = useState<any>(null)
  const [selectedResponsible, setSelectedResponsible] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchResponsibles = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/responsibles")
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      setResponsibles(data)
    } catch (err: any) {
      console.error("Failed to fetch responsibles:", err)
      setError("Error al cargar los responsables: " + err.message)
      toast({
        title: "Error",
        description: "No se pudieron cargar los responsables. Intenta de nuevo.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchResponsibles()
  }, [fetchResponsibles])

  const handleResponsibleAdded = () => {
    setShowAddDialog(false)
    fetchResponsibles() // Re-fetch data after adding
    toast({
      title: "Responsable Agregado",
      description: "El nuevo responsable ha sido registrado exitosamente.",
    })
  }

  const handleResponsibleUpdated = () => {
    setShowEditDialog(false)
    fetchResponsibles() // Re-fetch data after updating
    toast({
      title: "Responsable Actualizado",
      description: "La información del responsable ha sido actualizada.",
    })
  }

  const handleDeleteResponsible = async (id: number) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este responsable? Esta acción no se puede deshacer.")) {
      return
    }

    try {
      const response = await fetch(`/api/responsibles/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      toast({
        title: "Responsable Eliminado",
        description: "El responsable ha sido eliminado exitosamente.",
      })
      fetchResponsibles() // Re-fetch data after deleting
    } catch (err: any) {
      console.error("Failed to delete responsible:", err)
      toast({
        title: "Error al eliminar",
        description: "No se pudo eliminar el responsable: " + err.message,
        variant: "destructive",
      })
    }
  }

  const filteredResponsibles = responsibles.filter(
    (item) =>
      item.nombre_completo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.cargo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.email?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleEditResponsible = (responsible: any) => {
    setEditingResponsible(responsible)
    setShowEditDialog(true)
  }

  const handleViewDetails = (responsible: any) => {
    setSelectedResponsible(responsible)
    setShowDetailsDialog(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Responsables</h1>
          <p className="text-muted-foreground">Gestión de responsables del sistema</p>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Agregar Responsable
        </Button>
      </div>

      {/* Barra de búsqueda */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar responsables..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de responsables */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Responsables</CardTitle>
          <CardDescription>
            {loading ? "Cargando..." : `${filteredResponsibles.length} responsables registrados`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-3 text-muted-foreground">Cargando responsables...</span>
            </div>
          ) : error ? (
            <div className="text-center p-8 text-red-500">
              <p>{error}</p>
              <Button onClick={fetchResponsibles} className="mt-4">
                Reintentar
              </Button>
            </div>
          ) : filteredResponsibles.length === 0 ? (
            <div className="text-center p-8 text-muted-foreground">
              <p>No se encontraron responsables.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Nombre Completo</TableHead>
                  <TableHead>Cargo</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>Estación(es) Asignada(s)</TableHead>
                  <TableHead>Fecha Registro</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredResponsibles.map((responsible) => (
                  <TableRow key={responsible.id}>
                    <TableCell className="font-medium">{responsible.id}</TableCell>
                    <TableCell>{responsible.nombre_completo}</TableCell>
                    <TableCell>{responsible.cargo}</TableCell>
                    <TableCell>{responsible.email}</TableCell>
                    <TableCell>{responsible.telefono}</TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap max-w-xs">
                        {/* Placeholder for assigned stations, as this data is not directly in 'responsibles' table */}
                        <Badge variant="secondary" className="text-xs">
                          N/A
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>{new Date(responsible.fecha_registro).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEditResponsible(responsible)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleViewDetails(responsible)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteResponsible(responsible.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <AddResponsibleDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onResponsibleAdded={handleResponsibleAdded}
      />
      <EditResponsibleDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        responsible={editingResponsible}
        onResponsibleUpdated={handleResponsibleUpdated}
      />
      <ResponsibleDetailsDialog
        open={showDetailsDialog}
        onOpenChange={setShowDetailsDialog}
        responsible={selectedResponsible}
      />
    </div>
  )
}
