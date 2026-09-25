import { NextRequest, NextResponse } from 'next/server';

const targetBackend = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

export async function GET(
  req: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const segments = params.path.join('/');
  const qs = req.nextUrl.search;
  const backendRes = await fetch(`${targetBackend.replace(/\/$/, '')}/api/admin/${segments}${qs}`, {
    headers: { 'Bypass-Tunnel-Remainder': 'true' },
  });
  const data = await backendRes.json().catch(() => null);
  return NextResponse.json(data, { status: backendRes.ok ? 200 : backendRes.status });
}

export async function POST(
  req: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const segments = params.path.join('/');
  const qs = req.nextUrl.search;
  const body = await req.json().catch(() => ({}));
  const backendRes = await fetch(`${targetBackend.replace(/\/$/, '')}/api/admin/${segments}${qs}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Bypass-Tunnel-Remainder': 'true' },
    body: JSON.stringify(body),
  });
  const data = await backendRes.json().catch(() => null);
  return NextResponse.json(data, { status: backendRes.ok ? 200 : backendRes.status });
}