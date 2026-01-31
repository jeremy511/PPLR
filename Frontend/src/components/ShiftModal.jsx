import React from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Calendar as CalendarIcon, UserCheck, AlertCircle, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { AdminShiftControls } from "./AdminShiftControls";

export function ShiftModal({
    isOpen,
    onOpenChange,
    selectedShift,
    isPast,
    isJoined,
    isFull,
    user,
    onJoin,
    onLeave,
    timeSlots,
    allPublishers,
    onAdminUpdate,
    onAdminAdd,
    onAdminStatusChange
}) {
    if (!selectedShift) return null;

    const isAdmin = user?.role === 'ADMIN';

    const formatDate = (date) => {
        if (!date) return "";
        return new Intl.DateTimeFormat('es-ES', {
            weekday: 'long',
            day: 'numeric',
            month: 'long'
        }).format(date);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px] rounded-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl capitalize text-gray-800">
                        <CalendarIcon className="h-5 w-5 text-indigo-500" />
                        {formatDate(selectedShift.fullDate)}
                    </DialogTitle>
                    <div className="font-semibold text-indigo-600/80 flex flex-col gap-1 mt-2">
                        <span className="text-base">{selectedShift.slotIndex !== undefined ? timeSlots[selectedShift.slotIndex]?.label : ""}</span>
                        <div className="flex items-center justify-between">
                            <span className="flex items-center gap-1.5 text-gray-500 text-sm font-medium">
                                <MapPin className="h-3.5 w-3.5 text-indigo-400" />
                                {selectedShift.zoneName}
                            </span>
                            {selectedShift.status === 'CANCELLED' && (
                                <span className="bg-red-100 text-red-600 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter shadow-sm border border-red-200">Cancelado</span>
                            )}
                        </div>
                    </div>
                </DialogHeader>

                <div className="py-6 space-y-6">
                    {isPast && (
                        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3 text-amber-700 text-sm leading-relaxed shadow-sm">
                            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                            <p>Este turno ya ha pasado y no admite cambios en la lista de participantes.</p>
                        </div>
                    )}

                    <div className="space-y-4">
                        <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <UserCheck className="h-4 w-4" />
                            Participantes ({selectedShift.publishers.length}/4)
                        </h4>

                        {selectedShift.publishers.length === 0 ? (
                            <div className="text-center py-8 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                                <p className="text-sm text-gray-400 italic">No hay nadie anotado aún.</p>
                            </div>
                        ) : (
                            <ul className="space-y-2">
                                {(() => {
                                    const pubs = selectedShift.publishers;
                                    const adultMales = pubs
                                        .filter(p => p.gender === 'MALE' && p.age >= 18)
                                        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

                                    const adultFemales = pubs
                                        .filter(p => p.gender === 'FEMALE' && p.age >= 18)
                                        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

                                    const responsible = adultMales[0] || adultFemales[0];

                                    // Sort publishers to put responsible at the top
                                    const sortedPubs = [...pubs].sort((a, b) => {
                                        if (responsible && a.id === responsible.id) return -1;
                                        if (responsible && b.id === responsible.id) return 1;
                                        return 0;
                                    });

                                    return sortedPubs.map((p, i) => {
                                        const isResp = responsible && p.id === responsible.id;
                                        const isMinor = p.age < 18;

                                        return (
                                            <li
                                                key={i}
                                                className={cn(
                                                    "flex items-center justify-between gap-3 text-sm p-3 bg-white border rounded-xl shadow-sm group hover:border-indigo-100 transition-colors",
                                                    isResp ? "border-indigo-100 bg-indigo-50/10" : "border-gray-100"
                                                )}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={cn(
                                                        "h-2 w-2 rounded-full",
                                                        isResp ? "bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.3)]" : "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.3)]"
                                                    )} />
                                                    <span className={cn("text-gray-700", isResp ? "font-black" : "font-semibold")}>
                                                        {p.name}
                                                        {isMinor && <span className="ml-1 text-[10px] text-amber-500 font-bold">(Menor)</span>}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {isResp && (
                                                        <span className="text-[9px] font-black bg-indigo-600/10 text-indigo-700 px-2 py-0.5 rounded-md uppercase tracking-wider border border-indigo-100">
                                                            Responsable
                                                        </span>
                                                    )}
                                                    {p.email === user?.email && (
                                                        <span className="text-[10px] font-bold bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full uppercase">Tú</span>
                                                    )}
                                                </div>
                                            </li>
                                        );
                                    });
                                })()}
                            </ul>
                        )}
                    </div>

                    {/* Admin Specific Controls */}
                    {isAdmin && (
                        <AdminShiftControls
                            shift={selectedShift}
                            allPublishers={allPublishers}
                            onUpdate={onAdminUpdate}
                            onAdd={onAdminAdd}
                            onStatusChange={onAdminStatusChange}
                        />
                    )}
                </div>

                <DialogFooter className="sm:justify-stretch">
                    {isPast ? (
                        <Button variant="secondary" onClick={() => onOpenChange(false)} className="w-full h-11 rounded-xl font-bold border-gray-200 shadow-sm">
                            Cerrar
                        </Button>
                    ) : isJoined ? (
                        <Button
                            variant="destructive"
                            onClick={onLeave}
                            className="w-full h-11 rounded-xl font-bold bg-red-500 hover:bg-red-600 shadow-md shadow-red-200 border-none transition-all hover:scale-[1.02] active:scale-[0.98]"
                        >
                            Salir del turno
                        </Button>
                    ) : (
                        <Button
                            onClick={onJoin}
                            disabled={isFull || selectedShift.status === 'CANCELLED'}
                            className="w-full h-11 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-200 border-none disabled:bg-gray-100 disabled:text-gray-400 transition-all hover:scale-[1.02] active:scale-[0.98]"
                        >
                            {selectedShift.status === 'CANCELLED' ? "Turno Cancelado" : isFull ? "Cupo Completo" : "Inscribirme Ahora"}
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
