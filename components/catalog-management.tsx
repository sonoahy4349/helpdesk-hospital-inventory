"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Search, Edit, Trash2, Settings } from "lucide-react"
import { AddCatalogElementDialog } from "@/components/add-catalog-element-dialog"
import { EditCatalogElementDialog } from "@/components/edit-catalog-element-dialog"

interface CatalogManagementProps {
  type: "inventario" | "ubicaciones" | "responsables" | "estaciones"
}

const catalogData = {
  inventario: {
    title: "Catálogos de Inventario",
    description: "Gestionar marcas, modelos y tipos de equipos",
    items: [
      { id: 1, nombre: "HP", tipo: "Marca", categoria: "CPU", activo: true },
      { id: 2, nombre: "Dell", tipo: "Marca", categoria: "CPU", activo: true },
      { id: 3, nombre: "ProDesk 400 G9", tipo: "Modelo", categoria: "CPU", activo: true },
      { id: 4, nombre: "OptiPlex 3090", tipo: "Modelo", categoria: "CPU", activo: true },
      { id: 5, nombre: "LaserJet Pro", tipo: "Modelo", categoria: "Impresora", activo: true },
    ],
  },
  ubicaciones: {
    title: "Catálogos de Ubicaciones",
    description: "Gestionar edificios, plantas y servicios",
    items: [
      { id: 1, nombre: "A1", tipo: "Edificio", categoria: "Principal", activo: true },
      { id: 2, nombre: "B2", tipo: "Edificio", categoria: "Secundario", activo: true },
      { id: 3, nombre: "Telecomunicaciones", tipo: "Servicio", categoria: "Técnico", activo: true },
      { id: 4, nombre: "Urgencias", tipo: "Servicio", categoria: "Médico", activo: true },
    ],
  },
  responsables: {
    title: "Catálogos de Responsables",
    description: "Gestionar cargos y departamentos",
    items: [
      { id: 1, nombre: "Médico General", tipo: "Cargo", categoria: "Médico", activo: true },
      { id: 2, nombre: "Enfermero", tipo: "Cargo", categoria: "Enfermería", activo: true },
      { id: 3, nombre: "Técnico en Sistemas", tipo: "Cargo", categoria: "Técnico", activo: true },
      { id: 4, nombre: "Administración", tipo: "Departamento", categoria: "Administrativo", activo: true },
    ],
  },
  estaciones: {
    title: "Catálogos de Estaciones",
    description: "Gestionar tipos de estaciones y configuraciones",
    items: [
      { id: 1, nombre: "CPU + Monitor", tipo: "Tipo Estación", categoria: "Escritorio", activo: true },
      { id: 2, nombre: "Laptop", tipo: "Tipo Estación", categoria: "Portátil", activo: true },
      { id: 3, nombre: "Impresora", tipo: "Tipo Estación", categoria: "Periférico", activo: true },
    ],
  },
}

export function CatalogManagement({ type }: CatalogManagementProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editingElement, setEditingElement] = useState<any>(null)
  const data = catalogData[type]
  const [catalogItems, setCatalogItems] = useState(data.items)

  const filteredItems = catalogItems.filter(
    (item) =>
      item.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.tipo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.categoria.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleElementAdded = (newElement: any) => {
    const elementWithId = {
      ...newElement,
      id: Math.max(...catalogItems.map((item) => item.id)) + 1,
      activo: true,
    }
    setCatalogItems([...catalogItems, elementWithId])
  }

  const handleEditElement = (element: any) => {
    setEditingElement(element)
    setShowEditDialog(true)
  }

  const handleElementUpdated = (updatedElement: any) => {
    setCatalogItems(catalogItems.map((item) => (item.id === updatedElement.id ? updatedElement : item)))
  }

  const handleDeleteElement = (elementId: number) => {
    if (confirm("¿Estás seguro de que deseas eliminar este elemento?")) {
      setCatalogItems(catalogItems.filter((item) => item.id !== elementId))
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                {data.title}
              </CardTitle>
              <CardDescription>{data.description}</CardDescription>
            </div>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Agregar Elemento
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar elementos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla */}
      <Card>
        <CardHeader>
          <CardTitle>Elementos del Catálogo</CardTitle>
          <CardDescription>{filteredItems.length} elementos encontrados</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.id}</TableCell>
                  <TableCell>{item.nombre}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{item.tipo}</Badge>
                  </TableCell>
                  <TableCell>{item.categoria}</TableCell>
                  <TableCell>
                    <Badge variant={item.activo ? "default" : "secondary"}>{item.activo ? "Activo" : "Inactivo"}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEditElement(item)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteElement(item.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <AddCatalogElementDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        catalogType={type}
        onElementAdded={handleElementAdded}
      />
      <EditCatalogElementDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        catalogType={type}
        element={editingElement}
        onElementUpdated={handleElementUpdated}
      />
    </div>
  )
}
