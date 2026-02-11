const API_URL = 'https://api.tcgdex.net/v2/es';

export const fetchSets = async () => {
    try {
        const response = await fetch(`${API_URL}/sets`);
        const data = await response.json();

        // El listado general no trae releaseDate, necesitamos el detalle para ordenar bien.
        // Limitamos para no saturar la API, pero pillamos los sets con logo.
        const setsWithLogo = (data || []).filter(set => set.logo);

        // Fetch detailed info for all sets to get releaseDate
        const detailedSets = await Promise.all(
            setsWithLogo.map(async (set) => {
                try {
                    const res = await fetch(`${API_URL}/sets/${set.id}`);
                    return await res.json();
                } catch (e) {
                    return set;
                }
            })
        );

        return detailedSets.sort((a, b) => {
            return new Date(b.releaseDate || 0) - new Date(a.releaseDate || 0);
        });
    } catch (error) {
        console.error('Error fetching sets:', error);
        return [];
    }
};

export const fetchCardsBySet = async (setId) => {
    try {
        const response = await fetch(`${API_URL}/sets/${setId}`);
        const data = await response.json();
        return data.cards || [];
    } catch (error) {
        console.error('Error fetching cards for set:', setId, error);
        return [];
    }
};

export const fetchRandomCardsFromSet = async (setId, count = 10) => {
    try {
        const response = await fetch(`${API_URL}/sets/${setId}`);
        const data = await response.json();
        const allCards = data.cards;

        if (!allCards || allCards.length === 0) return [];

        // Para implementar probabilidades reales, necesitamos conocer las rarezas.
        // Como la API no las da en el listado del set, obtenemos una muestra grande (pool)
        // y de ahí seleccionamos para cada slot del sobre.
        const poolSize = Math.min(allCards.length, 45);
        const shuffledPool = [...allCards].sort(() => 0.5 - Math.random());
        const selectionPool = shuffledPool.slice(0, poolSize);

        // Fetch detailed info for the pool
        const detailedPool = await Promise.all(
            selectionPool.map(async (card) => {
                try {
                    const res = await fetch(`${API_URL}/cards/${card.id}`);
                    return await res.json();
                } catch (e) {
                    return { ...card, rarity: 'Commún' }; // Fallback
                }
            })
        );

        // Categorizar por rareza
        const categorize = (cards) => {
            const groups = {
                common: [],
                uncommon: [],
                rarePlus: []
            };

            cards.forEach(card => {
                const r = card.rarity || 'Commún';
                if (r.includes('Commún') || r.includes('Común')) {
                    groups.common.push(card);
                } else if (r.includes('Uncommon') || r.includes('Poco común') || r.includes('Entrenador')) {
                    groups.uncommon.push(card);
                } else {
                    groups.rarePlus.push(card);
                }
            });
            return groups;
        };

        const groups = categorize(detailedPool);

        // Definir slots (para un sobre de 10)
        // 6 Comunes, 3 Poco Comunes, 1 Rara o superior
        const finalPack = [];

        // Helper para sacar cartas de un grupo con fallback
        const pickFrom = (groupName, amount) => {
            let pool = groups[groupName];
            if (pool.length === 0) {
                // Fallback a cualquier carta si el grupo está vacío
                pool = detailedPool;
            }
            const picked = [];
            for (let i = 0; i < amount; i++) {
                const idx = Math.floor(Math.random() * pool.length);
                picked.push(pool[idx]);
                // Opcional: eliminar para no repetir en el mismo sobre
                if (pool.length > 1) pool.splice(idx, 1);
            }
            return picked;
        };

        // Llenar slots
        finalPack.push(...pickFrom('common', 6));
        finalPack.push(...pickFrom('uncommon', 3));

        // El último slot es especial (Rara o mejor)
        // Aquí podríamos meter lógica de "pull rate" si el pool fuera de todo el set
        // Pero como el pool es limitado, simplemente cogemos la mejor disponible
        const rareSlotPool = groups.rarePlus.length > 0 ? groups.rarePlus : detailedPool;
        const rareCard = rareSlotPool[Math.floor(Math.random() * rareSlotPool.length)];
        finalPack.push(rareCard);

        // Pesos para el ordenamiento final (visual)
        const rarityWeight = {
            'Commún': 1,
            'Común': 1,
            'Uncommon': 2,
            'Poco común': 2,
            'Entrenador': 2,
            'Rara': 3,
            'Holo Rara': 3,
            'Holo Rara V': 4,
            'Holo Rara VMAX': 4,
            'Holo Rara VSTAR': 5,
            'Rara Doble': 4,
            'Rara Ultra': 5,
            'Rara Secreto': 6,
            'Rara Ilustración': 5,
            'Rara Ilustración Especial': 6,
            'Rara Radiante': 5
        };

        return finalPack.sort((a, b) => {
            const weightA = rarityWeight[a.rarity] || 3;
            const weightB = rarityWeight[b.rarity] || 3;
            return weightA - weightB;
        });
    } catch (error) {
        console.error('Error fetching pack cards:', error);
        return [];
    }
};
