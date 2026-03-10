import React from 'react';
import { NavLink } from 'react-router-dom';
import { ShoppingBag, Box, BookOpen, History, Trophy } from 'lucide-react';

const BottomNav = () => {
    return (
        <nav className="fixed bottom-0 left-0 right-0 h-16 bg-[#161b33] border-t border-white/10 flex items-center justify-around px-4 z-50 md:bottom-8 md:left-1/2 md:-translate-x-1/2 md:w-fit md:h-14 md:gap-12 md:px-10 md:rounded-2xl md:border md:bg-[#161b33]/80 md:backdrop-blur-xl md:shadow-2xl md:shadow-black/50">
            <NavLink
                to="/"
                className={({ isActive }) =>
                    `flex flex-col items-center gap-1 transition-colors ${isActive ? 'text-primary' : 'text-slate-400 hover:text-slate-200'
                    }`
                }
            >
                <ShoppingBag size={24} />
                <span className="text-[10px] font-medium uppercase tracking-wider">Tienda</span>
            </NavLink>

            <NavLink
                to="/collection"
                className={({ isActive }) =>
                    `flex flex-col items-center gap-1 transition-colors ${isActive ? 'text-primary' : 'text-slate-400 hover:text-slate-200'
                    }`
                }
            >
                <BookOpen size={24} />
                <span className="text-[10px] font-medium uppercase tracking-wider">Colección</span>
            </NavLink>

            <NavLink
                to="/history"
                className={({ isActive }) =>
                    `flex flex-col items-center gap-1 transition-colors ${isActive ? 'text-primary' : 'text-slate-400 hover:text-slate-200'
                    }`
                }
            >
                <History size={24} />
                <span className="text-[10px] font-medium uppercase tracking-wider">Historial</span>
            </NavLink>

            <NavLink
                to="/ranking"
                className={({ isActive }) =>
                    `flex flex-col items-center gap-1 transition-colors ${isActive ? 'text-primary' : 'text-slate-400 hover:text-slate-200'
                    }`
                }
            >
                <Trophy size={24} />
                <span className="text-[10px] font-medium uppercase tracking-wider">Ranking</span>
            </NavLink>
        </nav>
    );
};

export default BottomNav;
