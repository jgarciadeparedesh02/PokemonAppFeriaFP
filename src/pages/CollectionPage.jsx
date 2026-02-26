import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { fetchSets, fetchCardsBySet } from '../api/pokemon';
import { useCollection } from '../hooks/useCollection';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, ShieldCheck, X } from 'lucide-react';
import CardImage from '../components/CardImage';
import BrandHeader from '../components/BrandHeader';
import ValueChart from '../components/ValueChart';

const CollectionPage = () => {
    const location = useLocation();
    const [sets, setSets] = useState([]);
    const [selectedSet, setSelectedSet] = useState(location.state?.initialSetId || null);
    const [setDetails, setSetDetails] = useState(null); // To store full info of selected set
    const [cards, setCards] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [activeCard, setActiveCard] = useState(null);
    const [fullCardDetails, setFullCardDetails] = useState(null);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [filterType, setFilterType] = useState('All');
    const [sortBy, setSortBy] = useState('number'); // number, name, price, hp
    const { inventory, getCardCount, valueSnapshots } = useCollection();

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
        if (activeCard) {
            const loadDetails = async () => {
                setLoadingDetails(true);
                // Si ya vienen los detalles completos (como en PackOpening), no hace falta re-fetch
                // Pero en CollectionPage vienen los datos básicos del set list
                if (!activeCard.cardmarket) {
                    const { fetchCardById } = await import('../api/pokemon');
                    const details = await fetchCardById(activeCard.id);
                    setFullCardDetails(details);
                } else {
                    setFullCardDetails(activeCard);
                }
                setLoadingDetails(false);
            };
            loadDetails();
        } else {
            setFullCardDetails(null);
        }
    }, [activeCard]);

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
        let result = cards.filter(card =>
            card.name.toLowerCase().includes(search.toLowerCase())
        );

        if (filterType !== 'All') {
            result = result.filter(card => card.types?.includes(filterType));
        }

        result.sort((a, b) => {
            if (sortBy === 'number') {
                return parseInt(a.localId || 0) - parseInt(b.localId || 0);
            }
            if (sortBy === 'name') return a.name.localeCompare(b.name);
            if (sortBy === 'hp') return (b.hp || 0) - (a.hp || 0);
            if (sortBy === 'price') return (b.pricing?.cardmarket?.avg || 0) - (a.pricing?.cardmarket?.avg || 0);
            return 0;
        });

        return result;
    }, [cards, search, filterType, sortBy]);

    const stats = useMemo(() => {
        if (cards.length === 0) return { collected: 0, total: 0, totalValue: 0 };
        const collectedCards = cards.filter(c => inventory[c.id]);
        return {
            collected: collectedCards.length,
            total: cards.length,
        };
    }, [cards, inventory]);

    // Track card details with pricing for the current set
    const [cardDetailsMap, setCardDetailsMap] = useState({});
    const [expansionValue, setExpansionValue] = useState(0);

    useEffect(() => {
        if (cards.length > 0) {
            const loadPrices = async () => {
                const ownedInSet = cards.filter(c => inventory[c.id]);
                const details = { ...cardDetailsMap };
                let total = 0;

                // Load prices for owned cards that we don't have yet
                for (const card of ownedInSet) {
                    if (!details[card.id]) {
                        try {
                            const { fetchCardById } = await import('../api/pokemon');
                            const data = await fetchCardById(card.id);
                            details[card.id] = data;
                        } catch (e) {
                            console.error("Error fetching price for", card.id);
                        }
                    }

                    const price = details[card.id]?.pricing?.cardmarket?.avg || 0;
                    total += price * (inventory[card.id] || 1);
                }

                setCardDetailsMap(details);
                setExpansionValue(total.toFixed(2));
            };
            loadPrices();
        } else {
            setCardDetailsMap({});
            setExpansionValue(0);
        }
    }, [cards, inventory]);

    return (
        <div className="px-4 pt-6 pb-24">
            {/* Modal Detail */}
            <AnimatePresence>
                {activeCard && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md"
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

                            <div className="rounded-3xl overflow-hidden card-shadow border border-white/20 aspect-[63/88] bg-surface relative">
                                <CardImage
                                    src={activeCard.image ? `${activeCard.image}/high.webp` : ''}
                                    alt={activeCard.name}
                                    className="w-full h-full"
                                    imageClassName="object-contain"
                                    isRare={['Rare', 'Rare Holo', 'Holo Rare', 'Ultra Rare', 'Secret Rare'].some(r => activeCard.rarity?.includes(r))}
                                />
                                {loadingDetails && (
                                    <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px] flex items-center justify-center">
                                        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                )}
                            </div>

                            <div className="mt-6 text-center">
                                <h2 className="text-2xl font-bold text-white">{activeCard.name}</h2>
                                <div className="flex items-center justify-center gap-2 mt-2">
                                    <span className="px-3 py-1 bg-surface border border-white/10 rounded-full text-xs text-slate-400 capitalize">
                                        {formatRarity(activeCard.rarity)}
                                    </span>
                                    {fullCardDetails?.pricing?.cardmarket?.avg && (
                                        <span className="px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full text-xs text-green-400 font-bold">
                                            {fullCardDetails.pricing.cardmarket.avg}€ (Cardmarket)
                                        </span>
                                    )}
                                </div>
                                <p className="text-[10px] text-slate-500 mt-3 font-mono uppercase">ID: {activeCard.id}</p>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <header className="mb-6">
                {!selectedSet && <BrandHeader />}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
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
                </div>

                {!selectedSet ? (
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar expansión..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full glass rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-primary/50 transition-colors"
                        />
                    </div>
                ) : (
                    <div className="flex flex-col gap-4 mt-4">
                        <ValueChart data={valueSnapshots} />

                        <div className="grid grid-cols-2 gap-3">
                            <div className="glass-dark rounded-2xl p-3">
                                <p className="text-[10px] uppercase text-slate-400 font-bold mb-1">Cartas Obtenidas</p>
                                <p className="text-xl font-black text-white">{stats.collected} / {stats.total}</p>
                            </div>
                            <div className="bg-green-500/5 border border-green-500/10 backdrop-blur-md rounded-2xl p-3">
                                <p className="text-[10px] uppercase text-green-400 font-bold mb-1">Valor Estimado</p>
                                <p className="text-xl font-black text-green-400">{expansionValue} €</p>
                            </div>
                        </div>

                        {/* Filtros Rápidos */}
                        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                            {['All', 'Fire', 'Water', 'Grass', 'Lightning', 'Psychic', 'Fighting', 'Colorless'].map(type => (
                                <button
                                    key={type}
                                    onClick={() => setFilterType(type)}
                                    className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase transition-all whitespace-nowrap ${filterType === type
                                        ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                        : 'glass text-slate-400 hover:text-white'
                                        }`}
                                >
                                    {type === 'All' ? 'Todos' : type}
                                </button>
                            ))}
                        </div>

                        <div className="flex justify-between items-center bg-black/20 rounded-xl p-1 border border-white/5">
                            {['number', 'name', 'price', 'hp'].map(sort => (
                                <button
                                    key={sort}
                                    onClick={() => setSortBy(sort)}
                                    className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${sortBy === sort ? 'bg-white/10 text-white' : 'text-slate-500'
                                        }`}
                                >
                                    {sort === 'number' ? '#' : sort === 'name' ? 'Nombre' : sort === 'price' ? 'Precio' : 'HP'}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </header>

            {!selectedSet ? (
                /* SETS LIST VIEW */
                <div className="grid grid-cols-1 gap-4">
                    {sets.filter(s => s.name.toLowerCase().includes(search.toLowerCase())).map(set => {
                        const collectedInSet = Object.keys(inventory).filter(id => id.startsWith(set.id)).length;
                        const totalInSet = set.cardCount?.total || 0;
                        const progress = totalInSet > 0 ? Math.round((collectedInSet / totalInSet) * 100) : 0;

                        return (
                            <motion.div
                                key={set.id}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setSelectedSet(set.id)}
                                className="glass rounded-2xl p-4 flex items-center gap-4 cursor-pointer hover:bg-white/5 transition-colors card-shadow"
                            >
                                <div className="w-16 h-16 glass-dark rounded-xl flex items-center justify-center p-2 flex-shrink-0">
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
                                            {collectedInSet} / {totalInSet} únicas
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
                                const details = cardDetailsMap[card.id];
                                const price = details?.pricing?.cardmarket?.avg;

                                return (
                                    <motion.div
                                        key={card.id}
                                        layoutId={card.id}
                                        onClick={() => setActiveCard(card)}
                                        className={`relative aspect-[63/88] rounded-lg overflow-hidden cursor-pointer transition-all active:scale-95 ${!owned ? 'grayscale opacity-40 brightness-50' : 'card-shadow ring-1 ring-white/10'
                                            }`}
                                    >
                                        <CardImage
                                            src={card.image ? `${card.image}/low.webp` : ''}
                                            alt={card.name}
                                            className="w-full h-full"
                                            imageClassName="object-cover"
                                            isRare={owned && (card.rarity?.includes('Rare') || card.rarity?.includes('Rara'))}
                                        />

                                        {owned && count > 1 && (
                                            <div className="absolute top-1 right-1 bg-primary text-white text-[10px] font-black px-1.5 h-5 rounded-full flex items-center justify-center shadow-lg ring-1 ring-black/50 min-w-[20px]">
                                                x{count}
                                            </div>
                                        )}

                                        {owned && price && (
                                            <div className="absolute bottom-1 left-1 right-1 bg-black/60 backdrop-blur-md rounded-md py-0.5 px-1 flex items-center justify-center">
                                                <span className="text-[9px] font-black text-green-400">
                                                    {price}€
                                                </span>
                                            </div>
                                        )}

                                        {owned && (card.rarity?.includes('Rare') || card.rarity?.includes('Rara')) && (
                                            <div className="absolute inset-0 pointer-events-none" />
                                        )}
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default CollectionPage;
