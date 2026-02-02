import React, { useState } from "react";
import { Link } from "react-router-dom";
import { forgotPassword } from "../api/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Mail, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSent, setIsSent] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            await forgotPassword(email);
            setIsSent(true);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
            <Card className="w-full max-w-md shadow-xl border-t-4 border-t-indigo-500">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center">Recuperar Contraseña</CardTitle>
                    <CardDescription className="text-center">
                        {isSent
                            ? "Revisa tu bandeja de entrada"
                            : "Ingresa tu correo y te enviaremos un link para volver a entrar."}
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    {isSent ? (
                        <div className="flex flex-col items-center justify-center py-6 text-center space-y-4">
                            <div className="h-16 w-16 bg-green-50 rounded-full flex items-center justify-center">
                                <CheckCircle2 className="h-10 w-10 text-green-500" />
                            </div>
                            <div className="space-y-2">
                                <p className="font-medium text-gray-900">¡Correo enviado!</p>
                                <p className="text-sm text-gray-500">
                                    Si <b>{email}</b> está registrado, recibirás un enlace en los próximos minutos.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Correo Electrónico</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="ejempl@correo.com"
                                        className="pl-10"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>

                            {error && (
                                <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm font-medium border border-red-100 italic">
                                    {error}
                                </div>
                            )}

                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Enviando...
                                    </>
                                ) : (
                                    "Enviar Enlace de Recuperación"
                                )}
                            </Button>
                        </form>
                    )}
                </CardContent>

                <CardFooter>
                    <Link
                        to="/login"
                        className="flex items-center justify-center w-full text-sm font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Volver al inicio de sesión
                    </Link>
                </CardFooter>
            </Card>
        </div>
    );
}
