/**
 * MyFXBook REST API client
 * All endpoints are GET requests with query params.
 * Docs: https://www.myfxbook.com/api
 *
 * Session tokens expire after ~2 hours. We cache the token in module
 * scope so Vercel function instances reuse it across invocations within
 * the same cold-start lifecycle.
 */

const BASE = 'https://www.myfxbook.com/api';

/* ─── Session cache (module-scoped, survives warm invocations) ───────────── */
let cachedSession: string | null = null;
let sessionExpiry = 0; // epoch ms

function sessionValid() {
  return !!cachedSession && Date.now() < sessionExpiry;
}

/* ─── Raw API shapes ─────────────────────────────────────────────────────── */
export interface MyfxAccount {
  id: number;
  name: string;
  accountId: number;
  description: string;
  gain: number;          // total gain %
  absGain: number;       // absolute gain % (deposits-adjusted)
  daily: number;         // avg daily %
  monthly: number;       // avg monthly %
  drawdown: number;      // max balance drawdown %
  deposits: number;
  withdrawals: number;
  profit: number;
  balance: number;
  equity: number;
  equityPercent: number;
  demo: boolean;
  lastUpdateDate: string;
  creationDate: string;
  firstTradeDate: string;
  tracking: number;
  views: number;
  commission: number;
  currency: string;
  profitFactor: number;
  pips: number;
}

export interface MyfxHistoryTrade {
  openTime: string;
  closeTime: string;
  symbol: string;
  action: string;      // '0' buy / '1' sell
  sizing: { type: string; value: string };
  openPrice: number;
  closePrice: number;
  tp: number;
  sl: number;
  comment: string;
  pips: number;
  profit: number;
  interest: number;
  commission: number;
}

/* ─── Mapped strategy data shape ─────────────────────────────────────────── */
export interface LiveStrategyData {
  gain: string;
  mo: string;
  ddBal: string;
  pf: string;
  trades: string;
  wins: string;
  losses: string;
  win: string;
  lastUpd: string;
}

/* ─── Core API calls ─────────────────────────────────────────────────────── */

async function get<T>(path: string, params: Record<string, string>): Promise<T> {
  const url = new URL(`${BASE}/${path}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const res = await fetch(url.toString(), {
    headers: { 'User-Agent': 'Mozilla/5.0' },
    next: { revalidate: 0 },
  });

  if (!res.ok) throw new Error(`MyFXBook HTTP ${res.status} on ${path}`);
  const json = await res.json();
  if (json.error) throw new Error(`MyFXBook error: ${json.message ?? 'unknown'}`);
  return json as T;
}

export async function login(email: string, password: string): Promise<string> {
  const data = await get<{ session: string }>('login.json', { email, password });
  cachedSession = data.session;
  sessionExpiry = Date.now() + 90 * 60 * 1000; // 90 min TTL (sessions last ~2 hr)
  return data.session;
}

export async function getSession(email: string, password: string): Promise<string> {
  if (sessionValid()) return cachedSession!;
  return login(email, password);
}

export async function getAccounts(session: string): Promise<MyfxAccount[]> {
  const data = await get<{ accounts: MyfxAccount[] }>('get-my-accounts.json', { session });
  return data.accounts;
}

export async function getHistory(
  session: string,
  accountId: number,
): Promise<MyfxHistoryTrade[]> {
  const data = await get<{ history: MyfxHistoryTrade[] }>('get-history.json', {
    session,
    id: String(accountId),
    start: '2020-01-01',
    end: new Date().toISOString().split('T')[0],
  });
  return data.history ?? [];
}

/* ─── Map raw account + history → dashboard format ──────────────────────── */

function fmt(n: number, decimals = 2): string {
  const s = Math.abs(n).toFixed(decimals);
  return n >= 0 ? `+${s}%` : `-${s}%`;
}

function fmtDd(n: number): string {
  return `${Math.abs(n).toFixed(2)}%`;
}

export function mapAccount(
  acct: MyfxAccount,
  history: MyfxHistoryTrade[],
): LiveStrategyData {
  const wins   = history.filter(t => t.profit > 0).length;
  const losses = history.filter(t => t.profit <= 0).length;
  const total  = wins + losses;
  const winRate = total > 0 ? ((wins / total) * 100).toFixed(2) + '%' : '—';

  return {
    gain:   fmt(acct.gain),
    mo:     fmt(acct.monthly),
    ddBal:  fmtDd(acct.drawdown),
    pf:     acct.profitFactor.toFixed(2),
    trades: total > 0 ? total.toLocaleString() : '—',
    wins:   wins > 0  ? wins.toLocaleString()  : '—',
    losses: losses > 0 ? losses.toLocaleString() : '—',
    win:    winRate,
    lastUpd: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
  };
}

/* ─── Account ID → strategy key mapping ─────────────────────────────────── */
export const ACCOUNT_MAP: Record<number, string> = {
  8671765:  'v10',
  11424740: 'v10hr',
  11891377: 'etf',
  12023120: 'etfgold',
};
