import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileQuestion, Loader2 } from 'lucide-react';

const CardImage = ({ src, alt, className, imageClassName, isRare }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [rotateX, setRotateX] = useState(0);
    const [rotateY, setRotateY] = useState(0);
    const [glareX, setGlareX] = useState(50);
    const [glareY, setGlareY] = useState(50);

    const handleMouseMove = (e) => {
        if (!isRare) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        setRotateX(((y - centerY) / centerY) * -15);
        setRotateY(((x - centerX) / centerX) * 15);

        setGlareX((x / rect.width) * 100);
        setGlareY((y / rect.height) * 100);
    };

    const handleMouseLeave = () => {
        setRotateX(0);
        setRotateY(0);
    };

    return (
        <motion.div
            className={`relative overflow-hidden ${className}`}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
                perspective: 1000,
                rotateX: rotateX,
                rotateY: rotateY,
                transition: { type: 'spring', stiffness: 300, damping: 20 }
            }}
        >
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
                className={`w-full h-full transition-opacity duration-500 object-cover ${imageClassName} ${isLoading ? 'opacity-0' : 'opacity-100'}`}
                draggable={false}
            />

            {isRare && !isLoading && (
                <div
                    className="absolute inset-0 pointer-events-none opacity-40 mix-blend-color-dodge transition-opacity duration-300"
                    style={{
                        background: `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.8) 0%, transparent 60%)`
                    }}
                />
            )}
        </motion.div>
    );
};

export default CardImage;
