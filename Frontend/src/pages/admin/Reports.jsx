import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getDashboardMetrics } from "../../api/admin";
import { Layout } from "../../components/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Users, CalendarCheck, AlertCircle, TrendingUp } from "lucide-react";
import Skeleton from "react-loading-skeleton";

const COLORS = ['#4f46e5', '#e5e7eb']; // Indigo vs Gray

export default function Reports() {
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ["dashboardMetrics"],
        queryFn: getDashboardMetrics,
    });

    if (isLoading) return (
        <Layout>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[1, 2, 3, 4].map(i => <Skeleton key={i} height={120} className="rounded-xl" />)}
            </div>
            <Skeleton height={400} className="rounded-xl" />
        </Layout>
    );

    if (error || !data) return (
        <Layout>
            <div className="p-8 text-center bg-red-50 dark:bg-red-950/20 rounded-2xl border border-red-200 dark:border-red-900/40 max-w-lg mx-auto my-12">
                <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-3" />
                <h2 className="text-lg font-bold text-red-900 dark:text-red-300">No se pudieron cargar las estadísticas</h2>
                <p className="text-sm text-red-700 dark:text-red-400 mt-2">
                    {error?.message || "Ocurrió un problema al obtener las métricas del servidor."}
                </p>
                <button
                    onClick={() => refetch()}
                    className="mt-5 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium text-sm transition-colors"
                >
                    Reintentar
                </button>
            </div>
        </Layout>
    );

    const { stats, topZones, recentActivity } = data;

    // Pie Data
    const pieData = [
        { name: 'Cubiertos', value: stats.coveredShiftsThisWeek },
        { name: 'Libres', value: stats.totalShiftsThisWeek - stats.coveredShiftsThisWeek }
    ];

    return (
        <Layout>

                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold tracking-tight">Reportes y Estadísticas</h1>
                    <p className="text-muted-foreground">Visión general del estado de la congregación y el territorio.</p>
                </div>

                {/* KPI CARDS */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Publicadores Activos</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalPublishers}</div>
                            <p className="text-xs text-muted-foreground">Registrados en la plataforma</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Cobertura Semanal</CardTitle>
                            <TrendingUp className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{stats.weeklyCoverage}%</div>
                            <p className="text-xs text-muted-foreground">De turnos ocupados esta semana</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Turnos Totales</CardTitle>
                            <CalendarCheck className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalShiftsThisWeek}</div>
                            <p className="text-xs text-muted-foreground">Disponibles esta semana</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Turnos Cubiertos</CardTitle>
                            <CalendarCheck className="h-4 w-4 text-indigo-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-primary">{stats.coveredShiftsThisWeek}</div>
                            <p className="text-xs text-muted-foreground">Hermanos asignados</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                    {/* TOP ZONES CHART */}
                    <Card className="col-span-4">
                        <CardHeader>
                            <CardTitle>Zonas Más Activas</CardTitle>
                            <CardDescription>Puntos con mayor cantidad de turnos históricos.</CardDescription>
                        </CardHeader>
                        <CardContent className="pl-2">
                            <div className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={topZones}>
                                        <XAxis
                                            dataKey="name"
                                            stroke="#888888"
                                            fontSize={12}
                                            tickLine={false}
                                            axisLine={false}
                                            tickFormatter={(val) => val.length > 10 ? `${val.slice(0, 10)}...` : val}
                                        />
                                        <YAxis
                                            stroke="#888888"
                                            fontSize={12}
                                            tickLine={false}
                                            axisLine={false}
                                            tickFormatter={(value) => `${value}`}
                                        />
                                        <Tooltip
                                            contentStyle={{ background: '#fff', borderRadius: '8px', border: '1px solid #eee' }}
                                            cursor={{ fill: 'transparent' }}
                                        />
                                        <Bar dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={40} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    {/* SHIFT DISTRIBUTION & ACTIVITY */}
                    <Card className="col-span-3">
                        <CardHeader>
                            <CardTitle>Estado Actual (Semana)</CardTitle>
                            <CardDescription>Proporción de turnos cubiertos.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[200px] flex items-center justify-center">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={pieData}
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {pieData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="flex justify-center gap-6 mt-4 text-sm">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-indigo-600"></div>
                                    <span>Cubiertos</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-muted-foreground/30"></div>
                                    <span>Libres</span>
                                </div>
                            </div>

                            {/* Recent Activity Mini-List */}
                            <div className="mt-8">
                                <h4 className="font-semibold text-sm mb-4">Actividad Reciente (Audit Log)</h4>
                                <div className="space-y-4">
                                    {recentActivity.length === 0 && <p className="text-xs text-muted-foreground">No hay actividad reciente.</p>}
                                    {recentActivity.map((log) => (
                                        <div key={log.id} className="flex items-start gap-4 text-sm border-b pb-2 last:border-0">
                                            <div className="min-w-fit mt-1">
                                                <AlertCircle className="h-4 w-4 text-muted-foreground" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-foreground">{log.action.replace('_', ' ')}</p>
                                                <p className="text-xs text-muted-foreground">{log.reason}</p>
                                                <p className="text-[10px] text-muted-foreground mt-1">
                                                    {new Date(log.createdAt).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
        </Layout>
    );
}
