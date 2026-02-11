import { useRef } from 'react';

const SFX_URLS = {
    tear: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3', // Tearing paper
    swipe: 'https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3', // Fast woosh
    rare: 'https://assets.mixkit.co/active_storage/sfx/2014/2014-preview.mp3', // Magic reveal / Fanfare
};

export const useSound = () => {
    const audioRefs = useRef({});

    const playSound = (type, volume = 0.5) => {
        try {
            if (!SFX_URLS[type]) return;

            // Reuse audio objects if they exist
            if (!audioRefs.current[type]) {
                audioRefs.current[type] = new Audio(SFX_URLS[type]);
            }

            const audio = audioRefs.current[type];
            audio.volume = volume;
            audio.currentTime = 0;
            audio.play().catch(e => console.log('Audio play blocked by browser policy:', e));
        } catch (error) {
            console.error('Error playing sound:', error);
        }
    };

    return { playSound };
};
