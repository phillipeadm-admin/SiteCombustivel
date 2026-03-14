"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

type TrimestralChartProps = {
    data: { mesAno: string, litros: number }[];
};

export function TrimestralChart({ data }: TrimestralChartProps) {
    return (
        <div className="h-[400px] w-full mb-8">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 20, right: 30, left: -10, bottom: 20 }}>
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
    );
}
