"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

interface EditEquipmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  equipment: any
  onSuccess: () => void
}

export function EditEquipmentDialog({ open, onOpenChange, equipment, onSuccess }: EditEquipmentDialogProps) {
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    tipo: "",
    perfil: "",
    tipoImpresora: "",
    marca: "",
    modelo: "",
    serie: "",
    estado: "disponible",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (equipment && open) {
      setFormData({
        tipo: equipment.tipo || "",
        perfil: equipment.perfil || "",
        tipoImpresora: equipment.tipo_impresora || "",
        marca: equipment.marca || "",
        modelo: equipment.modelo || "",
        serie: equipment.numero_serie || "",
        estado: equipment.estado || "disponible",
      })
    }
  }, [equipment, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Validaciones adicionales en el frontend antes de enviar
    if (!formData.tipo || !formData.marca || !formData.modelo || !formData.serie || !formData.estado) {
      toast({
        title: "Error de validación",
        description: "Por favor, completa todos los campos obligatorios (Tipo, Marca, Modelo, No. Serie, Estado).",
        variant: "destructive",
      })
      setIsSubmitting(false)
      return
    }

    if (formData.tipo === "impresora") {
      if (!formData.perfil || !formData.tipoImpresora) {
        toast({
          title: "Error de validación",
          description: "Para impresoras, los campos Perfil y Tipo de Impresora son obligatorios.",
          variant: "destructive",
        })
        setIsSubmitting(false)
        return
      }
    }

    const apiData = {
      nombre: equipment.nombre || null,
      tipo: formData.tipo,
      perfil: formData.tipo === "impresora" ? formData.perfil : null,
      tipo_impresora: formData.tipo === "impresora" ? formData.tipoImpresora : null,
      marca: formData.marca,
      modelo: formData.modelo,
      numero_serie: formData.serie,
      estado: formData.estado,
    }

    try {
      const response = await fetch(`/api/equipment/${equipment.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(apiData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      toast({
        title: "Éxito",
        description: "Equipo actualizado correctamente.",
      })
      onSuccess()
      onOpenChange(false)
    } catch (error: any) {
      console.error("Error al actualizar equipo:", error)
      toast({
        title: "Error",
        description: `No se pudo actualizar el equipo: ${error.message}`,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderFormFields = () => {
    if (formData.tipo === "impresora") {
      return (
        <>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="perfil" className="text-right">
              Perfil
            </Label>
            <Select value={formData.perfil} onValueChange={(value) => setFormData({ ...formData, perfil: value })}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Seleccionar perfil" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Multifuncional">Multifuncional</SelectItem>
                <SelectItem value="Etiquetas">Etiquetas</SelectItem>
                <SelectItem value="Documentos">Documentos</SelectItem>
                <SelectItem value="Fotografias">Fotografías</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="tipoImpresora" className="text-right">
              Tipo
            </Label>
            <Select
              value={formData.tipoImpresora}
              onValueChange={(value) => setFormData({ ...formData, tipoImpresora: value })}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Seleccionar tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Láser">Láser</SelectItem>
                <SelectItem value="Inyección de Tinta">Inyección de Tinta</SelectItem>
                <SelectItem value="Térmica">Térmica</SelectItem>
                <SelectItem value="Matriz de Puntos">Matriz de Puntos</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="marca" className="text-right">
              Marca
            </Label>
            <Select value={formData.marca} onValueChange={(value) => setFormData({ ...formData, marca: value })}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Seleccionar marca" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="HP">HP</SelectItem>
                <SelectItem value="Canon">Canon</SelectItem>
                <SelectItem value="Epson">Epson</SelectItem>
                <SelectItem value="Brother">Brother</SelectItem>
                <SelectItem value="Zebra">Zebra</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="modelo" className="text-right">
              Modelo
            </Label>
            <Select value={formData.modelo} onValueChange={(value) => setFormData({ ...formData, modelo: value })}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Seleccionar modelo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LaserJet Pro MFP M428fdw">LaserJet Pro MFP M428fdw</SelectItem>
                <SelectItem value="PIXMA G3010">PIXMA G3010</SelectItem>
                <SelectItem value="ZD420">ZD420</SelectItem>
                <SelectItem value="DCP-L2540DW">DCP-L2540DW</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </>
      )
    } else {
      return (
        <>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="marca" className="text-right">
              Marca
            </Label>
            <Select value={formData.marca} onValueChange={(value) => setFormData({ ...formData, marca: value })}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Seleccionar marca" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="HP">HP</SelectItem>
                <SelectItem value="Dell">Dell</SelectItem>
                <SelectItem value="Lenovo">Lenovo</SelectItem>
                <SelectItem value="ASUS">ASUS</SelectItem>
                <SelectItem value="Acer">Acer</SelectItem>
                <SelectItem value="Logitech">Logitech</SelectItem>
                <SelectItem value="Microsoft">Microsoft</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="modelo" className="text-right">
              Modelo
            </Label>
            <Select value={formData.modelo} onValueChange={(value) => setFormData({ ...formData, modelo: value })}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Seleccionar modelo" />
              </SelectTrigger>
              <SelectContent>
                {formData.tipo === "cpu" && (
                  <>
                    <SelectItem value="ProDesk 400 G9">ProDesk 400 G9</SelectItem>
                    <SelectItem value="OptiPlex 3090">OptiPlex 3090</SelectItem>
                    <SelectItem value="ThinkCentre M75s">ThinkCentre M75s</SelectItem>
                  </>
                )}
                {formData.tipo === "monitor" && (
                  <>
                    <SelectItem value="E24 G5">E24 G5</SelectItem>
                    <SelectItem value="P2422H">P2422H</SelectItem>
                    <SelectItem value="ThinkVision T24i">ThinkVision T24i</SelectItem>
                  </>
                )}
                {formData.tipo === "laptop" && (
                  <>
                    <SelectItem value="EliteBook 840 G8">EliteBook 840 G8</SelectItem>
                    <SelectItem value="Latitude 5520">Latitude 5520</SelectItem>
                    <SelectItem value="ThinkPad E15">ThinkPad E15</SelectItem>
                  </>
                )}
                {formData.tipo === "teclado" && (
                  <>
                    <SelectItem value="K120">K120</SelectItem>
                    <SelectItem value="MK270">MK270</SelectItem>
                    <SelectItem value="Ergonomic Keyboard">Ergonomic Keyboard</SelectItem>
                  </>
                )}
                {formData.tipo === "mouse" && (
                  <>
                    <SelectItem value="M185">M185</SelectItem>
                    <SelectItem value="M90">M90</SelectItem>
                    <SelectItem value="Wireless Mobile Mouse 1850">Wireless Mobile Mouse 1850</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>
        </>
      )
    }
  }

  if (!equipment) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Equipo #{equipment.id}</DialogTitle>
          <DialogDescription>Modifica la información del equipo en el inventario.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="tipo" className="text-right">
                Tipo
              </Label>
              <Select value={formData.tipo} onValueChange={(value) => setFormData({ ...formData, tipo: value })}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cpu">CPU</SelectItem>
                  <SelectItem value="monitor">Monitor</SelectItem>
                  <SelectItem value="laptop">Laptop</SelectItem>
                  <SelectItem value="impresora">Impresora</SelectItem>
                  <SelectItem value="teclado">Teclado</SelectItem>
                  <SelectItem value="mouse">Mouse</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {renderFormFields()}

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="serie" className="text-right">
                No. Serie
              </Label>
              <Input
                id="serie"
                value={formData.serie}
                onChange={(e) => setFormData({ ...formData, serie: e.target.value })}
                className="col-span-3"
                placeholder="Número de serie único"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="estado" className="text-right">
                Estado
              </Label>
              <Select value={formData.estado} onValueChange={(value) => setFormData({ ...formData, estado: value })}>
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="disponible">Disponible</SelectItem>
                  <SelectItem value="en-uso">En uso</SelectItem>
                  <SelectItem value="mantenimiento">En mantenimiento</SelectItem>
                  <SelectItem value="dañado">Dañado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
