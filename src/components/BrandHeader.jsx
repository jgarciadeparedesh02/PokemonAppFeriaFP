import React, { useEffect, useState } from 'react';
import { Shield, Zap, Globe, Package } from 'lucide-react';
import { getGlobalStats } from '../supabase';

const BrandHeader = () => {
    const [stats, setStats] = useState({ count: 0, totalValue: 0 });

    useEffect(() => {
        const fetchStats = async () => {
            const data = await getGlobalStats();
            setStats(data);
        };
        fetchStats();
        const interval = setInterval(fetchStats, 10000); // Actualizar cada 10 seg
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex flex-col gap-4 py-4 mb-2">
            <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10 flex items-center justify-center bg-primary rounded-xl shadow-[0_0_20px_rgba(236,61,70,0.5)]">
                        <Shield className="text-white fill-white/20" size={24} />
                        <div className="absolute -top-1 -right-1">
                            <Zap size={14} className="text-yellow-400 fill-yellow-400 shadow-xl" />
                        </div>
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-white italic tracking-tighter uppercase leading-none">
                            Poke<span className="text-primary">Vault</span>
                        </h1>
                        <p className="text-[8px] text-slate-500 font-bold uppercase tracking-[0.3em] leading-none mt-1">
                            Coleccionista Elite
                        </p>
                    </div>
                </div>

                {/* Meta Colectiva - Stats Globales */}
                <div className="flex items-center gap-4">
                    <div className="flex flex-col items-end">
                        <div className="flex items-center gap-1.5 text-slate-400">
                            <Package size={12} className="text-primary" />
                            <span className="text-[10px] font-bold uppercase tracking-tight">{stats.count} Sobres</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-400">
                            <Globe size={12} className="text-blue-400" />
                            <span className="text-[10px] font-bold uppercase tracking-tight">{stats.totalValue} €</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Barra de progreso visual (opcional/decorativa) */}
            <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>
    );
};

export default BrandHeader;
