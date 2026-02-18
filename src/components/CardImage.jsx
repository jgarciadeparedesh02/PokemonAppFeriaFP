import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileQuestion, Loader2 } from 'lucide-react';

const CardImage = ({ src, alt, className, imageClassName }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    return (
        <div className={`relative overflow-hidden ${className}`}>
            <AnimatePresence mode="wait">
                {(isLoading || hasError) && (
                    <motion.div
                        key="overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/50 z-10 p-4 text-center backdrop-blur-sm"
                    >
                        {hasError ? (
                            <>
                                <FileQuestion className="w-8 h-8 text-slate-500 mb-1" />
                                <p className="text-[8px] text-slate-500 font-medium">No disponible</p>
                            </>
                        ) : (
                            <>
                                <Loader2 className="w-6 h-6 text-primary animate-spin mb-1" />
                                <p className="text-[8px] text-slate-500 font-medium animate-pulse">Cargando...</p>
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            <img
                src={src}
                alt={alt}
                onLoad={() => setIsLoading(false)}
                onError={() => {
                    setIsLoading(false);
                    setHasError(true);
                }}
                className={`w-full h-full transition-opacity duration-500 ${imageClassName} ${isLoading ? 'opacity-0' : 'opacity-100'}`}
                draggable={false}
            />
        </div>
    );
};

export default CardImage;
