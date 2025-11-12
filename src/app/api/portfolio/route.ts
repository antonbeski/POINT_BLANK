import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { portfolio } from '@/db/schema';
import { eq, like, and } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Single record fetch by ID
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json(
          { error: 'Valid ID is required', code: 'INVALID_ID' },
          { status: 400 }
        );
      }

      const record = await db
        .select()
        .from(portfolio)
        .where(eq(portfolio.id, parseInt(id)))
        .limit(1);

      if (record.length === 0) {
        return NextResponse.json(
          { error: 'Portfolio item not found', code: 'NOT_FOUND' },
          { status: 404 }
        );
      }

      return NextResponse.json(record[0], { status: 200 });
    }

    // List with pagination and search
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '100'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const search = searchParams.get('search');

    let query = db.select().from(portfolio);

    if (search) {
      query = query.where(like(portfolio.ticker, `%${search}%`));
    }

    const results = await query.limit(limit).offset(offset);

    return NextResponse.json(results, { status: 200 });
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
    const { ticker, quantity, buyPrice, buyDate, notes } = body;

    // Validate required fields
    if (!ticker || ticker.trim() === '') {
      return NextResponse.json(
        { error: 'Ticker is required', code: 'MISSING_TICKER' },
        { status: 400 }
      );
    }

    if (quantity === undefined || quantity === null) {
      return NextResponse.json(
        { error: 'Quantity is required', code: 'MISSING_QUANTITY' },
        { status: 400 }
      );
    }

    if (buyPrice === undefined || buyPrice === null) {
      return NextResponse.json(
        { error: 'Buy price is required', code: 'MISSING_BUY_PRICE' },
        { status: 400 }
      );
    }

    if (!buyDate || buyDate.trim() === '') {
      return NextResponse.json(
        { error: 'Buy date is required', code: 'MISSING_BUY_DATE' },
        { status: 400 }
      );
    }

    // Validate quantity
    if (quantity <= 0) {
      return NextResponse.json(
        { error: 'Quantity must be greater than 0', code: 'INVALID_QUANTITY' },
        { status: 400 }
      );
    }

    // Validate buyPrice
    if (buyPrice <= 0) {
      return NextResponse.json(
        { error: 'Buy price must be greater than 0', code: 'INVALID_BUY_PRICE' },
        { status: 400 }
      );
    }

    // Validate buyDate is a valid date
    const dateRegex = /^\d{4}-\d{2}-\d{2}/;
    if (!dateRegex.test(buyDate)) {
      return NextResponse.json(
        { error: 'Buy date must be a valid ISO date string', code: 'INVALID_BUY_DATE' },
        { status: 400 }
      );
    }

    // Create new portfolio item
    const newItem = await db
      .insert(portfolio)
      .values({
        ticker: ticker.trim().toUpperCase(),
        quantity: parseFloat(quantity),
        buyPrice: parseFloat(buyPrice),
        buyDate: buyDate,
        notes: notes ? notes.trim() : null,
        createdAt: new Date().toISOString(),
      })
      .returning();

    return NextResponse.json(newItem[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { ticker, quantity, buyPrice, buyDate, notes } = body;

    // Check if record exists
    const existing = await db
      .select()
      .from(portfolio)
      .where(eq(portfolio.id, parseInt(id)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { error: 'Portfolio item not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    // Validate quantity if provided
    if (quantity !== undefined && quantity !== null && quantity <= 0) {
      return NextResponse.json(
        { error: 'Quantity must be greater than 0', code: 'INVALID_QUANTITY' },
        { status: 400 }
      );
    }

    // Validate buyPrice if provided
    if (buyPrice !== undefined && buyPrice !== null && buyPrice <= 0) {
      return NextResponse.json(
        { error: 'Buy price must be greater than 0', code: 'INVALID_BUY_PRICE' },
        { status: 400 }
      );
    }

    // Validate buyDate if provided
    if (buyDate !== undefined && buyDate !== null) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}/;
      if (!dateRegex.test(buyDate)) {
        return NextResponse.json(
          { error: 'Buy date must be a valid ISO date string', code: 'INVALID_BUY_DATE' },
          { status: 400 }
        );
      }
    }

    // Build update object with only provided fields
    const updates: {
      ticker?: string;
      quantity?: number;
      buyPrice?: number;
      buyDate?: string;
      notes?: string | null;
    } = {};

    if (ticker !== undefined) {
      updates.ticker = ticker.trim().toUpperCase();
    }
    if (quantity !== undefined && quantity !== null) {
      updates.quantity = parseFloat(quantity.toString());
    }
    if (buyPrice !== undefined && buyPrice !== null) {
      updates.buyPrice = parseFloat(buyPrice.toString());
    }
    if (buyDate !== undefined) {
      updates.buyDate = buyDate;
    }
    if (notes !== undefined) {
      updates.notes = notes ? notes.trim() : null;
    }

    const updated = await db
      .update(portfolio)
      .set(updates)
      .where(eq(portfolio.id, parseInt(id)))
      .returning();

    return NextResponse.json(updated[0], { status: 200 });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Check if record exists
    const existing = await db
      .select()
      .from(portfolio)
      .where(eq(portfolio.id, parseInt(id)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { error: 'Portfolio item not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const deleted = await db
      .delete(portfolio)
      .where(eq(portfolio.id, parseInt(id)))
      .returning();

    return NextResponse.json(
      {
        message: 'Portfolio item deleted successfully',
        item: deleted[0],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}