import { NextRequest, NextResponse } from 'next/server';
import { proxyFetch } from '@/lib/backend';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const backendRes = await proxyFetch('/api/auth/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const backendData = await backendRes.json().catch(() => ({}));
    return NextResponse.json(backendData, { status: backendRes.status });
  } catch (error) {
    return NextResponse.json(
      { detail: (error as Error).message || 'Failed to send OTP' },
      { status: 503 }
    );
  }
}