import React from "react";
import { Link } from "react-router-dom";
import { Menu, CircleAlert as CircleAlertIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";

import { useAuth } from "../hooks/useAuth";

export function MobileNav() {
  const [open, setOpen] = React.useState(false);
  const { user } = useAuth();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] sm:w-[400px]">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-left">
            <Label className="font-bold text-3xl text-red-600">PPLR</Label>
          </SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-4 px-4">
          <Link
            to="/dashboard"
            onClick={() => setOpen(false)}
            className="text-lg font-medium hover:text-indigo-600"
          >
            Dashboard
          </Link>

          {user?.role === 'ADMIN' ? (
            <>
              <Link
                to="/my-shifts"
                onClick={() => setOpen(false)}
                className="text-lg font-medium hover:text-indigo-600"
              >
                Mis Turnos
              </Link>
              <div className="border-t pt-4 mt-2">
                <h4 className="font-semibold mb-2 text-gray-500 uppercase text-xs tracking-wider">Administración</h4>
                <Link to="/admin/users" onClick={() => setOpen(false)} className="block py-2 text-lg font-medium hover:text-indigo-600">
                  Gestión de Usuarios
                </Link>
                <Link to="/admin/zones" onClick={() => setOpen(false)} className="block py-2 text-lg font-medium hover:text-indigo-600">
                  Zonas y Carritos
                </Link>
                <Link to="/admin/reports" onClick={() => setOpen(false)} className="block py-2 text-lg font-medium hover:text-indigo-600">
                  Reportes
                </Link>
                <Link to="/admin/settings" onClick={() => setOpen(false)} className="block py-2 text-lg font-medium hover:text-indigo-600">
                  Configuración
                </Link>
              </div>
            </>
          ) : (
            <>
              <Link
                to="/my-shifts"
                onClick={() => setOpen(false)}
                className="text-lg font-medium hover:text-indigo-600"
              >
                Mis Turnos
              </Link>
              <div className="border-t pt-4 mt-2">
                <h4 className="font-semibold mb-2 text-gray-500 uppercase text-xs tracking-wider">Información</h4>
                <Link to="/zones" onClick={() => setOpen(false)} className="block py-2 text-lg font-medium hover:text-indigo-600">
                  Zonas Disponibles
                </Link>
                <Link to="/guide" onClick={() => setOpen(false)} className="block py-2 text-lg font-medium hover:text-indigo-600">
                  Guía de Predicación
                </Link>
              </div>
            </>
          )}

          <div className="border-t pt-4 mt-2">
            <Link
              to="/help"
              onClick={() => setOpen(false)}
              className="text-lg font-medium hover:text-indigo-600"
            >
              Ayuda
            </Link>
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
