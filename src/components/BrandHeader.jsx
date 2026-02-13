import React from 'react';
import { Shield, Zap } from 'lucide-react';

const BrandHeader = () => {
    return (
        <div className="flex items-center gap-3 py-4 mb-2">
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
    );
};

export default BrandHeader;
