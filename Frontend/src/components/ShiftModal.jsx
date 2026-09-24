import React from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Calendar as CalendarIcon, UserCheck, AlertCircle, MapPin, Phone } from "lucide-react";
import { cn, formatDisplayName } from "@/lib/utils";
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
            <DialogContent className={cn(
                "sm:max-w-[425px] rounded-2xl max-h-[90vh] overflow-y-auto custom-scrollbar transition-all",
                isAdmin ? "border-primary/50 shadow-primary/10 border-2" : "border-border"
            )}>
                <DialogHeader>
                    {isAdmin && (
                        <div className="flex justify-center -mt-2 mb-2">
                            <span className="bg-indigo-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg shadow-indigo-200 flex items-center gap-1.5 animate-in slide-in-from-top-1 duration-500">
                                <AlertCircle className="h-3 w-3" />
                                Modo Administrador
                            </span>
                        </div>
                    )}
                    <DialogTitle className="flex items-center gap-2 text-xl capitalize text-foreground">
                        <CalendarIcon className="h-5 w-5 text-indigo-500" />
                        {formatDate(selectedShift.fullDate)}
                    </DialogTitle>
                    <div className="font-semibold text-indigo-600/80 flex flex-col gap-1 mt-2">
                        <span className="text-base">{selectedShift.slotIndex !== undefined ? timeSlots[selectedShift.slotIndex]?.label : ""}</span>
                        <div className="flex items-center justify-between">
                            <span className="flex items-center gap-1.5 text-muted-foreground text-sm font-medium">
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
                        <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                            <UserCheck className="h-4 w-4" />
                            Participantes ({selectedShift.publishers.length}/4)
                        </h4>

                        {selectedShift.publishers.length === 0 ? (
                            <div className="text-center py-8 bg-muted/30 rounded-xl border border-dashed border-border">
                                <p className="text-sm text-muted-foreground italic">No hay nadie anotado aún.</p>
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
                                                    "flex items-center justify-between gap-3 text-sm p-3 bg-card border rounded-xl shadow-sm group hover:border-primary/20 transition-colors",
                                                    isResp ? "border-primary/20 bg-primary/5" : "border-border"
                                                )}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={cn(
                                                        "h-2 w-2 rounded-full",
                                                        isResp ? "bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.3)]" : "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.3)]"
                                                    )} />
                                                    <span className={cn("text-foreground", isResp ? "font-black" : "font-semibold")}>
                                                        {formatDisplayName(p.firstName, p.lastName)}
                                                        {isMinor && <span className="ml-1 text-[10px] text-amber-500 font-bold">(Menor)</span>}
                                                    </span>
                                                    <div className="flex items-center gap-2">
                                                        {p.phone && (
                                                            <>
                                                                <a
                                                                    href={`tel:${p.phone}`}
                                                                    className="flex items-center gap-1 text-[11px] text-indigo-500 hover:text-indigo-700 mt-0.5 transition-colors group/phone"
                                                                    onClick={(e) => e.stopPropagation()}
                                                                >
                                                                    <Phone className="h-3 w-3" />
                                                                    {p.phone}
                                                                </a>
                                                                <a
                                                                    href={`https://wa.me/${p.phone.replace(/[^0-9]/g, '')}`}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="p-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-600 hover:text-white transition-all duration-300 shadow-sm border border-green-100 group/wa"
                                                                    title="Chatear por WhatsApp"
                                                                    onClick={(e) => e.stopPropagation()}
                                                                >
                                                                    <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                                                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                                                    </svg>
                                                                </a>
                                                            </>
                                                        )}
                                                    </div>
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
                            className="w-full h-11 rounded-xl font-bold bg-primary hover:bg-primary/90 shadow-md shadow-primary/20 border-none disabled:bg-muted disabled:text-muted-foreground transition-all hover:scale-[1.02] active:scale-[0.98]"
                        >
                            {selectedShift.status === 'CANCELLED' ? "Turno Cancelado" : isFull ? "Cupo Completo" : "Inscribirme Ahora"}
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
