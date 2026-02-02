import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Box, Info, Phone } from "lucide-react";

export function ZoneInfoCard({ zone }) {
    if (!zone) return null;

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 animate-in fade-in duration-500">
            {/* Location Card */}
            <Card className="border-t-4 shadow-sm" style={{ borderColor: zone.color }}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Ubicación</CardTitle>
                    <MapPin className="h-4 w-4" style={{ color: zone.color }} />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold truncate">
                        {zone.location?.startsWith("http") ? (
                            <a href={zone.location} target="_blank" rel="noopener noreferrer" className="hover:underline text-indigo-600">
                                Ver Mapa
                            </a>
                        ) : (
                            zone.location || "No especificada"
                        )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        {zone.name}
                    </p>
                </CardContent>
            </Card>

            {/* Warehouse Card */}
            <Card className="border-t-4 shadow-sm" style={{ borderColor: zone.color }}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Almacén / Carrito</CardTitle>
                    <Box className="h-4 w-4" style={{ color: zone.color }} />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{zone.warehouse || "No especificado"}</div>
                    <p className="text-xs text-muted-foreground">
                        Ubicación del equipo
                    </p>
                </CardContent>
            </Card>

            {/* Instructions Card (Spans full width on small screens, or separate) */}
            <Card className="md:col-span-2 lg:col-span-1 border-t-4 shadow-sm" style={{ borderColor: zone.color }}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Instrucciones</CardTitle>
                    <Info className="h-4 w-4" style={{ color: zone.color }} />
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground whitespace-pre-line">
                        {zone.instructions || "Sin instrucciones especiales."}
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
