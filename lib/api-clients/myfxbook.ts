import axios, { AxiosInstance } from 'axios';

export interface MyFXBookCredentials {
  email: string;
  password: string;
}

export interface MyFXBookAccount {
  id: string;
  name: string;
  accountNumber: string;
  balance: number;
  equity: number;
  freeMargin: number;
  usedMargin: number;
}

export interface MyFXBookTrade {
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
  commission: number;
  swaps: number;
}

export interface MyFXBookAccountStats {
  balance: number;
  equity: number;
  profitLoss: number;
  totalTrades: number;
  winRate: number;
  profitFactor: number;
  maxDD: number;
  currentDD: number;
  trades: MyFXBookTrade[];
}

/**
 * MyFXBook API Client
 * Handles authentication and data fetching from MyFXBook
 */
export class MyFXBookClient {
  private api: AxiosInstance;
  private baseURL = 'https://www.myfxbook.com/api';
  private sessionToken: string | null = null;

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
   * Authenticate with MyFXBook
   */
  async login(credentials: MyFXBookCredentials): Promise<string> {
    try {
      const response = await this.api.post('/v3/login', {
        email: credentials.email,
        password: credentials.password,
      });

      if (response.data?.session) {
        this.sessionToken = response.data.session;
        return response.data.session;
      }

      throw new Error('No session token received from MyFXBook');
    } catch (error) {
      throw new Error(`MyFXBook login failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Set session token (for re-establishing connection)
   */
  setSessionToken(token: string): void {
    this.sessionToken = token;
  }

  /**
   * Validate current session
   */
  async validateSession(): Promise<boolean> {
    if (!this.sessionToken) return false;

    try {
      const response = await this.api.get('/v3/common', {
        params: { session: this.sessionToken },
      });

      return response.data?.success === true;
    } catch {
      return false;
    }
  }

  /**
   * Get list of accounts for authenticated user
   */
  async getAccounts(): Promise<MyFXBookAccount[]> {
    if (!this.sessionToken) {
      throw new Error('Not authenticated. Call login() first.');
    }

    try {
      const response = await this.api.get('/v3/user', {
        params: { session: this.sessionToken },
      });

      if (!response.data?.accounts) {
        return [];
      }

      return response.data.accounts.map((acc: any) => ({
        id: acc.id,
        name: acc.name,
        accountNumber: acc.acc,
        balance: parseFloat(acc.balance),
        equity: parseFloat(acc.equity),
        freeMargin: parseFloat(acc.freeMargin || 0),
        usedMargin: parseFloat(acc.usedMargin || 0),
      }));
    } catch (error) {
      throw new Error(`Failed to fetch accounts: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get account statistics and performance data
   */
  async getAccountStats(accountId: string): Promise<MyFXBookAccountStats> {
    if (!this.sessionToken) {
      throw new Error('Not authenticated. Call login() first.');
    }

    try {
      const response = await this.api.get(`/v3/account/${accountId}`, {
        params: { session: this.sessionToken },
      });

      const data = response.data;

      return {
        balance: parseFloat(data.balance),
        equity: parseFloat(data.equity),
        profitLoss: parseFloat(data.profit),
        totalTrades: parseInt(data.trades, 10),
        winRate: parseFloat(data.winRate) / 100,
        profitFactor: parseFloat(data.profitFactor),
        maxDD: parseFloat(data.maxDD),
        currentDD: parseFloat(data.currentDD),
        trades: [], // Detailed trades require separate endpoint
      };
    } catch (error) {
      throw new Error(`Failed to fetch account stats: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get trade history for account
   */
  async getTradeHistory(
    accountId: string,
    limit: number = 100
  ): Promise<MyFXBookTrade[]> {
    if (!this.sessionToken) {
      throw new Error('Not authenticated. Call login() first.');
    }

    try {
      const response = await this.api.get(`/v3/account/${accountId}/trades`, {
        params: {
          session: this.sessionToken,
          limit,
        },
      });

      if (!response.data?.trades) {
        return [];
      }

      return response.data.trades.map((trade: any) => ({
        id: trade.id,
        symbol: trade.symbol,
        direction: trade.direction === 1 ? 'BUY' : 'SELL',
        entryPrice: parseFloat(trade.entryPrice),
        exitPrice: trade.exitPrice ? parseFloat(trade.exitPrice) : undefined,
        entryTime: trade.openTime,
        closeTime: trade.closeTime,
        volume: parseFloat(trade.lot),
        profitLoss: parseFloat(trade.profit),
        profitPercent: parseFloat(trade.profitPercent),
        commission: parseFloat(trade.commission || 0),
        swaps: parseFloat(trade.swap || 0),
      }));
    } catch (error) {
      throw new Error(`Failed to fetch trade history: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get account equity curve (historical daily equity)
   */
  async getEquityCurve(accountId: string): Promise<Array<{ date: string; equity: number }>> {
    if (!this.sessionToken) {
      throw new Error('Not authenticated. Call login() first.');
    }

    try {
      const response = await this.api.get(`/v3/account/${accountId}/equitychart`, {
        params: {
          session: this.sessionToken,
        },
      });

      if (!response.data?.data) {
        return [];
      }

      return response.data.data.map((point: any) => ({
        date: point.date,
        equity: parseFloat(point.equity),
      }));
    } catch (error) {
      throw new Error(`Failed to fetch equity curve: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// Export singleton instance
export const myfxbookClient = new MyFXBookClient();
