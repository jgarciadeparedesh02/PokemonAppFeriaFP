import React, { useState, useEffect } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchRandomCardsFromSet, getPreparedPack } from '../api/pokemon';
import { useCollection } from '../hooks/useCollection';
import { X, Sparkles, AlertCircle } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import CardImage from '../components/CardImage';
import { preloadImages } from '../utils/preload';

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

    const getRarityEffects = (rarity) => {
        const r = rarity?.toLowerCase() || '';
        if (r.includes('secret') || r.includes('ultra') || r.includes('illustration') || r.includes('vmax') || r.includes('vstar') || r.includes('hyper')) {
            return {
                color: 'rgba(234, 179, 8, 0.4)', // Gold
                sound: 'https://assets.mixkit.co/active_storage/sfx/270/270-preview.mp3'
            };
        }
        if (r.includes('rare')) {
            return {
                color: 'rgba(168, 85, 247, 0.4)', // Purple
                sound: 'https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3'
            };
        }
        if (r.includes('uncommon') || r.includes('poco')) {
            return {
                color: 'rgba(59, 130, 246, 0.4)', // Blue
                sound: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3'
            };
        }
        return {
            color: 'rgba(34, 197, 94, 0.4)', // Green
            sound: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3'
        };
    };

    const [phase, setPhase] = useState('loading'); // loading, pack, tearing, stack, finished
    const [cards, setCards] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isShaking, setIsShaking] = useState(false);
    const [resetToken, setResetToken] = useState(0);
    const [activeCard, setActiveCard] = useState(null);
    const [ambientColor, setAmbientColor] = useState('transparent');

    const playRaritySound = (soundUrl) => {
        const audio = new Audio(soundUrl);
        audio.volume = 0.5;
        audio.play().catch(e => console.log('Audio play failed:', e));
    };

    const handleReset = () => {
        setPhase('loading');
        setCards([]);
        setCurrentIndex(0);
        setIsShaking(false);
        setActiveCard(null);
        setAmbientColor('transparent');
        setResetToken(prev => prev + 1);
    };

    useEffect(() => {
        const initPack = async () => {
            let packCards = [];

            const prepared = getPreparedPack(setId);
            if (prepared && resetToken === 0) {
                // If it was already being fetched
                packCards = await prepared;
            } else {
                packCards = await fetchRandomCardsFromSet(setId);
            }

            if (packCards.length === 0) {
                setPhase('error');
                return;
            }
            setCards(packCards);

            // Preload images in the background
            const imageUrls = packCards.map(card => card.image ? `${card.image}/high.webp` : '');
            preloadImages(imageUrls);

            setPhase('pack');
        };
        initPack();
    }, [setId, resetToken, location.state]);

    // Update ambient color and sound when revealing cards
    useEffect(() => {
        if (phase === 'stack' && cards[currentIndex]) {
            const effects = getRarityEffects(cards[currentIndex].rarity);
            setAmbientColor(effects.color);
            playRaritySound(effects.sound);
        } else if (phase === 'finished' || phase === 'pack') {
            setAmbientColor('transparent');
        }
    }, [currentIndex, phase, cards]);

    const handlePackTap = () => {
        if (phase !== 'pack') return;

        setIsShaking(true);
        // Play tearing sound?
        new Audio('https://assets.mixkit.co/active_storage/sfx/1103/1103-preview.mp3').play().catch(() => { });

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

    const handleSkip = () => {
        setPhase('finished');
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
        <div className="fixed inset-0 bg-black z-[100] flex justify-center">
            {/* Ambient Lighting Background */}
            <motion.div
                animate={{ backgroundColor: ambientColor }}
                transition={{ duration: 0.8 }}
                className="absolute inset-0 pointer-events-none z-0 opacity-40 blur-[100px]"
            />

            <div className="w-full max-w-md h-full flex flex-col items-center justify-center overflow-hidden relative z-10">
                {/* HUD */}
                <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-50">
                    <button
                        onClick={() => navigate('/')}
                        className="p-2 bg-white/10 rounded-full text-white backdrop-blur-md"
                    >
                        <X size={24} />
                    </button>
                    {phase === 'stack' && (
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleSkip}
                                className="bg-white/10 px-4 py-1.5 rounded-full border border-white/20 backdrop-blur-md text-[10px] font-bold text-slate-300 hover:bg-white/20 transition-colors uppercase"
                            >
                                Saltar
                            </button>
                            <div className="bg-white/10 px-4 py-1.5 rounded-full border border-white/20 backdrop-blur-md">
                                <span className="text-[10px] font-bold text-slate-300 uppercase">
                                    {currentIndex + 1} / {cards.length}
                                </span>
                            </div>
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
                                            <CardImage
                                                src={card.image ? `${card.image}/high.webp` : ''}
                                                alt={card.name}
                                                imageClassName="object-cover pointer-events-none"
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
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="w-full h-full flex flex-col pt-24 pb-32 px-4 overflow-y-auto no-scrollbar"
                        >
                            <div className="text-center mb-8">
                                <motion.div
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4"
                                >
                                    <Sparkles className="text-green-500 w-8 h-8" />
                                </motion.div>
                                <h2 className="text-2xl font-bold text-white">¡Sobre Abierto!</h2>
                                <p className="text-slate-400 text-sm">{cards.length} cartas añadidas a tu colección</p>
                            </div>

                            <div className="grid grid-cols-3 gap-3 mb-10">
                                {cards.map((card, idx) => (
                                    <motion.div
                                        key={`${card.id}-${idx}`}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        onClick={() => setActiveCard(card)}
                                        className="relative aspect-[2/3] rounded-lg overflow-hidden card-shadow ring-1 ring-white/10 group cursor-pointer"
                                    >
                                        <CardImage
                                            src={card.image ? `${card.image}/low.webp` : ''}
                                            alt={card.name}
                                            imageClassName="object-cover"
                                        />
                                        {['Rare', 'Rare Holo', 'Holo Rare', 'Ultra Rare', 'Secret Rare'].some(r => card.rarity?.includes(r)) && (
                                            <div className="absolute inset-0 holo-effect opacity-30" />
                                        )}
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <Sparkles className="text-white w-6 h-6" />
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            <div className="flex flex-col gap-3 max-w-xs mx-auto w-full">
                                <button
                                    onClick={() => navigate('/collection', { state: { initialSetId: setId } })}
                                    className="w-full py-4 bg-white text-black font-bold rounded-2xl hover:bg-slate-200 transition-colors shadow-lg"
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

                {/* Card Detail Modal */}
                <AnimatePresence>
                    {activeCard && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/90 backdrop-blur-sm"
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
                                    className="absolute -top-12 right-0 p-2 text-white/50 hover:text-white transition-colors"
                                >
                                    <X size={32} />
                                </button>

                                <div className="rounded-3xl overflow-hidden shadow-2xl border border-white/10 aspect-[2/3] bg-surface">
                                    <CardImage
                                        src={activeCard.image ? `${activeCard.image}/high.webp` : ''}
                                        alt={activeCard.name}
                                        imageClassName="object-contain"
                                    />
                                    {['Rare', 'Rare Holo', 'Holo Rare', 'Ultra Rare', 'Secret Rare'].some(r => activeCard.rarity?.includes(r)) && (
                                        <div className="absolute inset-0 holo-effect pointer-events-none" />
                                    )}
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
        </div>
    );
};

export default PackOpeningPage;
