import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const targetBackend = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
  const body = await req.json().catch(() => ({}));
  const auth = req.headers.get('authorization');

  const backendRes = await fetch(`${targetBackend.replace(/\/$/, '')}/api/documents/generate`, {
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
}