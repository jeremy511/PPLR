import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, UserPlus, ShieldAlert, CheckCircle2, XCircle } from "lucide-react";
import { cn, formatDisplayName } from "@/lib/utils";
import { adminAddParticipant, adminRemoveParticipant, updateShiftStatus } from "../api/admin";
import { ConfirmationDialog } from "./ConfirmationDialog";
import { toast } from "sonner";

export function AdminShiftControls({ shift, allPublishers, onUpdate, onAdd, onStatusChange }) {
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);

    // State for removal confirmation
    const [confirmId, setConfirmId] = useState(null);
    const [isConfirmingRemoval, setIsConfirmingRemoval] = useState(false);

    // Filter publishers not already in the shift
    const availablePublishers = allPublishers.filter(p =>
        !shift.publishers.some(sp => sp.id === p.id) &&
        (
            (p.firstName || "").toLowerCase().includes(search.toLowerCase()) ||
            (p.lastName || "").toLowerCase().includes(search.toLowerCase()) ||
            (p.email || "").toLowerCase().includes(search.toLowerCase())
        )
    ).slice(0, 5);

    const handleAdd = async (publisherId) => {
        try {
            setLoading(true);
            if (onAdd) {
                await onAdd(publisherId);
            } else {
                await adminAddParticipant(shift.id, publisherId);
            }
            setSearch("");
            await onUpdate();
        } catch (err) {
            console.error(err);
            toast.error(err.message || "Error al añadir participante");
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveInitiate = (publisherId) => {
        setConfirmId(publisherId);
        setIsConfirmingRemoval(true);
    };

    const handleRemoveConfirm = async (reason) => {
        if (!confirmId) return;
        try {
            setLoading(true);
            await adminRemoveParticipant(shift.id, confirmId, reason);
            await onUpdate();
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
            setConfirmId(null);
        }
    };

    const handleStatusChange = async (status) => {
        try {
            setLoading(true);
            if (onStatusChange) {
                await onStatusChange(status);
            } else {
                await updateShiftStatus(shift.id, status);
            }
            await onUpdate();
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const targetPublisher = shift.publishers.find(p => p.id === confirmId);

    return (
        <>
            <div className="space-y-6 pt-6 border-t border-gray-100">
                {/* Participant Management */}
                <div className="space-y-4">
                    <h4 className="text-xs font-bold text-indigo-600 uppercase tracking-widest flex items-center gap-2">
                        <ShieldAlert className="h-4 w-4" />
                        Administrar Participantes
                    </h4>

                    {/* Current List with Remove button */}
                    <div className="space-y-2">
                        {shift.publishers.map((p) => (
                            <div key={p.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg group">
                                <span className="text-sm font-medium text-gray-700">{formatDisplayName(p.firstName, p.lastName)}</span>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                                    onClick={() => handleRemoveInitiate(p.id)}
                                    disabled={loading}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </div>

                    {/* Add New Participant */}
                    <div className="relative">
                        <div className="flex gap-2">
                            <Input
                                placeholder="Buscar hermano para añadir..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="h-10 rounded-xl"
                            />
                        </div>

                        {search && availablePublishers.length > 0 && (
                            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-100 shadow-xl rounded-xl overflow-hidden animate-in fade-in slide-in-from-top-2">
                                {availablePublishers.map((p) => (
                                    <button
                                        key={p.id}
                                        className="w-full flex items-center justify-between px-4 py-3 hover:bg-indigo-50 text-left transition-colors"
                                        onClick={() => handleAdd(p.id)}
                                        disabled={loading}
                                    >
                                        <div>
                                            <p className="text-sm font-bold text-gray-800">{formatDisplayName(p.firstName, p.lastName)}</p>
                                            <p className="text-xs text-gray-500">{p.email}</p>
                                        </div>
                                        <UserPlus className="h-4 w-4 text-indigo-500" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Shift Status */}
                <div className="space-y-4 pt-2">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2 px-1">
                        Gestión de Acceso
                    </h4>

                    {shift.status === 'CANCELLED' ? (
                        <Button
                            variant="outline"
                            className="w-full h-11 gap-3 rounded-xl border-green-200 bg-green-50 text-green-700 font-bold hover:bg-green-100 hover:border-green-300 transition-all shadow-sm"
                            onClick={() => handleStatusChange('CONFIRMED')}
                            disabled={loading}
                        >
                            <CheckCircle2 className="h-5 w-5" />
                            Activar Turno
                        </Button>
                    ) : (
                        <Button
                            variant="outline"
                            className="w-full h-11 gap-3 rounded-xl border-red-100 text-red-600 font-semibold hover:bg-red-50 hover:border-red-200 transition-all"
                            onClick={() => handleStatusChange('CANCELLED')}
                            disabled={loading}
                        >
                            <XCircle className="h-5 w-5" />
                            Cancelar Turno
                        </Button>
                    )}

                    <div className="px-3 py-2 bg-gray-50/50 rounded-lg border border-gray-100">
                        <p className="text-[11px] text-gray-500 leading-relaxed italic">
                            {shift.status === 'CANCELLED'
                                ? "Actualmente cancelado. Los publicadores no pueden verlo ni inscribirse."
                                : "Actualmente disponible. Puedes cancelarlo para evitar nuevas inscripciones o cerrar el punto."}
                        </p>
                    </div>
                </div>
            </div>

            {/* Custom Confirmation Dialog */}
            <ConfirmationDialog
                isOpen={isConfirmingRemoval}
                onOpenChange={setIsConfirmingRemoval}
                onConfirm={handleRemoveConfirm}
                requireReason={true}
                reasonPlaceholder="Ej: El hermano avisó que no podrá asistir..."
                title="¿Remover participante?"
                description={`Estás a punto de quitar a ${targetPublisher ? formatDisplayName(targetPublisher.firstName, targetPublisher.lastName) : 'este hermano'} del turno. Describe el motivo para el registro.`}
                confirmText="Sí, remover"
                cancelText="No, mantener"
                variant="destructive"
            />
        </>
    );
}
