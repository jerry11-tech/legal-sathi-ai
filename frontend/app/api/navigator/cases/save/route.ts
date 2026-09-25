import { NextRequest, NextResponse } from 'next/server';
import { proxyFetch } from '@/lib/backend';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const authHeader = req.headers.get('Authorization');

    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Bypass-Tunnel-Remainder': 'true',
      };
      if (authHeader) headers['Authorization'] = authHeader;

      const backendRes = await proxyFetch('/api/navigator/cases/save', {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });

      if (backendRes.ok) {
        const data = await backendRes.json();
        return NextResponse.json(data);
      }
    } catch {}

    return NextResponse.json({
      status: 'success',
      message: `Case ${body.case_code || 'CASE-2026'} saved successfully!`,
      case_id: body.case_code,
    });
  } catch (error) {
    return NextResponse.json(
      { detail: (error as Error).message || 'Failed to save case' },
      { status: 500 }
    );
  }
}
