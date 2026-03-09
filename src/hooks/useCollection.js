import { useState, useEffect } from 'react';
import { syncPullToGlobal } from '../supabase';

export const useCollection = () => {
    const [data, setData] = useState(() => {
        const saved = localStorage.getItem('myCollection');
        const defaultData = { inventory: {}, history: [], profile: { trainerName: '' } };
        if (!saved) return defaultData;

        try {
            const parsed = JSON.parse(saved);
            return {
                inventory: parsed.inventory || {},
                history: parsed.history || [],
                profile: parsed.profile || { trainerName: '' }
            };
        } catch (e) {
            return defaultData;
        }
    });

    const inventory = data.inventory;
    const history = data.history;
    const profile = data.profile;

    useEffect(() => {
        localStorage.setItem('myCollection', JSON.stringify(data));
    }, [data]);

    const setTrainerName = (name) => {
        setData(prev => ({
            ...prev,
            profile: { ...prev.profile, trainerName: name }
        }));
    };

    const addCardsToCollection = (newCards, setInfo) => {
        setData(prev => {
            const updatedInventory = { ...prev.inventory };
            newCards.forEach(card => {
                updatedInventory[card.id] = (updatedInventory[card.id] || 0) + 1;
            });

            // Sincronizar pulls potentes (> 5€ ó Raras) con el Ranking GLOBAL
            if (prev.profile.trainerName) {
                newCards.forEach(card => {
                    const price = card.pricing?.cardmarket?.avg || 0;
                    const isRare = ['Rare', 'Ultra', 'Secret', 'Illustration', 'VMAX', 'VSTAR', 'Hyper'].some(r => card.rarity?.includes(r));

                    if (price > 5 || isRare) {
                        syncPullToGlobal(prev.profile.trainerName, card, setInfo);
                    }
                });
            }

            const packTotal = newCards.reduce((sum, c) => sum + (c.pricing?.cardmarket?.avg || 0), 0).toFixed(2);

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
                ...prev,
                inventory: updatedInventory,
                history: [newHistoryEntry, ...prev.history].slice(0, 50)
            };
        });
    };

    const hasCard = (cardId) => {
        return !!inventory[cardId];
    };

    const getCardCount = (cardId) => {
        return inventory[cardId] || 0;
    };

    return { inventory, history, profile, setTrainerName, addCardsToCollection, hasCard, getCardCount };
};
