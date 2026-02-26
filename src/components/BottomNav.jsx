import React from 'react';
import { NavLink } from 'react-router-dom';
import { ShoppingBag, Box, BookOpen, History } from 'lucide-react';

const BottomNav = () => {
    return (
        <nav className="fixed bottom-0 left-0 right-0 h-16 bg-[#161b33] border-t border-white/10 flex items-center justify-around px-4 z-50">
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
        </nav>
    );
};

export default BottomNav;
