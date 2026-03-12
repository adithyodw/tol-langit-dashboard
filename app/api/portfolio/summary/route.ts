import { NextRequest, NextResponse } from 'next/server';
import { myfxbookClient } from '@/lib/api-clients/myfxbook';
import { aggregateAccountStats } from '@/lib/aggregation/portfolio';

/**
 * GET /api/portfolio/summary
 * Get aggregated portfolio summary (lightweight, no trade history)
 * Query params:
 *   - sessionToken: MyFXBook session token (required)
 */
export async function GET(request: NextRequest) {
  try {
    const sessionToken = request.nextUrl.searchParams.get('sessionToken');

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

    // Get accounts
    const accounts = await myfxbookClient.getAccounts();

    // Fetch stats for each account (no trade history for performance)
    const accountsWithStats = await Promise.all(
      accounts.map(async (acc) => {
        try {
          const stats = await myfxbookClient.getAccountStats(acc.id);
          return {
            id: acc.id,
            name: acc.name,
            stats: {
              ...stats,
              trades: [], // Empty for summary endpoint
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

    // Aggregate
    const portfolio = aggregateAccountStats(accountsWithStats);

    return NextResponse.json({
      success: true,
      summary: {
        totalAccounts: portfolio.totalAccounts,
        totalBalance: portfolio.totalBalance,
        totalEquity: portfolio.totalEquity,
        totalProfitLoss: portfolio.totalProfitLoss,
        totalProfitPercent: portfolio.totalProfitPercent,
        totalTrades: portfolio.totalTrades,
        combinedWinRate: portfolio.combinedWinRate,
        combinedProfitFactor: portfolio.combinedProfitFactor,
        maxDrawdown: portfolio.maxDrawdown,
        currentDrawdown: portfolio.currentDrawdown,
        accounts: portfolio.accounts.map((acc) => ({
          accountId: acc.accountId,
          name: acc.name,
          balance: acc.balance,
          equity: acc.equity,
          profitLoss: acc.profitLoss,
          profitPercent: acc.profitPercent,
          percentageOfTotal: acc.percentageOfTotal,
        })),
      },
      fetchedAt: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch portfolio summary',
      },
      { status: 500 }
    );
  }
}
