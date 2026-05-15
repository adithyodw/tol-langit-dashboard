/**
 * MyFXBook REST API client
 * All endpoints are GET requests with query params.
 * Docs: https://www.myfxbook.com/api
 *
 * Session tokens expire after ~2 hours. We cache the token in module
 * scope so Vercel function instances reuse it across invocations within
 * the same cold-start lifecycle.
 */

const BASE_URL = 'https://www.myfxbook.com/api';

/* ─── Session cache (module-scoped, survives warm invocations) ───────────── */
let cachedSession: string | null = null;
let sessionExpiry = 0;

function sessionValid() {
  return !!cachedSession && Date.now() < sessionExpiry;
}

/* ─── Raw API shapes ─────────────────────────────────────────────────────── */
export interface MyfxAccount {
  id: number;
  name: string;
  accountId: number;
  description: string;
  gain: number; // non-deposit-adjusted total gain %
  absGain: number; // deposit-adjusted absolute gain %
  daily: number;
  monthly: number; // average monthly gain %
  drawdown: number; // max drawdown % (equity DD for grid, balance DD for non-grid)
  deposits: number;
  withdrawals: number;
  interest: number;
  profit: number;
  balance: number;
  equity: number;
  equityPercent: number; // equity as % of balance (100 = flat, <100 = floating loss)
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
  portfolio: string;
  server: { name: string };
}

/* ─── Mapped live strategy fields (overlaid on BASE hardcoded data) ──────── */
export interface LiveStrategyData {
  gain: string; // total or absolute gain %
  mo: string; // average monthly gain %
  pf: string; // profit factor
  ddBal?: string; // max balance drawdown — updated for non-grid strategies
  ddEq?: string; // max equity drawdown  — updated for grid strategies
  lastUpd: string;
}

/*
 * Strategy classification:
 *   Grid strategies (V10): MFB `drawdown` = max equity DD
 *   Non-grid strategies (ETF Gold):    MFB `drawdown` = max balance DD
 *
 * All strategies use gain (not absGain).
 */
const GRID_IDS = new Set([8671765]);
const ABS_GAIN_IDS: Set<number> = new Set([]);

/* ─── Core API helper ────────────────────────────────────────────────────── */
async function get<T>(path: string, params: Record<string, string>): Promise<T> {
  const url = new URL(`${BASE_URL}/${path}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const res = await fetch(url.toString(), {
    headers: { 'User-Agent': 'Mozilla/5.0' },
    next: { revalidate: 0 },
  });

  if (!res.ok) throw new Error(`MyFXBook HTTP ${res.status} on ${path}`);
  const json = await res.json();
  if (json.error) throw new Error(`MyFXBook API error: ${json.message ?? 'unknown'}`);
  return json as T;
}

/* ─── Auth ───────────────────────────────────────────────────────────────── */
export async function login(email: string, password: string): Promise<string> {
  const data = await get<{ session: string }>('login.json', { email, password });
  // MyFXBook returns the session URL-encoded inside the JSON body.
  // Decode it so searchParams.set() doesn't double-encode % characters.
  cachedSession = decodeURIComponent(data.session);
  sessionExpiry = Date.now() + 90 * 60 * 1000; // 90-min TTL
  return cachedSession;
}

export async function getSession(email: string, password: string): Promise<string> {
  if (sessionValid()) return cachedSession!;
  return login(email, password);
}

/* ─── Data endpoints ─────────────────────────────────────────────────────── */
export async function getAccounts(session: string): Promise<MyfxAccount[]> {
  const data = await get<{ accounts: MyfxAccount[] }>('get-my-accounts.json', { session });
  return data.accounts;
}

/* ─── Formatters ─────────────────────────────────────────────────────────── */
function fmtGain(n: number, decimals = 2): string {
  const s = Math.abs(n).toFixed(decimals);
  return n >= 0 ? `+${s}%` : `-${s}%`;
}

function fmtDd(n: number): string {
  return `${Math.abs(n).toFixed(2)}%`;
}

/* ─── Map raw account → dashboard overlay ───────────────────────────────── */
export function mapAccount(acct: MyfxAccount): LiveStrategyData {
  const gainValue = ABS_GAIN_IDS.has(acct.id) ? acct.absGain : acct.gain;
  const isGrid = GRID_IDS.has(acct.id);

  const base: LiveStrategyData = {
    gain: fmtGain(gainValue),
    mo: fmtGain(acct.monthly),
    pf: acct.profitFactor.toFixed(2),
    lastUpd: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
  };

  if (isGrid) {
    base.ddEq = fmtDd(acct.drawdown); // grid: API drawdown = max equity DD
  } else {
    base.ddBal = fmtDd(acct.drawdown); // non-grid: API drawdown = max balance DD
  }

  return base;
}

/* ─── Account ID → strategy key ─────────────────────────────────────────── */
export const ACCOUNT_MAP: Record<number, string> = {
  8671765: 'v10',
  12042787: 'etfgold',
};
