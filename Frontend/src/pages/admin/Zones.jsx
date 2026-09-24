import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getZones } from "../../api/shifts";
import { createZone, updateZone, deleteZone } from "../../api/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
    Pencil,
    Trash2,
    Plus,
    Loader2,
    Sliders,
    Calendar,
    Clock,
    Users,
    Info,
    Check,
    ToggleLeft,
    ToggleRight,
    MapPin,
    Building2
} from "lucide-react";
import { toast } from "sonner";
import { Layout } from "../../components/Layout";

// Lista de colores preestablecidos para zonas
const COLORS = [
    "#ef4444", "#f97316", "#f59e0b", "#eab308",
    "#84cc16", "#22c55e", "#10b981", "#14b8a6",
    "#06b6d4", "#0ea5e9", "#3b82f6", "#6366f1",
    "#8b5cf6", "#d946ef", "#ec4899", "#f43f5e",
];

const WEEK_DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

const DEFAULT_CUSTOM_RULES = {
    isCustom: false,
    capacity: 2,
    operatingDays: [...WEEK_DAYS],
    useCustomSlots: false,
    customSlots: [
        { id: "1", label: "9:00 - 11:30 AM", startTime: "09:00", endTime: "11:30" },
        { id: "2", label: "11:30 - 2:00 PM", startTime: "11:30", endTime: "14:00" },
    ],
    isTemporaryEvent: false,
    startDate: "",
    endDate: "",
};

// Helpers para persistir reglas específicas de cada estación
export function getZoneCustomRules(zoneOrId) {
    if (!zoneOrId) return DEFAULT_CUSTOM_RULES;
    if (typeof zoneOrId === 'object' && zoneOrId.customRules) {
        return { ...DEFAULT_CUSTOM_RULES, ...zoneOrId.customRules };
    }
    const zoneId = typeof zoneOrId === 'object' ? zoneOrId.id : zoneOrId;
    try {
        const stored = localStorage.getItem(`pplr_zone_rules_${zoneId}`);
        return stored ? { ...DEFAULT_CUSTOM_RULES, ...JSON.parse(stored) } : DEFAULT_CUSTOM_RULES;
    } catch {
        return DEFAULT_CUSTOM_RULES;
    }
}

export function saveZoneCustomRules(zoneId, rules) {
    if (!zoneId) return;
    try {
        localStorage.setItem(`pplr_zone_rules_${zoneId}`, JSON.stringify(rules));
    } catch (e) {
        console.warn("Could not save zone rules to localStorage", e);
    }
}

