"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Search, Edit, Power, PowerOff, Users, Package, MapPin, Monitor, UserCheck } from "lucide-react"
import { AddUserDialog } from "@/components/add-user-dialog"
import { EditUserDialog } from "@/components/edit-user-dialog"
import { CatalogManagement } from "@/components/catalog-management"

const usersData = [
  {
    id: 1,
    nombre: "Vaca Lola",
    email: "vacalola@hospital.com",
    rol: "Administrador",
    estado: "ACTIVO",
    fechaCreacion: "2024-01-15",
    ultimoAcceso: "2024-03-15 10:30",
  },
  {
    id: 2,
    nombre: "Admin Sistema",
    email: "administrador@hospital.com",
    rol: "Administrador",
    estado: "ACTIVO",
    fechaCreacion: "2024-01-10",
    ultimoAcceso: "2024-03-15 09:15",
  },
  {
    id: 3,
    nombre: "Juan Pérez López",
    email: "admin@hospital.com",
    rol: "Administrador",
    estado: "ACTIVO",
    fechaCreacion: "2024-01-20",
    ultimoAcceso: "2024-03-14 16:45",
  },
  {
    id: 4,
    nombre: "María González",
    email: "maria.gonzalez@hospital.com",
    rol: "Usuario",
    estado: "ACTIVO",
    fechaCreacion: "2024-02-01",
    ultimoAcceso: "2024-03-15 08:20",
  },
  {
    id: 5,
    nombre: "Carlos Mendoza",
    email: "carlos.mendoza@hospital.com",
    rol: "Supervisor",
    estado: "INACTIVO",
    fechaCreacion: "2024-02-15",
    ultimoAcceso: "2024-03-10 14:30",
  },
]

export default function ConfiguracionPage() {
  const [activeTab, setActiveTab] = useState("acceso")
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("todos")
  const [showAddUserDialog, setShowAddUserDialog] = useState(false)
  const [showEditUserDialog, setShowEditUserDialog] = useState(false)
  const [editingUser, setEditingUser] = useState<any>(null)
  const [users, setUsers] = useState(usersData)

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === "todos" || user.rol.toLowerCase() === roleFilter.toLowerCase()
    return matchesSearch && matchesRole
  })

  const handleEditUser = (user: any) => {
    setEditingUser(user)
    setShowEditUserDialog(true)
  }

  const handleToggleUserStatus = (userId: number) => {
    setUsers(
      users.map((user) =>
        user.id === userId ? { ...user, estado: user.estado === "ACTIVO" ? "INACTIVO" : "ACTIVO" } : user,
      ),
    )
  }

  const handleUserAdded = (newUser: any) => {
    setUsers([...users, { ...newUser, id: users.length + 1 }])
  }

  const handleUserUpdated = (updatedUser: any) => {
    setUsers(users.map((user) => (user.id === updatedUser.id ? updatedUser : user)))
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Configuración</h1>
        <p className="text-muted-foreground">Configuración del sistema y gestión de usuarios</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="acceso" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Acceso
          </TabsTrigger>
          <TabsTrigger value="inventario" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Inventario
          </TabsTrigger>
          <TabsTrigger value="ubicaciones" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Ubicaciones
          </TabsTrigger>
          <TabsTrigger value="responsables" className="flex items-center gap-2">
            <UserCheck className="h-4 w-4" />
            Responsables
          </TabsTrigger>
          <TabsTrigger value="estaciones" className="flex items-center gap-2">
            <Monitor className="h-4 w-4" />
            Estaciones
          </TabsTrigger>
        </TabsList>

        {/* Tab de Acceso - Gestión de Usuarios */}
        <TabsContent value="acceso" className="space-y-6">
          {/* Filtros */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-4 items-center">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nombre o correo"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos los roles</SelectItem>
                    <SelectItem value="administrador">Administrador</SelectItem>
                    <SelectItem value="supervisor">Supervisor</SelectItem>
                    <SelectItem value="usuario">Usuario</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Gestión de Usuarios */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Usuarios
                  </CardTitle>
                  <CardDescription>Administrar usuarios del sistema</CardDescription>
                </div>
                <Button onClick={() => setShowAddUserDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Usuario
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Correo</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Último Acceso</TableHead>
                    <TableHead>Acción</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.nombre}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{user.rol}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.estado === "ACTIVO" ? "default" : "secondary"}>{user.estado}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{user.ultimoAcceso}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleEditUser(user)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleToggleUserStatus(user.id)}>
                            {user.estado === "ACTIVO" ? (
                              <PowerOff className="h-4 w-4 text-red-500" />
                            ) : (
                              <Power className="h-4 w-4 text-green-500" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tabs de Catálogos */}
        <TabsContent value="inventario">
          <CatalogManagement type="inventario" />
        </TabsContent>

        <TabsContent value="ubicaciones">
          <CatalogManagement type="ubicaciones" />
        </TabsContent>

        <TabsContent value="responsables">
          <CatalogManagement type="responsables" />
        </TabsContent>

        <TabsContent value="estaciones">
          <CatalogManagement type="estaciones" />
        </TabsContent>
      </Tabs>

      <AddUserDialog open={showAddUserDialog} onOpenChange={setShowAddUserDialog} onUserAdded={handleUserAdded} />
      <EditUserDialog
        open={showEditUserDialog}
        onOpenChange={setShowEditUserDialog}
        user={editingUser}
        onUserUpdated={handleUserUpdated}
      />
    </div>
  )
}
