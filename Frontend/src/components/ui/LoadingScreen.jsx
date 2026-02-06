import React from "react";

export function LoadingScreen({ text = "Cargando..." }) {
    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6">
            <div className="loader" />
            <p className="text-muted-foreground font-medium animate-pulse tracking-wide">
                {text}
            </p>
        </div>
    );
}
