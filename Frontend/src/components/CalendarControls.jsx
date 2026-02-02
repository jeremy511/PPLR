import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";

export function CalendarControls({ weekOffset, setWeekOffset, weekInfo, zoneColor = "#6366f1" }) {
    return (
        <div className="flex items-center justify-between bg-white p-2 rounded-xl border border-gray-100 shadow-sm sm:flex-row flex-col gap-3 sm:gap-0">
            <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setWeekOffset(prev => prev - 1)}
                    aria-label="Semana anterior"
                    className="h-9 w-9"
                >
                    <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setWeekOffset(0)}
                    disabled={weekOffset === 0}
                    className="hidden sm:flex font-medium"
                >
                    Hoy
                </Button>
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setWeekOffset(prev => prev + 1)}
                    disabled={weekOffset >= 1}
                    aria-label={weekOffset >= 1 ? "Límite futuro alcanzado" : "Siguiente semana"}
                    className="h-9 w-9 disabled:opacity-30"
                >
                    <ChevronRight className="h-5 w-5" />
                </Button>
            </div>

            <div
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg font-bold border"
                style={{
                    backgroundColor: `${zoneColor}15`, // opacity 15 (hex)
                    color: zoneColor,
                    borderColor: `${zoneColor}30` // opacity 30
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
                disabled={weekOffset === 0}
                className="sm:hidden w-full font-medium"
            >
                Ir a Hoy
            </Button>
        </div>
    );
}
