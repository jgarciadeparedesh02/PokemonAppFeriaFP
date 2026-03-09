import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, TrendingUp, Star, Award, X, Globe, User, RefreshCcw } from 'lucide-react';
import { useCollection } from '../hooks/useCollection';
import { getGlobalRanking } from '../supabase';
import BrandHeader from '../components/BrandHeader';
import CardImage from '../components/CardImage';

const RankingPage = () => {
    const { history, inventory, profile } = useCollection();
    const [activeCard, setActiveCard] = useState(null);
    const [activeTab, setActiveTab] = useState('local'); // 'local' or 'global'
    const [globalCards, setGlobalCards] = useState([]);
    const [loadingGlobal, setLoadingGlobal] = useState(false);

    // 1. Obtener todas las cartas que el usuario ha abierto
    const allOpenedCards = history.reduce((acc, entry) => {
        return [...acc, ...entry.cards];
    }, []);

    // 2. Encontrar el "Top 5" por precio (usando Cardmarket Avg)
    const topCards = [...allOpenedCards]
        .sort((a, b) => (b.pricing?.cardmarket?.avg || 0) - (a.pricing?.cardmarket?.avg || 0))
        .filter((card, index, self) =>
            index === self.findIndex((t) => t.id === card.id)
        )
        .slice(0, 10);

    // 3. Estadísticas generales
    const collectionValue = allOpenedCards.reduce((sum, c) => sum + (c.pricing?.cardmarket?.avg || 0), 0).toFixed(2);

    const loadGlobal = async () => {
        setLoadingGlobal(true);
        const data = await getGlobalRanking();
        setGlobalCards(data);
        setLoadingGlobal(false);
    };

    useEffect(() => {
        if (activeTab === 'global') {
            loadGlobal();
        }
    }, [activeTab]);

    return (
        <div className="px-4 pt-4 pb-24">
            <BrandHeader />

            <div className="flex bg-surface/50 p-1 rounded-2xl border border-white/5 mt-6 mb-8">
                <button
                    onClick={() => setActiveTab('local')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all ${activeTab === 'local' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-500 hover:text-slate-300'}`}
                >
                    <User size={16} /> Mis Tesoros
                </button>
                <button
                    onClick={() => setActiveTab('global')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all ${activeTab === 'global' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-500 hover:text-slate-300'}`}
                >
                    <Globe size={16} /> Ranking Feria
                </button>
            </div>

            <header className="mb-8">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 via-white to-yellow-600 bg-clip-text text-transparent flex items-center gap-2">
                    <Trophy className="text-yellow-500" />
                    {activeTab === 'local' ? 'Mi Salón de la Fama' : 'TOP Coleccionistas'}
                </h2>
                <p className="text-slate-400 mt-1">
                    {activeTab === 'local'
                        ? 'Tus mayores tesoros encontrados hasta ahora'
                        : 'Las cartas más valiosas abiertas en este taller'}
                </p>
            </header>

            {activeTab === 'local' && (
                <div className="grid grid-cols-2 gap-3 mb-8">
                    <div className="bg-surface/50 border border-white/5 p-4 rounded-2xl backdrop-blur-sm">
                        <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">
                            <TrendingUp size={12} className="text-green-500" /> Valor Total
                        </div>
                        <div className="text-xl font-black text-white">{collectionValue} €</div>
                    </div>
                    <div className="bg-surface/50 border border-white/5 p-4 rounded-2xl backdrop-blur-sm">
                        <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">
                            <Star size={12} className="text-yellow-500" /> Cartas Únicas
                        </div>
                        <div className="text-xl font-black text-white">{Object.keys(inventory).length}</div>
                    </div>
                </div>
            )}

            <div className="space-y-4">
                {activeTab === 'local' ? (
                    topCards.length === 0 ? (
                        <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-3xl">
                            <p className="text-slate-500 text-sm">Aún no has descubierto tesoros.<br />¡Abre algunos sobres en la tienda!</p>
                        </div>
                    ) : (
                        topCards.map((card, index) => (
                            <RankingItem
                                key={card.id}
                                card={card}
                                index={index}
                                onZoom={setActiveCard}
                            />
                        ))
                    )
                ) : (
                    loadingGlobal ? (
                        <div className="py-20 flex flex-col items-center justify-center gap-4">
                            <RefreshCcw className="text-primary animate-spin" size={32} />
                            <p className="text-slate-500 text-sm">Consultando oráculo de la feria...</p>
                        </div>
                    ) : globalCards.length === 0 ? (
                        <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-3xl">
                            <p className="text-slate-500 text-sm">La base de datos está vacía.<br />¡Sé el primero en abrir un sobre!</p>
                            <button onClick={loadGlobal} className="mt-4 text-xs text-primary font-bold uppercase">Reintentar</button>
                        </div>
                    ) : (
                        globalCards.map((entry, index) => (
                            <RankingItem
                                key={entry.id}
                                card={{
                                    id: entry.card_id,
                                    name: entry.card_name,
                                    image: entry.card_image,
                                    rarity: entry.rarity,
                                    pricing: { cardmarket: { avg: entry.price } }
                                }}
                                index={index}
                                trainerName={entry.trainer_name}
                                onZoom={setActiveCard}
                            />
                        ))
                    )
                )}
            </div>


            <AnimatePresence>
                {activeCard && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/95 backdrop-blur-md"
                        onClick={() => setActiveCard(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.8, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.8, y: 20 }}
                            className="relative max-w-sm w-full"
                            onClick={e => e.stopPropagation()}
                        >
                            <button
                                onClick={() => setActiveCard(null)}
                                className="absolute -top-14 right-0 p-2 text-white/50 hover:text-white"
                            >
                                <X size={32} />
                            </button>

                            <div className="rounded-3xl overflow-hidden shadow-2xl border border-white/10 aspect-[2/3] bg-surface relative">
                                <CardImage
                                    src={activeCard.image ? `${activeCard.image}/high.webp` : ''}
                                    alt={activeCard.name}
                                    className="w-full h-full"
                                    imageClassName="object-contain"
                                />
                                {(['Rare', 'Ultra', 'Secret'].some(r => activeCard.rarity?.includes(r))) && (
                                    <div className="absolute inset-0 holo-effect pointer-events-none opacity-40" />
                                )}
                            </div>

                            <div className="mt-6 text-center">
                                <h2 className="text-2xl font-bold text-white">{activeCard.name}</h2>
                                <div className="flex items-center justify-center gap-2 mt-2">
                                    <span className="px-3 py-1 bg-surface border border-white/10 rounded-full text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                                        {activeCard.rarity || 'Normal'}
                                    </span>
                                    {activeCard.pricing?.cardmarket?.avg && (
                                        <span className="px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full text-xs text-green-400 font-bold">
                                            {activeCard.pricing.cardmarket.avg}€ (Cardmarket)
                                        </span>
                                    )}
                                </div>
                                <p className="text-[10px] text-slate-500 mt-4 font-mono uppercase">SET ID: {activeCard.id}</p>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const RankingItem = ({ card, index, trainerName, onZoom }) => (
    <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.05 }}
        onClick={() => onZoom(card)}
        className="relative flex items-center gap-4 bg-surface-hover/30 border border-white/10 p-3 rounded-2xl overflow-hidden group cursor-pointer active:scale-95 transition-transform"
    >
        <div className={`
            w-8 h-8 rounded-full flex items-center justify-center font-black text-sm z-10
            ${index === 0 ? 'bg-yellow-500 text-black shadow-[0_0_15px_rgba(234,179,8,0.5)]' :
                index === 1 ? 'bg-slate-300 text-black' :
                    index === 2 ? 'bg-amber-700 text-white' : 'bg-white/10 text-slate-400'}
        `}>
            {index + 1}
        </div>

        <div className="w-16 aspect-[2/3] rounded-lg overflow-hidden shadow-lg ring-1 ring-white/10">
            <CardImage
                src={card.image ? `${card.image}/low.webp` : ''}
                alt={card.name}
            />
        </div>

        <div className="flex-1 min-w-0">
            <h4 className="font-bold text-slate-100 truncate">{card.name}</h4>
            {trainerName && (
                <p className="text-[10px] text-primary font-black uppercase tracking-tighter mb-1 flex items-center gap-1">
                    <User size={10} /> {trainerName}
                </p>
            )}
            <div className="flex items-baseline gap-1">
                <span className="text-green-400 font-black">{card.pricing?.cardmarket?.avg || '0.00'}</span>
                <span className="text-[10px] text-green-500/50 font-bold">€</span>
            </div>
        </div>

        <div className="pr-2 opacity-20 group-hover:opacity-100 transition-opacity">
            {index === 0 && <Award size={32} className="text-yellow-500" />}
            {index > 0 && <Star size={24} className="text-white/20" />}
        </div>

        {index === 0 && (
            <div className="absolute inset-0 bg-yellow-500/5 blur-xl -z-10" />
        )}
    </motion.div>
);

export default RankingPage;
