"use client"

import type React from "react"

import { useEffect, useState } from "react"
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

interface EditLocationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  location: Location | null
  onEdit: (location: Omit<Location, "estaciones_asignadas" | "created_at" | "updated_at">) => void
}

export function EditLocationDialog({ open, onOpenChange, location, onEdit }: EditLocationDialogProps) {
  const [edificio, setEdificio] = useState("")
  const [planta, setPlanta] = useState("")
  const [servicio, setServicio] = useState("")
  const [ubicacionInterna, setUbicacionInterna] = useState("")

  useEffect(() => {
    if (location) {
      setEdificio(location.edificio)
      setPlanta(location.planta)
      setServicio(location.servicio)
      setUbicacionInterna(location.ubicacion_interna || "")
    }
  }, [location])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!edificio.trim() || !planta.trim() || !servicio.trim()) {
      alert("Edificio, Planta y Servicio son campos obligatorios.")
      return
    }
    if (location) {
      onEdit({
        id: location.id,
        edificio: edificio.trim(),
        planta: planta.trim(),
        servicio: servicio.trim(),
        ubicacion_interna: ubicacionInterna.trim() || null,
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Ubicación</DialogTitle>
          <DialogDescription>Modifica la información de la ubicación en el hospital.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edificio" className="text-right">
                Edificio
              </Label>
              <Select value={edificio} onValueChange={setEdificio}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Seleccionar edificio" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A1">A1</SelectItem>
                  <SelectItem value="A2">A2</SelectItem>
                  <SelectItem value="B1">B1</SelectItem>
                  <SelectItem value="B2">B2</SelectItem>
                  <SelectItem value="C1">C1</SelectItem>
                  <SelectItem value="C2">C2</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="planta" className="text-right">
                Planta
              </Label>
              <Select value={planta} onValueChange={setPlanta}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Seleccionar planta" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Planta Baja">Planta Baja</SelectItem>
                  <SelectItem value="Piso 1">Piso 1</SelectItem>
                  <SelectItem value="Piso 2">Piso 2</SelectItem>
                  <SelectItem value="Piso 3">Piso 3</SelectItem>
                  <SelectItem value="Piso 4">Piso 4</SelectItem>
                  <SelectItem value="Sótano">Sótano</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="servicio" className="text-right">
                Servicio
              </Label>
              <Select value={servicio} onValueChange={setServicio}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Seleccionar servicio" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Telecomunicaciones">Telecomunicaciones</SelectItem>
                  <SelectItem value="Urgencias">Urgencias</SelectItem>
                  <SelectItem value="Consulta Externa">Consulta Externa</SelectItem>
                  <SelectItem value="Hospitalización">Hospitalización</SelectItem>
                  <SelectItem value="Cirugía">Cirugía</SelectItem>
                  <SelectItem value="Laboratorio">Laboratorio</SelectItem>
                  <SelectItem value="Radiología">Radiología</SelectItem>
                  <SelectItem value="Farmacia">Farmacia</SelectItem>
                  <SelectItem value="Administración">Administración</SelectItem>
                  <SelectItem value="R.H.H.H.">R.H.H.H.</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="ubicacionInterna" className="text-right">
                Ubicación Interna
              </Label>
              <Input
                id="ubicacionInterna"
                value={ubicacionInterna}
                onChange={(e) => setUbicacionInterna(e.target.value)}
                className="col-span-3"
                placeholder="Cubículo 5, Sala de Espera..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">Guardar Cambios</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
