import { useState, useEffect } from 'react';
import { syncPullToGlobal, logPackOpening } from '../supabase';

export const useCollection = () => {
    const [data, setData] = useState(() => {
        const saved = localStorage.getItem('myCollection');
        const defaultData = { inventory: {}, history: [], profile: { trainerName: '' }, valueSnapshots: [] };
        if (!saved) return defaultData;

        try {
            const parsed = JSON.parse(saved);

            const history = parsed.history || [];
            let valueSnapshots = parsed.valueSnapshots || [];

            // Si hay historial pero no snapshots (porque la función es nueva)
            // Reconstruimos los snapshots acumulando los valores del historial
            if (valueSnapshots.length === 0 && history.length > 0) {
                let cumulativeValue = 0;
                // El historial está de más reciente a más antiguo, lo invertimos para el gráfico
                valueSnapshots = [...history].reverse().map(entry => {
                    cumulativeValue += parseFloat(entry.totalValue || 0);
                    return {
                        date: new Date(entry.id).toLocaleTimeString(),
                        value: parseFloat(cumulativeValue.toFixed(2))
                    };
                }).slice(-20);
            }

            return {
                inventory: parsed.inventory || {},
                history: history,
                profile: parsed.profile || { trainerName: '' },
                valueSnapshots: valueSnapshots
            };
        } catch (e) {
            return defaultData;
        }
    });

    const inventory = data.inventory;
    const history = data.history;
    const profile = data.profile;
    const valueSnapshots = data.valueSnapshots || [];

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
        const packTotal = newCards.reduce((sum, c) => sum + (c.pricing?.cardmarket?.avg || 0), 0).toFixed(2);

        // --- EFECTOS SECUNDARIOS (FUERA DE SETDATA) ---
        // 1. Registrar apertura global
        logPackOpening(packTotal);

        // 2. Sincronizar pulls potentes
        if (profile.trainerName) {
            newCards.forEach(card => {
                const price = card.pricing?.cardmarket?.avg || 0;
                const isRare = ['Rare', 'Ultra', 'Secret', 'Illustration', 'VMAX', 'VSTAR', 'Hyper'].some(r => card.rarity?.includes(r));
                if (price > 5 || isRare) {
                    syncPullToGlobal(profile.trainerName, card, setInfo);
                }
            });
        }

        setData(prev => {
            const updatedInventory = { ...prev.inventory };
            newCards.forEach(card => {
                updatedInventory[card.id] = (updatedInventory[card.id] || 0) + 1;
            });

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

            const newHistory = [newHistoryEntry, ...prev.history].slice(0, 50);

            // Snapshot de valor para Recharts
            const totalCollectionValue = newHistory.reduce((sum, entry) => sum + parseFloat(entry.totalValue), 0).toFixed(2);
            const newValueSnapshots = [
                ...(prev.valueSnapshots || []),
                { date: new Date().toLocaleTimeString(), value: parseFloat(totalCollectionValue) }
            ].slice(-20);

            return {
                ...prev,
                inventory: updatedInventory,
                history: newHistory,
                valueSnapshots: newValueSnapshots
            };
        });
    };

    const hasCard = (cardId) => {
        return !!inventory[cardId];
    };

    const getCardCount = (cardId) => {
        return inventory[cardId] || 0;
    };

    return { inventory, history, profile, setTrainerName, addCardsToCollection, hasCard, getCardCount, valueSnapshots };
};
