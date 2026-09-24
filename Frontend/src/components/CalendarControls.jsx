import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";

export function CalendarControls({ weekOffset, setWeekOffset, weekInfo, zoneColor = "#6366f1", disabled = false, maxWeeks = 2 }) {
    return (
        <div className="flex items-center justify-between bg-card text-card-foreground p-2 sm:p-2.5 rounded-xl border border-border/80 shadow-sm sm:flex-row flex-col gap-3 sm:gap-0 transition-colors">
            <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setWeekOffset(prev => prev - 1)}
                    disabled={disabled}
                    aria-label="Semana anterior"
                    className="h-9 w-9 border-border/70 hover:bg-muted"
                >
                    <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setWeekOffset(0)}
                    disabled={disabled || weekOffset === 0}
                    className="hidden sm:flex font-medium border-border/70 hover:bg-muted"
                >
                    Hoy
                </Button>
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setWeekOffset(prev => prev + 1)}
                    disabled={disabled || weekOffset >= (maxWeeks - 1)}
                    aria-label={weekOffset >= (maxWeeks - 1) ? "Límite futuro alcanzado" : "Siguiente semana"}
                    className="h-9 w-9 disabled:opacity-30 border-border/70 hover:bg-muted"
                >
                    <ChevronRight className="h-5 w-5" />
                </Button>
            </div>

            <div
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg font-bold border transition-colors shadow-xs"
                style={{
                    backgroundColor: `${zoneColor}18`, // subtle transparent tint
                    color: zoneColor,
                    borderColor: `${zoneColor}35`
                }}
            >
                <CalendarIcon className="h-4 w-4" aria-hidden="true" />
                <span className="text-sm whitespace-nowrap">{weekInfo}</span>
            </div>

            {/* Mobile only Today button */}
            <Button
                variant="outline"
                size="sm"
                onClick={() => setWeekOffset(0)}
                disabled={disabled || weekOffset === 0}
                className="sm:hidden w-full font-medium border-border/70 hover:bg-muted"
            >
                Ir a Hoy
            </Button>
        </div>
    );
}

