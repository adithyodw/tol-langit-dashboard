import { NextRequest, NextResponse } from 'next/server';
import { mql5Client } from '@/lib/api-clients/mql5';

/**
 * GET /api/mql5/signals
 * Fetch MQL5 signal details (public data, no auth required)
 * Query params:
 *   - signalId: MQL5 Signal ID (required)
 */
export async function GET(request: NextRequest) {
  try {
    const signalId = request.nextUrl.searchParams.get('signalId');

    if (!signalId) {
      return NextResponse.json({ error: 'signalId query parameter required' }, { status: 400 });
    }

    // Verify signal exists
    const exists = await mql5Client.verifySignal(signalId);
    if (!exists) {
      return NextResponse.json(
        { error: 'Signal not found or not accessible' },
        { status: 404 }
      );
    }

    // Fetch signal stats
    const stats = await mql5Client.getSignalStats(signalId);

    return NextResponse.json({
      success: true,
      signal: stats,
      fetchedAt: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch signal data',
      },
      { status: 500 }
    );
  }
}
