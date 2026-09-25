import { NextRequest, NextResponse } from 'next/server';
import { proxyFetch } from '@/lib/backend';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Forward to FastAPI backend (OTP-verified accounts only — no client-side fabrication)
    const backendRes = await proxyFetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Bypass-Tunnel-Remainder': 'true',
      },
      body: JSON.stringify(body),
    });

    const backendData = await backendRes.json().catch(() => ({}));

    if (backendRes.ok) {
      return NextResponse.json(
        { status: backendData.status || 'success', ...backendData },
        { status: backendRes.status }
      );
    }

    return NextResponse.json(
      { detail: backendData.detail || 'Registration failed' },
      { status: backendRes.status }
    );
  } catch (error) {
    return NextResponse.json(
      { detail: (error as Error).message || 'Failed to complete registration' },
      { status: 503 }
    );
  }
}
