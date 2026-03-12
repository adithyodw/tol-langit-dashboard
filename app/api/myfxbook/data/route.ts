import { NextRequest, NextResponse } from 'next/server';
import { myfxbookClient, MyFXBookTrade } from '@/lib/api-clients/myfxbook';

/**
 * GET /api/myfxbook/data
 * Fetch account data (balance, equity, trades, etc.)
 * Query params:
 *   - sessionToken: MyFXBook session token (required)
 *   - accountId: Account ID to fetch (required)
 *   - includeHistory: Include trade history (optional, default: true)
 */
export async function GET(request: NextRequest) {
  try {
    const sessionToken = request.nextUrl.searchParams.get('sessionToken');
    const accountId = request.nextUrl.searchParams.get('accountId');
    const includeHistory = request.nextUrl.searchParams.get('includeHistory') !== 'false';

    if (!sessionToken || !accountId) {
      return NextResponse.json(
        { error: 'sessionToken and accountId query parameters required' },
        { status: 400 }
      );
    }

    myfxbookClient.setSessionToken(sessionToken);

    // Validate session
    const isValid = await myfxbookClient.validateSession();
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid or expired session token' },
        { status: 401 }
      );
    }

    // Fetch account stats
    const stats = await myfxbookClient.getAccountStats(accountId);

    let trades: MyFXBookTrade[] = [];
    if (includeHistory) {
      trades = await myfxbookClient.getTradeHistory(accountId, 100);
    }

    // Try to fetch equity curve for charting
    let equityCurve: Array<{ date: string; equity: number }> = [];
    try {
      equityCurve = await myfxbookClient.getEquityCurve(accountId);
    } catch {
      // Equity curve may not be available for all accounts
      equityCurve = [];
    }

    return NextResponse.json({
      success: true,
      accountId,
      stats: {
        ...stats,
        trades,
      },
      equityCurve,
      fetchedAt: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch account data',
      },
      { status: 500 }
    );
  }
}
