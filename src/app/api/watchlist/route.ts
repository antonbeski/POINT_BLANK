import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { watchlist } from '@/db/schema';
import { eq, like, or, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    // Single record fetch
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json(
          { 
            error: 'Valid ID is required',
            code: 'INVALID_ID'
          },
          { status: 400 }
        );
      }

      const record = await db.select()
        .from(watchlist)
        .where(eq(watchlist.id, parseInt(id)))
        .limit(1);

      if (record.length === 0) {
        return NextResponse.json(
          { error: 'Watchlist item not found' },
          { status: 404 }
        );
      }

      return NextResponse.json(record[0], { status: 200 });
    }

    // List with pagination and search
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '100'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const search = searchParams.get('search');

    let query = db.select().from(watchlist);

    if (search) {
      query = query.where(
        or(
          like(watchlist.ticker, `%${search}%`),
          like(watchlist.name, `%${search}%`)
        )
      );
    }

    const results = await query
      .orderBy(desc(watchlist.addedAt))
      .limit(limit)
      .offset(offset);

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
    const { ticker, name, notes } = body;

    // Validate required fields
    if (!ticker || typeof ticker !== 'string' || ticker.trim() === '') {
      return NextResponse.json(
        { 
          error: 'Ticker is required and must be a non-empty string',
          code: 'MISSING_TICKER'
        },
        { status: 400 }
      );
    }

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json(
        { 
          error: 'Name is required and must be a non-empty string',
          code: 'MISSING_NAME'
        },
        { status: 400 }
      );
    }

    // Prepare insert data
    const insertData: {
      ticker: string;
      name: string;
      addedAt: string;
      notes?: string;
    } = {
      ticker: ticker.trim().toUpperCase(),
      name: name.trim(),
      addedAt: new Date().toISOString(),
    };

    if (notes && typeof notes === 'string') {
      insertData.notes = notes.trim();
    }

    const newRecord = await db.insert(watchlist)
      .values(insertData)
      .returning();

    return NextResponse.json(newRecord[0], { status: 201 });
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
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { 
          error: 'Valid ID is required',
          code: 'INVALID_ID'
        },
        { status: 400 }
      );
    }

    // Check if record exists
    const existing = await db.select()
      .from(watchlist)
      .where(eq(watchlist.id, parseInt(id)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { error: 'Watchlist item not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { ticker, name, notes } = body;

    // Prepare update data
    const updateData: {
      ticker?: string;
      name?: string;
      notes?: string | null;
    } = {};

    if (ticker !== undefined) {
      if (typeof ticker !== 'string' || ticker.trim() === '') {
        return NextResponse.json(
          { 
            error: 'Ticker must be a non-empty string',
            code: 'INVALID_TICKER'
          },
          { status: 400 }
        );
      }
      updateData.ticker = ticker.trim().toUpperCase();
    }

    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim() === '') {
        return NextResponse.json(
          { 
            error: 'Name must be a non-empty string',
            code: 'INVALID_NAME'
          },
          { status: 400 }
        );
      }
      updateData.name = name.trim();
    }

    if (notes !== undefined) {
      if (notes === null || notes === '') {
        updateData.notes = null;
      } else if (typeof notes === 'string') {
        updateData.notes = notes.trim();
      } else {
        return NextResponse.json(
          { 
            error: 'Notes must be a string or null',
            code: 'INVALID_NOTES'
          },
          { status: 400 }
        );
      }
    }

    // Only update if there are fields to update
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(existing[0], { status: 200 });
    }

    const updated = await db.update(watchlist)
      .set(updateData)
      .where(eq(watchlist.id, parseInt(id)))
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
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { 
          error: 'Valid ID is required',
          code: 'INVALID_ID'
        },
        { status: 400 }
      );
    }

    // Check if record exists
    const existing = await db.select()
      .from(watchlist)
      .where(eq(watchlist.id, parseInt(id)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { error: 'Watchlist item not found' },
        { status: 404 }
      );
    }

    const deleted = await db.delete(watchlist)
      .where(eq(watchlist.id, parseInt(id)))
      .returning();

    return NextResponse.json(
      {
        message: 'Watchlist item deleted successfully',
        deleted: deleted[0]
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