import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Layout } from "../components/Layout";
import { LoadingScreen } from "../components/ui/LoadingScreen";
import { getMyShifts } from "../api/shifts";
import { useAuth } from "../hooks/useAuth";
import {
    Calendar,
    Clock,
    MapPin,
    Users,
    MessageCircle,
    Phone,
    Loader2,
    AlertCircle,
    ChevronRight,
    ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn, formatDisplayName } from "@/lib/utils";
import { toast } from "sonner";

export default function MyShifts() {
    const { user } = useAuth();
    const [shifts, setShifts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchShifts();
    }, []);

    const fetchShifts = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getMyShifts();
            // Client-side safety: ensure only unique shifts are shown
            const uniqueShifts = Array.from(new Map((data || []).map(item => [item.id, item])).values());
            setShifts(uniqueShifts);
        } catch (err) {
            if (import.meta.env.DEV) {
                console.warn("[MyShifts fetchShifts Failed]:", err);
            }
            const friendlyMsg = err?.message || "No se pudieron cargar tus turnos. Por favor, intenta de nuevo.";
            setError(friendlyMsg);
            toast.error(friendlyMsg);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <LoadingScreen text="Cargando tus turnos..." />;
    }

    return (
        <Layout>
            {/* Main Content Section */}
                <section className="bg-card rounded-2xl shadow-sm border border-border p-6 md:p-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                        <div>
                            <h3 className="text-2xl font-bold text-foreground">Mis Turnos</h3>
                            <p className="text-muted-foreground text-sm mt-1">
                                Consulta tus inscripciones próximas y contacta a tus compañeros.
                            </p>
                        </div>
                        {shifts.length > 0 && (
                            <Badge variant="outline" className="w-fit h-7 px-3 border-primary/30 text-primary bg-primary/5">
                                {shifts.length} {shifts.length === 1 ? 'Turno' : 'Turnos'}
                            </Badge>
                        )}
                    </div>

                    {error ? (
                        <div className="p-8 text-center bg-red-50 border border-red-100 rounded-2xl">
                            <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-4" />
                            <h2 className="text-lg font-bold text-red-900">¡Ups! Algo salió mal</h2>
                            <p className="text-sm text-red-700 mt-2">{error}</p>
                            <Button onClick={fetchShifts} className="mt-6 bg-red-600 hover:bg-red-700"> Reintentar </Button>
                        </div>
                    ) : shifts.length === 0 ? (
                        <div className="py-20 text-center bg-muted/30 rounded-2xl border border-dashed border-border">
                            <div className="bg-indigo-50 h-14 w-14 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Calendar className="h-7 w-7 text-indigo-500" />
                            </div>
                            <h2 className="text-lg font-bold text-foreground">No tienes turnos próximos</h2>
                            <p className="text-muted-foreground text-sm mt-2 max-w-sm mx-auto">
                                Todavía no te has inscrito en ningún turno activo. Ve al Dashboard para ver la disponibilidad.
                            </p>
                            <Button asChild className="mt-8 bg-indigo-600 hover:bg-indigo-700 rounded-xl px-8 h-12 font-bold shadow-lg shadow-indigo-100">
                                <Link to="/dashboard">Ir al Dashboard</Link>
                            </Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                            {shifts.map((shift) => (
                                <ShiftCard
                                    key={shift.id}
                                    shift={shift}
                                    currentUser={user}
                                />
                            ))}
                        </div>
                    )}
                </section>
        </Layout>
    );
}

