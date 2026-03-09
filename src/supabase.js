import { createClient } from '@supabase/supabase-js';

// TODO PARA EL USUARIO:
// 1. Crea un proyecto en supabase.com
// 2. Ve a Project Settings > API
// 3. Pega aquí tu URL y tu Anon Key
const supabaseUrl = 'https://hzghuywqxzfrooaqkdyg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh6Z2h1eXdxeHpmcm9vYXFrZHlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwODAyMzUsImV4cCI6MjA4ODY1NjIzNX0.sIqnUwdPL9aOuHQzSi7LCNhXlZwD48Kyl9NA4k_CIDI';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Función helper para guardar un "pull" valioso en el ranking global
export const syncPullToGlobal = async (trainerName, card, setInfo) => {
    if (!supabaseUrl || supabaseUrl.includes('TU_')) return;

    try {
        const { error } = await supabase
            .from('fair_ranking')
            .insert([{
                trainer_name: trainerName,
                card_id: card.id,
                card_name: card.name,
                card_image: card.image,
                rarity: card.rarity,
                price: card.pricing?.cardmarket?.avg || 0,
                set_name: setInfo?.name,
                set_id: setInfo?.id
            }]);

        if (error) console.error("Error syncing to global ranking:", error);
    } catch (e) {
        console.error("Supabase sync failed:", e);
    }
};

export const getGlobalRanking = async () => {
    if (!supabaseUrl || supabaseUrl.includes('TU_')) return [];

    try {
        const { data, error } = await supabase
            .from('fair_ranking')
            .select('*')
            .order('price', { ascending: false })
            .limit(20);

        if (error) throw error;
        return data || [];
    } catch (e) {
        console.error("Failed to fetch global ranking:", e);
        return [];
    }
};
