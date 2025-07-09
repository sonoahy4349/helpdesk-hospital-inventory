"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"

interface CreateStationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onStationCreated: () => void
}

export function CreateStationDialog({ open, onOpenChange, onStationCreated }: CreateStationDialogProps) {
  const [stationType, setStationType] = useState("cpu-monitor")
  const [formData, setFormData] = useState<any>({})
  const [accessories, setAccessories] = useState<any>({
    mouse: false,
    teclado: false,
    webcam: false,
    audifonos: false,
    regulador: false,
    noBreak: false,
  })
  const [locations, setLocations] = useState<any[]>([])
  const [responsibles, setResponsibles] = useState<any[]>([])
  const [availableEquipment, setAvailableEquipment] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(false)
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const { toast } = useToast()

  // Cargar datos iniciales cuando se abre el dialog
  useEffect(() => {
    const fetchInitialData = async () => {
      if (!open) return;
      
      try {
        setLoadingData(true)
        console.log('Loading initial data...')
        
        const [locationsRes, responsiblesRes] = await Promise.all([
          fetch("/api/locations"),
          fetch("/api/responsibles"),
        ])

        const locationsData = await locationsRes.json()
        const responsiblesData = await responsiblesRes.json()

        console.log('Locations loaded:', locationsData?.length)
        console.log('Responsibles loaded:', responsiblesData?.length)

        setLocations(locationsData || [])
        setResponsibles(responsiblesData || [])
        
        // Cargar equipos disponibles
        await fetchAvailableEquipment()
      } catch (error) {
        console.error("Error fetching dialog data:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los datos necesarios para el formulario.",
          variant: "destructive",
        })
      } finally {
        setLoadingData(false)
      }
    }
    
    if (open) {
      fetchInitialData()
      resetForm()
    }
  }, [open])

  // Cargar equipos disponibles cuando cambia el tipo de estación
  useEffect(() => {
    if (open && stationType) {
      fetchAvailableEquipment()
      // Limpiar selecciones de equipos cuando cambia el tipo
      setFormData(prev => ({
        ...prev,
        equipoPrincipal: "",
        equipoSecundario: "",
        equipoTercero: ""
      }))
    }
  }, [stationType, open])

  const fetchAvailableEquipment = async () => {
    try {
      console.log(`Fetching equipment for station type: ${stationType}`)
      
      const response = await fetch(`/api/equipment/available?stationType=${stationType}`)
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      console.log("Available equipment response:", data)
      
      setAvailableEquipment(data.equipment || [])
      setDebugInfo(data.debug)
      
      if (data.equipment?.length === 0) {
        toast({
          title: "Información",
          description: "No hay equipos disponibles para este tipo de estación.",
        })
      }
    } catch (error) {
      console.error("Error fetching available equipment:", error)
      toast({
        title: "Error",
        description: `No se pudieron cargar los equipos disponibles: ${error}`,
        variant: "destructive",
      })
      setAvailableEquipment([])
    }
  }

  const resetForm = () => {
    setStationType("cpu-monitor")
    setFormData({})
    setAccessories({
      mouse: false,
      teclado: false,
      webcam: false,
      audifonos: false,
      regulador: false,
      noBreak: false,
    })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setFormData((prev: any) => ({ ...prev, [id]: value }))
  }

  const handleSelectChange = (id: string, value: string) => {
    console.log(`Select changed: ${id} = ${value}`)
    // Si el valor es "none", guardamos como vacío
    const finalValue = value === "none" ? "" : value
    setFormData((prev: any) => ({ ...prev, [id]: finalValue }))
  }

  const handleCheckboxChange = (id: string, checked: boolean) => {
    setAccessories((prev: any) => ({ ...prev, [id]: checked }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      console.log("Submitting station data:", { stationType, formData, accessories })
      
      const response = await fetch("/api/stations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ stationType, formData, accessories }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error al crear estación")
      }

      toast({
        title: "Éxito",
        description: "Estación creada correctamente.",
      })
      onStationCreated()
      onOpenChange(false)
    } catch (error: any) {
      console.error("Failed to create station:", error)
      toast({
        title: "Error",
        description: error.message || "No se pudo crear la estación.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Filtrar equipos por tipo para cada campo
  const getEquipmentByType = (equipmentType: string) => {
    const filtered = availableEquipment.filter((e: any) => e.tipo === equipmentType)
    console.log(`Equipment filtered for type ${equipmentType}:`, filtered.length)
    return filtered
  }

  const renderFormFields = () => {
    if (loadingData) {
      return (
        <div className="flex items-center justify-center py-8">
          <div className="text-sm text-muted-foreground">Cargando equipos disponibles...</div>
        </div>
      )
    }

    // Debug info
    if (debugInfo) {
      console.log('Debug info:', debugInfo)
    }

    switch (stationType) {
      case "cpu-monitor":
        const cpuEquipment = getEquipmentByType("CPU")
        const monitorEquipment = getEquipmentByType("MONITOR")
        const otherEquipment = availableEquipment.filter(e => !["CPU", "MONITOR"].includes(e.tipo))
        
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="equipoPrincipal">Equipo Principal (CPU)</Label>
                <Select
                  onValueChange={(value) => handleSelectChange("equipoPrincipal", value)}
                  value={formData.equipoPrincipal || ""}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={`Selecciona CPU (${cpuEquipment.length} disponibles)`} />
                  </SelectTrigger>
                  <SelectContent>
                    {cpuEquipment.length > 0 ? (
                      cpuEquipment.map((e: any) => (
                        <SelectItem key={e.id} value={e.id}>
                          {e.marca} {e.modelo} ({e.numero_serie})
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-cpu" disabled>
                        No hay CPUs disponibles
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="equipoSecundario">Equipo Secundario (Monitor)</Label>
                <Select
                  onValueChange={(value) => handleSelectChange("equipoSecundario", value)}
                  value={formData.equipoSecundario || ""}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={`Selecciona Monitor (${monitorEquipment.length} disponibles)`} />
                  </SelectTrigger>
                  <SelectContent>
                    {monitorEquipment.length > 0 ? (
                      monitorEquipment.map((e: any) => (
                        <SelectItem key={e.id} value={e.id}>
                          {e.marca} {e.modelo} ({e.numero_serie})
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-monitor" disabled>
                        No hay Monitores disponibles
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {otherEquipment.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="equipoTercero">Equipo Adicional (Opcional)</Label>
                <Select
                  onValueChange={(value) => handleSelectChange("equipoTercero", value)}
                  value={formData.equipoTercero || ""}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona equipo adicional" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sin equipo adicional</SelectItem>
                    {otherEquipment.map((e: any) => (
                      <SelectItem key={e.id} value={e.id}>
                        {e.tipo} {e.marca} {e.modelo} ({e.numero_serie})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </>
        )
      case "laptop":
        const laptopEquipment = getEquipmentByType("LAPTOP")
        
        return (
          <div className="space-y-2">
            <Label htmlFor="equipoPrincipal">Laptop</Label>
            <Select
              onValueChange={(value) => handleSelectChange("equipoPrincipal", value)}
              value={formData.equipoPrincipal || ""}
            >
              <SelectTrigger>
                <SelectValue placeholder={`Selecciona Laptop (${laptopEquipment.length} disponibles)`} />
              </SelectTrigger>
              <SelectContent>
                {laptopEquipment.length > 0 ? (
                  laptopEquipment.map((e: any) => (
                    <SelectItem key={e.id} value={e.id}>
                      {e.marca} {e.modelo} ({e.numero_serie})
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-laptop" disabled>
                    No hay Laptops disponibles
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
        )
      case "impresora":
        const printerEquipment = getEquipmentByType("IMPRESORA")
        
        return (
          <div className="space-y-2">
            <Label htmlFor="equipoPrincipal">Impresora</Label>
            <Select
              onValueChange={(value) => handleSelectChange("equipoPrincipal", value)}
              value={formData.equipoPrincipal || ""}
            >
              <SelectTrigger>
                <SelectValue placeholder={`Selecciona Impresora (${printerEquipment.length} disponibles)`} />
              </SelectTrigger>
              <SelectContent>
                {printerEquipment.length > 0 ? (
                  printerEquipment.map((e: any) => (
                    <SelectItem key={e.id} value={e.id}>
                      {e.marca} {e.modelo} ({e.numero_serie})
                      {e.perfil && ` - ${e.perfil}`}
                      {e.tipo_impresora && ` (${e.tipo_impresora})`}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-printer" disabled>
                    No hay Impresoras disponibles
                  </SelectItem>
                )}
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
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nueva Estación</DialogTitle>
          {debugInfo && (
            <div className="text-xs text-gray-500 mt-2">
              Debug: {debugInfo.finalAvailable} equipos disponibles de {debugInfo.totalEquipment} totales
            </div>
          )}
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="stationType">Tipo de Estación</Label>
            <Select onValueChange={setStationType} value={stationType}>
              <SelectTrigger id="stationType">
                <SelectValue placeholder="Selecciona tipo de estación" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cpu-monitor">CPU + Monitor</SelectItem>
                <SelectItem value="laptop">Laptop</SelectItem>
                <SelectItem value="impresora">Impresora</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {renderFormFields()}

          <div className="space-y-2">
            <Label htmlFor="ubicacion">Ubicación</Label>
            <Select onValueChange={(value) => handleSelectChange("ubicacion", value)} value={formData.ubicacion || ""}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona ubicación" />
              </SelectTrigger>
              <SelectContent>
                {locations.length > 0 ? locations.map((loc: any) => (
                  <SelectItem key={loc.id} value={loc.id}>
                    {loc.edificio} - {loc.planta} - {loc.servicio}
                    {loc.ubicacion_interna && ` (${loc.ubicacion_interna})`}
                  </SelectItem>
                )) : (
                  <SelectItem value="no-location" disabled>No hay ubicaciones disponibles</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="responsable">Responsable</Label>
            <Select
              onValueChange={(value) => handleSelectChange("responsable", value)}
              value={formData.responsable || ""}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona responsable" />
              </SelectTrigger>
              <SelectContent>
                {responsibles.length > 0 ? responsibles.map((resp: any) => (
                  <SelectItem key={resp.id} value={resp.id}>
                    {resp.nombre_completo}
                    {resp.cargo && ` - ${resp.cargo}`}
                  </SelectItem>
                )) : (
                  <SelectItem value="no-responsible" disabled>No hay responsables disponibles</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="direccion">Dirección</Label>
            <Input
              id="direccion"
              value={formData.direccion || ""}
              onChange={handleChange}
              placeholder="Ej: DO, DG, etc."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="autorizacion">Autorizado por</Label>
            <Input
              id="autorizacion"
              value={formData.autorizacion || ""}
              onChange={handleChange}
              placeholder="Nombre de quien autoriza"
            />
          </div>

          {/* Mostrar accesorios solo para laptops */}
          {stationType === "laptop" && (
            <div className="space-y-4">
              <Label>Accesorios Incluidos</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="mouse"
                    checked={accessories.mouse}
                    onCheckedChange={(checked: boolean) => handleCheckboxChange("mouse", checked)}
                  />
                  <Label htmlFor="mouse">Mouse</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="teclado"
                    checked={accessories.teclado}
                    onCheckedChange={(checked: boolean) => handleCheckboxChange("teclado", checked)}
                  />
                  <Label htmlFor="teclado">Teclado</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="webcam"
                    checked={accessories.webcam}
                    onCheckedChange={(checked: boolean) => handleCheckboxChange("webcam", checked)}
                  />
                  <Label htmlFor="webcam">Webcam</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="audifonos"
                    checked={accessories.audifonos}
                    onCheckedChange={(checked: boolean) => handleCheckboxChange("audifonos", checked)}
                  />
                  <Label htmlFor="audifonos">Audífonos</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="regulador"
                    checked={accessories.regulador}
                    onCheckedChange={(checked: boolean) => handleCheckboxChange("regulador", checked)}
                  />
                  <Label htmlFor="regulador">Regulador</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="noBreak"
                    checked={accessories.noBreak}
                    onCheckedChange={(checked: boolean) => handleCheckboxChange("noBreak", checked)}
                  />
                  <Label htmlFor="noBreak">No Break</Label>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || loadingData}>
              {loading ? "Creando..." : "Crear Estación"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}