function ShiftCard({ shift, currentUser }) {
    const dateObj = new Date(shift.date);
    const dayName = dateObj.toLocaleDateString("es-ES", { weekday: "long", timeZone: 'UTC' });
    const formattedDate = dateObj.toLocaleDateString("es-ES", { day: "numeric", month: "long", timeZone: 'UTC' });

    // Format start and end times
    const start = new Date(shift.schedule.startTime).toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });

    const end = new Date(shift.schedule.endTime).toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });

    const timeRange = `${start} - ${end}`;

    // Check if the user is the responsible one
    const isResponsable = Number(shift.responsableId) === Number(currentUser?.id);

    // Filter out our own user to show only teammates
    const teammates = shift.publishers
        .map(p => p.publisher)
        .filter(p => p && Number(p.id) !== Number(currentUser?.id));

    // Zone Color
    const zoneColor = shift.zone?.color || "#6366f1";

    return (
        <Card
            className="overflow-hidden border-border/40 hover:shadow-md transition-all duration-300 rounded-xl group flex flex-col border-l-4 bg-card"
            style={{ borderLeftColor: zoneColor, borderColor: `${zoneColor}30` }}
        >
            {/* Header with Date and Status */}
            <div className="px-4 py-3 border-b border-border/30 flex justify-between items-center bg-muted/30">
                <div className="flex items-center gap-2">
                    <div className="flex flex-col">
                        <span
                            className="text-[10px] font-black uppercase tracking-wider leading-none"
                            style={{ color: zoneColor }}
                        >
                            {dayName}
                        </span>
                        <span className="text-xs font-bold text-muted-foreground mt-0.5">
                            {formattedDate}
                        </span>
                    </div>
                </div>
                <Badge variant="ghost" className="text-[9px] h-4 px-1.5 text-muted-foreground border-none uppercase font-black tracking-tighter">
                    {shift.status === 'CONFIRMED' ? 'Confirmado' : 'Asignado'}
                </Badge>
            </div>

            {/* Shift Logistics */}
            <div className="p-4 space-y-4 flex-grow flex flex-col">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div
                            className="p-1.5 rounded-lg"
                            style={{ backgroundColor: `${zoneColor}15` }}
                        >
                            <Clock className="h-4 w-4" style={{ color: zoneColor }} />
                        </div>
                        <span className="text-[13px] font-bold text-foreground">
                            {timeRange}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div
                            className="p-1.5 rounded-lg"
                            style={{ backgroundColor: `${zoneColor}15` }}
                        >
                            <MapPin className="h-4 w-4" style={{ color: zoneColor }} />
                        </div>
                        <span className="text-[13px] font-bold text-foreground text-right truncate max-w-[100px]">
                            {shift.zone.name}
                        </span>
                    </div>
                </div>

                {/* Teammates Section */}
                <div className="pt-2 border-t border-dashed border-border flex-grow">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                            Compañeros
                        </span>
                        {isResponsable && (
                            <Badge className="bg-amber-100 text-amber-700 text-[9px] border-none py-0 h-4">
                                Responsable
                            </Badge>
                        )}
                    </div>

                    {teammates.length === 0 ? (
                        <p className="text-[11px] text-muted-foreground italic py-1">Sin compañeros asignados aún</p>
                    ) : (
                        <div className="space-y-2">
                            {teammates.map((teammate) => (
                                <div key={teammate.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/40 group-hover:bg-muted/60 transition-colors border border-border/50">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <div
                                            className="h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
                                            style={{ backgroundColor: `${zoneColor}15`, color: zoneColor }}
                                        >
                                            {teammate.firstName[0]}
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-[12px] font-bold text-foreground leading-tight truncate">
                                                {formatDisplayName(teammate.firstName, teammate.lastName)}
                                            </span>
                                            <span className="text-[10px] text-muted-foreground">{teammate.phone}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0">
                                        <a
                                            href={`https://wa.me/${teammate.phone?.replace(/\D/g, "")}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-1.5 hover:bg-green-50 rounded-lg transition-colors text-green-600"
                                            title="WhatsApp"
                                        >
                                            <MessageCircle className="h-4 w-4" />
                                        </a>
                                        <a
                                            href={`tel:${teammate.phone}`}
                                            className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors text-blue-600"
                                            title="Llamar"
                                        >
                                            <Phone className="h-4 w-4" />
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </Card>
    );
}
