"use client";

import { useEffect, useState, useTransition } from "react";
import { Navigation } from "@/components/Navigation";
import { TrendingUp, Loader2 } from "lucide-react";
import { getUltimos3MesesData } from "@/app/actions";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function DashboardTrimestralPage() {
    const [chartTresMeses, setChartTresMeses] = useState<{ mesAno: string, litros: number }[]>([]);
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        startTransition(async () => {
            const tMeses = await getUltimos3MesesData();
            setChartTresMeses(tMeses);
        });
    }, []);

    // Totalizar os litros do trimestre
    const totalTrimestre = chartTresMeses.reduce((acc, curr) => acc + curr.litros, 0);

    return (
        <div className="space-y-6 relative">
            <Navigation />

            <header className="mb-8 pt-4 text-center md:text-left">
                <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#006fb3] to-[#faa954]">
                    Dashboard Trimestral
                </h1>
                <p className="text-slate-400 mt-2">
                    Evolução do volume abastecido nos últimos 3 meses
                </p>
            </header>

            {isPending && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-3xl">
                    <Loader2 className="w-10 h-10 text-[#006fb3] animate-spin" />
                </div>
            )}

            {/* Total Consolidados */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-lg relative overflow-hidden group">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#006fb3]/5 rounded-full blur-xl group-hover:bg-[#006fb3]/10 transition-all"></div>
                <div className="flex items-center justify-between relative">
                    <div>
                        <p className="text-slate-500 font-medium mb-1">Acumulado do Trimestre</p>
                        <h3 className="text-3xl font-bold text-slate-900">
                            {totalTrimestre.toFixed(1)} <span className="text-lg text-slate-500 font-normal">L</span>
                        </h3>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-xl text-[#006fb3]">
                        <TrendingUp className="w-8 h-8" />
                    </div>
                </div>
            </div>

            {/* Gráfico */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-lg mt-6">
                <div className="flex flex-col mb-6 gap-4">
                    <h2 className="text-xl font-bold text-slate-900">Evolução Mensal</h2>
                </div>
                <div className="h-[400px] w-full mb-8">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartTresMeses} margin={{ top: 20, right: 30, left: -10, bottom: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                            <XAxis
                                dataKey="mesAno"
                                stroke="#64748b"
                                tick={{ fill: '#64748b', fontSize: 13 }}
                                tickMargin={15}
                            />
                            <YAxis stroke="#64748b" tick={{ fill: '#64748b' }} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', color: '#0f172a' }}
                                itemStyle={{ color: '#006fb3', fontWeight: 'bold' }}
                                cursor={{ fill: '#f1f5f9', opacity: 0.8 }}
                            />
                            <Bar dataKey="litros" name="Total (L)" fill="#006fb3" radius={[6, 6, 0, 0]} barSize={80} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
