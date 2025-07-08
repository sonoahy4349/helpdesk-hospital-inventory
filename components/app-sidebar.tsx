"use client"

import { Home, Monitor, Package, MapPin, Users, Settings, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { supabase } from "@/lib/supabase"

const menuItems = [
  {
    title: "Inicio",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Estaciones",
    url: "/dashboard/estaciones",
    icon: Monitor,
  },
  {
    title: "Inventario",
    url: "/dashboard/inventario",
    icon: Package,
  },
  {
    title: "Ubicaciones",
    url: "/dashboard/ubicaciones",
    icon: MapPin,
  },
  {
    title: "Responsables",
    url: "/dashboard/responsables",
    icon: Users,
  },
]

export function AppSidebar() {
  const pathname = usePathname()

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error("Logout error:", error)
      alert(`Error al cerrar sesión: ${error.message}`)
    } else {
      console.log("User logged out")
      window.location.href = "/login"
    }
  }

  return (
    <div className="w-64 bg-background border-r flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">HD</span>
          </div>
          <span className="text-xl font-bold text-blue-600">HelpDesk</span>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 p-4">
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.url
            return (
              <Link key={item.title} href={item.url}>
                <Button variant={isActive ? "default" : "ghost"} className="w-full justify-start gap-3">
                  <item.icon className="h-4 w-4" />
                  <span>{item.title}</span>
                </Button>
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Footer */}
      <div className="p-4 border-t">
        <div className="space-y-2">
          <Link href="/dashboard/configuracion">
            <Button variant="ghost" className="w-full justify-start gap-3">
              <Settings className="h-4 w-4" />
              <span>Configuración</span>
            </Button>
          </Link>
          <Separator />
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            Cerrar Sesión
          </Button>
        </div>
      </div>
    </div>
  )
}
