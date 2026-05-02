export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import {
  getSession,
  getAccounts,
  mapAccount,
  ACCOUNT_MAP,
} from '@/lib/api-clients/myfxbook-live';

export async function GET() {
  const email    = process.env.MYFXBOOK_EMAIL;
  const password = process.env.MYFXBOOK_PASSWORD;

  if (!email || !password) {
    return NextResponse.json({ error: 'MyFXBook credentials not configured' }, { status: 503 });
  }

  try {
    const session  = await getSession(email, password);
    const accounts = await getAccounts(session);

    const strategies: Record<string, ReturnType<typeof mapAccount>> = {};

    for (const acct of accounts) {
      const key = ACCOUNT_MAP[acct.id];
      if (!key) continue;
      strategies[key] = mapAccount(acct);
    }

    return NextResponse.json({
      strategies,
      updatedAt: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error('[myfxbook/sync]', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
