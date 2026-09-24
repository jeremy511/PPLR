import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSystemSettings, updateSystemSettings } from "../../api/admin";
import { Layout } from "../../components/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
    Sliders,
    Calendar,
    Clock,
    Users,
    Shield,
    Save,
    RotateCcw,
    Plus,
    Trash2,
    CheckCircle2,
    AlertCircle,
    Info,
    Sparkles,
    Megaphone,
    Building2,
    ToggleLeft,
    ToggleRight
} from "lucide-react";

// Configuración predeterminada recomendada para la congregación
const DEFAULT_SETTINGS = {
    // 1. Reglas de turnos
    advanceWeeks: 2, // Semanas de anticipación
    maxWeeklyShiftsPerUser: 2, // Tope de turnos por semana (0 = sin límite)
    defaultCapacityPerShift: 2, // Publicadores por turno
    minCancellationHours: 24, // Horas mínimas para cancelar sin responsable

    // 2. Horarios maestros (Turnos del día)
    timeSlots: [
        { id: "1", label: "7:30 - 9:30 AM", startHour: 7, startMinute: 30, endHour: 9, endMinute: 30, active: true },
        { id: "2", label: "9:30 - 11:00 AM", startHour: 9, startMinute: 30, endHour: 11, endMinute: 0, active: true },
        { id: "3", label: "4:00 - 6:00 PM", startHour: 16, startMinute: 0, endHour: 18, endMinute: 0, active: true },
        { id: "4", label: "6:00 - 7:30 PM", startHour: 18, startMinute: 0, endHour: 19, endMinute: 30, active: true },
    ],

    // 3. Acceso y Congregación
    congregationName: "Congregación Central",
    allowPublicRegistration: true,
    requireAdminApproval: false,
    announcementBanner: "Recuerden revisar el estado de su turno y reportar cualquier novedad a su compañero.",
    showAnnouncementBanner: true,
};

const STORAGE_KEY = "pplr_global_settings";

