"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { X, User, Mail, Phone, Calendar, MapPin, Monitor } from "lucide-react"

interface ResponsibleDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  responsible: any
}

// Datos simulados de estaciones asignadas al responsable
const getStationsForResponsible = (responsibleId: number) => {
  const allStations = [
    {
      id: 1,
      tipo: "CPU + Monitor",
      ubicacion: "A1 - Planta Baja - Telecomunicaciones - Cubículo 5",
      equipoPrincipal: "HP ProDesk 400 G9",
      equipoSecundario: 'Monitor HP 24"',
      estado: "Activo",
      fechaAsignacion: "2024-01-15",
    },
    {
      id: 3,
      tipo: "CPU + Monitor",
      ubicacion: "A1 - Piso 1 - R.H.H.H. - Cubículo 3",
      equipoPrincipal: "Dell OptiPlex 3090",
      equipoSecundario: 'Monitor Dell 22"',
      estado: "Activo",
      fechaAsignacion: "2024-01-20",
    },
    {
      id: 8,
      tipo: "Laptop",
      ubicacion: "B2 - Piso 2 - Urgencias - Consultorio 1",
      equipoPrincipal: "HP EliteBook 840",
      equipoSecundario: "-",
      estado: "Activo",
      fechaAsignacion: "2024-02-01",
    },
    {
      id: 12,
      tipo: "Impresora",
      ubicacion: "A1 - Planta Baja - Telecomunicaciones - Área común",
      equipoPrincipal: "HP LaserJet Pro MFP",
      equipoSecundario: "-",
      estado: "Activo",
      fechaAsignacion: "2024-02-05",
    },
    {
      id: 15,
      tipo: "CPU + Monitor",
      ubicacion: "C1 - Piso 3 - Cardiología - Sala de Juntas",
      equipoPrincipal: "Lenovo ThinkCentre",
      equipoSecundario: 'Monitor Lenovo 24"',
      estado: "Mantenimiento",
      fechaAsignacion: "2024-02-10",
    },
    {
      id: 18,
      tipo: "Laptop",
      ubicacion: "A2 - Piso 2 - Consulta Externa - Consultorio 5",
      equipoPrincipal: "Dell Latitude 5520",
      equipoSecundario: "-",
      estado: "Activo",
      fechaAsignacion: "2024-02-15",
    },
    {
      id: 21,
      tipo: "CPU + Monitor",
      ubicacion: "B1 - Planta Baja - Farmacia - Mostrador",
      equipoPrincipal: "HP ProDesk 600",
      equipoSecundario: 'Monitor HP 22"',
      estado: "Activo",
      fechaAsignacion: "2024-02-20",
    },
    {
      id: 24,
      tipo: "Impresora",
      ubicacion: "A1 - Piso 1 - Administración - Recepción",
      equipoPrincipal: "Canon PIXMA G3010",
      equipoSecundario: "-",
      estado: "Activo",
      fechaAsignacion: "2024-02-25",
    },
  ]

  // Simular diferentes cantidades de estaciones según el responsable
  // Nota: Aquí se asume que el ID del responsable en la mock data de la página
  // de responsables (1, 2, 3) se corresponde con la lógica de esta función.
  // En un sistema real, esto se manejaría con una relación de base de datos.
  if (responsibleId === 1) {
    // Bryan Mendoza
    return allStations
  } else if (responsibleId === 2) {
    // Vaca Lola
    return allStations.slice(0, 3)
  } else if (responsibleId === 3) {
    // Dr. Juan Pérez
    return allStations.slice(0, 5)
  }
  return []
}

export function ResponsibleDetailsDialog({ open, onOpenChange, responsible }: ResponsibleDetailsDialogProps) {
  if (!responsible) return null

  // Asumiendo que el ID del responsable en la mock data de la página
  // de responsables (1, 2, 3) se corresponde con la lógica de esta función.
  const assignedStations = getStationsForResponsible(responsible.id)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <div>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Detalles del Responsable #{responsible.id}
            </DialogTitle>
            <DialogDescription>Información completa y estaciones asignadas</DialogDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="space-y-6">
          {/* Información Personal */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-4 w-4" />
                Información Personal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Nombre Completo</label>
                    <p className="text-lg font-semibold">{responsible.nombre_completo}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Cargo</label>
                    <p className="text-base">
                      <Badge variant="secondary" className="text-sm">
                        {responsible.cargo}
                      </Badge>
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      Correo Electrónico
                    </label>
                    <p className="text-base">{responsible.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      Teléfono
                    </label>
                    <p className="text-base">{responsible.telefono}</p>
                  </div>
                </div>
              </div>
              <Separator className="my-4" />
              <div>
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Fecha de Registro
                </label>
                <p className="text-base">{new Date(responsible.fecha_registro).toLocaleDateString()}</p>
              </div>
            </CardContent>
          </Card>

          {/* Resumen de Estaciones */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Monitor className="h-4 w-4" />
                Resumen de Estaciones Asignadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{assignedStations.length}</div>
                  <div className="text-sm text-muted-foreground">Total Estaciones</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {assignedStations.filter((s) => s.estado === "Activo").length}
                  </div>
                  <div className="text-sm text-muted-foreground">Activas</div>
                </div>
                <div className="text-center p-3 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">
                    {assignedStations.filter((s) => s.estado === "Mantenimiento").length}
                  </div>
                  <div className="text-sm text-muted-foreground">En Mantenimiento</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-600">
                    {assignedStations.filter((s) => s.tipo === "CPU + Monitor").length}
                  </div>
                  <div className="text-sm text-muted-foreground">CPU + Monitor</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabla de Estaciones Detallada */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Estaciones Asignadas ({assignedStations.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {assignedStations.length > 0 ? (
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID Estación</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Ubicación</TableHead>
                        <TableHead>Equipo Principal</TableHead>
                        <TableHead>Equipo Secundario</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Fecha Asignación</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {assignedStations.map((station) => (
                        <TableRow key={station.id}>
                          <TableCell className="font-medium">#{station.id}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              {station.tipo}
                            </Badge>
                          </TableCell>
                          <TableCell className="max-w-xs">
                            <div className="text-sm">{station.ubicacion}</div>
                          </TableCell>
                          <TableCell>{station.equipoPrincipal}</TableCell>
                          <TableCell>{station.equipoSecundario}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                station.estado === "Activo"
                                  ? "default"
                                  : station.estado === "Mantenimiento"
                                    ? "destructive"
                                    : "secondary"
                              }
                              className="text-xs"
                            >
                              {station.estado}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm">{station.fechaAsignacion}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Monitor className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No hay estaciones asignadas a este responsable</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Información Adicional */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Información Adicional</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <label className="font-medium text-muted-foreground">Última Actividad</label>
                  <p>Hace 2 horas</p>
                </div>
                <div>
                  <label className="font-medium text-muted-foreground">Resguardos Pendientes</label>
                  <p>
                    <Badge variant="destructive" className="text-xs">
                      2 pendientes
                    </Badge>
                  </p>
                </div>
                <div>
                  <label className="font-medium text-muted-foreground">Departamento</label>
                  <p>Tecnologías de la Información</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
