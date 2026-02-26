import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const ValueChart = ({ data }) => {
    if (!data || data.length === 0) {
        return (
            <div className="h-40 glass rounded-2xl flex items-center justify-center p-4 text-center">
                <p className="text-xs text-slate-500 font-medium">Abre tu primer sobre para ver el gráfico de valor de tu colección</p>
            </div>
        );
    }

    return (
        <div className="h-48 glass rounded-2xl p-4 overflow-hidden relative">
            <h4 className="absolute top-4 left-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest z-10">Valor Histórico (€)</h4>
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                    data={data}
                    margin={{ top: 30, right: 0, left: -20, bottom: 0 }}
                >
                    <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                    <XAxis
                        dataKey="date"
                        hide
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#64748b', fontSize: 10 }}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#0f172a',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '12px',
                            fontSize: '12px'
                        }}
                        itemStyle={{ color: '#22c55e' }}
                    />
                    <Area
                        type="monotone"
                        dataKey="value"
                        stroke="#22c55e"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorValue)"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

export default ValueChart;