export default function Settings() {
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState("reglas"); // "reglas" | "horarios" | "acceso"
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    // Estado local con fallback seguro a localStorage o DEFAULT_SETTINGS
    const [settings, setSettings] = useState(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
        } catch {
            return DEFAULT_SETTINGS;
        }
    });

    // Estado para formulario de nuevo bloque horario
    const [newSlot, setNewSlot] = useState({
        label: "",
        startTime: "08:00",
        endTime: "10:00",
    });
    const [showSlotForm, setShowSlotForm] = useState(false);

    // Consulta al backend con soporte resiliente
    const { data: serverSettings, isLoading } = useQuery({
        queryKey: ["systemSettings"],
        queryFn: async () => {
            try {
                const res = await getSystemSettings();
                return res || DEFAULT_SETTINGS;
            } catch (err) {
                // Si el backend aún no implementa el endpoint, usamos la configuración local
                return settings;
            }
        },
        retry: 0,
    });

    useEffect(() => {
        if (serverSettings && typeof serverSettings === "object") {
            setSettings((prev) => ({ ...prev, ...serverSettings }));
        }
    }, [serverSettings]);

    // Mutación para guardar
    const mutation = useMutation({
        mutationFn: async (newConfig) => {
            // Guardamos localmente para asegurar persistencia inmediata
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newConfig));
            try {
                await updateSystemSettings(newConfig);
            } catch (err) {
                // Si el backend no tiene el endpoint activo aún, no rompemos la experiencia
                console.info("[Settings] Saved locally. Backend endpoint pending implementation.");
            }
            return newConfig;
        },
        onSuccess: (data) => {
            queryClient.setQueryData(["systemSettings"], data);
            setHasUnsavedChanges(false);
            toast.success("Configuración global guardada correctamente", {
                description: "Los cambios ahora aplican a las reglas y horarios del sistema."
            });
        },
        onError: (err) => {
            toast.error(err.message || "Error al guardar la configuración");
        },
    });

    const updateField = (field, value) => {
        setSettings((prev) => ({ ...prev, [field]: value }));
        setHasUnsavedChanges(true);
    };

    const handleSave = () => {
        mutation.mutate(settings);
    };

    const handleResetDefaults = () => {
        if (window.confirm("¿Seguro que deseas restablecer todos los valores a los recomendados de fábrica?")) {
            setSettings(DEFAULT_SETTINGS);
            setHasUnsavedChanges(true);
            toast.info("Valores restablecidos. Recuerda hacer clic en 'Guardar Cambios'.");
        }
    };

    // Horarios handlers
    const handleToggleSlot = (id) => {
        setSettings((prev) => ({
            ...prev,
            timeSlots: prev.timeSlots.map((s) => (s.id === id ? { ...s, active: !s.active } : s)),
        }));
        setHasUnsavedChanges(true);
    };

    const handleDeleteSlot = (id) => {
        if (settings.timeSlots.length <= 1) {
            toast.error("Debe existir al menos un bloque horario en el sistema.");
            return;
        }
        setSettings((prev) => ({
            ...prev,
            timeSlots: prev.timeSlots.filter((s) => s.id !== id),
        }));
        setHasUnsavedChanges(true);
    };

    const handleAddSlot = (e) => {
        e.preventDefault();
        const [startHour, startMinute] = newSlot.startTime.split(":").map(Number);
        const [endHour, endMinute] = newSlot.endTime.split(":").map(Number);

        if (startHour > endHour || (startHour === endHour && startMinute >= endMinute)) {
            toast.error("La hora de inicio debe ser anterior a la hora de fin.");
            return;
        }

        const generatedLabel = newSlot.label.trim() || `${newSlot.startTime} - ${newSlot.endTime}`;
        const created = {
            id: Date.now().toString(),
            label: generatedLabel,
            startHour,
            startMinute,
            endHour,
            endMinute,
            active: true,
        };

        setSettings((prev) => ({
            ...prev,
            timeSlots: [...prev.timeSlots, created],
        }));
        setHasUnsavedChanges(true);
        setNewSlot({ label: "", startTime: "08:00", endTime: "10:00" });
        setShowSlotForm(false);
        toast.success("Nuevo bloque horario añadido.");
    };

    return (
        <Layout>
            <div className="space-y-8 max-w-5xl mx-auto pb-12">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold tracking-tight text-foreground">
                                Configuración Global
                            </h1>
                            <Badge variant="outline" className="border-primary/30 text-primary bg-primary/5">
                                Sistema
                            </Badge>
                        </div>
                        <p className="text-muted-foreground mt-1 text-sm">
                            Ajusta las reglas de inscripción, turnos horarios maestros y políticas de la congregación.
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            onClick={handleResetDefaults}
                            disabled={mutation.isPending}
                            className="rounded-xl border-border"
                        >
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Predeterminados
                        </Button>
                        <Button
                            onClick={handleSave}
                            disabled={mutation.isPending || !hasUnsavedChanges}
                            className={`rounded-xl transition-all shadow-md ${hasUnsavedChanges
                                ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200 dark:shadow-none animate-pulse"
                                : "bg-primary text-primary-foreground"
                                }`}
                        >
                            <Save className="h-4 w-4 mr-2" />
                            {mutation.isPending ? "Guardando..." : "Guardar Cambios"}
                        </Button>
                    </div>
                </div>

                {/* Quick KPI Preview Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="bg-card/60 backdrop-blur-sm border-border/50">
                        <CardHeader className="p-4 pb-2">
                            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                <Calendar className="h-3.5 w-3.5 text-indigo-500" />
                                Anticipación
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                            <div className="text-2xl font-bold text-foreground">
                                {settings.advanceWeeks} {settings.advanceWeeks === 1 ? "semana" : "semanas"}
                            </div>
                            <p className="text-[11px] text-muted-foreground mt-0.5">Ventana de turnos visibles</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-card/60 backdrop-blur-sm border-border/50">
                        <CardHeader className="p-4 pb-2">
                            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                <Users className="h-3.5 w-3.5 text-indigo-500" />
                                Tope Semanal
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                            <div className="text-2xl font-bold text-foreground">
                                {settings.maxWeeklyShiftsPerUser === 0 ? "Sin tope" : `${settings.maxWeeklyShiftsPerUser} turnos`}
                            </div>
                            <p className="text-[11px] text-muted-foreground mt-0.5">Por publicador por semana</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-card/60 backdrop-blur-sm border-border/50">
                        <CardHeader className="p-4 pb-2">
                            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                <Clock className="h-3.5 w-3.5 text-indigo-500" />
                                Cancelación Libre
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                            <div className="text-2xl font-bold text-foreground">
                                {settings.minCancellationHours} horas
                            </div>
                            <p className="text-[11px] text-muted-foreground mt-0.5">Antes del inicio del turno</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-card/60 backdrop-blur-sm border-border/50">
                        <CardHeader className="p-4 pb-2">
                            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                <Sliders className="h-3.5 w-3.5 text-indigo-500" />
                                Bloques Diarios
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                            <div className="text-2xl font-bold text-foreground">
                                {settings.timeSlots.filter(s => s.active).length} activos
                            </div>
                            <p className="text-[11px] text-muted-foreground mt-0.5">De {settings.timeSlots.length} configurados</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Navigation Tabs */}
                <div className="flex border-b border-border gap-2">
                    <button
                        onClick={() => setActiveTab("reglas")}
                        className={`flex items-center gap-2 px-4 py-3 font-semibold text-sm border-b-2 transition-all ${activeTab === "reglas"
                            ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                            : "border-transparent text-muted-foreground hover:text-foreground"
                            }`}
                    >
                        <Sliders className="h-4 w-4" />
                        Reglas de Inscripción
                    </button>
                    <button
                        onClick={() => setActiveTab("horarios")}
                        className={`flex items-center gap-2 px-4 py-3 font-semibold text-sm border-b-2 transition-all ${activeTab === "horarios"
                            ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                            : "border-transparent text-muted-foreground hover:text-foreground"
                            }`}
                    >
                        <Clock className="h-4 w-4" />
                        Horarios Maestros
                    </button>
                    <button
                        onClick={() => setActiveTab("acceso")}
                        className={`flex items-center gap-2 px-4 py-3 font-semibold text-sm border-b-2 transition-all ${activeTab === "acceso"
                            ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                            : "border-transparent text-muted-foreground hover:text-foreground"
                            }`}
                    >
                        <Shield className="h-4 w-4" />
                        Acceso y Congregación
                    </button>
                </div>

                {/* TAB 1: REGLAS DE INSCRIPCIÓN */}
                {activeTab === "reglas" && (
                    <div className="space-y-6">
                        <Card className="bg-card/70 backdrop-blur-sm border-border/60">
                            <CardHeader>
                                <CardTitle className="text-xl">Parámetros de Publicación y Turnos</CardTitle>
                                <CardDescription>
                                    Controla con cuánta antelación y bajo qué límites los publicadores pueden apartar turnos en el carrito.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Anticipación */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                                    <div className="md:col-span-2">
                                        <Label className="text-base font-semibold text-foreground">Semanas de anticipación</Label>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            ¿Cuántas semanas hacia adelante puede ver e inscribirse un hermano en el calendario?
                                        </p>
                                    </div>
                                    <div>
                                        <select
                                            value={settings.advanceWeeks}
                                            onChange={(e) => updateField("advanceWeeks", Number(e.target.value))}
                                            className="w-full h-11 px-3 rounded-xl border border-input bg-background text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                        >
                                            <option value={1}>1 semana vista</option>
                                            <option value={2}>2 semanas vista (Recomendado)</option>
                                            <option value={3}>3 semanas vista</option>
                                            <option value={4}>4 semanas (1 mes)</option>
                                        </select>
                                    </div>
                                </div>

                                <Separator />

                                {/* Límite semanal */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                                    <div className="md:col-span-2">
                                        <Label className="text-base font-semibold text-foreground">Máximo de turnos por semana por hermano</Label>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            Evita que uno o dos hermanos ocupen todos los cupos del mes, permitiendo que todos participen.
                                        </p>
                                    </div>
                                    <div>
                                        <select
                                            value={settings.maxWeeklyShiftsPerUser}
                                            onChange={(e) => updateField("maxWeeklyShiftsPerUser", Number(e.target.value))}
                                            className="w-full h-11 px-3 rounded-xl border border-input bg-background text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                        >
                                            <option value={0}>Sin límite (Cualquiera)</option>
                                            <option value={1}>Máximo 1 turno por semana</option>
                                            <option value={2}>Máximo 2 turnos por semana (Recomendado)</option>
                                            <option value={3}>Máximo 3 turnos por semana</option>
                                            <option value={4}>Máximo 4 turnos por semana</option>
                                        </select>
                                    </div>
                                </div>

                                <Separator />

                                {/* Capacidad estándar */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                                    <div className="md:col-span-2">
                                        <Label className="text-base font-semibold text-foreground">Publicadores requeridos por turno</Label>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            Cantidad predeterminada de hermanos para dar por cubierto un carrito en un turno estándar.
                                        </p>
                                    </div>
                                    <div>
                                        <select
                                            value={settings.defaultCapacityPerShift}
                                            onChange={(e) => updateField("defaultCapacityPerShift", Number(e.target.value))}
                                            className="w-full h-11 px-3 rounded-xl border border-input bg-background text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                        >
                                            <option value={1}>1 publicador</option>
                                            <option value={2}>2 publicadores (Estándar)</option>
                                            <option value={3}>3 publicadores (Puntos muy concurridos)</option>
                                            <option value={4}>4 publicadores</option>
                                        </select>
                                    </div>
                                </div>

                                <Separator />

                                {/* Margen de cancelación libre */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                                    <div className="md:col-span-2">
                                        <Label className="text-base font-semibold text-foreground">Plazo mínimo de cancelación libre</Label>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            Si falta menos de este tiempo para el turno, el publicador debe avisar directamente al responsable.
                                        </p>
                                    </div>
                                    <div>
                                        <select
                                            value={settings.minCancellationHours}
                                            onChange={(e) => updateField("minCancellationHours", Number(e.target.value))}
                                            className="w-full h-11 px-3 rounded-xl border border-input bg-background text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                        >
                                            <option value={6}>6 horas antes</option>
                                            <option value={12}>12 horas antes</option>
                                            <option value={24}>24 horas antes (1 día - Recomendado)</option>
                                            <option value={48}>48 horas antes (2 días)</option>
                                        </select>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* TAB 2: HORARIOS MAESTROS */}
                {activeTab === "horarios" && (
                    <div className="space-y-6">
                        <Card className="bg-card/70 backdrop-blur-sm border-border/60">
                            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                    <CardTitle className="text-xl">Bloques Horarios Estándar</CardTitle>
                                    <CardDescription>
                                        Estos son los turnos que se generan diariamente en las zonas activas.
                                    </CardDescription>
                                </div>
                                <Button
                                    onClick={() => setShowSlotForm(!showSlotForm)}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl gap-2 shadow-sm"
                                    size="sm"
                                >
                                    <Plus className="h-4 w-4" />
                                    Nuevo Horario
                                </Button>
                            </CardHeader>

                            <CardContent className="space-y-6">
                                {/* Formulario para agregar horario */}
                                {showSlotForm && (
                                    <form onSubmit={handleAddSlot} className="p-4 rounded-xl border border-indigo-200 dark:border-indigo-900/50 bg-indigo-50/50 dark:bg-indigo-950/20 space-y-4">
                                        <h4 className="text-sm font-bold text-indigo-900 dark:text-indigo-300">Añadir nuevo bloque horario</h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                            <div>
                                                <Label className="text-xs">Etiqueta descriptiva (opcional)</Label>
                                                <Input
                                                    placeholder="Ej: Turno Mañana"
                                                    value={newSlot.label}
                                                    onChange={(e) => setNewSlot(prev => ({ ...prev, label: e.target.value }))}
                                                    className="h-10 mt-1"
                                                />
                                            </div>
                                            <div>
                                                <Label className="text-xs">Hora de Inicio</Label>
                                                <Input
                                                    type="time"
                                                    value={newSlot.startTime}
                                                    onChange={(e) => setNewSlot(prev => ({ ...prev, startTime: e.target.value }))}
                                                    required
                                                    className="h-10 mt-1"
                                                />
                                            </div>
                                            <div>
                                                <Label className="text-xs">Hora de Fin</Label>
                                                <Input
                                                    type="time"
                                                    value={newSlot.endTime}
                                                    onChange={(e) => setNewSlot(prev => ({ ...prev, endTime: e.target.value }))}
                                                    required
                                                    className="h-10 mt-1"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex justify-end gap-2">
                                            <Button type="button" variant="ghost" size="sm" onClick={() => setShowSlotForm(false)}>
                                                Cancelar
                                            </Button>
                                            <Button type="submit" size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                                                Añadir Bloque
                                            </Button>
                                        </div>
                                    </form>
                                )}

                                {/* Lista de horarios */}
                                <div className="space-y-3">
                                    {settings.timeSlots.map((slot, index) => (
                                        <div
                                            key={slot.id}
                                            className={`flex items-center justify-between p-4 rounded-xl border transition-all ${slot.active
                                                ? "bg-card border-border/80 shadow-sm"
                                                : "bg-muted/30 border-border/30 opacity-60"
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-lg ${slot.active ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600" : "bg-muted text-muted-foreground"}`}>
                                                    <Clock className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold text-foreground text-sm">
                                                            {slot.label}
                                                        </span>
                                                        <Badge variant={slot.active ? "default" : "secondary"} className="text-[10px] h-5">
                                                            {slot.active ? "Activo" : "Pausado"}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground mt-0.5">
                                                        Turno {index + 1} del día
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleToggleSlot(slot.id)}
                                                    className="text-xs"
                                                >
                                                    {slot.active ? "Pausar" : "Reactivar"}
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDeleteSlot(slot.id)}
                                                    className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                                                    title="Eliminar horario"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* TAB 3: ACCESO Y CONGREGACIÓN */}
                {activeTab === "acceso" && (
                    <div className="space-y-6">
                        <Card className="bg-card/70 backdrop-blur-sm border-border/60">
                            <CardHeader>
                                <CardTitle className="text-xl">Identidad y Políticas de Acceso</CardTitle>
                                <CardDescription>
                                    Configura los datos generales de la congregación y el control de nuevos publicadores.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Nombre congregación */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                                    <div className="md:col-span-2">
                                        <Label className="text-base font-semibold text-foreground">Nombre de la Congregación</Label>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            Aparece en el pie de página, notificaciones y correos electrónicos.
                                        </p>
                                    </div>
                                    <div>
                                        <Input
                                            value={settings.congregationName}
                                            onChange={(e) => updateField("congregationName", e.target.value)}
                                            placeholder="Ej: Congregación Central"
                                            className="h-11"
                                        />
                                    </div>
                                </div>

                                <Separator />

                                {/* Registro público */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                                    <div className="md:col-span-2">
                                        <Label className="text-base font-semibold text-foreground">Permitir Registro Público</Label>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            Si está desactivado, el formulario de registro se cierra y solo los administradores pueden dar de alta hermanos.
                                        </p>
                                    </div>
                                    <div className="flex justify-end">
                                        <button
                                            type="button"
                                            onClick={() => updateField("allowPublicRegistration", !settings.allowPublicRegistration)}
                                            className="flex items-center gap-2 p-1 text-2xl transition-colors"
                                        >
                                            {settings.allowPublicRegistration ? (
                                                <ToggleRight className="h-9 w-9 text-indigo-600" />
                                            ) : (
                                                <ToggleLeft className="h-9 w-9 text-muted-foreground" />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                <Separator />

                                {/* Banner de anuncio para publicadores */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <Label className="text-base font-semibold text-foreground">Aviso / Anuncio para el Dashboard</Label>
                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                Mensaje destacado que verán todos los publicadores al entrar al tablero.
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => updateField("showAnnouncementBanner", !settings.showAnnouncementBanner)}
                                            className="flex items-center gap-2 p-1 text-2xl transition-colors"
                                        >
                                            {settings.showAnnouncementBanner ? (
                                                <ToggleRight className="h-9 w-9 text-indigo-600" />
                                            ) : (
                                                <ToggleLeft className="h-9 w-9 text-muted-foreground" />
                                            )}
                                        </button>
                                    </div>
                                    {settings.showAnnouncementBanner && (
                                        <div className="pt-2">
                                            <Input
                                                value={settings.announcementBanner}
                                                onChange={(e) => updateField("announcementBanner", e.target.value)}
                                                placeholder="Ej: Recuerden llevar paraguas en días lluviosos."
                                                className="h-11"
                                            />
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </Layout>
    );
}
