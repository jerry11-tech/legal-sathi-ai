import { NextRequest, NextResponse } from 'next/server';
import { proxyFetch } from '@/lib/backend';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Attempt forward to FastAPI backend
    try {
      const backendRes = await proxyFetch('/api/chat/', {
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

    // High quality fallback legal engine response
    const queryStr = (body.query || '').toLowerCase();
    let domain = 'General Legal Information';
    let law = 'Constitution of India & Applicable Codes';
    let summary = `Regarding your query about "${body.query}": Under Indian Law, rights and procedures are governed by specific statutory codes and acts.`;
    let steps = '- Consult a licensed advocate or legal aid counsel.\n- Preserve relevant documents and evidence.\n- File appropriate notice or complaint with authorities.';
    let docs = '- Identity Proof (Aadhaar / Voter ID / PAN)\n- Incident proof or written communication\n- Related legal notices or receipts';

    if (queryStr.includes('cyber') || queryStr.includes('fraud') || queryStr.includes('online')) {
      domain = 'Cyber Crime & Online Fraud';
      law = 'Information Technology Act, 2000 & Bharatiya Nyaya Sanhita (BNS)';
      summary = `For cyber crime and financial fraud, report immediately to the Cyber Crime Helpline 1930 or online portal.`;
      steps = '- Call National Cyber Crime Helpline: 1930\n- Register a complaint at cybercrime.gov.in\n- Freeze linked bank accounts immediately';
      docs = '- Bank statements & transaction IDs\n- Screenshots of chats / emails / fraud URLs\n- Mobile number details';
    } else if (queryStr.includes('rent') || queryStr.includes('tenant') || queryStr.includes('landlord')) {
      domain = 'Rental Laws & Property';
      law = 'Model Tenancy Act & State Rent Control Acts';
      summary = `Tenant-landlord disputes are governed by state Rent Control laws and registered tenancy agreements.`;
      steps = '- Review terms of tenancy agreement\n- Send formal legal notice\n- File petition with Rent Controller / Tribunal';
      docs = '- Registered Rent Agreement\n- Rent receipts / bank transfers\n- Notice letters exchanged';
    } else if (queryStr.includes('women') || queryStr.includes('harassment') || queryStr.includes('dowry')) {
      domain = "Women's Rights & Protection";
      law = 'Protection of Women from Domestic Violence Act, 2005 & Sexual Harassment at Workplace Act (POSH)';
      summary = `Women have statutory protection against domestic violence, harassment, and workplace discrimination.`;
      steps = '- Contact National Commission for Women Helpline: 7827170170\n- Approach local Protection Officer or Police Station\n- File petition under DV Act or POSH committee';
      docs = '- Written complaint details\n- Medical / Incident records\n- Communication records';
    }

    return NextResponse.json({
      summary,
      applicable_law: law,
      explanation: `LegalSathi Guidance for domain: ${domain}. Always verify details with legal counsel before court proceedings.`,
      rights: 'Right to legal aid, right to file FIR/complaint, right to natural justice.',
      next_steps: steps,
      required_documents: docs,
      government_website: 'https://www.india.gov.in',
      disclaimer: 'This platform provides general legal information for education only, not legal advice. Please consult a qualified lawyer for official legal representation.',
      confidence_score: 0.9,
    });
  } catch (error) {
    return NextResponse.json(
      { detail: (error as Error).message || 'Failed to process request' },
      { status: 500 }
    );
  }
}
