import { db } from '@/db';
import { portfolio } from '@/db/schema';

async function main() {
    const samplePortfolio = [
        {
            ticker: 'AAPL',
            quantity: 50,
            buyPrice: 175.50,
            buyDate: '2024-01-15',
            notes: 'Long-term hold',
            createdAt: new Date('2024-01-15T10:30:00').toISOString(),
        },
        {
            ticker: 'MSFT',
            quantity: 30,
            buyPrice: 380.25,
            buyDate: '2024-02-20',
            notes: 'Core position',
            createdAt: new Date('2024-02-20T14:15:00').toISOString(),
        },
        {
            ticker: 'NVDA',
            quantity: 15,
            buyPrice: 495.75,
            buyDate: '2024-03-10',
            notes: null,
            createdAt: new Date('2024-03-10T09:45:00').toISOString(),
        },
        {
            ticker: 'TSLA',
            quantity: 25,
            buyPrice: 242.30,
            buyDate: '2023-12-05',
            notes: 'Speculative play, watch closely',
            createdAt: new Date('2023-12-05T11:20:00').toISOString(),
        }
    ];

    await db.insert(portfolio).values(samplePortfolio);
    
    console.log('✅ Portfolio seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});