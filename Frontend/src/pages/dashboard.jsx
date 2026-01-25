import React from "react";
import { useAuth } from "../hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { Link, useNavigate } from "react-router-dom";
import { CircleAlert as CircleAlertIcon, LogOut, User } from "lucide-react";
import { ShiftScheduler } from "../components/ShiftScheduler";
import { MobileNav } from "../components/MobileNav";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const components = [
  {
    title: "Alert Dialog",
    href: "/docs/primitives/alert-dialog",
    description:
      "A modal dialog that interrupts the user with important content and expects a response.",
  },
  {
    title: "Hover Card",
    href: "/docs/primitives/hover-card",
    description:
      "For sighted users to preview content available behind a link.",
  },
  {
    title: "Progress",
    href: "/docs/primitives/progress",
    description:
      "Displays an indicator showing the completion progress of a task, typically displayed as a progress bar.",
  },
  {
    title: "Scroll-area",
    href: "/docs/primitives/scroll-area",
    description: "Visually or semantically separates content.",
  },
  {
    title: "Tabs",
    href: "/docs/primitives/tabs",
    description:
      "A set of layered sections of content—known as tab panels—that are displayed one at a time.",
  },
  {
    title: "Tooltip",
    href: "/docs/primitives/tooltip",
    description:
      "A popup that displays information related to an element when the element receives keyboard focus or the mouse hovers over it.",
  },
]

export default function Dashboard() {  
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  if (loading) {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-6">
            <div className="loader" />
            <p className="text-gray-500 font-medium animate-pulse tracking-wide">Cargando tablero...</p>
        </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50/50 py-10 px-4 md:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md shadow-sm border border-gray-200/60 rounded-2xl p-4 flex items-center justify-between sticky top-4 z-50">
          
          {/* Left: Mobile Menu & Logo */}
          <div className="flex items-center gap-4">
              <MobileNav />
              <Label className="font-bold text-3xl text-red-600 tracking-tight">
                  PPLR
              </Label>
          </div>

          {/* Center: Desktop Navigation */}
          <div className="hidden md:block">
              <NavigationMenu>
                <NavigationMenuList>
                  {/* Generic Item */}
                  <NavigationMenuItem>
                    <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                      <Link to="/dashboard">Dashboard</Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>

                  {/* Role Based Items */}
                  {user?.role === 'ADMIN' ? (
                    <>
                      <NavigationMenuItem>
                        <NavigationMenuTrigger>Administración</NavigationMenuTrigger>
                        <NavigationMenuContent>
                          <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] ">
                            <ListItem title="Gestión de Usuarios" href="/admin/users">
                              Administra la lista de publicadores y sus roles.
                            </ListItem>
                            <ListItem title="Zonas y Carritos" href="/admin/zones">
                              Configura las ubicaciones y carritos disponibles.
                            </ListItem>
                            <ListItem title="Reportes" href="/admin/reports">
                              Visualiza estadísticas de asistencia y cobertura.
                            </ListItem>
                            <ListItem title="Configuración Global" href="/admin/settings">
                              Ajustes del sistema y bloques horarios.
                            </ListItem>
                          </ul>
                        </NavigationMenuContent>
                      </NavigationMenuItem>
                    </>
                  ) : (
                    <>
                      <NavigationMenuItem>
                        <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                          <Link to="/my-shifts">Mis Turnos</Link>
                        </NavigationMenuLink>
                      </NavigationMenuItem>
                      <NavigationMenuItem>
                        <NavigationMenuTrigger>Información</NavigationMenuTrigger>
                        <NavigationMenuContent>
                          <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] ">
                            <ListItem title="Zonas Disponibles" href="/zones">
                              Consulta los puntos de predicación activos.
                            </ListItem>
                            <ListItem title="Guía de Predicación" href="/guide">
                              Instrucciones y recordatorios de seguridad.
                            </ListItem>
                          </ul>
                        </NavigationMenuContent>
                      </NavigationMenuItem>
                    </>
                  )}

                  <NavigationMenuItem>
                    <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                      <Link to="/help">Ayuda</Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
          </div>

          {/* Right: User Menu */}
          <div className="flex items-center gap-4">
              <span className="text-gray-600 text-sm hidden md:inline-block font-medium">
                  Hola, <span className="text-gray-900">{user?.name || "Usuario"}</span>
              </span>
              <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-10 w-10 rounded-full border border-gray-200">
                          <Avatar>
                              <AvatarImage src={user?.image} alt={user?.name} />
                              <AvatarFallback className="bg-indigo-50 text-indigo-700">{user?.name?.charAt(0) || "U"}</AvatarFallback>
                          </Avatar>
                      </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                      <DropdownMenuLabel className="font-normal">
                          <div className="flex flex-col space-y-1">
                              <p className="text-sm font-medium leading-none">{user?.name}</p>
                              <p className="text-xs leading-none text-muted-foreground">
                                  {user?.email}
                              </p>
                          </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                          <User className="mr-2 h-4 w-4" />
                          <span>Perfil</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
                          <LogOut className="mr-2 h-4 w-4" />
                          <span>Cerrar sesión</span>
                      </DropdownMenuItem>
                  </DropdownMenuContent>
              </DropdownMenu>
          </div>
        </header>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Usuarios</h2>
            <div className="flex items-baseline gap-2 mt-2">
              <p className="text-3xl font-bold text-gray-900">124</p>
              <span className="text-green-500 text-xs font-medium">+12%</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">Activos este mes</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Ventas</h2>
            <div className="flex items-baseline gap-2 mt-2">
              <p className="text-3xl font-bold text-gray-900">$8,230</p>
            </div>
            <p className="text-xs text-gray-400 mt-1">Últimos 7 días</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Tareas</h2>
            <div className="flex items-baseline gap-2 mt-2">
              <p className="text-3xl font-bold text-gray-900">15</p>
            </div>
            <p className="text-xs text-gray-400 mt-1">Pendientes</p>
          </div>
        </div>

        {/* Scheduler Section */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">Cronograma de Turnos</h3>
              <p className="text-gray-500 text-sm mt-1">Gestiona y visualiza las asignaciones semanales.</p>
            </div>
          </div>
          <ShiftScheduler />
        </section>
      </div>
    </div>
  );
};



function ListItem({ title, children, href, ...props }) {
  return (
    <li {...props}>
      <NavigationMenuLink asChild>
        <Link to={href}>
          <div className="flex flex-col gap-1 text-sm">
            <div className="leading-none font-medium">{title}</div>
            <div className="text-muted-foreground line-clamp-2">{children}</div>
          </div>
        </Link>
      </NavigationMenuLink>
    </li>
  )
}
