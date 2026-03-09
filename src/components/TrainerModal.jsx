import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, ShieldCheck, Sparkles } from 'lucide-react';
import { useCollection } from '../hooks/useCollection';

const TrainerModal = () => {
    const { profile, setTrainerName } = useCollection();
    const [nameInput, setNameInput] = useState('');
    const [isOpen, setIsOpen] = useState(!profile.trainerName);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (nameInput.trim().length < 3) return;
        setTrainerName(nameInput.trim());
        setIsOpen(false);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl"
                >
                    <motion.div
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        className="bg-surface border border-white/10 w-full max-w-sm rounded-[32px] p-8 shadow-2xl overflow-hidden relative"
                    >
                        {/* Background Decor */}
                        <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/20 blur-[60px] rounded-full" />
                        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-500/10 blur-[60px] rounded-full" />

                        <div className="relative">
                            <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mb-6 ring-1 ring-primary/50">
                                <User className="text-primary w-8 h-8" />
                            </div>

                            <h2 className="text-2xl font-bold text-white mb-2">¡Hola, Entrenador!</h2>
                            <p className="text-slate-400 text-sm mb-8 leading-relaxed">
                                Introduce tu nombre para registrar tus mejores cartas en el ranking de la feria.
                            </p>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">
                                        Nombre de Entrenador
                                    </label>
                                    <input
                                        autoFocus
                                        type="text"
                                        maxLength={15}
                                        value={nameInput}
                                        onChange={(e) => setNameInput(e.target.value)}
                                        placeholder="Tu nombre..."
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-primary/50 transition-all font-medium"
                                    />
                                    <div className="flex items-center gap-2 mt-2 px-1">
                                        <ShieldCheck size={12} className="text-green-500" />
                                        <span className="text-[10px] text-slate-500">Visible en el ranking global del taller.</span>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={nameInput.trim().length < 3}
                                    className="w-full bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:grayscale py-4 rounded-2xl text-white font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/20"
                                >
                                    Comenzar Aventura <Sparkles size={18} />
                                </button>
                            </form>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default TrainerModal;
