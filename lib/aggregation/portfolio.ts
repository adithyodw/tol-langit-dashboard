import { MyFXBookAccountStats, MyFXBookTrade } from '@/lib/api-clients/myfxbook';

/**
 * Aggregated portfolio metrics across multiple accounts
 */
export interface AggregatedPortfolio {
  totalAccounts: number;
  totalBalance: number;
  totalEquity: number;
  totalProfitLoss: number;
  totalProfitPercent: number;
  totalTrades: number;
  combinedWinRate: number;
  combinedProfitFactor: number;
  maxDrawdown: number;
  currentDrawdown: number;
  accounts: PortfolioAccount[];
  allTrades: MyFXBookTrade[];
  timestamp: string;
}

export interface PortfolioAccount {
  accountId: string;
  name: string;
  balance: number;
  equity: number;
  profitLoss: number;
  profitPercent: number;
  trades: number;
  winRate: number;
  profitFactor: number;
  maxDD: number;
  currentDD: number;
  percentageOfTotal: number;
}

/**
 * Aggregate multiple account statistics into portfolio view
 */
export function aggregateAccountStats(
  accounts: Array<{ id: string; name: string; stats: MyFXBookAccountStats }>,
): AggregatedPortfolio {
  if (accounts.length === 0) {
    return {
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
    };
  }

  // Aggregate basic metrics
  let totalBalance = 0;
  let totalEquity = 0;
  let totalProfitLoss = 0;
  let totalTrades = 0;
  let maxDrawdown = 0;
  let allTrades: MyFXBookTrade[] = [];

  const portfolioAccounts: PortfolioAccount[] = [];

  for (const account of accounts) {
    const { stats } = account;

    totalBalance += stats.balance;
    totalEquity += stats.equity;
    totalProfitLoss += stats.profitLoss;
    totalTrades += stats.totalTrades;

    // Collect all trades for attribution analysis
    allTrades = allTrades.concat(stats.trades);

    // Update max drawdown
    if (stats.maxDD > maxDrawdown) {
      maxDrawdown = stats.maxDD;
    }

    portfolioAccounts.push({
      accountId: account.id,
      name: account.name,
      balance: stats.balance,
      equity: stats.equity,
      profitLoss: stats.profitLoss,
      profitPercent: stats.balance > 0 ? (stats.profitLoss / stats.balance) * 100 : 0,
      trades: stats.totalTrades,
      winRate: stats.winRate,
      profitFactor: stats.profitFactor,
      maxDD: stats.maxDD,
      currentDD: stats.currentDD,
      percentageOfTotal: stats.balance > 0 ? (stats.balance / totalBalance) * 100 : 0,
    });
  }

  // Calculate portfolio-level win rate
  // Approximate: average of accounts weighted by trade count
  const combinedWinRate =
    totalTrades > 0
      ? portfolioAccounts.reduce(
          (sum, acc) => sum + acc.winRate * (acc.trades / totalTrades),
          0,
        )
      : 0;

  // Calculate combined profit factor
  // Simplified: use weighted average of individual profit factors
  const combinedProfitFactor =
    portfolioAccounts.length > 0
      ? portfolioAccounts.reduce((sum, acc) => sum + acc.profitFactor, 0) /
        portfolioAccounts.length
      : 0;

  const totalProfitPercent = totalBalance > 0 ? (totalProfitLoss / totalBalance) * 100 : 0;

  return {
    totalAccounts: accounts.length,
    totalBalance,
    totalEquity,
    totalProfitLoss,
    totalProfitPercent,
    totalTrades,
    combinedWinRate,
    combinedProfitFactor,
    maxDrawdown,
    currentDrawdown: totalEquity > 0 ? ((totalEquity - totalBalance) / totalBalance) * 100 : 0,
    accounts: portfolioAccounts,
    allTrades,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Calculate portfolio growth over time from snapshots
 */
export function calculatePortfolioGrowth(
  snapshots: Array<{
    timestamp: Date;
    totalBalance: number;
    totalEquity: number;
    totalReturn: number;
  }>,
): Array<{
  date: string;
  balance: number;
  equity: number;
  return: number;
}> {
  return snapshots
    .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
    .map((snap) => ({
      date: snap.timestamp.toISOString().split('T')[0],
      balance: snap.totalBalance,
      equity: snap.totalEquity,
      return: snap.totalReturn,
    }));
}

/**
 * Calculate monthly return for a given month
 */
export function calculateMonthlyReturn(
  trades: MyFXBookTrade[],
  year: number,
  month: number,
): { return: number; trades: number } {
  const monthStart = new Date(year, month - 1, 1);
  const monthEnd = new Date(year, month, 0, 23, 59, 59);

  const monthTrades = trades.filter((trade) => {
    const tradeDate = new Date(trade.closeTime || trade.entryTime);
    return tradeDate >= monthStart && tradeDate <= monthEnd;
  });

  const monthlyProfit = monthTrades.reduce((sum, trade) => sum + trade.profitLoss, 0);
  const monthlyReturn = monthTrades.length > 0 ? monthlyProfit : 0;

  return {
    return: monthlyReturn,
    trades: monthTrades.length,
  };
}

/**
 * Calculate drawdown for a specific period
 */
export function calculateDrawdownMetrics(
  trades: MyFXBookTrade[],
): { maxDD: number; currentDD: number; avgDD: number } {
  if (trades.length === 0) {
    return { maxDD: 0, currentDD: 0, avgDD: 0 };
  }

  // Sort trades by close time
  const sortedTrades = trades.sort(
    (a, b) => new Date(a.closeTime || '').getTime() - new Date(b.closeTime || '').getTime(),
  );

  let maxDrawdown = 0;
  let peakProfit = 0;
  let cumulativeProfit = 0;
  const drawdowns: number[] = [];

  for (const trade of sortedTrades) {
    cumulativeProfit += trade.profitLoss;

    if (cumulativeProfit > peakProfit) {
      peakProfit = cumulativeProfit;
    }

    const drawdown = peakProfit - cumulativeProfit;
    drawdowns.push(drawdown);

    if (drawdown > maxDrawdown) {
      maxDrawdown = drawdown;
    }
  }

  const avgDD = drawdowns.length > 0 ? drawdowns.reduce((a, b) => a + b) / drawdowns.length : 0;
  const currentDD = drawdowns.length > 0 ? drawdowns[drawdowns.length - 1] : 0;

  return {
    maxDD: maxDrawdown,
    currentDD,
    avgDD,
  };
}
