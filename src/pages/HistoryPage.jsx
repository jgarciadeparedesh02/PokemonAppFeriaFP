import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCollection } from '../hooks/useCollection';
import { History, X, ChevronRight, Sparkles, Calendar, Box } from 'lucide-react';
import CardImage from '../components/CardImage';
import BrandHeader from '../components/BrandHeader';

const HistoryPage = () => {
    const { history } = useCollection();
    const [selectedPack, setSelectedPack] = useState(null);

    const formatRarity = (rarity) => {
        if (!rarity) return 'Común';
        return rarity
            .replace('Commún', 'Común')
            .replace('Uncommon', 'Poco común')
            .replace('Rara Secreto', 'Secreta')
            .replace('Entrenador de arte completo', 'Full Art');
    };

    const formatDate = (isoString) => {
        const date = new Date(isoString);
        return new Intl.DateTimeFormat('es-ES', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    return (
        <div className="px-4 pt-4 pb-24 min-h-screen">
            <BrandHeader />
            <header className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                    <History className="text-primary" size={28} />
                    <h1 className="text-3xl font-bold text-white">Historial</h1>
                </div>
                <p className="text-slate-400 text-sm">Registro de tus últimos sobres abiertos</p>
            </header>

            <div className="space-y-4">
                {history.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center uppercase tracking-widest text-slate-600">
                        <Box size={48} className="mb-4 opacity-20" />
                        <p className="text-xs font-bold">No hay sobres en el historial</p>
                    </div>
                ) : (
                    history.map((pack) => (
                        <motion.div
                            key={pack.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            onClick={() => setSelectedPack(pack)}
                            className="bg-surface rounded-2xl p-4 border border-white/5 flex items-center gap-4 cursor-pointer hover:bg-white/5 transition-colors group active:scale-[0.98]"
                        >
                            <div className="w-14 h-14 bg-black/20 rounded-xl flex items-center justify-center p-2 flex-shrink-0">
                                {pack.setLogo ? (
                                    <img src={`${pack.setLogo}.webp`} alt="" className="max-w-full max-h-full object-contain" />
                                ) : (
                                    <Sparkles className="text-white/20" />
                                )}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-0.5">
                                    <h3 className="text-white font-bold truncate text-sm">{pack.setName}</h3>
                                    <span className="text-[10px] text-slate-500 flex items-center gap-1">
                                        <Calendar size={10} />
                                        {formatDate(pack.timestamp)}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                                        {pack.cards.length} cartas
                                    </p>
                                    <p className="text-sm font-black text-green-400">
                                        {pack.totalValue} €
                                    </p>
                                </div>
                            </div>

                            <ChevronRight className="text-slate-600 group-hover:text-primary transition-colors" size={20} />
                        </motion.div>
                    ))
                )}
            </div>

            {/* Pack Detail Modal */}
            <AnimatePresence>
                {selectedPack && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
                        onClick={() => setSelectedPack(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-surface border border-white/10 rounded-[2.5rem] w-full max-w-md max-h-[85vh] overflow-hidden flex flex-col"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5">
                                <div>
                                    <h3 className="text-lg font-bold text-white">{selectedPack.setName}</h3>
                                    <p className="text-xs text-slate-400">{formatDate(selectedPack.timestamp)}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] text-slate-500 uppercase font-black">Valor Total</p>
                                    <p className="text-xl font-black text-green-400">{selectedPack.totalValue} €</p>
                                </div>
                                <button
                                    onClick={() => setSelectedPack(null)}
                                    className="ml-4 p-2 bg-black/20 rounded-full text-slate-400 hover:text-white"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 no-scrollbar">
                                <div className="grid grid-cols-2 gap-3">
                                    {selectedPack.cards.map((card, idx) => (
                                        <div key={`${card.id}-${idx}`} className="bg-black/20 rounded-2xl p-2 border border-white/5">
                                            <div className="aspect-[2/3] rounded-xl overflow-hidden mb-2 relative">
                                                <CardImage
                                                    src={card.image ? `${card.image}/low.webp` : ''}
                                                    alt={card.name}
                                                />
                                                {card.pricing?.cardmarket?.avg && (
                                                    <div className="absolute bottom-1 right-1 bg-green-500 text-black text-[9px] font-black px-1.5 py-0.5 rounded-md shadow-lg">
                                                        {card.pricing.cardmarket.avg}€
                                                    </div>
                                                )}
                                            </div>
                                            <h4 className="text-[10px] font-bold text-white truncate px-1">{card.name}</h4>
                                            <p className="text-[8px] text-slate-500 px-1 uppercase tracking-tighter">
                                                {formatRarity(card.rarity)}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="p-4 bg-black/20 text-center">
                                <button
                                    onClick={() => setSelectedPack(null)}
                                    className="w-full py-3 bg-white text-black font-bold rounded-2xl text-sm"
                                >
                                    Cerrar
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default HistoryPage;
