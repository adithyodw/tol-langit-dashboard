import { NextRequest, NextResponse } from 'next/server';
import { myfxbookClient, MyFXBookTrade } from '@/lib/api-clients/myfxbook';
import { aggregateAccountStats } from '@/lib/aggregation/portfolio';

/**
 * GET /api/portfolio/accounts
 * Fetch and aggregate data from all connected accounts
 * Query params:
 *   - sessionToken: MyFXBook session token (required)
 *   - includeHistory: Include full trade history (optional, default: false for performance)
 */
export async function GET(request: NextRequest) {
  try {
    const sessionToken = request.nextUrl.searchParams.get('sessionToken');
    const includeHistory = request.nextUrl.searchParams.get('includeHistory') === 'true';

    if (!sessionToken) {
      return NextResponse.json(
        { error: 'sessionToken query parameter required' },
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

    // Get list of accounts
    const accounts = await myfxbookClient.getAccounts();

    if (accounts.length === 0) {
      return NextResponse.json({
        success: true,
        accountCount: 0,
        portfolio: {
          totalAccounts: 0,
          totalBalance: 0,
          totalEquity: 0,
          totalProfitLoss: 0,
          totalProfitPercent: 0,
          totalTrades: 0,
          combinedWinRate: 0,
          combinedProfitFactor: 0,
          maxDrawdown: 0,
          currentDrawdown: 0,
          accounts: [],
          allTrades: [],
          timestamp: new Date().toISOString(),
        },
        fetchedAt: new Date().toISOString(),
      });
    }

    // Fetch stats for each account
    const accountsWithStats = await Promise.all(
      accounts.map(async (acc) => {
        try {
          const stats = await myfxbookClient.getAccountStats(acc.id);

          // Optionally fetch trade history
          let trades: MyFXBookTrade[] = [];
          if (includeHistory) {
            trades = await myfxbookClient.getTradeHistory(acc.id, 500);
          }

          return {
            id: acc.id,
            name: acc.name,
            stats: {
              ...stats,
              trades,
            },
          };
        } catch (error) {
          console.warn(`Failed to fetch stats for account ${acc.id}:`, error);
          return {
            id: acc.id,
            name: acc.name,
            stats: {
              balance: 0,
              equity: 0,
              profitLoss: 0,
              totalTrades: 0,
              winRate: 0,
              profitFactor: 0,
              maxDD: 0,
              currentDD: 0,
              trades: [],
            },
          };
        }
      }),
    );

    // Aggregate portfolio
    const portfolio = aggregateAccountStats(accountsWithStats);

    return NextResponse.json({
      success: true,
      accountCount: accounts.length,
      portfolio,
      fetchedAt: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch portfolio',
      },
      { status: 500 }
    );
  }
}
