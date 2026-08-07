import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const targetBackend = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

    try {
      const backendRes = await fetch(`${targetBackend.replace(/\/$/, '')}/api/navigator/draft`, {
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

    const draftType = body.draft_type || 'Police Complaint';
    const summary = body.case_summary || 'Legal grievance requiring immediate formal notice.';
    const todayStr = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

    let content = ``;

    if (draftType.toLowerCase().includes('notice') || draftType.toLowerCase().includes('rent')) {
      content = `LEGAL NOTICE

Date: ${todayStr}

TO:
The Opposite Party / Landlord / Respondent
Address: [Opposite Party Address]

FROM:
[Your Name / Complainant]
Address: [Your Address]

SUBJECT: LEGAL NOTICE FOR RESOLUTION OF DISPUTE REGARDING: ${summary.slice(0, 100)}

Sir / Madam,

Under instructions from and on behalf of my client / self, I hereby serve upon you this Legal Notice:

1. That you entered into a legal transaction / agreement with the undersigned regarding the matter summarized as: "${summary}".
2. That despite multiple oral and written requests, you have failed and neglected to fulfill your statutory obligations.
3. That your deliberate inaction constitutes a breach of statutory provisions under Indian Law.

THEREFORE, TAKE NOTICE that you are hereby called upon to comply with the demands within 15 DAYS from the receipt of this notice, failing which appropriate legal proceedings (civil & criminal) will be initiated before the competent Court of Law at your sole risk, cost, and consequences.

Sincerely,

_________________________
[Complainant Signature / Legal Counsel]`;
    } else {
      content = `FORMAL COMPLAINT / POLICE FIR APPLICATION

Date: ${todayStr}

TO:
The Station House Officer (S.H.O.) / Competent Statutory Authority
[Police Station / Authority Name]

SUBJECT: COMPLAINT REGARDING: ${summary.slice(0, 100)}

Respected Sir / Madam,

I, [Your Full Name], residing at [Your Complete Address], wish to submit the following formal complaint for investigation:

1. STATEMENT OF FACTS:
   On or around recent dates, the following incident occurred: "${summary}".

2. EVIDENCE SUBMITTED:
   - Identity Proof (Aadhaar / Voter ID)
   - Transaction logs, bank receipts, screenshots, or written communications exchanged.

3. PRAYER / RELIEF SOUGHT:
   It is humbly requested that an official FIR / Complaint be registered under applicable sections of Bharatiya Nyaya Sanhita (BNS) / IT Act 2000 and necessary legal action be taken against the accused.

Thanking You.

Yours Faithfully,

_________________________
[Complainant Signature]
Contact Number: [Your Mobile Number]`;
    }

    return NextResponse.json({
      title: `${draftType} - Draft Copy`,
      content: content,
    });
  } catch (error) {
    return NextResponse.json(
      { detail: (error as Error).message || 'Failed to generate legal draft' },
      { status: 500 }
    );
  }
}
