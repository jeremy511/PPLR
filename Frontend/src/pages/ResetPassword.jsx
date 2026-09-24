import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { resetPassword } from "../api/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { KeyRound, Loader2, CheckCircle2, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get("token");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isDone, setIsDone] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!token) {
            setError("Falta el código de seguridad. Por favor, usa el enlace que te enviamos por correo.");
        }
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error("Las contraseñas no coinciden");
            return;
        }

        if (password.length < 6) {
            toast.error("La contraseña debe tener al menos 6 caracteres");
            return;
        }

        setIsLoading(true);
        setError("");

        try {
            await resetPassword(token, password);
            setIsDone(true);
            toast.success("Contraseña actualizada con éxito");
            setTimeout(() => navigate("/login"), 3000);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
            <Card className="w-full max-w-md shadow-xl border-t-4 border-t-primary">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center">Nueva Contraseña</CardTitle>
                    <CardDescription className="text-center">
                        {isDone
                            ? "¡Todo listo!"
                            : "Ingresa tu nueva clave de acceso."}
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    {isDone ? (
                        <div className="flex flex-col items-center justify-center py-6 text-center space-y-4">
                            <div className="h-16 w-16 bg-green-50 rounded-full flex items-center justify-center">
                                <CheckCircle2 className="h-10 w-10 text-green-500" />
                            </div>
                            <div className="space-y-2">
                                <p className="font-medium text-foreground">¡Contraseña Cambiada!</p>
                                <p className="text-sm text-muted-foreground">
                                    Serás redirigido al login en unos segundos...
                                </p>
                            </div>
                            <Button variant="outline" className="w-full" onClick={() => navigate("/login")}>
                                Ir al Login ahora
                            </Button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {error ? (
                                <div className="p-4 rounded-lg bg-red-50 text-red-700 text-sm flex items-start gap-3 border border-red-100">
                                    <ShieldAlert className="h-5 w-5 shrink-0 mt-0.5" />
                                    <p>{error}</p>
                                </div>
                            ) : null}

                            <div className="space-y-2">
                                <Label htmlFor="password">Nueva Contraseña</Label>
                                <div className="relative">
                                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="Mínimo 6 caracteres"
                                        className="pl-10"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        disabled={isLoading || !token}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirm-password">Confirmar Contraseña</Label>
                                <div className="relative">
                                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="confirm-password"
                                        type="password"
                                        placeholder="Repite la contraseña"
                                        className="pl-10"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                        disabled={isLoading || !token}
                                    />
                                </div>
                            </div>

                            <Button type="submit" className="w-full" disabled={isLoading || !token}>
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Actualizando...
                                    </>
                                ) : (
                                    "Cambiar Contraseña"
                                )}
                            </Button>
                        </form>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
