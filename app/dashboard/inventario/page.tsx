"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Search, Edit, Eye, Trash2, Monitor, Laptop, Printer } from "lucide-react"
import { AddEquipmentDialog } from "@/components/add-equipment-dialog"
import { EditEquipmentDialog } from "@/components/edit-equipment-dialog"
import { useToast } from "@/hooks/use-toast"
// AGREGAR ESTE CÓDIGO A TU PÁGINA DE INVENTARIO

// Corregir los tipos de equipo
const equipmentTypes = [
  { id: "todos", label: "Todos los equipos", icon: null },
  { id: "cpu-monitor", label: "CPU y Monitores", icon: Monitor }, // Cambiar esto
  { id: "LAPTOP", label: "Laptops", icon: Laptop },
  { id: "IMPRESORA", label: "Impresoras", icon: Printer },
]

// Corregir la función de filtrado
const filteredEquipment = equipmentData.filter((item) => {
  // Filtro por tipo corregido
  let matchesType = false
  
  switch (selectedType) {
    case "todos":
      matchesType = true
      break
    case "cpu-monitor":
      // Agrupar CPU y MONITOR
      matchesType = item.tipo === "CPU" || item.tipo === "MONITOR"
      break
    case "LAPTOP":
      matchesType = item.tipo === "LAPTOP"
      break
    case "IMPRESORA":
      matchesType = item.tipo === "IMPRESORA"
      break
    default:
      matchesType = item.tipo === selectedType
  }
  
  // Resto de filtros...
  const matchesStatus = 
    selectedStatus === "todos" || 
    (selectedStatus === "disponible" && !item.isAssigned) ||
    (selectedStatus === "asignado" && item.isAssigned) ||
    (selectedStatus === "mantenimiento" && item.estado.toLowerCase().includes("mantenimiento"))
  
  const matchesSearch =
    item.equipo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.marca.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.modelo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.serie.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.perfil?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.tipoImpresora?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.estacion?.toLowerCase().includes(searchTerm.toLowerCase())
  
  return matchesType && matchesStatus && matchesSearch
})

// Función para renderizar header correcto
const renderTableHeader = () => {
  if (selectedType === "IMPRESORA") {
    return (
      <TableRow>
        <TableHead>Equipo</TableHead>
        <TableHead>Perfil</TableHead>
        <TableHead>Tipo</TableHead>
        <TableHead>Marca</TableHead>
        <TableHead>Modelo</TableHead>
        <TableHead>No. de Serie</TableHead>
        <TableHead>Estado</TableHead>
        <TableHead>Asignación</TableHead>
        <TableHead>Acciones</TableHead>
      </TableRow>
    )
  } else if (selectedType === "cpu-monitor") {
    return (
      <TableRow>
        <TableHead>Tipo</TableHead>
        <TableHead>Marca</TableHead>
        <TableHead>Modelo</TableHead>
        <TableHead>No. de Serie</TableHead>
        <TableHead>Estado</TableHead>
        <TableHead>Estación Asignada</TableHead>
        <TableHead>Rol en Estación</TableHead>
        <TableHead>Acciones</TableHead>
      </TableRow>
    )
  } else {
    // Para laptop y todos
    return (
      <TableRow>
        <TableHead>Equipo</TableHead>
        <TableHead>Marca</TableHead>
        <TableHead>Modelo</TableHead>
        <TableHead>No. de Serie</TableHead>
        <TableHead>Estado</TableHead>
        <TableHead>Estación Asignada</TableHead>
        <TableHead>Tipo en Estación</TableHead>
        <TableHead>Acciones</TableHead>
      </TableRow>
    )
  }
}