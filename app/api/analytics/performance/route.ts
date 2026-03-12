import { NextRequest, NextResponse } from 'next/server';
import { myfxbookClient } from '@/lib/api-clients/myfxbook';
import {
  calculateReturns,
  calculateSharpeRatio,
  calculateSortinoRatio,
  calculateVaR,
  calculateCVaR,
  calculateDailyReturns,
  calculateProfitFactor,
  calculateRecoveryFactor,
  calculateExpectancy,
} from '@/lib/analytics/performance';

/**
 * GET /api/analytics/performance
 * Calculate comprehensive performance metrics for an account
 * Query params:
 *   - sessionToken: MyFXBook session token (required)
 *   - accountId: Account ID (required)
 */
export async function GET(request: NextRequest) {
  try {
    const sessionToken = request.nextUrl.searchParams.get('sessionToken');
    const accountId = request.nextUrl.searchParams.get('accountId');

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

    // Fetch account data
    const stats = await myfxbookClient.getAccountStats(accountId);
    const trades = await myfxbookClient.getTradeHistory(accountId, 1000); // Large limit for analysis

    if (trades.length === 0) {
      return NextResponse.json({
        success: true,
        accountId,
        warning: 'Insufficient trade history for analysis',
        metrics: {
          returns: null,
          sharpeRatio: 0,
          sortinoRatio: 0,
          valueAtRisk: null,
          conditionalVaR: null,
          profitFactor: 0,
          recoveryFactor: 0,
          expectancy: 0,
          dailyReturns: [],
        },
        fetchedAt: new Date().toISOString(),
      });
    }

    // Calculate metrics
    const dailyReturns = calculateDailyReturns(trades, stats.balance);
    const returnsArray = dailyReturns.map((dr) => dr.return);

    const returns = calculateReturns(trades, stats.balance, stats.equity);
    const sharpe = calculateSharpeRatio(returnsArray);
    const sortino = calculateSortinoRatio(returnsArray);
    const var95 = calculateVaR(returnsArray, 0.95);
    const cvar95 = calculateCVaR(returnsArray, 0.95);
    const pf = calculateProfitFactor(trades);
    const rf = calculateRecoveryFactor(trades, stats.balance);
    const exp = calculateExpectancy(trades);

    return NextResponse.json({
      success: true,
      accountId,
      metrics: {
        returns: {
          totalReturn: returns.totalReturn,
          cagr: returns.cagr,
          annualReturn: returns.annualReturn,
          monthlyReturn: returns.monthlyReturn,
        },
        riskMetrics: {
          sharpeRatio: parseFloat(sharpe.toFixed(2)),
          sortinoRatio: parseFloat(sortino.toFixed(2)),
          valueAtRisk95: parseFloat(var95.toFixed(4)),
          conditionalVaR95: parseFloat(cvar95.toFixed(4)),
          maxDrawdown: stats.maxDD,
          currentDrawdown: stats.currentDD,
        },
        tradeMetrics: {
          profitFactor: parseFloat(pf.toFixed(2)),
          recoveryFactor: parseFloat(rf.toFixed(2)),
          expectancy: parseFloat(exp.toFixed(2)),
          totalTrades: trades.length,
          winRate: stats.winRate * 100,
        },
        dailyReturns: dailyReturns.slice(-60), // Last 60 days
      },
      fetchedAt: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to calculate performance metrics',
      },
      { status: 500 }
    );
  }
}
