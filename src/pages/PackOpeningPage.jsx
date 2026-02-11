import React, { useState, useEffect } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchRandomCardsFromSet } from '../api/pokemon';
import { useCollection } from '../hooks/useCollection';
import { X, Sparkles, AlertCircle } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
    return twMerge(clsx(inputs));
}

const PackOpeningPage = () => {
    const { setId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const setInfo = location.state?.set;
    const { addCardsToCollection } = useCollection();

    const formatRarity = (rarity) => {
        if (!rarity) return 'Común';
        return rarity
            .replace('Commún', 'Común')
            .replace('Uncommon', 'Poco común')
            .replace('Rara Secreto', 'Secreta')
            .replace('Entrenador de arte completo', 'Full Art');
    };

    const [phase, setPhase] = useState('loading'); // loading, pack, tearing, stack, finished
    const [cards, setCards] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isShaking, setIsShaking] = useState(false);
    const [resetToken, setResetToken] = useState(0);

    const handleReset = () => {
        setPhase('loading');
        setCards([]);
        setCurrentIndex(0);
        setIsShaking(false);
        setResetToken(prev => prev + 1);
    };

    useEffect(() => {
        const initPack = async () => {
            const packCards = await fetchRandomCardsFromSet(setId);
            if (packCards.length === 0) {
                setPhase('error');
                return;
            }
            setCards(packCards);
            setPhase('pack');
        };
        initPack();
    }, [setId, resetToken]);

    const handlePackTap = () => {
        if (phase !== 'pack') return;

        setIsShaking(true);
        setTimeout(() => {
            setIsShaking(false);
            setPhase('tearing');
            setTimeout(() => {
                setPhase('stack');
                // Save to collection immediately when revealed
                addCardsToCollection(cards);
            }, 800);
        }, 500);
    };

    const handleCardTap = () => {
        if (currentIndex < cards.length - 1) {
            setCurrentIndex(prev => prev + 1);
        } else {
            setPhase('finished');
        }
    };

    if (phase === 'loading') {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <motion.div
                    animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="w-24 h-32 bg-slate-800 rounded-lg border-4 border-slate-700 mb-4 opacity-50"
                />
                <p className="text-slate-400 animate-pulse">Preparando sobre de mejora...</p>
            </div>
        );
    }

    if (phase === 'error') {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center">
                <AlertCircle className="text-primary w-16 h-16 mb-4" />
                <h2 className="text-xl font-bold">Error al cargar las cartas</h2>
                <p className="text-slate-400 mt-2">La expansión puede no estar disponible o se ha perdido la conexión.</p>
                <button
                    onClick={() => navigate('/')}
                    className="mt-6 px-6 py-2 bg-primary text-white rounded-full font-bold"
                >
                    Volver
                </button>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black z-[100] flex flex-col items-center justify-center overflow-hidden">
            {/* HUD */}
            <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-50">
                <button
                    onClick={() => navigate('/')}
                    className="p-2 bg-white/10 rounded-full text-white backdrop-blur-md"
                >
                    <X size={24} />
                </button>
                {phase === 'stack' && (
                    <div className="bg-white/10 px-4 py-1.5 rounded-full border border-white/20 backdrop-blur-md">
                        <span className="text-xs font-bold text-slate-300">
                            CARTA {currentIndex + 1} / {cards.length}
                        </span>
                    </div>
                )}
            </div>

            <AnimatePresence mode="wait">
                {phase === 'pack' && (
                    <motion.div
                        key="pack"
                        initial={{ scale: 0.5, opacity: 0, y: 100 }}
                        animate={{
                            scale: 1,
                            opacity: 1,
                            y: 0,
                            x: isShaking ? [-5, 5, -5, 5, 0] : 0,
                            rotate: isShaking ? [-2, 2, -2, 2, 0] : 0
                        }}
                        exit={{ scale: 1.2, opacity: 0 }}
                        className="relative cursor-pointer"
                        onClick={handlePackTap}
                    >
                        <div className="relative group">
                            {/* Pack Wrapper (Simulated with set image) */}
                            <div className="w-64 h-92 bg-gradient-to-br from-slate-700 to-slate-900 rounded-[20px] shadow-2xl relative overflow-hidden border border-white/20">
                                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                                    {setInfo?.logo && <img src={`${setInfo.logo}.webp`} alt="" className="w-40 mb-4" />}
                                    <h3 className="text-lg font-black italic text-white uppercase tracking-tighter shadow-black drop-shadow-lg">
                                        {setInfo?.name}
                                    </h3>
                                    <div className="mt-8 flex gap-2">
                                        <span className="w-2 h-2 rounded-full bg-pokemon-red" />
                                        <span className="w-2 h-2 rounded-full bg-pokemon-yellow" />
                                        <span className="w-2 h-2 rounded-full bg-pokemon-blue" />
                                    </div>
                                </div>

                                {/* Tear visual hints */}
                                <div className="absolute top-0 left-0 right-0 h-4 bg-black/40 border-b border-white/10 flex justify-center gap-1">
                                    {[...Array(20)].map((_, i) => (
                                        <div key={i} className="w-1 h-full bg-white/10" />
                                    ))}
                                </div>

                                {/* Interaction prompt */}
                                <motion.div
                                    animate={{ opacity: [0.3, 1, 0.3], y: [0, -10, 0] }}
                                    transition={{ repeat: Infinity, duration: 1.5 }}
                                    className="absolute bottom-10 left-0 right-0 flex flex-col items-center"
                                >
                                    <p className="text-[10px] font-bold text-white uppercase tracking-[0.2em]">Pulsa para abrir</p>
                                </motion.div>
                            </div>
                        </div>

                        {/* Glow effect under pack */}
                        <div className="absolute -inset-4 bg-primary/20 blur-2xl rounded-full -z-10 group-hover:bg-primary/30 transition-colors" />
                    </motion.div>
                )}

                {(phase === 'tearing' || phase === 'stack') && (
                    <div className="relative w-full h-full flex flex-col items-center justify-center p-6">
                        <div className="relative w-64 h-92 mb-20 flex items-center justify-center">
                            {cards.slice(currentIndex).map((card, idx) => {
                                const isTop = idx === 0;
                                // zIndex should be higher for cards earlier in the array
                                const zIndex = cards.length - idx;

                                return (
                                    <motion.div
                                        key={card.id}
                                        initial={phase === 'tearing' ? {
                                            scale: 0.8,
                                            opacity: 0,
                                            y: 0,
                                            rotate: 0
                                        } : false}
                                        animate={{
                                            scale: 1,
                                            opacity: 1,
                                            y: -idx * 2,
                                            rotate: isTop ? 0 : (Math.random() * 6 - 3),
                                            zIndex: zIndex
                                        }}
                                        transition={{
                                            type: "spring",
                                            stiffness: 300,
                                            damping: 20
                                        }}
                                        className={cn(
                                            "absolute w-64 h-92 bg-surface rounded-xl overflow-hidden shadow-2xl cursor-pointer touch-none",
                                            "border border-white/10",
                                            isTop && "ring-2 ring-primary/50"
                                        )}
                                        onClick={() => {
                                            if (isTop) handleCardTap();
                                        }}
                                    >
                                        <img
                                            src={card.image ? `${card.image}/high.webp` : ''}
                                            alt={card.name}
                                            className="w-full h-full object-cover pointer-events-none"
                                            draggable={false}
                                        />

                                        {/* Rare effects */}
                                        {['Rare', 'Rare Holo', 'Holo Rare', 'Ultra Rare', 'Secret Rare', 'Rare Ultra', 'Rare Secret', 'Holo Rare V', 'Holo Rare VMAX', 'Holo Rare VSTAR', 'Hyper rare', 'Illustration rare', 'Special illustration rare', 'Double rare', 'Rara', 'Holo Rara', 'Rara Doble', 'Rara Ultra', 'Rara Secreto', 'Rara Ilustración', 'Rara Ilustración Especial', 'Rara Radiante'].some(r => card.rarity?.includes(r)) && isTop && (
                                            <div className="absolute inset-0 holo-effect pointer-events-none" />
                                        )}

                                        {isTop && (
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="absolute bottom-4 left-0 right-0 flex justify-center pointer-events-none"
                                            >
                                                <div className="bg-black/60 px-3 py-1 rounded-full text-[10px] font-bold text-white flex items-center gap-1.5 border border-white/20 capitalize">
                                                    <Sparkles size={10} className="text-yellow-400" />
                                                    {formatRarity(card.rarity)}
                                                    <Sparkles size={10} className="text-yellow-400" />
                                                </div>
                                            </motion.div>
                                        )}
                                    </motion.div>
                                );
                            })}
                        </div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center"
                        >
                            <p className="text-slate-400 text-sm font-medium">Pulsa la carta para revelar la siguiente</p>
                        </motion.div>
                    </div>
                )}

                {phase === 'finished' && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center"
                    >
                        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Sparkles className="text-green-500 w-10 h-10" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">¡Sobre completado!</h2>
                        <p className="text-slate-400 mb-8 max-w-xs">Todas las cartas se han añadido a tu colección.</p>
                        <div className="flex flex-col gap-3 px-6">
                            <button
                                onClick={() => navigate('/collection', { state: { initialSetId: setId } })}
                                className="w-full py-4 bg-white text-black font-bold rounded-2xl hover:bg-slate-200 transition-colors"
                            >
                                Ver Colección
                            </button>
                            <button
                                onClick={handleReset}
                                className="w-full py-4 bg-surface text-white font-bold rounded-2xl border border-white/10 hover:bg-surface-hover transition-colors"
                            >
                                Abrir otro
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PackOpeningPage;
