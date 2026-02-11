import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { fetchSets, fetchCardsBySet } from '../api/pokemon';
import { useCollection } from '../hooks/useCollection';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, ShieldCheck, X } from 'lucide-react';

const CollectionPage = () => {
    const location = useLocation();
    const [sets, setSets] = useState([]);
    const [selectedSet, setSelectedSet] = useState(location.state?.initialSetId || null);
    const [setDetails, setSetDetails] = useState(null); // To store full info of selected set
    const [cards, setCards] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [activeCard, setActiveCard] = useState(null);
    const { inventory, getCardCount } = useCollection();

    const formatRarity = (rarity) => {
        if (!rarity) return 'Común';
        // Fix weird spellings from API
        return rarity
            .replace('Commún', 'Común')
            .replace('Uncommon', 'Poco común')
            .replace('Rara Secreto', 'Secreta')
            .replace('Entrenador de arte completo', 'Full Art');
    };

    useEffect(() => {
        const loadSets = async () => {
            const data = await fetchSets();
            setSets(data);
        };
        loadSets();
    }, []);

    useEffect(() => {
        if (selectedSet) {
            const loadCards = async () => {
                setLoading(true);
                const data = await fetchCardsBySet(selectedSet);
                setCards(data);
                // Also get the set details for the header
                const setInfo = sets.find(s => s.id === selectedSet);
                setSetDetails(setInfo);
                setLoading(false);
            };
            loadCards();
        } else {
            setCards([]);
            setSetDetails(null);
        }
    }, [selectedSet, sets]);

    const filteredCards = useMemo(() => {
        return cards.filter(card =>
            card.name.toLowerCase().includes(search.toLowerCase())
        );
    }, [cards, search]);

    const stats = useMemo(() => {
        if (cards.length === 0) return { collected: 0, total: 0 };
        const collectedCount = cards.filter(c => inventory[c.id]).length;
        return { collected: collectedCount, total: cards.length };
    }, [cards, inventory]);

    return (
        <div className="px-4 pt-6 pb-24 min-h-screen">
            <header className="mb-6">
                <div className="flex items-center gap-3 mb-4">
                    {selectedSet && (
                        <button
                            onClick={() => setSelectedSet(null)}
                            className="p-2 bg-surface rounded-xl border border-white/5 text-slate-400"
                        >
                            <X size={20} />
                        </button>
                    )}
                    <h1 className="text-3xl font-bold text-white">
                        {selectedSet ? setDetails?.name : 'Mi Colección'}
                    </h1>
                </div>

                {!selectedSet && (
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar en toda la colección..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-surface border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-primary/50 transition-colors"
                        />
                    </div>
                )}
            </header>

            {!selectedSet ? (
                /* SETS LIST VIEW */
                <div className="grid grid-cols-1 gap-4">
                    {sets.filter(s => s.name.toLowerCase().includes(search.toLowerCase())).map(set => {
                        // Calculate progress for this set
                        // Note: This requires knowing which cards are in which set in the inventory
                        // For now we'll show the card count if available
                        const collectedInSet = Object.keys(inventory).filter(id => id.startsWith(set.id)).length;
                        const totalInSet = set.cardCount?.total || 0;
                        const progress = totalInSet > 0 ? Math.round((collectedInSet / totalInSet) * 100) : 0;

                        return (
                            <motion.div
                                key={set.id}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setSelectedSet(set.id)}
                                className="bg-surface rounded-2xl p-4 border border-white/5 flex items-center gap-4 cursor-pointer hover:bg-white/5 transition-colors"
                            >
                                <div className="w-16 h-16 bg-black/20 rounded-xl flex items-center justify-center p-2 flex-shrink-0">
                                    {set.logo ? (
                                        <img src={`${set.logo}.webp`} alt="" className="max-w-full max-h-full object-contain" />
                                    ) : (
                                        <div className="text-xl font-bold text-white/20 uppercase">{set.id.slice(0, 2)}</div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-white font-bold truncate">{set.name}</h3>
                                    <div className="flex items-center gap-3 mt-1">
                                        <div className="flex-1 h-1.5 bg-black/20 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-primary transition-all duration-500"
                                                style={{ width: `${progress}%` }}
                                            />
                                        </div>
                                        <span className="text-[10px] font-mono text-slate-500 whitespace-nowrap">
                                            {collectedInSet} / {totalInSet}
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            ) : (
                /* CARDS GRID VIEW */
                <>
                    {/* Progress Bar for the specific set */}
                    <div className="bg-surface rounded-2xl p-4 mb-6 border border-white/5">
                        <div className="flex justify-between items-end mb-2">
                            <div>
                                <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Progreso de la expansión</p>
                                <p className="text-xl font-black text-white">{stats.collected} / {stats.total}</p>
                            </div>
                            <p className="text-primary font-bold text-sm">
                                {stats.total > 0 ? Math.round((stats.collected / stats.total) * 100) : 0}%
                            </p>
                        </div>
                        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${(stats.collected / (stats.total || 1)) * 100}%` }}
                                className="h-full bg-primary"
                            />
                        </div>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-3 gap-3 animate-pulse">
                            {[...Array(9)].map((_, i) => (
                                <div key={i} className="aspect-[2/3] bg-surface rounded-lg border border-white/5" />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-3 gap-3">
                            {filteredCards.map((card) => {
                                const owned = !!inventory[card.id];
                                const count = getCardCount(card.id);

                                return (
                                    <motion.div
                                        key={card.id}
                                        layoutId={card.id}
                                        onClick={() => setActiveCard(card)}
                                        className={`relative aspect-[2/3] rounded-lg overflow-hidden cursor-pointer transition-all active:scale-95 ${!owned ? 'grayscale opacity-40 brightness-50' : 'card-shadow ring-1 ring-white/10'
                                            }`}
                                    >
                                        <img
                                            src={card.image ? `${card.image}/low.webp` : ''}
                                            alt={card.name}
                                            className="w-full h-full object-cover"
                                            loading="lazy"
                                        />

                                        {owned && count > 1 && (
                                            <div className="absolute top-1 right-1 bg-primary text-white text-[10px] font-black px-1.5 h-5 rounded-full flex items-center justify-center shadow-lg ring-1 ring-black/50 min-w-[20px]">
                                                x{count}
                                            </div>
                                        )}

                                        {owned && (card.rarity?.includes('Rare') || card.rarity?.includes('Rara')) && (
                                            <div className="absolute inset-0 holo-effect opacity-30" />
                                        )}
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </>
            )}

            {/* Card Detail Modal */}
            <AnimatePresence>
                {activeCard && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-sm"
                        onClick={() => setActiveCard(null)}
                    >
                        <motion.div
                            layoutId={activeCard.id}
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.8 }}
                            className="relative max-w-sm w-full"
                            onClick={e => e.stopPropagation()}
                        >
                            <button
                                onClick={() => setActiveCard(null)}
                                className="absolute -top-12 right-0 p-2 text-white/50 hover:text-white"
                            >
                                <X size={32} />
                            </button>

                            <div className="rounded-3xl overflow-hidden shadow-2xl border border-white/10">
                                <img
                                    src={activeCard.image ? `${activeCard.image}/high.webp` : ''}
                                    alt={activeCard.name}
                                    className="w-full h-auto"
                                />
                            </div>

                            <div className="mt-6 text-center">
                                <h2 className="text-2xl font-bold text-white">{activeCard.name}</h2>
                                <div className="flex items-center justify-center gap-2 mt-2">
                                    <span className="px-3 py-1 bg-surface border border-white/10 rounded-full text-xs text-slate-400 capitalize">
                                        {formatRarity(activeCard.rarity)}
                                    </span>
                                    <span className="px-3 py-1 bg-surface border border-white/10 rounded-full text-xs text-slate-400 font-mono">
                                        {activeCard.id}
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CollectionPage;
