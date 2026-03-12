import axios, { AxiosInstance } from 'axios';

export interface MQL5SignalStats {
  id: string;
  name: string;
  authorId: number;
  description: string;
  leverage: number;
  balance: number;
  equity: number;
  gain: string;
  gainPercent: number;
  totalTrades: number;
  winRate: number;
  profitFactor: number;
  maxDD: string;
  maxDDPercent: number;
  currentDD: string;
  currentDDPercent: number;
  monthlyGain: number;
  followersCount: number;
  rating: number;
  tradingDaysCount: number;
  lastTradeTime: string;
  accountCreatedTime: string;
}

export interface MQL5Trade {
  id: string;
  symbol: string;
  direction: 'BUY' | 'SELL';
  entryPrice: number;
  exitPrice?: number;
  entryTime: string;
  closeTime?: string;
  volume: number;
  profitLoss: number;
  profitPercent: number;
}

/**
 * MQL5 Signals API Client
 * Fetches public signal data from MQL5
 * Note: MQL5 API is limited for public signals, main data comes from web scraping
 */
export class MQL5Client {
  private api: AxiosInstance;
  private baseURL = 'https://www.mql5.com/api';

  constructor() {
    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    });
  }

  /**
   * Fetch signal details from MQL5 REST API
   * Returns basic public signal information
   */
  async getSignalStats(signalId: string): Promise<MQL5SignalStats> {
    try {
      // Try MQL5 REST API endpoint
      const response = await this.api.get(`/signals/v1/signals/${signalId}`);

      const data = response.data;

      return {
        id: signalId,
        name: data.name || 'Unknown Signal',
        authorId: data.author_id || 0,
        description: data.description || '',
        leverage: data.leverage || 0,
        balance: parseFloat(data.balance) || 0,
        equity: parseFloat(data.equity) || 0,
        gain: data.gain || '+0%',
        gainPercent: parseFloat(data.gain_percent) || 0,
        totalTrades: parseInt(data.total_trades, 10) || 0,
        winRate: parseFloat(data.win_rate) || 0,
        profitFactor: parseFloat(data.profit_factor) || 0,
        maxDD: data.max_drawdown || '0%',
        maxDDPercent: parseFloat(data.max_drawdown_percent) || 0,
        currentDD: data.current_drawdown || '0%',
        currentDDPercent: parseFloat(data.current_drawdown_percent) || 0,
        monthlyGain: parseFloat(data.monthly_gain) || 0,
        followersCount: parseInt(data.followers_count, 10) || 0,
        rating: parseFloat(data.rating) || 0,
        tradingDaysCount: parseInt(data.trading_days_count, 10) || 0,
        lastTradeTime: data.last_trade_time || new Date().toISOString(),
        accountCreatedTime: data.account_created_time || new Date().toISOString(),
      };
    } catch (error) {
      throw new Error(`Failed to fetch MQL5 signal stats: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get trade history for a signal (if available via API)
   * Note: Limited data available through public API
   */
  async getTradeHistory(signalId: string, limit: number = 50): Promise<MQL5Trade[]> {
    try {
      const response = await this.api.get(`/signals/v1/signals/${signalId}/trades`, {
        params: { limit },
      });

      if (!response.data?.trades) {
        return [];
      }

      return response.data.trades.map((trade: any) => ({
        id: trade.id,
        symbol: trade.symbol,
        direction: trade.type === 0 ? 'BUY' : 'SELL',
        entryPrice: parseFloat(trade.open_price),
        exitPrice: trade.close_price ? parseFloat(trade.close_price) : undefined,
        entryTime: trade.open_time,
        closeTime: trade.close_time,
        volume: parseFloat(trade.volume),
        profitLoss: parseFloat(trade.profit),
        profitPercent: parseFloat(trade.profit_percent),
      }));
    } catch (error) {
      // MQL5 API may not support this endpoint for all signals
      console.warn(`Trade history not available via MQL5 API: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return [];
    }
  }

  /**
   * Get historical monthly performance
   * Requires parsing from web data as official API is limited
   */
  async getMonthlyPerformance(_signalId: string): Promise<Array<{ month: string; return: number }>> {
    // Note: This would typically require web scraping or a secondary data source
    // The official MQL5 API has limited historical data access
    console.warn('Monthly performance requires web scraping or secondary data source');
    return [];
  }

  /**
   * Verify signal is accessible and fetch latest data
   */
  async verifySignal(signalId: string): Promise<boolean> {
    try {
      const response = await this.api.get(`/signals/v1/signals/${signalId}`);
      return response.status === 200 && response.data?.id;
    } catch {
      return false;
    }
  }
}

// Export singleton instance
export const mql5Client = new MQL5Client();
