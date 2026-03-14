"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

type DashboardChartsProps = {
    litrosPorEquipamento: { nome: string, litros: number }[];
};

export function DashboardCharts({ litrosPorEquipamento }: DashboardChartsProps) {
    return (
        <div className="h-80 w-full mb-8">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={litrosPorEquipamento} margin={{ top: 10, right: 10, left: -20, bottom: 80 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis
                        dataKey="nome"
                        stroke="#64748b"
                        tick={{ fill: '#64748b', fontSize: 12, dy: 30, dx: -20 }}
                        angle={-45}
                        textAnchor="end"
                        interval={0}
                        tickMargin={10}
                    />
                    <YAxis stroke="#64748b" tick={{ fill: '#64748b' }} />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', color: '#0f172a' }}
                        itemStyle={{ color: '#faa954', fontWeight: 'bold' }}
                        cursor={{ fill: '#f1f5f9', opacity: 0.8 }}
                    />
                    <Bar dataKey="litros" name="Total (L)" fill="#faa954" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
