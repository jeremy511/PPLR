import React from "react";
import { Layout } from "../components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell } from "lucide-react";

export default function Reminders() {
    return (
        <Layout>
            <section className="bg-card rounded-2xl shadow-sm border border-border p-6 md:p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-indigo-100 rounded-lg">
                            <Bell className="h-6 w-6 text-indigo-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-foreground">Recordatorios</h1>
                            <p className="text-muted-foreground text-sm">
                                Anuncios y recordatorios importantes para la congregación.
                            </p>
                        </div>
                    </div>

                    <div className="grid gap-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Próximamente</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">
                                    No hay recordatorios activos en este momento.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </section>
        </Layout>
    );
}
