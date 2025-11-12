import { db } from '@/db';
import { analysisHistory } from '@/db/schema';

async function main() {
    const sampleAnalysisHistory = [
        // AAPL records (4 total)
        {
            ticker: 'AAPL',
            period: '3mo',
            interval: '1d',
            indicatorsEnabled: true,
            runAt: new Date('2024-12-16T09:15:00Z').toISOString(),
        },
        {
            ticker: 'AAPL',
            period: '1y',
            interval: '1wk',
            indicatorsEnabled: false,
            runAt: new Date('2024-12-17T14:30:00Z').toISOString(),
        },
        {
            ticker: 'AAPL',
            period: '5y',
            interval: '1mo',
            indicatorsEnabled: true,
            runAt: new Date('2024-12-18T11:45:00Z').toISOString(),
        },
        {
            ticker: 'AAPL',
            period: '1mo',
            interval: '1d',
            indicatorsEnabled: false,
            runAt: new Date('2024-12-19T16:20:00Z').toISOString(),
        },
        // TSLA records (3 total)
        {
            ticker: 'TSLA',
            period: '3mo',
            interval: '1d',
            indicatorsEnabled: true,
            runAt: new Date('2024-12-17T10:00:00Z').toISOString(),
        },
        {
            ticker: 'TSLA',
            period: '6mo',
            interval: '1d',
            indicatorsEnabled: false,
            runAt: new Date('2024-12-19T13:30:00Z').toISOString(),
        },
        {
            ticker: 'TSLA',
            period: '1y',
            interval: '1wk',
            indicatorsEnabled: true,
            runAt: new Date('2024-12-20T15:45:00Z').toISOString(),
        },
        // NVDA records (2 total)
        {
            ticker: 'NVDA',
            period: '1y',
            interval: '1d',
            indicatorsEnabled: true,
            runAt: new Date('2024-12-18T08:30:00Z').toISOString(),
        },
        {
            ticker: 'NVDA',
            period: '3mo',
            interval: '1wk',
            indicatorsEnabled: true,
            runAt: new Date('2024-12-21T10:15:00Z').toISOString(),
        },
        // MSFT records (2 total)
        {
            ticker: 'MSFT',
            period: '6mo',
            interval: '1d',
            indicatorsEnabled: false,
            runAt: new Date('2024-12-20T09:00:00Z').toISOString(),
        },
        {
            ticker: 'MSFT',
            period: '1y',
            interval: '1wk',
            indicatorsEnabled: false,
            runAt: new Date('2024-12-21T14:30:00Z').toISOString(),
        },
        // GOOGL record (1 total)
        {
            ticker: 'GOOGL',
            period: '3mo',
            interval: '1d',
            indicatorsEnabled: true,
            runAt: new Date('2024-12-22T11:00:00Z').toISOString(),
        },
    ];

    await db.insert(analysisHistory).values(sampleAnalysisHistory);
    
    console.log('✅ Analysis history seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});