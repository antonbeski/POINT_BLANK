import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { analysisHistory } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '20'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const ticker = searchParams.get('ticker');

    let query = db.select().from(analysisHistory).orderBy(desc(analysisHistory.runAt));

    if (ticker) {
      query = query.where(eq(analysisHistory.ticker, ticker));
    }

    const results = await query.limit(limit).offset(offset);

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
        code: 'INTERNAL_SERVER_ERROR'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ticker, period, interval, indicatorsEnabled } = body;

    // Validate required fields
    if (!ticker || typeof ticker !== 'string' || ticker.trim() === '') {
      return NextResponse.json(
        { 
          error: 'Ticker is required and must be a non-empty string',
          code: 'INVALID_TICKER'
        },
        { status: 400 }
      );
    }

    if (!period || typeof period !== 'string' || period.trim() === '') {
      return NextResponse.json(
        { 
          error: 'Period is required and must be a non-empty string',
          code: 'INVALID_PERIOD'
        },
        { status: 400 }
      );
    }

    if (!interval || typeof interval !== 'string' || interval.trim() === '') {
      return NextResponse.json(
        { 
          error: 'Interval is required and must be a non-empty string',
          code: 'INVALID_INTERVAL'
        },
        { status: 400 }
      );
    }

    if (typeof indicatorsEnabled !== 'boolean') {
      return NextResponse.json(
        { 
          error: 'IndicatorsEnabled is required and must be a boolean',
          code: 'INVALID_INDICATORS_ENABLED'
        },
        { status: 400 }
      );
    }

    // Sanitize inputs
    const sanitizedTicker = ticker.trim().toUpperCase();
    const sanitizedPeriod = period.trim();
    const sanitizedInterval = interval.trim();

    // Create new analysis history record
    const newRecord = await db.insert(analysisHistory)
      .values({
        ticker: sanitizedTicker,
        period: sanitizedPeriod,
        interval: sanitizedInterval,
        indicatorsEnabled: indicatorsEnabled,
        runAt: new Date().toISOString()
      })
      .returning();

    return NextResponse.json(newRecord[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
        code: 'INTERNAL_SERVER_ERROR'
      },
      { status: 500 }
    );
  }
}