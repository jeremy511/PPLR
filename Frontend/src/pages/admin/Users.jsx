import React, { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllPublishers, deletePublisher, updatePublisher } from "../../api/admin";
import { useAuth } from "../../hooks/useAuth";
import { Layout } from "../../components/Layout";
import { formatDisplayName } from "@/lib/utils";
import { toast } from "sonner";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { MoreHorizontal, Trash2, Pencil, Search, X, Check, User, ArrowUpDown, ChevronUp, ChevronDown } from "lucide-react";

export default function Users() {
    const { user: currentUser } = useAuth();
    const queryClient = useQueryClient();

    const [deleteId, setDeleteId] = useState(null);
    const [editingUser, setEditingUser] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;
    const [passwordModalOpen, setPasswordModalOpen] = useState(false);
    const [tempPasswords, setTempPasswords] = useState({ new: "", confirm: "" });
    const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });

    const { data: users, isLoading, error, refetch } = useQuery({
        queryKey: ["users"],
        queryFn: getAllPublishers,
    });

    // ... checks

    const deleteMutation = useMutation({
        mutationFn: deletePublisher,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["users"] });
            setDeleteId(null);
            toast.success("Usuario eliminado correctamente");
        },
        onError: (err) => toast.error(err.message),
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => updatePublisher(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["users"] });
            setEditingUser(null);
            toast.success("Usuario actualizado correctamente");
        },
        onError: (err) => toast.error(err.message),
    });

    const handleEditSave = (e) => {
        // ... same existing code
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = {
            firstName: formData.get("firstName"),
            lastName: formData.get("lastName"),
            phone: formData.get("phone"),
            email: formData.get("email"),
            role: formData.get("role"),
            gender: formData.get("gender"),
            birthdate: formData.get("birthdate") || null,
        };
        updateMutation.mutate({ id: editingUser.id, data });
    };

    const handlePasswordChange = (e) => {
        e.preventDefault();
        if (tempPasswords.new !== tempPasswords.confirm) {
            toast.error("Las contraseñas no coinciden");
            return;
        }
        if (tempPasswords.new.length < 6) {
            toast.error("La contraseña debe tener al menos 6 caracteres");
            return;
        }
        updateMutation.mutate({
            id: editingUser.id,
            data: { password: tempPasswords.new }
        }, {
            onSuccess: () => {
                setPasswordModalOpen(false);
                setTempPasswords({ new: "", confirm: "" });
                toast.success("Contraseña actualizada exitosamente");
            }
        });
    };

    const handleSort = (key) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    const { sortedAndFilteredUsers, paginatedUsers, totalPages } = useMemo(() => {
        let result = users ? [...users] : [];

        if (searchTerm) {
            const lowerSearch = searchTerm.toLowerCase();
            result = result.filter(u =>
                u.firstName.toLowerCase().includes(lowerSearch) ||
                u.lastName.toLowerCase().includes(lowerSearch) ||
                u.email.toLowerCase().includes(lowerSearch)
            );
        }

        if (sortConfig.key) {
            result.sort((a, b) => {
                let aValue = a[sortConfig.key];
                let bValue = b[sortConfig.key];

                if (sortConfig.key === 'createdAt' || sortConfig.key === 'birthdate') {
                    aValue = aValue ? new Date(aValue).getTime() : 0;
                    bValue = bValue ? new Date(bValue).getTime() : 0;
                } else if (typeof aValue === 'string') {
                    aValue = aValue.toLowerCase();
                    bValue = bValue.toLowerCase();
                }

                if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }

        const total = Math.ceil(result.length / itemsPerPage);
        const paginated = result.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

        return {
            sortedAndFilteredUsers: result,
            paginatedUsers: paginated,
            totalPages: total
        };
    }, [users, searchTerm, sortConfig, currentPage]);

    // Reset to page 1 when searching or sorting
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, sortConfig]);

    const SortIcon = ({ columnKey }) => {
        if (sortConfig.key !== columnKey) return <ArrowUpDown className="ml-2 h-3 w-3 opacity-30" />;
        return sortConfig.direction === 'asc'
            ? <ChevronUp className="ml-2 h-3 w-3 text-primary" />
            : <ChevronDown className="ml-2 h-3 w-3 text-primary" />;
    };

    if (isLoading) {
        return (
            <Layout>
                <div className="py-24 flex flex-col items-center justify-center gap-6">
                    <div className="loader" />
                    <p className="text-muted-foreground font-medium animate-pulse tracking-wide">Cargando usuarios...</p>
                </div>
            </Layout>
        );
    }
    if (error) {
        return (
            <Layout>
                <div className="p-8 text-center bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 rounded-2xl max-w-lg mx-auto my-12">
                    <h2 className="text-lg font-bold text-red-900 dark:text-red-300">No se pudieron cargar los usuarios</h2>
                    <p className="text-sm text-red-700 dark:text-red-400 mt-2">
                        {error.message || "Ocurrió un problema de comunicación con el servidor."}
                    </p>
                    <Button onClick={() => refetch()} className="mt-5 bg-red-600 hover:bg-red-700 text-white">
                        Reintentar
                    </Button>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Gestión de Usuarios</h1>
                        <p className="text-muted-foreground mt-1">
                            Administra los publicadores y sus permisos.
                        </p>
                    </div>
                    <div className="bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium w-fit">
                        Total: {users?.length || 0}
                    </div>
                </div>

                {/* Persistent Edit Section */}
                <div className="border rounded-xl bg-card shadow-sm overflow-hidden mb-6">
                    <div className="bg-muted/50 px-6 py-3 border-b">
                        <h3 className="flex items-center gap-2 font-semibold">
                            <User className="h-5 w-5 text-primary" />
                            {editingUser ? `Editando: ${formatDisplayName(editingUser.firstName, editingUser.lastName)}` : "Detalles del Usuario"}
                        </h3>
                    </div>

                    <div className="p-6">
                        <form id="edit-form" onSubmit={handleEditSave} className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" key={editingUser?.id || "empty"}>
                            <div className="space-y-2">
                                <Label htmlFor="firstName">Nombre</Label>
                                <Input
                                    id="firstName"
                                    name="firstName"
                                    defaultValue={editingUser?.firstName || ""}
                                    disabled={!editingUser}
                                    placeholder="Nombre"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="lastName">Apellido</Label>
                                <Input
                                    id="lastName"
                                    name="lastName"
                                    defaultValue={editingUser?.lastName || ""}
                                    disabled={!editingUser}
                                    placeholder="Apellido"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Teléfono</Label>
                                <Input
                                    id="phone"
                                    name="phone"
                                    defaultValue={editingUser?.phone || ""}
                                    disabled={!editingUser}
                                    placeholder="+54 9 11 ..."
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    defaultValue={editingUser?.email || ""}
                                    disabled={!editingUser}
                                    placeholder="correo@ejemplo.com"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="role">Rol</Label>
                                <select
                                    id="role"
                                    name="role"
                                    defaultValue={editingUser?.role || "PUBLISHER"}
                                    disabled={!editingUser}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <option value="PUBLISHER">PUBLISHER</option>
                                    <option value="ADMIN">ADMIN</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="gender">Sexo</Label>
                                <select
                                    id="gender"
                                    name="gender"
                                    defaultValue={editingUser?.gender || "MALE"}
                                    disabled={!editingUser}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <option value="MALE">Masculino</option>
                                    <option value="FEMALE">Femenino</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="birthdate">Fecha de Nacimiento</Label>
                                <Input
                                    id="birthdate"
                                    name="birthdate"
                                    type="date"
                                    defaultValue={editingUser?.birthdate ? new Date(editingUser.birthdate).toISOString().split('T')[0] : ""}
                                    disabled={!editingUser}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Seguridad</Label>
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full justify-start text-muted-foreground"
                                    disabled={!editingUser}
                                    onClick={() => setPasswordModalOpen(true)}
                                >
                                    Cambiar Contraseña...
                                </Button>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="age">Edad (Auto-calculada)</Label>
                                <Input
                                    id="age"
                                    value={editingUser?.age || ""}
                                    disabled
                                    className="bg-muted"
                                />
                            </div>
                        </form>
                    </div>

                    <div className="bg-muted/20 px-6 py-3 border-t flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">
                            {editingUser ? "Haz clic en 'Guardar' para aplicar los cambios." : "Selecciona un usuario abajo para editar."}
                        </span>
                        <div className="flex gap-2">
                            {editingUser && (
                                <Button variant="ghost" size="sm" onClick={() => setEditingUser(null)}>
                                    Cancelar
                                </Button>
                            )}
                            <Button
                                form="edit-form"
                                type="submit"
                                disabled={!editingUser || updateMutation.isPending}
                                size="sm"
                            >
                                {updateMutation.isPending ? "Guardando..." : "Guardar Cambios"}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Search Bar & Table */}
                <div className="space-y-4 pt-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar por nombre o email..."
                            className="pl-10 max-w-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="border rounded-xl bg-card shadow-sm overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/50">
                                    <TableHead className="w-[200px] cursor-pointer hover:text-primary transition-colors" onClick={() => handleSort('firstName')}>
                                        <div className="flex items-center">Usuario <SortIcon columnKey="firstName" /></div>
                                    </TableHead>
                                    <TableHead className="cursor-pointer hover:text-primary transition-colors" onClick={() => handleSort('email')}>
                                        <div className="flex items-center">Email <SortIcon columnKey="email" /></div>
                                    </TableHead>
                                    <TableHead>Teléfono</TableHead>
                                    <TableHead className="cursor-pointer hover:text-primary transition-colors" onClick={() => handleSort('gender')}>
                                        <div className="flex items-center">Sexo <SortIcon columnKey="gender" /></div>
                                    </TableHead>
                                    <TableHead className="cursor-pointer hover:text-primary transition-colors" onClick={() => handleSort('age')}>
                                        <div className="flex items-center">Edad <SortIcon columnKey="age" /></div>
                                    </TableHead>
                                    <TableHead className="cursor-pointer hover:text-primary transition-colors" onClick={() => handleSort('createdAt')}>
                                        <div className="flex items-center">Registro <SortIcon columnKey="createdAt" /></div>
                                    </TableHead>
                                    <TableHead className="cursor-pointer hover:text-primary transition-colors" onClick={() => handleSort('role')}>
                                        <div className="flex items-center">Rol <SortIcon columnKey="role" /></div>
                                    </TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedUsers?.length > 0 ? (
                                    paginatedUsers.map((u) => (
                                        <TableRow
                                            key={u.id}
                                            className={`cursor-pointer hover:bg-muted/50 transition-colors ${editingUser?.id === u.id ? "bg-primary/5 border-l-4 border-l-primary" : ""}`}
                                            onClick={() => {
                                                setEditingUser(u);
                                                window.scrollTo({ top: 0, behavior: 'smooth' });
                                            }}
                                        >
                                            <TableCell className="font-medium">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                                        {u.firstName.charAt(0)}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span>{formatDisplayName(u.firstName, u.lastName)}</span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>{u.email}</TableCell>
                                            <TableCell>
                                                <span className="text-sm text-muted-foreground">{u.phone || "-"}</span>
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-sm font-bold text-muted-foreground">
                                                    {u.gender === "MALE" ? "M" : "F"}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-sm font-medium">{u.age} años</span>
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-xs text-muted-foreground">
                                                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }) : "-"}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <span
                                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${u.role === "ADMIN"
                                                        ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
                                                        : "bg-muted text-muted-foreground"
                                                        }`}
                                                >
                                                    {u.role}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="opacity-0 group-hover:opacity-100"
                                                    onClick={(e) => {
                                                        e.stopPropagation(); // Avoid triggering row click
                                                        setEditingUser(u);
                                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                                    }}
                                                >
                                                    <Pencil className="h-4 w-4 text-muted-foreground" />
                                                </Button>
                                                {currentUser?.id !== u.id && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setDeleteId(u.id);
                                                        }}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center">
                                            No se encontraron usuarios.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div className="bg-muted/30 px-6 py-4 border-t flex items-center justify-between">
                                <p className="text-xs text-muted-foreground">
                                    Mostrando página <span className="font-bold">{currentPage}</span> de {totalPages}
                                </p>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                        disabled={currentPage === 1}
                                        className="h-8 rounded-lg"
                                    >
                                        Anterior
                                    </Button>
                                    <div className="flex gap-1">
                                        {[...Array(totalPages)].map((_, i) => (
                                            <Button
                                                key={i}
                                                variant={currentPage === i + 1 ? "default" : "ghost"}
                                                size="sm"
                                                onClick={() => setCurrentPage(i + 1)}
                                                className="h-8 w-8 p-0 rounded-lg"
                                            >
                                                {i + 1}
                                            </Button>
                                        ))}
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                        disabled={currentPage === totalPages}
                                        className="h-8 rounded-lg"
                                    >
                                        Siguiente
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

            {/* Password Change Modal */}
            <AlertDialog open={passwordModalOpen} onOpenChange={setPasswordModalOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Cambiar Contraseña</AlertDialogTitle>
                        <AlertDialogDescription>
                            Ingresa la nueva contraseña para <strong>{editingUser?.firstName}</strong>.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Nueva Contraseña</Label>
                            <Input
                                type="password"
                                value={tempPasswords.new}
                                onChange={(e) => setTempPasswords(prev => ({ ...prev, new: e.target.value }))}
                                placeholder="Mínimo 6 caracteres"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Confirmar Contraseña</Label>
                            <Input
                                type="password"
                                value={tempPasswords.confirm}
                                onChange={(e) => setTempPasswords(prev => ({ ...prev, confirm: e.target.value }))}
                                placeholder="Escribe de nuevo la contraseña"
                            />
                        </div>
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setTempPasswords({ new: "", confirm: "" })}>
                            Cancelar
                        </AlertDialogCancel>
                        <Button
                            onClick={handlePasswordChange}
                            disabled={!tempPasswords.new || updateMutation.isPending}
                        >
                            {updateMutation.isPending ? "Actualizando..." : "Actualizar Contraseña"}
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Delete Confirmation */}
            <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer. Esto eliminará permanentemente al usuario
                            y todos sus datos asociados.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-red-600 hover:bg-red-700"
                            onClick={() => deleteMutation.mutate(deleteId)}
                        >
                            Eliminar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

        </Layout>
    );
}
