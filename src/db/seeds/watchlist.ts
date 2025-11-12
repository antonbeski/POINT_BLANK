import { db } from '@/db';
import { watchlist } from '@/db/schema';

async function main() {
    const sampleWatchlist = [
        {
            ticker: 'AAPL',
            name: 'Apple Inc.',
            notes: 'Tech giant, strong fundamentals',
            addedAt: new Date('2024-12-15T09:30:00Z').toISOString(),
        },
        {
            ticker: 'MSFT',
            name: 'Microsoft Corporation',
            notes: 'Cloud leader, steady growth',
            addedAt: new Date('2024-12-18T14:45:00Z').toISOString(),
        },
        {
            ticker: 'NVDA',
            name: 'NVIDIA Corporation',
            notes: 'AI chip leader, high volatility',
            addedAt: new Date('2024-12-22T11:20:00Z').toISOString(),
        },
        {
            ticker: 'TSLA',
            name: 'Tesla, Inc.',
            notes: 'EV pioneer, watch earnings closely',
            addedAt: new Date('2024-12-28T16:00:00Z').toISOString(),
        },
        {
            ticker: 'GOOGL',
            name: 'Alphabet Inc.',
            notes: 'Search dominance, AI investments',
            addedAt: new Date('2025-01-03T10:15:00Z').toISOString(),
        },
        {
            ticker: 'AMZN',
            name: 'Amazon.com, Inc.',
            notes: 'E-commerce + AWS powerhouse',
            addedAt: new Date('2025-01-08T13:30:00Z').toISOString(),
        },
        {
            ticker: 'META',
            name: 'Meta Platforms, Inc.',
            notes: null,
            addedAt: new Date('2025-01-12T15:45:00Z').toISOString(),
        },
    ];

    await db.insert(watchlist).values(sampleWatchlist);
    
    console.log('✅ Watchlist seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});