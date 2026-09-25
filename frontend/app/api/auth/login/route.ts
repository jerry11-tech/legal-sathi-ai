import { NextRequest, NextResponse } from 'next/server';
import { proxyFetch } from '@/lib/backend';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    try {
      const backendRes = await proxyFetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Bypass-Tunnel-Remainder': 'true',
        },
        body: JSON.stringify(body),
      });

      const backendData = await backendRes.json();

      if (backendRes.ok) {
        return NextResponse.json(backendData);
      } else {
        return NextResponse.json(
          { detail: backendData.detail || 'Login authentication failed' },
          { status: backendRes.status }
        );
      }
    } catch {
      // Backend unreachable - fail closed instead of fabricating auth
      return NextResponse.json(
        { detail: 'Authentication service is temporarily unavailable. Please try again later.' },
        { status: 503 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { detail: (error as Error).message || 'Failed to authenticate login' },
      { status: 500 }
    );
  }
}
