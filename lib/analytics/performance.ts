import { MyFXBookTrade } from '@/lib/api-clients/myfxbook';

/**
 * Calculate annualized returns from trades
 */
export function calculateReturns(
  trades: MyFXBookTrade[],
  initialBalance: number,
  endBalance: number,
): {
  totalReturn: number;
  cagr: number;
  annualReturn: number;
  monthlyReturn: number;
} {
  if (trades.length === 0 || initialBalance <= 0) {
    return {
      totalReturn: 0,
      cagr: 0,
      annualReturn: 0,
      monthlyReturn: 0,
    };
  }

  // Calculate total return percentage
  const totalReturn = ((endBalance - initialBalance) / initialBalance) * 100;

  // Calculate trading period in years
  const firstTrade = new Date(trades[0].entryTime);
  const lastTrade = new Date(trades[trades.length - 1].closeTime || trades[trades.length - 1].entryTime);
  const yearsDiff = (lastTrade.getTime() - firstTrade.getTime()) / (1000 * 60 * 60 * 24 * 365.25);

  // CAGR (Compound Annual Growth Rate)
  const cagr =
    yearsDiff > 0
      ? (Math.pow(endBalance / initialBalance, 1 / yearsDiff) - 1) * 100
      : 0;

  // Annual return (simple)
  const annualReturn = yearsDiff > 0 ? totalReturn / yearsDiff : 0;

  // Monthly return (geometric mean)
  const monthlyReturn = yearsDiff > 0 ? Math.pow(1 + totalReturn / 100, 1 / (yearsDiff * 12)) - 1 : 0;

  return {
    totalReturn,
    cagr,
    annualReturn,
    monthlyReturn: monthlyReturn * 100,
  };
}

/**
 * Calculate Sharpe Ratio
 * Sharpe = (Annual Return - Risk Free Rate) / Annual Volatility
 * Assumes risk-free rate of 2%
 */
export function calculateSharpeRatio(returns: number[], riskFreeRate = 2): number {
  if (returns.length < 2) return 0;

  const riskFreeRateDaily = riskFreeRate / 365;
  const excessReturns = returns.map((r) => r - riskFreeRateDaily);

  const avgExcessReturn = excessReturns.reduce((a, b) => a + b, 0) / excessReturns.length;
  const variance =
    excessReturns.reduce((a, b) => a + Math.pow(b - avgExcessReturn, 2), 0) / excessReturns.length;
  const stdDev = Math.sqrt(variance);

  if (stdDev === 0) return 0;

  // Annualize: Sharpe = (avg excess * 252) / (stdDev * sqrt(252))
  const annualizedSharpe = (avgExcessReturn * 252) / (stdDev * Math.sqrt(252));
  return annualizedSharpe;
}

/**
 * Calculate Sortino Ratio (downside deviation only)
 */
export function calculateSortinoRatio(returns: number[], targetReturn = 0, riskFreeRate = 2): number {
  if (returns.length < 2) return 0;

  const riskFreeRateDaily = riskFreeRate / 365;
  const excessReturns = returns.map((r) => r - riskFreeRateDaily);

  const avgExcessReturn = excessReturns.reduce((a, b) => a + b, 0) / excessReturns.length;

  // Downside deviation: only negative returns
  const downsidesReturns = excessReturns.filter((r) => r < targetReturn);
  if (downsidesReturns.length === 0) return 0;

  const downsideVariance =
    downsidesReturns.reduce((a, r) => a + Math.pow(r - targetReturn, 2), 0) / excessReturns.length;
  const downsideStdDev = Math.sqrt(downsideVariance);

  if (downsideStdDev === 0) return 0;

  // Annualize Sortino
  const annualizedSortino = (avgExcessReturn * 252) / (downsideStdDev * Math.sqrt(252));
  return annualizedSortino;
}

/**
 * Calculate Value at Risk (VaR) at confidence level (e.g., 95%)
 */
export function calculateVaR(returns: number[], confidenceLevel = 0.95): number {
  if (returns.length === 0) return 0;

  const sorted = returns.slice().sort((a, b) => a - b);
  const index = Math.floor((1 - confidenceLevel) * sorted.length);
  return sorted[index];
}

/**
 * Calculate Conditional VaR (CVaR / Expected Shortfall)
 * Average of returns below VaR
 */
export function calculateCVaR(returns: number[], confidenceLevel = 0.95): number {
  if (returns.length === 0) return 0;

  const var_val = calculateVaR(returns, confidenceLevel);
  const shortfallReturns = returns.filter((r) => r <= var_val);

  if (shortfallReturns.length === 0) return var_val;

  return shortfallReturns.reduce((a, b) => a + b, 0) / shortfallReturns.length;
}

/**
 * Calculate daily returns from trades
 */
export function calculateDailyReturns(
  trades: MyFXBookTrade[],
  initialBalance: number,
): Array<{ date: string; return: number }> {
  if (trades.length === 0 || initialBalance <= 0) {
    return [];
  }

  const dailyPnL: Record<string, number> = {};

  for (const trade of trades) {
    const date = new Date(trade.closeTime || trade.entryTime).toISOString().split('T')[0];
    if (!dailyPnL[date]) {
      dailyPnL[date] = 0;
    }
    dailyPnL[date] += trade.profitLoss;
  }

  // Convert to returns percentage
  const dailyReturns = Object.entries(dailyPnL)
    .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
    .map(([date, pnl]) => ({
      date,
      return: (pnl / initialBalance) * 100,
    }));

  return dailyReturns;
}

/**
 * Calculate profit factor
 */
export function calculateProfitFactor(trades: MyFXBookTrade[]): number {
  if (trades.length === 0) return 0;

  let grossProfit = 0;
  let grossLoss = 0;

  for (const trade of trades) {
    if (trade.profitLoss > 0) {
      grossProfit += trade.profitLoss;
    } else if (trade.profitLoss < 0) {
      grossLoss += Math.abs(trade.profitLoss);
    }
  }

  if (grossLoss === 0) return grossProfit > 0 ? 999 : 0; // Avoid division by zero

  return grossProfit / grossLoss;
}

/**
 * Calculate recovery factor (Net Profit / Max Drawdown)
 */
export function calculateRecoveryFactor(trades: MyFXBookTrade[], initialBalance: number): number {
  if (trades.length === 0 || initialBalance <= 0) return 0;

  const netProfit = trades.reduce((sum, trade) => sum + trade.profitLoss, 0);

  // Calculate max drawdown
  let maxDrawdown = 0;
  let peakProfit = 0;
  let cumulativeProfit = 0;

  const sorted = trades.sort(
    (a, b) => new Date(a.closeTime || '').getTime() - new Date(b.closeTime || '').getTime(),
  );

  for (const trade of sorted) {
    cumulativeProfit += trade.profitLoss;
    if (cumulativeProfit > peakProfit) {
      peakProfit = cumulativeProfit;
    }
    const drawdown = peakProfit - cumulativeProfit;
    if (drawdown > maxDrawdown) {
      maxDrawdown = drawdown;
    }
  }

  if (maxDrawdown === 0) return 0;

  return netProfit / maxDrawdown;
}

/**
 * Calculate expectancy (average profit per trade)
 */
export function calculateExpectancy(trades: MyFXBookTrade[]): number {
  if (trades.length === 0) return 0;

  const totalProfit = trades.reduce((sum, trade) => sum + trade.profitLoss, 0);
  return totalProfit / trades.length;
}
