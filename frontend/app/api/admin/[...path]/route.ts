import { NextRequest, NextResponse } from 'next/server';
import { proxyFetch } from '@/lib/backend';

export const dynamic = 'force-dynamic';

async function handle(
  method: 'GET' | 'POST',
  req: NextRequest,
  segments: string[]
) {
  const path = segments.join('/');
  const qs = req.nextUrl.search;

  const init: RequestInit = {
    method,
    headers: { 'Bypass-Tunnel-Remainder': 'true' },
  };

  if (method === 'POST') {
    init.headers = { 'Content-Type': 'application/json', 'Bypass-Tunnel-Remainder': 'true' };
    init.body = JSON.stringify(await req.json().catch(() => ({})));
  }

  try {
    const backendRes = await proxyFetch(`/api/admin/${path}${qs}`, init);
    const data = await backendRes.json().catch(() => null);
    return NextResponse.json(data, { status: backendRes.ok ? 200 : backendRes.status });
  } catch {
    return NextResponse.json(
      { detail: 'Admin service is temporarily unavailable. Please try again later.' },
      { status: 503 }
    );
  }
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path } = await context.params;
  return handle('GET', req, path);
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path } = await context.params;
  return handle('POST', req, path);
}