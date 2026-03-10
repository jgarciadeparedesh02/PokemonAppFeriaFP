import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hzghuywqxzfrooaqkdyg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh6Z2h1eXdxeHpmcm9vYXFrZHlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwODAyMzUsImV4cCI6MjA4ODY1NjIzNX0.sIqnUwdPL9aOuHQzSi7LCNhXlZwD48Kyl9NA4k_CIDI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    const { data: packs, error: err1 } = await supabase.from('fair_packs').select('*');
    const { data: ranking, error: err2 } = await supabase.from('fair_ranking').select('*');

    console.log('--- DB CHECK ---');
    if (err1) console.error('Error fair_packs:', err1.message);
    else console.log('Rows in fair_packs:', packs.length);

    if (err2) console.error('Error fair_ranking:', err2.message);
    else console.log('Rows in fair_ranking:', ranking.length);
    console.log('----------------');
}

check();
