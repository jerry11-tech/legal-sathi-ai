import { NextRequest, NextResponse } from 'next/server';
import { proxyFetch } from '@/lib/backend';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const auth = req.headers.get('authorization');

  try {
    const backendRes = await proxyFetch('/api/documents/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Bypass-Tunnel-Remainder': 'true',
        ...(auth ? { Authorization: auth } : {}),
      },
      body: JSON.stringify(body),
    });

    const data = await backendRes.json().catch(() => null);
    return NextResponse.json(data, { status: backendRes.ok ? 200 : backendRes.status });
  } catch {
    return NextResponse.json(
      { detail: 'Document generation service is temporarily unavailable. Please try again later.' },
      { status: 503 }
    );
  }
}