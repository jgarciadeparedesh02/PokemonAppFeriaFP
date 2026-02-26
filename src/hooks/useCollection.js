import { useState, useEffect } from 'react';

export const useCollection = () => {
    const [data, setData] = useState(() => {
        const saved = localStorage.getItem('myCollection');
        const defaultData = { inventory: {}, history: [] };
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
                valueSnapshots: valueSnapshots
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

            // Calcular valor total de la colección para el gráfico
            // Nota: En una app real esto se haría más eficientemente, aquí sumamos el histórico
            const newHistory = [newHistoryEntry, ...prev.history].slice(0, 50);

            // Snapshot de valor para Recharts
            const totalCollectionValue = newHistory.reduce((sum, entry) => sum + parseFloat(entry.totalValue), 0).toFixed(2);
            const valueSnapshots = [
                ...(prev.valueSnapshots || []),
                { date: new Date().toLocaleTimeString(), value: parseFloat(totalCollectionValue) }
            ].slice(-20); // Guardamos los últimos 20 puntos

            return {
                inventory: updatedInventory,
                history: newHistory,
                valueSnapshots
            };
        });
    };

    const hasCard = (cardId) => {
        return !!inventory[cardId];
    };

    const getCardCount = (cardId) => {
        return inventory[cardId] || 0;
    };

    const valueSnapshots = data.valueSnapshots || [];

    return { inventory, history, addCardsToCollection, hasCard, getCardCount, valueSnapshots };
};
