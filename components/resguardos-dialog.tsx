"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Eye, Download, Printer, Plus, Upload, X, FileText, CheckCircle } from "lucide-react"
import { GenerateResguardoDialog } from "@/components/generate-resguardo-dialog"

interface ResguardosDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  station: any
}

export function ResguardosDialog({ open, onOpenChange, station }: ResguardosDialogProps) {
  const [resguardosData, setResguardosData] = useState([
    {
      folio: "RG-2024-001",
      tipo: "Asignación Inicial",
      fecha: "2024-01-15",
      estado: "Firmado",
      detalles: "Documento inicial de asignación",
      documentoGenerado: true,
      documentoFirmado: true,
    },
  ])

  const [showGenerateDialog, setShowGenerateDialog] = useState(false)

  if (!station) return null

  const handleResguardoGenerated = (nuevoResguardo: any) => {
    setResguardosData([...resguardosData, nuevoResguardo])
  }

  const handleDownloadDocument = (folio: string) => {
    // Simular descarga del documento generado
    console.log(`Descargando documento: ${folio}`)
    // Aquí iría la lógica real de descarga
  }

  const handleUploadSigned = (folio: string) => {
    // Simular subida de documento firmado
    const input = document.createElement("input")
    input.type = "file"
    input.accept = ".pdf,.doc,.docx"
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        console.log(`Subiendo documento firmado para: ${folio}`, file.name)
        // Actualizar estado del resguardo
        setResguardosData((prev) =>
          prev.map((r) => (r.folio === folio ? { ...r, estado: "Firmado", documentoFirmado: true } : r)),
        )
      }
    }
    input.click()
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[1000px] max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-xl">Resguardos de la Estación #{station.id}</DialogTitle>
                <DialogDescription className="mt-1">Historial completo de resguardos y documentos</DialogDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto space-y-4">
            {/* Información de la estación */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
              <div>
                <span className="font-medium">Responsable:</span> {station.responsable}
              </div>
              <div>
                <span className="font-medium">Ubicación:</span> {station.edificio} - {station.servicio}
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex gap-2 justify-end border-b pb-4">
              <Button variant="default" size="sm" onClick={() => setShowGenerateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Generar Resguardo
              </Button>
              <Button variant="outline" size="sm">
                <Printer className="h-4 w-4 mr-2" />
                Imprimir Lista
              </Button>
            </div>

            {/* Contenido principal */}
            {resguardosData.length > 0 ? (
              <div className="border rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[120px]">Folio</TableHead>
                        <TableHead className="w-[150px]">Tipo</TableHead>
                        <TableHead className="w-[100px]">Fecha</TableHead>
                        <TableHead className="w-[100px]">Estado</TableHead>
                        <TableHead className="min-w-[200px]">Detalles</TableHead>
                        <TableHead className="w-[140px]">Documento</TableHead>
                        <TableHead className="w-[160px]">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {resguardosData.map((resguardo) => (
                        <TableRow key={resguardo.folio}>
                          <TableCell className="font-medium font-mono text-sm">{resguardo.folio}</TableCell>
                          <TableCell className="font-medium">{resguardo.tipo}</TableCell>
                          <TableCell>{resguardo.fecha}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                resguardo.estado === "Firmado"
                                  ? "default"
                                  : resguardo.estado === "Generado"
                                    ? "secondary"
                                    : "destructive"
                              }
                              className="text-xs"
                            >
                              {resguardo.estado}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="max-w-[200px] truncate" title={resguardo.detalles}>
                              {resguardo.detalles}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              {resguardo.documentoGenerado && (
                                <Badge variant="outline" className="text-xs w-fit">
                                  <FileText className="h-3 w-3 mr-1" />
                                  Generado
                                </Badge>
                              )}
                              {resguardo.documentoFirmado && (
                                <Badge variant="default" className="text-xs w-fit">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Firmado
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1 flex-wrap">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDownloadDocument(resguardo.folio)}
                                disabled={!resguardo.documentoGenerado}
                                title="Descargar documento"
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleUploadSigned(resguardo.folio)}
                                disabled={!resguardo.documentoGenerado || resguardo.documentoFirmado}
                                title="Subir documento firmado"
                              >
                                <Upload className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" title="Ver detalles">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" title="Imprimir">
                                <Printer className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">No hay resguardos registrados</h3>
                <p className="text-sm mb-4">Esta estación no tiene resguardos asociados</p>
                <Button variant="outline" onClick={() => setShowGenerateDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Generar Primer Resguardo
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <GenerateResguardoDialog
        open={showGenerateDialog}
        onOpenChange={setShowGenerateDialog}
        station={station}
        onResguardoGenerated={handleResguardoGenerated}
      />
    </>
  )
}
