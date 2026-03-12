import { NextRequest, NextResponse } from 'next/server';
import { myfxbookClient } from '@/lib/api-clients/myfxbook';

/**
 * GET /api/myfxbook/accounts
 * Fetch list of accounts for authenticated user
 * Requires sessionToken query parameter
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

    // Fetch accounts
    const accounts = await myfxbookClient.getAccounts();

    return NextResponse.json({
      success: true,
      accounts,
      count: accounts.length,
      fetchedAt: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch accounts',
      },
      { status: 500 }
    );
  }
}
