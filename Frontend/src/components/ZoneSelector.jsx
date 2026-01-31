import React from "react";
import { cn } from "@/lib/utils";
import { MapPin, ChevronDown, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ZoneSelector({ zones, selectedZoneId, onSelect }) {
    if (!zones || zones.length === 0) return null;

    const currentZone = zones.find((z) => z.id === selectedZoneId) || zones[0];

    return (
        <div className="flex justify-center w-full max-w-sm mx-auto">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="outline"
                        className="w-full h-11 justify-between rounded-xl px-4 border-gray-200 bg-white shadow-sm hover:bg-gray-50 text-gray-700 font-semibold group transition-all duration-310"
                    >
                        <div className="flex items-center gap-2.5 overflow-hidden">
                            <div className="bg-indigo-50 p-1.5 rounded-lg group-hover:bg-indigo-100 transition-colors">
                                <MapPin className="h-4 w-4 text-indigo-500" />
                            </div>
                            <span className="truncate text-sm">{currentZone.name}</span>
                        </div>
                        <ChevronDown className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" className="w-[--radix-dropdown-menu-trigger-width] rounded-xl p-1.5 shadow-lg border-gray-100">
                    {zones.map((zone) => (
                        <DropdownMenuItem
                            key={zone.id}
                            onClick={() => onSelect(zone.id)}
                            className={cn(
                                "flex items-center justify-between rounded-lg px-3 py-2.5 cursor-pointer transition-colors",
                                selectedZoneId === zone.id
                                    ? "bg-indigo-50 text-indigo-600 font-bold focus:bg-indigo-50 focus:text-indigo-600"
                                    : "text-gray-600 focus:bg-gray-50 focus:text-gray-900"
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <MapPin className={cn("h-4 w-4", selectedZoneId === zone.id ? "text-indigo-500" : "text-gray-400")} />
                                <span className="text-sm">{zone.name}</span>
                            </div>
                            {selectedZoneId === zone.id && <Check className="h-4 w-4 text-indigo-600 shrink-0" />}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
