import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchSets, preparePack } from '../api/pokemon';
import { useSound } from '../hooks/useSound';
import { motion } from 'framer-motion';
import CardImage from '../components/CardImage';
import BrandHeader from '../components/BrandHeader';
import { preloadImages } from '../utils/preload';

const ShopPage = () => {
    const [sets, setSets] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { playSound } = useSound();

    useEffect(() => {
        const loadSets = async () => {
            try {
                const data = await fetchSets();
                setSets(data || []);
            } catch (error) {
                console.error('Failed to load sets:', error);
            } finally {
                setLoading(false);
            }
        };
        loadSets();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[80vh]">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="px-4 pt-4 pb-24">
            <BrandHeader />
            <header className="mb-8">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                    Sobres de Mejora
                </h2>
                <p className="text-slate-400 mt-1">Selecciona una expansión para abrir sobres</p>
            </header>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                {sets.length === 0 ? (
                    <div className="col-span-full py-12 text-center bg-surface rounded-2xl border border-white/5">
                        <p className="text-slate-500">No se encontraron expansiones. Por favor, comprueba tu conexión.</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-4 px-6 py-2 bg-primary/20 text-primary border border-primary/50 rounded-full text-xs font-bold"
                        >
                            Reintentar
                        </button>
                    </div>
                ) : (
                    sets.map((set, index) => (
                        <motion.div
                            key={set.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            onClick={() => {
                                playSound('swipe', 0.2);
                                // Start fetching cards immediately (internally cached)
                                preparePack(set.id);
                                navigate(`/open/${set.id}`, { state: { set } });
                            }}
                            className="group relative glass rounded-2xl overflow-hidden hover:border-primary/50 transition-all duration-300 active:scale-95 cursor-pointer card-shadow"
                        >
                            <div className="aspect-[4/3] p-4 flex items-center justify-center bg-gradient-to-br from-white/5 to-transparent">
                                <CardImage
                                    src={set.boosters?.[0]?.artwork_front ? `${set.boosters[0].artwork_front}.webp` : set.logo ? `${set.logo}.webp` : ''}
                                    alt={set.name}
                                    className="max-w-full max-h-full filter drop-shadow-2xl group-hover:scale-110 transition-transform duration-500"
                                    imageClassName="object-contain"
                                />
                            </div>
                            <div className="p-3 border-t border-white/5 bg-black/40 backdrop-blur-md">
                                <p className="text-xs font-semibold truncate text-slate-100">{set.name}</p>
                                <div className="flex items-center justify-between mt-1">
                                    <span className="text-[10px] text-slate-400 uppercase tracking-tighter">{set.id}</span>
                                    {set.symbol && <img src={`${set.symbol}.webp`} alt="" className="h-4 w-4 grayscale opacity-30 group-hover:opacity-60 transition-opacity" />}
                                </div>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ShopPage;
