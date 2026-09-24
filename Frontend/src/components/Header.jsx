import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

import { MobileNav } from "./MobileNav";
import { ModeToggle } from "./mode-toggle";
import { CircleAlert as CircleAlertIcon, LogOut, User } from "lucide-react";
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
} from "@/components/ui/navigation-menu";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDisplayName } from "@/lib/utils";

export function Header() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate("/login");
    };

    return (
        <header className="bg-card/80 backdrop-blur-md shadow-sm border border-border/60 rounded-2xl p-4 flex items-center justify-between sticky top-4 z-50 mb-8">
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
                                    <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                                        <Link to="/my-shifts">Mis Turnos</Link>
                                    </NavigationMenuLink>
                                </NavigationMenuItem>
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
                                            <ListItem title="Recordatorios" href="/recordatorios">
                                                Consulta los recordatorios y anuncios importantes.
                                            </ListItem>
                                        </ul>
                                    </NavigationMenuContent>
                                </NavigationMenuItem>
                            </>
                        )}
                    </NavigationMenuList>
                </NavigationMenu>
            </div>

            {/* Right: User Menu */}
            <div className="flex items-center gap-4">
                <ModeToggle />

                <span className="text-muted-foreground text-sm hidden md:inline-block font-medium">
                    Hola, <span className="text-foreground">{formatDisplayName(user?.firstName, user?.lastName) || "Usuario"}</span>
                </span>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-10 w-10 rounded-full border border-gray-200">
                            <Avatar>
                                <AvatarImage src={user?.image} alt={user?.name} />
                                <AvatarFallback className="bg-indigo-50 text-indigo-700">{user?.firstName?.charAt(0) || "U"}</AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                        <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium leading-none">{formatDisplayName(user?.firstName, user?.lastName)}</p>
                                <p className="text-xs leading-none text-muted-foreground">
                                    {user?.email}
                                </p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link to="/profile" className="cursor-pointer w-full flex items-center">
                                <User className="mr-2 h-4 w-4" />
                                <span>Perfil</span>
                            </Link>
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
    );
}

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
