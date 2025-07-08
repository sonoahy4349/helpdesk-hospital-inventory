"use client"

import type React from "react"

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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react" // Import Loader2
import { useToast } from "@/hooks/use-toast" // Assuming useToast is available

interface AddResponsibleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onResponsibleAdded: () => void // Callback to notify parent
}

export function AddResponsibleDialog({ open, onOpenChange, onResponsibleAdded }: AddResponsibleDialogProps) {
  const [formData, setFormData] = useState({
    nombreCompleto: "",
    cargo: "sin-asignar",
    email: "",
    telefono: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/responsibles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nombre_completo: formData.nombreCompleto,
          cargo: formData.cargo,
          email: formData.email,
          telefono: formData.telefono,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      const newResponsible = await response.json()
      console.log("Nuevo responsable creado:", newResponsible)
      onResponsibleAdded() // Notify parent to re-fetch data
      onOpenChange(false) // Close dialog

      // Reset form
      setFormData({
        nombreCompleto: "",
        cargo: "sin-asignar",
        email: "",
        telefono: "",
      })
    } catch (err: any) {
      console.error("Failed to add responsible:", err)
      toast({
        title: "Error al agregar",
        description: "No se pudo agregar el responsable: " + err.message,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Agregar Nuevo Responsable</DialogTitle>
          <DialogDescription>Registra un nuevo responsable en el sistema.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="nombreCompleto" className="text-right">
                Nombre Completo
              </Label>
              <Input
                id="nombreCompleto"
                value={formData.nombreCompleto}
                onChange={(e) => setFormData({ ...formData, nombreCompleto: e.target.value })}
                className="col-span-3"
                placeholder="Nombre completo"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="cargo" className="text-right">
                Cargo
              </Label>
              <Select value={formData.cargo} onValueChange={(value) => setFormData({ ...formData, cargo: value })}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Sin asignar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sin-asignar">Sin asignar</SelectItem>
                  <SelectItem value="medico-general">Médico General</SelectItem>
                  <SelectItem value="medico-especialista">Médico Especialista</SelectItem>
                  <SelectItem value="enfermero-general">Enfermero General</SelectItem>
                  <SelectItem value="enfermero-especialista">Enfermero Especialista</SelectItem>
                  <SelectItem value="tecnico-sistemas">Técnico en Sistemas</SelectItem>
                  <SelectItem value="tecnico-laboratorio">Técnico de Laboratorio</SelectItem>
                  <SelectItem value="tecnico-radiologia">Técnico en Radiología</SelectItem>
                  <SelectItem value="administrativo">Administrativo</SelectItem>
                  <SelectItem value="secretaria">Secretaria</SelectItem>
                  <SelectItem value="contador">Contador</SelectItem>
                  <SelectItem value="recursos-humanos">Recursos Humanos</SelectItem>
                  <SelectItem value="seguridad">Seguridad</SelectItem>
                  <SelectItem value="limpieza">Limpieza</SelectItem>
                  <SelectItem value="mantenimiento">Mantenimiento</SelectItem>
                  <SelectItem value="farmaceutico">Farmacéutico</SelectItem>
                  <SelectItem value="psicologo">Psicólogo</SelectItem>
                  <SelectItem value="trabajador-social">Trabajador Social</SelectItem>
                  <SelectItem value="director">Director</SelectItem>
                  <SelectItem value="subdirector">Subdirector</SelectItem>
                  <SelectItem value="jefe-departamento">Jefe de Departamento</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="col-span-3"
                placeholder="correo@hospital.com"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="telefono" className="text-right">
                Teléfono
              </Label>
              <Input
                id="telefono"
                value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                className="col-span-3"
                placeholder="+52 123 456 7890"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting || !formData.nombreCompleto || !formData.cargo}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando...
                </>
              ) : (
                "Guardar Responsable"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
