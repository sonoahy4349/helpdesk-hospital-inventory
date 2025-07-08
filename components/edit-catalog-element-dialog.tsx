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
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface EditCatalogElementDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  catalogType: "inventario" | "ubicaciones" | "responsables" | "estaciones"
  element: any
  onElementUpdated: (element: any) => void
}

const catalogConfig = {
  inventario: {
    title: "Editar Elemento de Inventario",
    description: "Modificar marca, modelo o tipo de equipo",
    types: [
      { value: "marca", label: "Marca" },
      { value: "modelo", label: "Modelo" },
      { value: "tipo", label: "Tipo de Equipo" },
    ],
    categories: {
      marca: ["CPU", "Monitor", "Laptop", "Impresora", "Teclado", "Mouse", "Otros"],
      modelo: ["CPU", "Monitor", "Laptop", "Impresora", "Teclado", "Mouse", "Otros"],
      tipo: ["Hardware", "Software", "Periféricos", "Accesorios"],
    },
  },
  ubicaciones: {
    title: "Editar Elemento de Ubicación",
    description: "Modificar edificio, planta o servicio",
    types: [
      { value: "edificio", label: "Edificio" },
      { value: "planta", label: "Planta" },
      { value: "servicio", label: "Servicio" },
      { value: "area", label: "Área Específica" },
    ],
    categories: {
      edificio: ["Principal", "Secundario", "Anexo", "Temporal"],
      planta: ["Planta Baja", "Piso 1", "Piso 2", "Piso 3", "Piso 4", "Sótano"],
      servicio: ["Médico", "Administrativo", "Técnico", "Apoyo"],
      area: ["Consultorios", "Salas", "Oficinas", "Almacenes"],
    },
  },
  responsables: {
    title: "Editar Elemento de Responsables",
    description: "Modificar cargo o departamento",
    types: [
      { value: "cargo", label: "Cargo" },
      { value: "departamento", label: "Departamento" },
      { value: "especialidad", label: "Especialidad Médica" },
    ],
    categories: {
      cargo: ["Médico", "Enfermería", "Administrativo", "Técnico", "Apoyo"],
      departamento: ["Médico", "Administrativo", "Técnico", "Apoyo", "Dirección"],
      especialidad: ["Medicina General", "Especialidades", "Cirugía", "Diagnóstico"],
    },
  },
  estaciones: {
    title: "Editar Elemento de Estaciones",
    description: "Modificar tipo de estación o configuración",
    types: [
      { value: "tipo-estacion", label: "Tipo de Estación" },
      { value: "configuracion", label: "Configuración" },
      { value: "accesorio", label: "Accesorio" },
    ],
    categories: {
      "tipo-estacion": ["Escritorio", "Portátil", "Periférico", "Especializada"],
      configuracion: ["Básica", "Intermedia", "Avanzada", "Especializada"],
      accesorio: ["Conectividad", "Entrada", "Almacenamiento", "Software"],
    },
  },
}

export function EditCatalogElementDialog({
  open,
  onOpenChange,
  catalogType,
  element,
  onElementUpdated,
}: EditCatalogElementDialogProps) {
  const [formData, setFormData] = useState({
    nombre: "",
    tipo: "",
    categoria: "",
    descripcion: "",
    activo: true,
  })

  const config = catalogConfig[catalogType]

  useEffect(() => {
    if (element && open) {
      setFormData({
        nombre: element.nombre || "",
        tipo: element.tipo?.toLowerCase().replace(/\s+/g, "-") || "",
        categoria: element.categoria || "",
        descripcion: element.descripcion || "",
        activo: element.activo ?? true,
      })
    }
  }, [element, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const updatedElement = {
      ...element,
      ...formData,
      fechaModificacion: new Date().toISOString().split("T")[0],
    }

    onElementUpdated(updatedElement)
    onOpenChange(false)
  }

  const getAvailableCategories = () => {
    if (!formData.tipo) return []
    return config.categories[formData.tipo as keyof typeof config.categories] || []
  }

  if (!element) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {config.title} #{element.id}
          </DialogTitle>
          <DialogDescription>{config.description}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Información Básica */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Información Básica</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="nombre">Nombre *</Label>
                  <Input
                    id="nombre"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    placeholder="Nombre del elemento"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="tipo">Tipo *</Label>
                    <Select
                      value={formData.tipo}
                      onValueChange={(value) => setFormData({ ...formData, tipo: value, categoria: "" })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        {config.types.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="categoria">Categoría *</Label>
                    <Select
                      value={formData.categoria}
                      onValueChange={(value) => setFormData({ ...formData, categoria: value })}
                      disabled={!formData.tipo}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        {getAvailableCategories().map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="descripcion">Descripción</Label>
                  <Textarea
                    id="descripcion"
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    placeholder="Descripción detallada del elemento"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="activo">Estado</Label>
                  <Select
                    value={formData.activo ? "true" : "false"}
                    onValueChange={(value) => setFormData({ ...formData, activo: value === "true" })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Activo</SelectItem>
                      <SelectItem value="false">Inactivo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!formData.nombre || !formData.tipo || !formData.categoria}>
              Guardar Cambios
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
