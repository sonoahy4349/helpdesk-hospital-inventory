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
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

interface EditUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: any
  onUserUpdated: (user: any) => void
}

export function EditUserDialog({ open, onOpenChange, user, onUserUpdated }: EditUserDialogProps) {
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    rol: "",
    estado: "ACTIVO",
  })

  const [permissions, setPermissions] = useState({
    inventario: { ver: false, crear: false, editar: false, eliminar: false },
    estaciones: { ver: false, crear: false, editar: false, eliminar: false },
    ubicaciones: { ver: false, crear: false, editar: false, eliminar: false },
    responsables: { ver: false, crear: false, editar: false, eliminar: false },
    resguardos: { ver: false, crear: false, editar: false, eliminar: false },
    configuracion: { ver: false, crear: false, editar: false, eliminar: false },
  })

  useEffect(() => {
    if (user && open) {
      setFormData({
        nombre: user.nombre || "",
        email: user.email || "",
        rol: user.rol || "",
        estado: user.estado || "ACTIVO",
      })

      if (user.permisos) {
        setPermissions(user.permisos)
      }
    }
  }, [user, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const updatedUser = {
      ...user,
      ...formData,
      permisos: permissions,
    }

    onUserUpdated(updatedUser)
    onOpenChange(false)
  }

  const handlePermissionChange = (module: string, action: string, checked: boolean) => {
    setPermissions((prev) => ({
      ...prev,
      [module]: {
        ...prev[module as keyof typeof prev],
        [action]: checked,
      },
    }))
  }

  const setRolePermissions = (role: string) => {
    setFormData({ ...formData, rol: role })

    if (role === "Administrador") {
      const adminPermissions = Object.keys(permissions).reduce(
        (acc, module) => ({
          ...acc,
          [module]: { ver: true, crear: true, editar: true, eliminar: true },
        }),
        {},
      )
      setPermissions(adminPermissions as typeof permissions)
    } else if (role === "Supervisor") {
      const supervisorPermissions = Object.keys(permissions).reduce(
        (acc, module) => ({
          ...acc,
          [module]: { ver: true, crear: true, editar: true, eliminar: false },
        }),
        {},
      )
      setPermissions(supervisorPermissions as typeof permissions)
    } else if (role === "Usuario") {
      const userPermissions = Object.keys(permissions).reduce(
        (acc, module) => ({
          ...acc,
          [module]: { ver: true, crear: false, editar: false, eliminar: false },
        }),
        {},
      )
      setPermissions(userPermissions as typeof permissions)
    }
  }

  if (!user) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Usuario #{user.id}</DialogTitle>
          <DialogDescription>Modificar información y permisos del usuario</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Información Básica */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Información Básica</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nombre">Nombre Completo *</Label>
                    <Input
                      id="nombre"
                      value={formData.nombre}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Correo Electrónico *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="rol">Rol del Usuario *</Label>
                    <Select value={formData.rol} onValueChange={setRolePermissions}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar rol" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Administrador">Administrador</SelectItem>
                        <SelectItem value="Supervisor">Supervisor</SelectItem>
                        <SelectItem value="Usuario">Usuario</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="estado">Estado</Label>
                    <Select
                      value={formData.estado}
                      onValueChange={(value) => setFormData({ ...formData, estado: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ACTIVO">Activo</SelectItem>
                        <SelectItem value="INACTIVO">Inactivo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Permisos */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Permisos del Sistema</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(permissions).map(([module, perms]) => (
                    <div key={module}>
                      <h4 className="font-medium mb-2 capitalize">{module}</h4>
                      <div className="grid grid-cols-4 gap-4 ml-4">
                        {Object.entries(perms).map(([action, checked]) => (
                          <div key={action} className="flex items-center space-x-2">
                            <Checkbox
                              id={`${module}-${action}`}
                              checked={checked}
                              onCheckedChange={(checked) => handlePermissionChange(module, action, checked as boolean)}
                            />
                            <Label htmlFor={`${module}-${action}`} className="text-sm capitalize">
                              {action}
                            </Label>
                          </div>
                        ))}
                      </div>
                      <Separator className="mt-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <DialogFooter className="mt-6">
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
