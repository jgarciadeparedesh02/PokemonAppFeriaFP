import { useState, useEffect } from 'react';

export const useCollection = () => {
    const [data, setData] = useState(() => {
        const saved = localStorage.getItem('myCollection');
        const defaultData = { inventory: {}, history: [] };
        if (!saved) return defaultData;

        try {
            const parsed = JSON.parse(saved);
            // Migración si solo existía inventory
            return {
                inventory: parsed.inventory || {},
                history: parsed.history || []
            };
        } catch (e) {
            return defaultData;
        }
    });

    const inventory = data.inventory;
    const history = data.history;

    useEffect(() => {
        localStorage.setItem('myCollection', JSON.stringify(data));
    }, [data]);

    const addCardsToCollection = (newCards, setInfo) => {
        setData(prev => {
            const updatedInventory = { ...prev.inventory };
            newCards.forEach(card => {
                updatedInventory[card.id] = (updatedInventory[card.id] || 0) + 1;
            });

            const packTotal = newCards.reduce((sum, c) => sum + (c.pricing?.cardmarket?.avg || 0), 0).toFixed(2);

            // Evitar duplicados exactos en menos de 2 segundos (clic doble)
            const lastEntry = prev.history[0];
            if (lastEntry &&
                lastEntry.totalValue === packTotal &&
                (Date.now() - lastEntry.id) < 2000) {
                return prev;
            }

            const newHistoryEntry = {
                id: Date.now(),
                timestamp: new Date().toISOString(),
                setName: setInfo?.name || 'Set Desconocido',
                setLogo: setInfo?.logo,
                cards: newCards,
                totalValue: packTotal
            };

            return {
                inventory: updatedInventory,
                history: [newHistoryEntry, ...prev.history].slice(0, 50) // Guardamos últimos 50
            };
        });
    };

    const hasCard = (cardId) => {
        return !!inventory[cardId];
    };

    const getCardCount = (cardId) => {
        return inventory[cardId] || 0;
    };

    return { inventory, history, addCardsToCollection, hasCard, getCardCount };
};
