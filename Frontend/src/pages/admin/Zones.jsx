import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getZones } from "../../api/shifts"; // Using public getZones, but we need admin actions too
import { createZone, updateZone, deleteZone } from "../../api/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Pencil, Trash2, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Header } from "../../components/Header";

// Helper color picker component (simple preset list)
const COLORS = [
    "#ef4444", // red
    "#f97316", // orange
    "#f59e0b", // amber
    "#eab308", // yellow
    "#84cc16", // lime
    "#22c55e", // green
    "#10b981", // emerald
    "#14b8a6", // teal
    "#06b6d4", // cyan
    "#0ea5e9", // sky
    "#3b82f6", // blue
    "#6366f1", // indigo (default)
    "#8b5cf6", // violet
    "#d946ef", // fuchsia
    "#ec4899", // pink
    "#f43f5e", // rose
];

export default function Zones() {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
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
    });

    const { data: zones = [], isLoading } = useQuery({
        queryKey: ["zones", "all"],
        queryFn: () => getZones(true),
    });

    const createMutation = useMutation({
        mutationFn: createZone,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["zones"] });
            setIsModalOpen(false);
            toast.success("Zona creada correctamente");
            resetForm();
        },
        onError: (err) => toast.error(err.message),
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => updateZone(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["zones"] });
            setIsModalOpen(false);
            toast.success("Zona actualizada correctamente");
            resetForm();
        },
        onError: (err) => toast.error(err.message),
    });

    const deleteMutation = useMutation({
        mutationFn: deleteZone,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["zones"] });
            setDeleteId(null);
            toast.success("Zona eliminada correctamente");
        },
        onError: (err) => toast.error(err.message),
    });

    const resetForm = () => {
        setEditingZone(null);
        setFormData({ name: "", description: "", color: "#6366f1", active: true, location: "", warehouse: "", instructions: "" });
    };

    const handleEdit = (zone) => {
        setEditingZone(zone);
        setFormData({
            name: zone.name,
            description: zone.description || "",
            color: zone.color || "#6366f1",
            active: zone.active !== undefined ? zone.active : true,
            location: zone.location || "",
            warehouse: zone.warehouse || "",
            instructions: zone.instructions || "",
        });
        setIsModalOpen(true);
    };

    const handleDelete = (id) => {
        setDeleteId(id);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingZone) {
            updateMutation.mutate({ id: editingZone.id, data: formData });
        } else {
            createMutation.mutate(formData);
        }
    };

    return (
        <div className="bg-background py-10 px-4 md:px-8">
            <div className="max-w-5xl mx-auto space-y-8">
                <Header />

                <div className="bg-card rounded-2xl shadow-sm border border-border p-6 md:p-8">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-2xl font-bold">Gestión de Zonas</h2>
                            <p className="text-muted-foreground">Configura las zonas de predicación y sus colores.</p>
                        </div>
                        <Button onClick={() => { resetForm(); setIsModalOpen(true); }}>
                            <Plus className="mr-2 h-4 w-4" />
                            Nueva Zona
                        </Button>
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center p-8">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Color</TableHead>
                                    <TableHead>Nombre</TableHead>
                                    <TableHead>Descripción</TableHead>
                                    <TableHead>Estado</TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {zones.map((zone) => (
                                    <TableRow key={zone.id}>
                                        <TableCell>
                                            <div
                                                className="h-6 w-6 rounded-full border border-border"
                                                style={{ backgroundColor: zone.color || "#6366f1" }}
                                                title={zone.color}
                                            />
                                        </TableCell>
                                        <TableCell className="font-medium">{zone.name}</TableCell>
                                        <TableCell>{zone.description}</TableCell>
                                        <TableCell>
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${zone.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                                                {zone.active ? "Visible" : "Oculta"}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon" onClick={() => handleEdit(zone)}>
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => handleDelete(zone.id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </div>

                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>{editingZone ? "Editar Zona" : "Nueva Zona"}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nombre</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Descripción</Label>
                                <Input
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="location">Ubicación</Label>
                                    <Input
                                        id="location"
                                        placeholder="Ej. Entrada Principal"
                                        value={formData.location || ""}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="warehouse">Almacén / Carrito</Label>
                                    <Input
                                        id="warehouse"
                                        placeholder="Ej. Armario A"
                                        value={formData.warehouse || ""}
                                        onChange={(e) => setFormData({ ...formData, warehouse: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="instructions">Instrucciones</Label>
                                <textarea
                                    id="instructions"
                                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    placeholder="Instrucciones específicas para este puesto..."
                                    value={formData.instructions || ""}
                                    onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                                />
                            </div>

                            <div className="flex items-center space-x-2 pt-2">
                                <input
                                    type="checkbox"
                                    id="active"
                                    checked={formData.active}
                                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                />
                                <Label htmlFor="active" className="cursor-pointer">Visible para usuarios</Label>
                            </div>

                            <div className="space-y-2">
                                <Label>Color de Identificación</Label>
                                <div className="grid grid-cols-8 gap-2 mt-2">
                                    {COLORS.map((color) => (
                                        <div
                                            key={color}
                                            onClick={() => setFormData({ ...formData, color })}
                                            className={`h-8 w-8 rounded-full cursor-pointer transition-transform hover:scale-110 border-2 ${formData.color === color ? 'border-primary ring-2 ring-primary/30' : 'border-transparent'}`}
                                            style={{ backgroundColor: color }}
                                        />
                                    ))}
                                </div>
                            </div>

                            <DialogFooter>
                                <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
                                    Cancelar
                                </Button>
                                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                                    {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Guardar
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Delete Confirmation Alert */}
                <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>¿Estás seguro?</DialogTitle>
                            <DialogTitle className="text-sm font-normal text-muted-foreground pt-1">
                                Esta acción eliminará la zona permanentemente.
                                <br />
                                <span className="text-red-500 font-bold mt-2 block">
                                    Nota: Si la zona tiene turnos o carritos asociados, no se podrá eliminar.
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
                                {deleteMutation.isPending ? "Eliminando..." : "Eliminar"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}

