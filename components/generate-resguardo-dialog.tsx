"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { FileText, Download } from "lucide-react"
import { Input } from "@/components/ui/input"

interface GenerateResguardoDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  station: any
  onResguardoGenerated: (resguardo: any) => void
}

const tiposResguardo = [
  { value: "asignacion-inicial", label: "Asignación Inicial" },
  { value: "cambio-ubicacion", label: "Cambio de Ubicación" },
  { value: "cambio-responsable", label: "Cambio de Responsable" },
  { value: "sustitucion-principal", label: "Sustitución de Equipo Principal" },
  { value: "sustitucion-secundario", label: "Sustitución de Equipo Secundario" },
  { value: "mantenimiento", label: "Mantenimiento" },
  { value: "baja-temporal", label: "Baja Temporal" },
  { value: "baja-definitiva", label: "Baja Definitiva" },
  { value: "reactivacion", label: "Reactivación" },
]

export function GenerateResguardoDialog({
  open,
  onOpenChange,
  station,
  onResguardoGenerated,
}: GenerateResguardoDialogProps) {
  const [tipoResguardo, setTipoResguardo] = useState("")
  const [observaciones, setObservaciones] = useState("")
  const [nuevoResponsable, setNuevoResponsable] = useState("")
  const [nuevaUbicacion, setNuevaUbicacion] = useState("")
  const [equipoSustitucion, setEquipoSustitucion] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [fechaResguardo, setFechaResguardo] = useState(new Date().toISOString().split("T")[0])

  if (!station) return null

  const generateFolio = () => {
    const year = new Date().getFullYear()
    const month = String(new Date().getMonth() + 1).padStart(2, "0")
    const day = String(new Date().getDate()).padStart(2, "0")
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0")
    return `RG-${year}${month}${day}-${random}`
  }

  const generateWordDocument = (resguardoData: any) => {
    // Usar resguardoData.fecha en lugar de fecha actual
    const docContent = `
RESGUARDO DE EQUIPO DE CÓMPUTO
Hospital General - Sistema HelpDesk

FOLIO: ${resguardoData.folio}
FECHA: ${resguardoData.fecha}
TIPO: ${resguardoData.tipoLabel}

INFORMACIÓN DE LA ESTACIÓN:
- ID Estación: #${station.id}
- Equipo Principal: ${station.equipoPrincipal || station.nombreEquipo}
- Equipo Secundario: ${station.equipoSecundario || "N/A"}
- Ubicación: ${station.edificio} - ${station.planta} - ${station.servicio} - ${station.ubicacionInterna}

RESPONSABLE:
Nombre: ${station.responsable}
Cargo: Responsable de Equipo

AUTORIZA:
Nombre: Juan Pérez López
Cargo: Administrador del Sistema

OBSERVACIONES:
${resguardoData.observaciones}

FIRMAS:
_____________________     _____________________
Responsable               Autoriza
${station.responsable}    Juan Pérez López

Fecha: _______________    Fecha: _______________
`

    // Crear blob y descargar
    const blob = new Blob([docContent], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `Resguardo_${resguardoData.folio}.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleGenerate = async () => {
    if (!tipoResguardo) return

    setIsGenerating(true)

    // Simular proceso de generación
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const folio = generateFolio()
    const fecha = new Date(fechaResguardo).toLocaleDateString("es-MX")
    const tipoLabel = tiposResguardo.find((t) => t.value === tipoResguardo)?.label || ""

    const nuevoResguardo = {
      folio,
      tipo: tipoLabel,
      fecha,
      estado: "Generado",
      detalles: observaciones || "Resguardo generado automáticamente",
      documentoGenerado: true,
      documentoFirmado: false,
    }

    // Generar documento Word
    generateWordDocument({
      folio,
      fecha,
      tipoLabel,
      observaciones,
    })

    // Llamar callback para actualizar la lista
    onResguardoGenerated(nuevoResguardo)

    setIsGenerating(false)
    onOpenChange(false)

    // Reset form
    setTipoResguardo("")
    setObservaciones("")
    setNuevoResponsable("")
    setNuevaUbicacion("")
    setEquipoSustitucion("")
    setFechaResguardo(new Date().toISOString().split("T")[0])
  }

  const renderAdditionalFields = () => {
    switch (tipoResguardo) {
      case "cambio-responsable":
        return (
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Nuevo Responsable</Label>
            <Select value={nuevoResponsable} onValueChange={setNuevoResponsable}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Seleccionar nuevo responsable..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dr-garcia">Dr. García</SelectItem>
                <SelectItem value="dra-lopez">Dra. López</SelectItem>
                <SelectItem value="enf-martinez">Enf. Martínez</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )
      case "cambio-ubicacion":
        return (
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Nueva Ubicación</Label>
            <Select value={nuevaUbicacion} onValueChange={setNuevaUbicacion}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Seleccionar nueva ubicación..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="a1-p2-urgencias">A1 - Piso 2 - Urgencias</SelectItem>
                <SelectItem value="b1-pb-farmacia">B1 - Planta Baja - Farmacia</SelectItem>
                <SelectItem value="c2-p3-cardiologia">C2 - Piso 3 - Cardiología</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )
      case "sustitucion-principal":
      case "sustitucion-secundario":
        return (
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Equipo de Sustitución</Label>
            <Select value={equipoSustitucion} onValueChange={setEquipoSustitucion}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Seleccionar equipo de reemplazo..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hp-prodesk-new">HP ProDesk 400 G10 - SN789456</SelectItem>
                <SelectItem value="dell-optiplex-new">Dell OptiPlex 3100 - SN456789</SelectItem>
                <SelectItem value="monitor-hp-new">Monitor HP 24" - SN123789</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Generar Nuevo Resguardo
          </DialogTitle>
          <DialogDescription>Crear un nuevo resguardo para la Estación #{station.id}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Información de la Estación */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Información de la Estación</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">ID Estación:</span> #{station.id}
                </div>
                <div>
                  <span className="font-medium">Responsable Actual:</span> {station.responsable}
                </div>
                <div>
                  <span className="font-medium">Ubicación:</span> {station.edificio} - {station.planta}
                </div>
                <div>
                  <span className="font-medium">Servicio:</span> {station.servicio}
                </div>
                <div className="col-span-2">
                  <span className="font-medium">Equipo Principal:</span>{" "}
                  {station.equipoPrincipal || station.nombreEquipo}
                </div>
                {station.equipoSecundario && station.equipoSecundario !== "-" && (
                  <div className="col-span-2">
                    <span className="font-medium">Equipo Secundario:</span> {station.equipoSecundario}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Formulario de Resguardo */}
          <div className="space-y-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Tipo de Resguardo *</Label>
              <Select value={tipoResguardo} onValueChange={setTipoResguardo}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Seleccionar tipo de resguardo..." />
                </SelectTrigger>
                <SelectContent>
                  {tiposResguardo.map((tipo) => (
                    <SelectItem key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Fecha del Resguardo *</Label>
              <Input
                type="date"
                value={fechaResguardo}
                onChange={(e) => setFechaResguardo(e.target.value)}
                className="col-span-3"
                max={new Date().toISOString().split("T")[0]}
              />
            </div>

            {renderAdditionalFields()}

            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right pt-2">Observaciones</Label>
              <Textarea
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                placeholder="Detalles adicionales del resguardo..."
                className="col-span-3"
                rows={3}
              />
            </div>
          </div>

          <Separator />

          {/* Información de Firmas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Información de Firmas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-2">Responsable</h4>
                  <div className="space-y-1 text-sm">
                    <div>
                      <span className="font-medium">Nombre:</span> {station.responsable}
                    </div>
                    <div>
                      <span className="font-medium">Cargo:</span> Responsable de Equipo
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Autoriza</h4>
                  <div className="space-y-1 text-sm">
                    <div>
                      <span className="font-medium">Nombre:</span> Juan Pérez López
                    </div>
                    <div>
                      <span className="font-medium">Cargo:</span> Administrador del Sistema
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {tipoResguardo && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-800">Vista Previa del Resguardo</span>
              </div>
              <div className="text-sm text-blue-700">
                <div>
                  <strong>Tipo:</strong> {tiposResguardo.find((t) => t.value === tipoResguardo)?.label}
                </div>
                <div>
                  <strong>Folio:</strong> {generateFolio()}
                </div>
                <div>
                  <strong>Fecha:</strong> {new Date(fechaResguardo).toLocaleDateString("es-MX")}
                </div>
                <div>
                  <strong>Estado:</strong> <Badge variant="secondary">Por Firmar</Badge>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleGenerate} disabled={!tipoResguardo || isGenerating} className="gap-2">
            {isGenerating ? (
              <>Generando...</>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Generar Resguardo
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
