import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const targetBackend = process.env.NEXT_PUBLIC_API_URL || 'https://legalsathi-backend-owxr.onrender.com';
    
    // Attempt forward to FastAPI backend
    try {
      const backendRes = await fetch(`${targetBackend.replace(/\/$/, '')}/api/chat/`, {
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
    } catch {
      // Backend request failed, fallback below
    }

    // Backend unavailable: return an honest error instead of a fabricated
    // confident answer. Legal questions must never be answered from canned text.
    return NextResponse.json(
      {
        detail:
          'The LegalSathi legal engine is temporarily unavailable. Please try again in a moment. For urgent matters, consult a qualified advocate or visit https://www.india.gov.in.',
        backend_unavailable: true,
        summary:
          'The legal engine is temporarily unavailable, so no answer was generated for this query.',
        applicable_law: 'Not determined — backend unavailable.',
        explanation:
          'No legal information could be retrieved for your question. Please retry shortly or consult a qualified advocate for advice on your specific matter.',
        rights: 'Your legal rights are unaffected by this outage. General legal aid information: https://legalaffairs.gov.in / NALSA helpline 15100.',
        next_steps: '- Retry your question in a few minutes\n- For emergencies, dial 112\n- For free legal aid, contact your District Legal Services Authority (helpline 15100)',
        required_documents: 'Not applicable.',
        government_website: 'https://www.india.gov.in',
        disclaimer:
          'This platform provides general legal information for education only, not legal advice. Please consult a qualified lawyer for advice on your specific case.',
        confidence_score: 0.0,
      },
      { status: 503 }
    );
  } catch (error) {
    return NextResponse.json(
      { detail: (error as Error).message || 'Failed to process request' },
      { status: 500 }
    );
  }
}
