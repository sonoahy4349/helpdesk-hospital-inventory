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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trash2 } from "lucide-react"

interface AddDirectionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const existingDirections = [
  "Dirección Médica",
  "Dirección Administrativa",
  "Dirección de Enfermería",
  "Dirección de Sistemas",
  "Dirección de Recursos Humanos",
]

export function AddDirectionDialog({ open, onOpenChange }: AddDirectionDialogProps) {
  const [newDirection, setNewDirection] = useState("")
  const [directions, setDirections] = useState(existingDirections)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (newDirection.trim()) {
      setDirections([...directions, newDirection.trim()])
      setNewDirection("")
    }
  }

  const handleDelete = (index: number) => {
    setDirections(directions.filter((_, i) => i !== index))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Gestionar Direcciones</DialogTitle>
          <DialogDescription>Agregar y administrar las direcciones disponibles en el sistema.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Formulario para agregar nueva dirección */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="direccion" className="text-right">
                Nueva Dirección
              </Label>
              <Input
                id="direccion"
                value={newDirection}
                onChange={(e) => setNewDirection(e.target.value)}
                className="col-span-3"
                placeholder="Nombre de la dirección..."
              />
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={!newDirection.trim()}>
                Agregar Dirección
              </Button>
            </div>
          </form>

          {/* Lista de direcciones existentes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Direcciones Registradas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {directions.map((direction, index) => (
                  <div key={index} className="flex items-center justify-between p-2 border rounded-lg">
                    <Badge variant="outline" className="text-sm">
                      {direction}
                    </Badge>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(index)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button type="button" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
