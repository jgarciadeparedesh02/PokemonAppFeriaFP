const API_URL = 'https://api.tcgdex.net/v2/es';

async function test() {
    const res = await fetch(`${API_URL}/cards/swsh1-1`);
    const card = await res.json();
    console.log('--- CARD STRUCTURE ---');
    console.log('Name:', card.name);
    console.log('Rarity:', card.rarity);
    console.log('Pricing Data:', JSON.stringify(card.pricing, null, 2));
    console.log('Full keys:', Object.keys(card));
    console.log('----------------------');
}

test();
