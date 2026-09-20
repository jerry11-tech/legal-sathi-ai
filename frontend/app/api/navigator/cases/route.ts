import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const targetBackend = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
    const authHeader = req.headers.get('Authorization');

    try {
      const headers: HeadersInit = { 'Bypass-Tunnel-Remainder': 'true' };
      if (authHeader) headers['Authorization'] = authHeader;

      const backendRes = await fetch(`${targetBackend.replace(/\/$/, '')}/api/navigator/cases`, {
        headers,
      });

      if (backendRes.ok) {
        const data = await backendRes.json();
        return NextResponse.json(data);
      }
    } catch {}

    // Serverless fallback mock saved cases
    return NextResponse.json([
      {
        id: 1,
        case_code: 'CASE-2026-3794',
        title: 'Cyber Fraud & Phishing Recovery Inquiry',
        category: 'Cyber Crime',
        urgency: 'Critical',
        status: 'Active Investigation',
        progress: 45,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 2,
        case_code: 'CASE-2026-1042',
        title: 'Rental Deposit Withholding Legal Notice',
        category: 'Rental & Property',
        urgency: 'High',
        status: 'Pre-Litigation Notice',
        progress: 60,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ]);
  } catch (error) {
    return NextResponse.json([], { status: 200 });
  }
}
