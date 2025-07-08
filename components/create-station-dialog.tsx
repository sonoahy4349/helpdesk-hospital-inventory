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
  const [equipment, setEquipment] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [locationsRes, responsiblesRes, equipmentRes] = await Promise.all([
          fetch("/api/locations"),
          fetch("/api/responsibles"),
          fetch("/api/equipment"),
        ])

        const locationsData = await locationsRes.json()
        const responsiblesData = await responsiblesRes.json()
        const equipmentData = await equipmentRes.json()

        setLocations(locationsData)
        setResponsibles(responsiblesData)
        setEquipment(equipmentData)
      } catch (error) {
        console.error("Error fetching dialog data:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los datos necesarios para el formulario.",
          variant: "destructive",
        })
      }
    }
    if (open) {
      fetchData()
      resetForm()
    }
  }, [open])

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
    setFormData((prev: any) => ({ ...prev, [id]: value }))
  }

  const handleCheckboxChange = (id: string, checked: boolean) => {
    setAccessories((prev: any) => ({ ...prev, [id]: checked }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
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

  const renderFormFields = () => {
    switch (stationType) {
      case "cpu-monitor":
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
                    <SelectValue placeholder="Selecciona CPU" />
                  </SelectTrigger>
                  <SelectContent>
                    {equipment
                      .filter((e: any) => e.tipo_equipo === "CPU")
                      .map((e: any) => (
                        <SelectItem key={e.id} value={e.id.toString()}>
                          {e.marca} {e.modelo} ({e.numero_serie})
                        </SelectItem>
                      ))}
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
                    <SelectValue placeholder="Selecciona Monitor" />
                  </SelectTrigger>
                  <SelectContent>
                    {equipment
                      .filter((e: any) => e.tipo_equipo === "Monitor")
                      .map((e: any) => (
                        <SelectItem key={e.id} value={e.id.toString()}>
                          {e.marca} {e.modelo} ({e.numero_serie})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
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
                  {equipment
                    .filter((e: any) => e.tipo_equipo !== "CPU" && e.tipo_equipo !== "Monitor")
                    .map((e: any) => (
                      <SelectItem key={e.id} value={e.id.toString()}>
                        {e.tipo_equipo} {e.marca} {e.modelo} ({e.numero_serie})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </>
        )
      case "laptop":
        return (
          <div className="space-y-2">
            <Label htmlFor="equipoPrincipal">Laptop</Label>
            <Select
              onValueChange={(value) => handleSelectChange("equipoPrincipal", value)}
              value={formData.equipoPrincipal || ""}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona Laptop" />
              </SelectTrigger>
              <SelectContent>
                {equipment
                  .filter((e: any) => e.tipo_equipo === "Laptop")
                  .map((e: any) => (
                    <SelectItem key={e.id} value={e.id.toString()}>
                      {e.marca} {e.modelo} ({e.numero_serie})
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        )
      case "impresora":
        return (
          <div className="space-y-2">
            <Label htmlFor="equipoPrincipal">Impresora</Label>
            <Select
              onValueChange={(value) => handleSelectChange("equipoPrincipal", value)}
              value={formData.equipoPrincipal || ""}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona Impresora" />
              </SelectTrigger>
              <SelectContent>
                {equipment
                  .filter((e: any) => e.tipo_equipo === "Impresora")
                  .map((e: any) => (
                    <SelectItem key={e.id} value={e.id.toString()}>
                      {e.marca} {e.modelo} ({e.numero_serie})
                    </SelectItem>
                  ))}
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
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Nueva Estación</DialogTitle>
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
                {locations.map((loc: any) => (
                  <SelectItem key={loc.id} value={loc.id.toString()}>
                    {loc.edificio} - {loc.planta} - {loc.servicio} ({loc.ubicacion_interna})
                  </SelectItem>
                ))}
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
                {responsibles.map((resp: any) => (
                  <SelectItem key={resp.id} value={resp.id.toString()}>
                    {resp.nombre} {resp.apellido}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="direccion">Dirección</Label>
            <Input
              id="direccion"
              value={formData.direccion || ""}
              onChange={handleChange}
              placeholder="Dirección de la estación"
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

          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? "Creando..." : "Crear Estación"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
