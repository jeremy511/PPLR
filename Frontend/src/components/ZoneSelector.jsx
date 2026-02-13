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
                        className="w-full h-11 justify-between rounded-xl px-4 border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground text-foreground font-semibold group transition-all duration-310"
                    >
                        <div className="flex items-center gap-2.5 overflow-hidden">
                            <div
                                className="p-1.5 rounded-lg transition-colors relative"
                                style={{ backgroundColor: currentZone.color || "#6366f1", color: "white" }}
                            >
                                <MapPin className="h-4 w-4" />
                                {currentZone.name === "Jardin Botanico" && (
                                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                        <span className="animate-pulse-green absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                                    </span>
                                )}
                            </div>
                            <span className="truncate text-sm">{currentZone.name}</span>
                        </div>
                        <ChevronDown className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" className="w-[--radix-dropdown-menu-trigger-width] rounded-xl p-1.5 shadow-lg border-border bg-popover text-popover-foreground">
                    {zones.map((zone) => (
                        <DropdownMenuItem
                            key={zone.id}
                            onClick={() => onSelect(zone.id)}
                            className={cn(
                                "flex items-center justify-between rounded-lg px-3 py-2.5 cursor-pointer transition-colors",
                                selectedZoneId === zone.id
                                    ? "bg-accent text-accent-foreground font-bold"
                                    : "text-foreground focus:bg-accent focus:text-accent-foreground"
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className="h-3 w-3 rounded-full shrink-0"
                                    style={{ backgroundColor: zone.color || "#6366f1" }}
                                />
                                <span className="text-sm">{zone.name}</span>
                            </div>
                            {selectedZoneId === zone.id && <Check className="h-4 w-4 shrink-0" style={{ color: zone.color || "#6366f1" }} />}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
