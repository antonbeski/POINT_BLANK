import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { userPreferences } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const preferences = await db.select()
      .from(userPreferences)
      .limit(1);

    if (preferences.length === 0) {
      const defaultPreferences = {
        defaultTicker: 'AAPL',
        defaultPeriod: '3mo',
        defaultInterval: '1d',
        showIndicators: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const created = await db.insert(userPreferences)
        .values(defaultPreferences)
        .returning();

      return NextResponse.json(created[0], { status: 200 });
    }

    return NextResponse.json(preferences[0], { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { defaultTicker, defaultPeriod, defaultInterval, showIndicators } = body;

    if (!defaultTicker || typeof defaultTicker !== 'string' || defaultTicker.trim() === '') {
      return NextResponse.json(
        { 
          error: 'defaultTicker is required and must be a non-empty string',
          code: 'INVALID_DEFAULT_TICKER'
        },
        { status: 400 }
      );
    }

    if (!defaultPeriod || typeof defaultPeriod !== 'string' || defaultPeriod.trim() === '') {
      return NextResponse.json(
        { 
          error: 'defaultPeriod is required and must be a non-empty string',
          code: 'INVALID_DEFAULT_PERIOD'
        },
        { status: 400 }
      );
    }

    if (!defaultInterval || typeof defaultInterval !== 'string' || defaultInterval.trim() === '') {
      return NextResponse.json(
        { 
          error: 'defaultInterval is required and must be a non-empty string',
          code: 'INVALID_DEFAULT_INTERVAL'
        },
        { status: 400 }
      );
    }

    if (typeof showIndicators !== 'boolean') {
      return NextResponse.json(
        { 
          error: 'showIndicators is required and must be a boolean',
          code: 'INVALID_SHOW_INDICATORS'
        },
        { status: 400 }
      );
    }

    const existingPreferences = await db.select()
      .from(userPreferences)
      .limit(1);

    if (existingPreferences.length > 0) {
      const updated = await db.update(userPreferences)
        .set({
          defaultTicker: defaultTicker.trim(),
          defaultPeriod: defaultPeriod.trim(),
          defaultInterval: defaultInterval.trim(),
          showIndicators,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(userPreferences.id, existingPreferences[0].id))
        .returning();

      return NextResponse.json(updated[0], { status: 200 });
    }

    const created = await db.insert(userPreferences)
      .values({
        defaultTicker: defaultTicker.trim(),
        defaultPeriod: defaultPeriod.trim(),
        defaultInterval: defaultInterval.trim(),
        showIndicators,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .returning();

    return NextResponse.json(created[0], { status: 200 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}