export default function Zones() {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalTab, setModalTab] = useState("general"); // "general" | "reglas"
    const [editingZone, setEditingZone] = useState(null);
    const [deleteId, setDeleteId] = useState(null);

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        color: "#6366f1",
        active: true,
        location: "",
        warehouse: "",
        instructions: "",
        customRules: { ...DEFAULT_CUSTOM_RULES },
    });

    const [newSlotInput, setNewSlotInput] = useState({
        label: "",
        startTime: "09:00",
        endTime: "11:30"
    });

    const { data: zones = [], isLoading, error, refetch } = useQuery({
        queryKey: ["zones", "all"],
        queryFn: () => getZones(true),
    });

    const createMutation = useMutation({
        mutationFn: createZone,
        onSuccess: (newZone) => {
            if (newZone?.id && formData.customRules?.isCustom) {
                saveZoneCustomRules(newZone.id, formData.customRules);
            }
            queryClient.invalidateQueries({ queryKey: ["zones"] });
            setIsModalOpen(false);
            toast.success("Zona creada correctamente");
            resetForm();
        },
        onError: (err) => toast.error(err.message || "Error al crear la zona"),
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => updateZone(id, data),
        onSuccess: (updatedZone, variables) => {
            const targetId = variables.id;
            saveZoneCustomRules(targetId, formData.customRules);
            queryClient.invalidateQueries({ queryKey: ["zones"] });
            setIsModalOpen(false);
            toast.success("Zona actualizada correctamente");
            resetForm();
        },
        onError: (err) => toast.error(err.message || "Error al actualizar la zona"),
    });

    const deleteMutation = useMutation({
        mutationFn: deleteZone,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["zones"] });
            setDeleteId(null);
            toast.success("Zona eliminada correctamente");
        },
        onError: (err) => toast.error(err.message || "Error al eliminar la zona"),
    });

    const resetForm = () => {
        setEditingZone(null);
        setModalTab("general");
        setFormData({
            name: "",
            description: "",
            color: "#6366f1",
            active: true,
            location: "",
            warehouse: "",
            instructions: "",
            customRules: { ...DEFAULT_CUSTOM_RULES },
        });
    };

    const handleEdit = (zone) => {
        const savedRules = getZoneCustomRules(zone);
        setEditingZone(zone);
        setModalTab("general");
        setFormData({
            name: zone.name,
            description: zone.description || "",
            color: zone.color || "#6366f1",
            active: zone.active !== undefined ? zone.active : true,
            location: zone.location || "",
            warehouse: zone.warehouse || "",
            instructions: zone.instructions || "",
            customRules: savedRules,
        });
        setIsModalOpen(true);
    };

    const handleDelete = (id) => {
        setDeleteId(id);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const payload = {
            name: formData.name,
            description: formData.description,
            color: formData.color,
            active: formData.active,
            location: formData.location,
            warehouse: formData.warehouse,
            instructions: formData.instructions,
            customRules: formData.customRules,
        };

        if (editingZone) {
            updateMutation.mutate({ id: editingZone.id, data: payload });
        } else {
            createMutation.mutate(payload);
        }
    };

    const toggleOperatingDay = (day) => {
        const current = formData.customRules.operatingDays || [];
        const exists = current.includes(day);
        const updated = exists
            ? current.filter(d => d !== day)
            : [...current, day];

        if (updated.length === 0) {
            toast.error("La estación debe operar al menos 1 día de la semana.");
            return;
        }

        setFormData(prev => ({
            ...prev,
            customRules: {
                ...prev.customRules,
                operatingDays: updated,
            }
        }));
    };

    const handleAddCustomSlot = (e) => {
        e.preventDefault();
        const slotLabel = newSlotInput.label.trim() || `${newSlotInput.startTime} - ${newSlotInput.endTime}`;
        const newSlot = {
            id: Date.now().toString(),
            label: slotLabel,
            startTime: newSlotInput.startTime,
            endTime: newSlotInput.endTime,
        };
        setFormData(prev => ({
            ...prev,
            customRules: {
                ...prev.customRules,
                customSlots: [...(prev.customRules.customSlots || []), newSlot]
            }
        }));
        setNewSlotInput({ label: "", startTime: "09:00", endTime: "11:30" });
    };

    const handleRemoveCustomSlot = (slotId) => {
        setFormData(prev => ({
            ...prev,
            customRules: {
                ...prev.customRules,
                customSlots: (prev.customRules.customSlots || []).filter(s => s.id !== slotId)
            }
        }));
    };

    return (
        <Layout>
            <div className="bg-card rounded-2xl shadow-sm border border-border p-6 md:p-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                        <div className="flex items-center gap-3">
                            <h2 className="text-2xl font-bold tracking-tight text-foreground">Gestión de Zonas y Estaciones</h2>
                            <Badge variant="outline" className="border-primary/30 text-primary bg-primary/5">
                                {zones.length} {zones.length === 1 ? 'Estación' : 'Estaciones'}
                            </Badge>
                        </div>
                        <p className="text-muted-foreground text-sm mt-1">
                            Configura las estaciones de predicación, puntos de carritos y personaliza sus reglas de horario.
                        </p>
                    </div>
                    <Button onClick={() => { resetForm(); setIsModalOpen(true); }} className="rounded-xl gap-2">
                        <Plus className="h-4 w-4" />
                        Nueva Zona
                    </Button>
                </div>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center p-12 gap-4">
                        <div className="loader" />
                        <p className="text-muted-foreground text-xs font-medium animate-pulse">Cargando zonas...</p>
                    </div>
                ) : error ? (
                    <div className="p-8 text-center bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 rounded-2xl my-6">
                        <h3 className="text-base font-bold text-red-900 dark:text-red-300">No se pudieron cargar las zonas</h3>
                        <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                            {error.message || "Ocurrió un problema de comunicación con el servidor."}
                        </p>
                        <Button onClick={() => refetch()} className="mt-4 bg-red-600 hover:bg-red-700 text-white" size="sm">
                            Reintentar
                        </Button>
                    </div>
                ) : (
                    <div className="border border-border/60 rounded-xl overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-12">Color</TableHead>
                                    <TableHead>Estación / Zona</TableHead>
                                    <TableHead>Almacén / Depósito</TableHead>
                                    <TableHead>Reglas y Horarios</TableHead>
                                    <TableHead>Estado</TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {zones.map((zone) => {
                                    const rules = getZoneCustomRules(zone);
                                    return (
                                        <TableRow key={zone.id} className="hover:bg-muted/40 transition-colors">
                                            <TableCell>
                                                <div
                                                    className="h-6 w-6 rounded-full border border-border/60 shadow-sm"
                                                    style={{ backgroundColor: zone.color || "#6366f1" }}
                                                    title={zone.color}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-semibold text-foreground">{zone.name}</div>
                                                {zone.location && (
                                                    <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                                        <MapPin className="h-3 w-3 text-muted-foreground" />
                                                        {zone.location}
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {zone.warehouse ? (
                                                    <div className="text-xs font-medium text-foreground flex items-center gap-1.5">
                                                        <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                                                        {zone.warehouse}
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-muted-foreground italic">No asignado</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {rules.isCustom ? (
                                                    <div className="flex flex-col gap-1 items-start">
                                                        <Badge className="bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-900/40 text-[11px]">
                                                            Personalizada ({rules.capacity} pubs)
                                                        </Badge>
                                                        <span className="text-[11px] text-muted-foreground">
                                                            {rules.operatingDays?.length < 7
                                                                ? `${rules.operatingDays?.length} días/sem`
                                                                : "Todos los días"}
                                                            {rules.useCustomSlots ? " • Horarios propios" : " • Horarios estándar"}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <Badge variant="outline" className="text-[11px] text-muted-foreground font-normal">
                                                        Estándar Global (Heredada)
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${zone.active
                                                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                                    : "bg-muted text-muted-foreground"
                                                    }`}>
                                                    {zone.active ? "Visible" : "Oculta"}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="icon" onClick={() => handleEdit(zone)} title="Editar estación">
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20" onClick={() => handleDelete(zone.id)} title="Eliminar">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </div>

            {/* Modal para Crear / Editar Zona con Pestaña de Reglas Propias */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-[620px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold">
                            {editingZone ? `Editar Estación: ${editingZone.name}` : "Nueva Estación / Zona"}
                        </DialogTitle>
                    </DialogHeader>

                    {/* Modal Tabs Header */}
                    <div className="flex border-b border-border gap-4 mt-2">
                        <button
                            type="button"
                            onClick={() => setModalTab("general")}
                            className={`pb-2.5 text-sm font-semibold border-b-2 transition-all ${modalTab === "general"
                                ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                                : "border-transparent text-muted-foreground hover:text-foreground"
                                }`}
                        >
                            Información General
                        </button>
                        <button
                            type="button"
                            onClick={() => setModalTab("reglas")}
                            className={`pb-2.5 text-sm font-semibold border-b-2 transition-all flex items-center gap-1.5 ${modalTab === "reglas"
                                ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                                : "border-transparent text-muted-foreground hover:text-foreground"
                                }`}
                        >
                            <Sliders className="h-3.5 w-3.5" />
                            Reglas y Horarios Propios
                            {formData.customRules.isCustom && (
                                <span className="h-2 w-2 rounded-full bg-indigo-600" />
                            )}
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5 py-4">
                        {/* TAB 1: INFORMACIÓN GENERAL */}
                        {modalTab === "general" && (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Nombre de la Estación / Punto</Label>
                                    <Input
                                        id="name"
                                        placeholder="Ej: Estación Central o Plaza Mayor"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                        className="h-10"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">Descripción breve</Label>
                                    <Input
                                        id="description"
                                        placeholder="Ej: Punto de alto tráfico peatonal cerca del acceso norte"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="h-10"
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="location">Ubicación física / Referencia</Label>
                                        <Input
                                            id="location"
                                            placeholder="Ej: Av. Principal con Calle 4"
                                            value={formData.location || ""}
                                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                            className="h-10"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="warehouse">Almacén / Depósito del Carrito</Label>
                                        <Input
                                            id="warehouse"
                                            placeholder="Ej: Salón B - Armario 2"
                                            value={formData.warehouse || ""}
                                            onChange={(e) => setFormData({ ...formData, warehouse: e.target.value })}
                                            className="h-10"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="instructions">Instrucciones para los publicadores</Label>
                                    <textarea
                                        id="instructions"
                                        className="flex min-h-[75px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                                        placeholder="Instrucciones específicas (ej: retirar llaves con el conserje, dejar el carrito trabado)..."
                                        value={formData.instructions || ""}
                                        onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                                    />
                                </div>

                                <div className="flex items-center space-x-2 pt-1">
                                    <input
                                        type="checkbox"
                                        id="active"
                                        checked={formData.active}
                                        onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <Label htmlFor="active" className="cursor-pointer text-sm font-medium">
                                        Estación activa y visible en el Dashboard
                                    </Label>
                                </div>

                                <div className="space-y-2 pt-1">
                                    <Label className="text-xs uppercase tracking-wider text-muted-foreground font-bold">
                                        Color distintivo en el calendario
                                    </Label>
                                    <div className="grid grid-cols-8 gap-2 mt-2">
                                        {COLORS.map((color) => (
                                            <div
                                                key={color}
                                                onClick={() => setFormData({ ...formData, color })}
                                                className={`h-7 w-7 rounded-full cursor-pointer transition-transform hover:scale-110 border-2 ${formData.color === color ? 'border-primary ring-2 ring-primary/40' : 'border-transparent'}`}
                                                style={{ backgroundColor: color }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* TAB 2: REGLAS Y HORARIOS PROPIOS */}
                        {modalTab === "reglas" && (
                            <div className="space-y-5">
                                {/* Toggle Principal */}
                                <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-muted/30">
                                    <div>
                                        <div className="font-semibold text-sm text-foreground">
                                            Personalizar reglas para esta estación
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            Sobrescribe la configuración global de la congregación solo para este punto.
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setFormData(prev => ({
                                            ...prev,
                                            customRules: { ...prev.customRules, isCustom: !prev.customRules.isCustom }
                                        }))}
                                        className="text-2xl transition-colors"
                                    >
                                        {formData.customRules.isCustom ? (
                                            <ToggleRight className="h-8 w-8 text-indigo-600" />
                                        ) : (
                                            <ToggleLeft className="h-8 w-8 text-muted-foreground" />
                                        )}
                                    </button>
                                </div>

                                {!formData.customRules.isCustom ? (
                                    <div className="p-5 rounded-xl border border-indigo-100 dark:border-indigo-900/40 bg-indigo-50/40 dark:bg-indigo-950/20 text-xs text-indigo-900 dark:text-indigo-300 flex items-start gap-3">
                                        <Info className="h-5 w-5 shrink-0 text-indigo-600 mt-0.5" />
                                        <div className="space-y-1">
                                            <p className="font-bold">Esta estación hereda la Configuración Global:</p>
                                            <ul className="list-disc list-inside space-y-0.5 text-muted-foreground dark:text-indigo-300/80">
                                                <li>Cupo estándar de 2 publicadores por turno.</li>
                                                <li>Habilitada los 7 días de la semana (Lunes a Domingo).</li>
                                                <li>Usa los 4 bloques horarios diarios de la congregación.</li>
                                            </ul>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-5 animate-in fade-in duration-200">
                                        {/* Capacidad propia */}
                                        <div className="space-y-2">
                                            <Label className="text-sm font-semibold flex items-center gap-1.5">
                                                <Users className="h-4 w-4 text-indigo-600" />
                                                Capacidad de publicadores por turno
                                            </Label>
                                            <p className="text-xs text-muted-foreground">
                                                Por ejemplo: 3 publicadores si la zona es muy concurrida o peligrosa.
                                            </p>
                                            <div className="flex gap-2 pt-1">
                                                {[1, 2, 3, 4].map((num) => (
                                                    <button
                                                        key={num}
                                                        type="button"
                                                        onClick={() => setFormData(prev => ({
                                                            ...prev,
                                                            customRules: { ...prev.customRules, capacity: num }
                                                        }))}
                                                        className={`flex-1 py-2 rounded-xl text-sm font-bold border transition-all ${formData.customRules.capacity === num
                                                            ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                                                            : "bg-background border-border text-foreground hover:bg-muted"
                                                            }`}
                                                    >
                                                        {num} {num === 1 ? "hermano" : "hermanos"}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <Separator />

                                        {/* Días habilitados */}
                                        <div className="space-y-2">
                                            <Label className="text-sm font-semibold flex items-center gap-1.5">
                                                <Calendar className="h-4 w-4 text-indigo-600" />
                                                Días habilitados para esta estación
                                            </Label>
                                            <p className="text-xs text-muted-foreground">
                                                Selecciona qué días de la semana se abren turnos en este punto.
                                            </p>
                                            <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5 pt-1">
                                                {WEEK_DAYS.map((day) => {
                                                    const isSelected = formData.customRules.operatingDays?.includes(day);
                                                    return (
                                                        <button
                                                            key={day}
                                                            type="button"
                                                            onClick={() => toggleOperatingDay(day)}
                                                            className={`py-2 px-1 text-xs font-semibold rounded-lg border transition-all truncate ${(isSelected)
                                                                ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800"
                                                                : "bg-background text-muted-foreground border-border/60 hover:bg-muted"
                                                                }`}
                                                            title={day}
                                                        >
                                                            {day.slice(0, 3)}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        <Separator />

                                        {/* Horarios específicos */}
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <Label className="text-sm font-semibold flex items-center gap-1.5">
                                                        <Clock className="h-4 w-4 text-indigo-600" />
                                                        Horarios propios para esta estación
                                                    </Label>
                                                    <p className="text-xs text-muted-foreground">
                                                        Activa si esta zona no sigue los 4 bloques estándar.
                                                    </p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData(prev => ({
                                                        ...prev,
                                                        customRules: { ...prev.customRules, useCustomSlots: !prev.customRules.useCustomSlots }
                                                    }))}
                                                    className="text-2xl"
                                                >
                                                    {formData.customRules.useCustomSlots ? (
                                                        <ToggleRight className="h-7 w-7 text-indigo-600" />
                                                    ) : (
                                                        <ToggleLeft className="h-7 w-7 text-muted-foreground" />
                                                    )}
                                                </button>
                                            </div>

                                            {formData.customRules.useCustomSlots && (
                                                <div className="space-y-3 pt-2 bg-muted/20 p-3 rounded-xl border border-border">
                                                    <div className="space-y-2">
                                                        {(formData.customRules.customSlots || []).map((slot) => (
                                                            <div key={slot.id} className="flex items-center justify-between bg-card p-2.5 rounded-lg border border-border text-xs">
                                                                <span className="font-semibold">{slot.label}</span>
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-6 w-6 text-red-500 hover:text-red-700"
                                                                    onClick={() => handleRemoveCustomSlot(slot.id)}
                                                                >
                                                                    <Trash2 className="h-3 w-3" />
                                                                </Button>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    {/* Agregar horario a la zona */}
                                                    <div className="flex gap-2 items-center pt-1">
                                                        <Input
                                                            type="time"
                                                            value={newSlotInput.startTime}
                                                            onChange={(e) => setNewSlotInput(prev => ({ ...prev, startTime: e.target.value }))}
                                                            className="h-8 text-xs"
                                                        />
                                                        <span className="text-xs text-muted-foreground">a</span>
                                                        <Input
                                                            type="time"
                                                            value={newSlotInput.endTime}
                                                            onChange={(e) => setNewSlotInput(prev => ({ ...prev, endTime: e.target.value }))}
                                                            className="h-8 text-xs"
                                                        />
                                                        <Button
                                                            type="button"
                                                            size="sm"
                                                            onClick={handleAddCustomSlot}
                                                            className="h-8 text-xs bg-indigo-600 hover:bg-indigo-700 text-white shrink-0"
                                                        >
                                                            <Plus className="h-3.5 w-3.5 mr-1" />
                                                            Agregar
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        <DialogFooter className="pt-3 border-t border-border">
                            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                                {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {editingZone ? "Guardar Cambios" : "Crear Estación"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal de confirmación para eliminar */}
            <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>¿Estás seguro de eliminar esta estación?</DialogTitle>
                        <DialogTitle className="text-sm font-normal text-muted-foreground pt-1">
                            Esta acción eliminará la zona de forma permanente.
                            <br />
                            <span className="text-red-500 font-bold mt-2 block">
                                Nota: Si la estación ya tiene turnos o carritos asociados, la base de datos protegerá el historial.
                            </span>
                        </DialogTitle>
                    </DialogHeader>
                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setDeleteId(null)}>Cancelar</Button>
                        <Button
                            variant="destructive"
                            onClick={() => deleteMutation.mutate(deleteId)}
                            disabled={deleteMutation.isPending}
                        >
                            {deleteMutation.isPending ? "Eliminando..." : "Sí, eliminar"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Layout>
    );
}
