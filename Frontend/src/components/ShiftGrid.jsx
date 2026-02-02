import React, { memo } from "react";
import { cn, formatDisplayName } from "@/lib/utils";
import { XCircle } from "lucide-react";

// Memoized Individual Slot Component
const ShiftCell = memo(({ day, index, shift, user, loading, onSlotClick, isUnavailable, slotLabel, zoneColor }) => {
    const count = shift?.publishers.length || 0;
    const isUserIn = shift?.publishers.some(p => p.email === user?.email);

    let statusStyle = {};
    let statusClass = "bg-gray-50/50 border-gray-100 text-gray-300 hover:bg-gray-100/80 cursor-pointer";

    if (isUnavailable) {
        statusClass = "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed striped-background pattern-diagonal-lines";
    } else if (shift && (shift.status === "CANCELLED" || count > 0)) {
        const isCancelled = shift.status === "CANCELLED";
        statusClass = "bg-white border-gray-200 text-gray-400 hover:bg-gray-50/50 cursor-pointer transition-colors";

        if (isCancelled) {
            statusClass = "bg-gray-50/50 border-gray-100 text-gray-300 cursor-pointer hover:bg-gray-100/80";
        } else if (isUserIn) {
            // Active user style
            statusClass = "bg-white text-gray-400 cursor-pointer shadow-sm";
            statusStyle = {
                borderColor: `${zoneColor}60`, // lighter border
                borderLeftWidth: '4px',
                borderLeftColor: zoneColor
            };
        } else if (count >= 4) {
            statusClass = "bg-white border-gray-200 text-gray-400 cursor-default";
        } else {
            // Available but not joined - Hover effect
            statusStyle = { borderColor: "transparent" }; // Default
        }
    }

    // Hover style handling would be complex inline, simplified to class for general, specific for joined

    return (
        <button
            disabled={isUnavailable || loading}
            onClick={() => onSlotClick(day.name, index)}
            className={cn(
                "min-h-[4.5rem] h-auto p-1.5 rounded-lg border transition-all duration-200 flex flex-col items-center justify-center text-xs group focus-visible:ring-2 focus-visible:ring-ring outline-none",
                loading ? "bg-gray-50 border-gray-100 animate-pulse" : statusClass
            )}
            style={statusStyle}
            aria-label={`Turno ${day.name} ${slotLabel}. ${count} participantes.`}
        >
            {loading ? (
                <div className="h-4 w-8 bg-gray-200 rounded animate-pulse" />
            ) : isUnavailable ? (
                <span className="text-[10px] font-medium opacity-60">Bloqueado</span>
            ) : shift?.status === "CANCELLED" ? (
                <div className="flex flex-col items-center opacity-60">
                    <XCircle className="h-4 w-4 text-red-400 mb-1" />
                    <span className="text-[10px] font-black uppercase text-red-500/50">Cancelado</span>
                </div>
            ) : shift && count > 0 ? (
                <div className="flex flex-col items-center w-full overflow-hidden">
                    <span
                        className={cn("text-[10px] font-bold mb-1.5 px-2 py-0.5 rounded-full border")}
                        style={isUserIn ? {
                            backgroundColor: `${zoneColor}15`,
                            color: zoneColor,
                            borderColor: `${zoneColor}30`
                        } : {
                            backgroundColor: "#f3f4f6",
                            color: "#6b7280",
                            borderColor: "#e5e7eb"
                        }}
                    >
                        {count}/4
                    </span>
                    <div className="flex flex-col gap-0.5 w-full relative px-1">
                        {(() => {
                            const pubs = shift.publishers;
                            const adultMales = pubs
                                .filter(p => p.gender === "MALE" && p.age >= 18)
                                .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

                            const adultFemales = pubs
                                .filter(p => p.gender === "FEMALE" && p.age >= 18)
                                .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

                            const responsible = adultMales[0] || adultFemales[0];

                            const sortedPubs = [...pubs].sort((a, b) => {
                                if (responsible && a.id === responsible.id) return -1;
                                if (responsible && b.id === responsible.id) return 1;
                                return 0;
                            });

                            return sortedPubs.map((p) => {
                                const isResp = responsible && p.id === responsible.id;
                                return (
                                    <span
                                        key={p.id}
                                        className={cn(
                                            "text-[10px] leading-tight w-full text-left truncate flex items-center gap-0.5",
                                            isResp ? "font-black" : "text-gray-400 font-medium"
                                        )}
                                        style={isResp ? { color: '#111827' } : {}} // Keep responsible dark
                                        title={`${formatDisplayName(p.firstName, p.lastName)} ${isResp ? "(Responsable)" : ""}`}
                                    >
                                        {formatDisplayName(p.firstName, p.lastName)}
                                    </span>
                                );
                            });
                        })()}
                    </div>
                </div>
            ) : (
                <span className="text-[10px] uppercase font-bold opacity-20 group-hover:opacity-100 transition-opacity">Libre</span>
            )}
        </button>
    );
});

ShiftCell.displayName = "ShiftCell";

export function ShiftGrid({ weekDates, timeSlots, shifts, user, loading, onSlotClick, zoneColor = "#6366f1" }) {
    return (
        <div className="p-2 sm:p-4 bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto custom-scrollbar">
            <div className="min-w-[800px] md:min-w-0">
                {/* Header Row */}
                <div className="grid grid-cols-[100px_repeat(7,1fr)] gap-1 sm:gap-2 mb-4">
                    <div className="font-bold text-gray-400 text-[10px] uppercase flex items-center justify-center tracking-widest">Hora</div>
                    {weekDates.map((day) => (
                        <div key={day.name} className="flex flex-col items-center pb-2 border-b-2 border-transparent">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{day.name.slice(0, 3)}</span>
                            <span className="text-xl font-black text-gray-800 tabular-nums">{day.date}</span>
                        </div>
                    ))}
                </div>

                {/* Time Slots */}
                <div className="grid gap-1 sm:gap-2">
                    {timeSlots.map((slot, index) => (
                        <div key={index} className="grid grid-cols-[100px_repeat(7,1fr)] gap-1 sm:gap-2">
                            {/* Time Label */}
                            <div className="text-gray-400 font-bold text-[10px] flex items-center justify-center text-center px-1 tabular-nums leading-tight">
                                {slot.label.split(" ").map((p, i) => <span key={i} className="block">{p}</span>)}
                            </div>

                            {/* Day Slots */}
                            {weekDates.map((day) => {
                                const key = `${day.name}-${index}`;
                                const isUnavailable = false;
                                return (
                                    <ShiftCell
                                        key={key}
                                        day={day}
                                        index={index}
                                        shift={shifts[key]}
                                        user={user}
                                        loading={loading}
                                        onSlotClick={onSlotClick}
                                        isUnavailable={isUnavailable}
                                        slotLabel={slot.label}
                                        zoneColor={zoneColor}
                                    />
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default memo(ShiftGrid);
