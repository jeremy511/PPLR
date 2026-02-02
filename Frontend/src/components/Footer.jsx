import React from "react";
import { Link } from "react-router-dom";
import { Heart } from "lucide-react";

export function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="w-full bg-white border-t border-border mt-auto py-6">
            <div className="container max-w-5xl mx-auto px-4 md:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
                <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4">
                    <span className="font-semibold text-foreground">PPLR System</span>
                    <span className="hidden md:inline text-border">|</span>
                    <span>&copy; {currentYear} Congregación Demo</span>
                </div>

                <div className="flex items-center gap-6">
                    <Link to="/help" className="hover:text-foreground transition-colors">
                        Ayuda
                    </Link>
                    <Link to="/privacy" className="hover:text-foreground transition-colors">
                        Privacidad
                    </Link>
                    <Link to="/terms" className="hover:text-foreground transition-colors">
                        Términos
                    </Link>
                </div>

                <div className="flex items-center gap-1.5 text-xs">
                    <span>Hecho con</span>
                    <Heart className="h-3 w-3 text-red-500 fill-red-500" />
                    <span>para la congregación</span>
                </div>
            </div>
        </footer>
    );
}
