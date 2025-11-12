import { db } from '@/db';
import { userPreferences } from '@/db/schema';

async function main() {
    const samplePreferences = [
        {
            defaultTicker: 'AAPL',
            defaultPeriod: '3mo',
            defaultInterval: '1d',
            showIndicators: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        }
    ];

    await db.insert(userPreferences).values(samplePreferences);
    
    console.log('✅ User preferences seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});