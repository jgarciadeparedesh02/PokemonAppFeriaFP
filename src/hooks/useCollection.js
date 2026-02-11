import { useState, useEffect } from 'react';

export const useCollection = () => {
    const [inventory, setInventory] = useState(() => {
        const saved = localStorage.getItem('myCollection');
        return saved ? JSON.parse(saved).inventory : {};
    });

    useEffect(() => {
        localStorage.setItem('myCollection', JSON.stringify({ inventory }));
    }, [inventory]);

    const addCardsToCollection = (newCards) => {
        setInventory(prev => {
            const updated = { ...prev };
            newCards.forEach(card => {
                updated[card.id] = (updated[card.id] || 0) + 1;
            });
            return updated;
        });
    };

    const hasCard = (cardId) => {
        return !!inventory[cardId];
    };

    const getCardCount = (cardId) => {
        return inventory[cardId] || 0;
    };

    return { inventory, addCardsToCollection, hasCard, getCardCount };
};
