import React, { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertTriangle } from "lucide-react";

export function ConfirmationDialog({
    isOpen,
    onOpenChange,
    onConfirm,
    title = "¿Estás seguro?",
    description = "Esta acción no se puede deshacer.",
    confirmText = "Confirmar",
    cancelText = "Cancelar",
    variant = "destructive",
    requireReason = false,
    reasonPlaceholder = "Indica el motivo..."
}) {
    const [reason, setReason] = useState("");

    const handleConfirm = () => {
        if (requireReason && !reason.trim()) return;
        onConfirm(reason);
        setReason("");
        onOpenChange(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[400px] rounded-2xl border-none shadow-2xl">
                <DialogHeader className="flex flex-col items-center text-center space-y-3">
                    <div className={`p-3 rounded-full ${variant === 'destructive' ? 'bg-destructive/10' : 'bg-amber-500/10'}`}>
                        <AlertTriangle className={`h-6 w-6 ${variant === 'destructive' ? 'text-destructive' : 'text-amber-500'}`} />
                    </div>
                    <DialogTitle className="text-xl font-bold text-foreground">
                        {title}
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground max-w-[280px]">
                        {description}
                    </DialogDescription>
                </DialogHeader>

                {requireReason && (
                    <div className="py-2 space-y-2">
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">Motivo requerido</label>
                        <Input
                            placeholder={reasonPlaceholder}
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="rounded-xl h-11 border-border focus:border-primary/50"
                            autoFocus
                        />
                    </div>
                )}

                <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-4">
                    <Button
                        variant="secondary"
                        onClick={() => {
                            setReason("");
                            onOpenChange(false);
                        }}
                        className="flex-1 rounded-xl h-11 font-semibold border-border"
                    >
                        {cancelText}
                    </Button>
                    <Button
                        variant={variant === 'destructive' ? 'destructive' : 'default'}
                        onClick={handleConfirm}
                        disabled={requireReason && !reason.trim()}
                        className={`flex-1 rounded-xl h-11 font-bold ${variant !== 'destructive' ? 'bg-indigo-600 hover:bg-indigo-700' : ''}`}
                    >
                        {confirmText}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
