import { NextRequest, NextResponse } from 'next/server';
import { myfxbookClient, MyFXBookCredentials } from '@/lib/api-clients/myfxbook';

/**
 * POST /api/myfxbook/auth
 * Authenticate with MyFXBook using email and password
 * Returns session token on success
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body as MyFXBookCredentials;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password required' },
        { status: 400 }
      );
    }

    const sessionToken = await myfxbookClient.login({ email, password });

    // In production, this would be stored securely (encrypted in DB or secure session)
    return NextResponse.json({
      success: true,
      sessionToken,
      message: 'Successfully authenticated with MyFXBook',
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Authentication failed',
      },
      { status: 401 }
    );
  }
}
