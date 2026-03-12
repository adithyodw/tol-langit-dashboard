import { NextRequest, NextResponse } from 'next/server';
import { mql5Client } from '@/lib/api-clients/mql5';

/**
 * GET /api/mql5/history
 * Fetch trade history for an MQL5 signal
 * Query params:
 *   - signalId: MQL5 Signal ID (required)
 *   - limit: Number of trades to fetch (optional, default: 50)
 */
export async function GET(request: NextRequest) {
  try {
    const signalId = request.nextUrl.searchParams.get('signalId');
    const limitParam = request.nextUrl.searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam, 10) : 50;

    if (!signalId) {
      return NextResponse.json({ error: 'signalId query parameter required' }, { status: 400 });
    }

    if (isNaN(limit) || limit < 1) {
      return NextResponse.json(
        { error: 'limit must be a positive number' },
        { status: 400 }
      );
    }

    // Fetch trade history
    const trades = await mql5Client.getTradeHistory(signalId, limit);

    return NextResponse.json({
      success: true,
      signalId,
      trades,
      count: trades.length,
      fetchedAt: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch trade history',
      },
      { status: 500 }
    );
  }
}
