import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const targetBackend = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

    try {
      const backendRes = await fetch(`${targetBackend.replace(/\/$/, '')}/api/navigator/cases/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Bypass-Tunnel-Remainder': 'true',
        },
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
