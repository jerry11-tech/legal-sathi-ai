import re
import json
import requests
from datetime import datetime
from config.settings import settings

SUPPORTED_DOC_TYPES = {
    "police": {
        "aliases": ["police complaint", "fir", "police fir", "complaint"],
        "category": "Police & Criminal",
        "title": "First Information Report (FIR) / Police Complaint",
    },
    "cyber": {
        "aliases": ["cyber", "cyber crime", "online fraud", "phishing", "cyber complaint"],
        "category": "Cyber Crime",
        "title": "Cyber Crime Complaint",
    },
    "rent": {
        "aliases": ["rent", "rental", "landlord", "tenant", "eviction", "deposit", "lease"],
        "category": "Rental & Property",
        "title": "Legal Notice to Landlord",
    },
    "consumer": {
        "aliases": ["consumer", "refund", "defective", "warranty", "product", "seller"],
        "category": "Consumer Rights",
        "title": "Consumer Complaint Notice",
    },
    "copyright": {
        "aliases": ["copyright", "takedown", "piracy", "infringement", "plagiarism"],
        "category": "Cyber Crime",
        "title": "Copyright Takedown Notice",
    },
    "rti": {
        "aliases": ["rti", "right to information", "information act"],
        "category": "RTI & Public",
        "title": "RTI Application Form",
    },
}

DEFAULT_TYPE = "police"

DISCLAIMER = "This document is a draft placeholder for general guidance and is not a substitute for legal advice or an officially filed document. Please verify with a licensed advocate before submission."


def resolve_doc_type(doc_type: str) -> str:
    key = (doc_type or "").lower().strip()
    if not key:
        return DEFAULT_TYPE
    if key in SUPPORTED_DOC_TYPES:
        return key
    for doc_key, cfg in SUPPORTED_DOC_TYPES.items():
        for alias in cfg["aliases"]:
            if alias in key:
                return doc_key
    return DEFAULT_TYPE


def _dup(details, *keys, default=""):
    for k in keys:
        val = details.get(k)
        if val is not None and str(val).strip():
            return str(val).strip()
    return default


def _today() -> str:
    return datetime.utcnow().strftime("%d %B %Y")


def _bullet_section(title, items) -> str:
    lines = [f"{title}:"]
    for item in items:
        lines.append(f"- {item}")
    return "\n".join(lines)


def build_fir(details: dict) -> dict:
    complainant = _dup(details, "complainant_name", "name", "full_name", default="[Your Full Name]")
    address = _dup(details, "address", "residence", default="[Your Complete Address]")
    phone = _dup(details, "phone", "mobile", default="[Your Mobile Number]")
    accused = _dup(details, "accused_name", "opposite_party", default="[Accused Person / Party Name]")
    incident = _dup(
        details, "incident_details", "facts", "case_summary", "description",
        default="[Describe the incident in detail: date, time, place, and what happened]",
    )
    evidence = [str(e).strip() for e in (details.get("evidence") or []) if str(e).strip()]
    if not evidence:
        evidence = [
            "Identity Proof (Aadhaar / Voter ID)",
            "Photos, videos or documents supporting the incident",
            "Witness details and contact information",
        ]

    content = f"""FORMAL COMPLAINT / FIRST INFORMATION REPORT (FIR) APPLICATION

Date: {_today()}

TO:
The Station House Officer (S.H.O.)
[Police Station Name]
District: [District, State]

SUBJECT: COMPLAINT REGARDING {incident[:80].upper()}

Respected Sir / Madam,

I, {complainant}, residing at {address}, contact number {phone}, wish to lodge a formal complaint for investigation and legal action:

1. STATEMENT OF FACTS:
   {incident}

2. ACCUSED / OPPOSING PARTY:
   {accused}

3. EVIDENCE AVAILABLE:
{_bullet_section("   EVIDENCE", evidence)}

4. PRAYER / RELIEF SOUGHT:
   It is humbly requested that an official FIR be registered and necessary investigation be conducted under the applicable provisions of the Bharatiya Nyaya Sanhita (BNS), 2023 and any other applicable law, and appropriate action be taken against the accused.

Thanking You.

Yours Faithfully,

_________________________
{complainant}
Contact: {phone}

{DISCLAIMER}
"""
    return {
        "doc_type": "Police Complaint (FIR)",
        "category": SUPPORTED_DOC_TYPES["police"]["category"],
        "content": content.strip(),
    }


def build_cyber_complaint(details: dict) -> dict:
    complainant = _dup(details, "complainant_name", "name", "full_name", default="[Your Full Name]")
    address = _dup(details, "address", "residence", default="[Your Complete Address]")
    phone = _dup(details, "phone", "mobile", default="[Your Mobile Number]")
    amount = _dup(details, "amount", "loss_amount", default="[Approximate Amount Lost (INR)]")
    transaction = _dup(details, "transaction_id", "ref_id", default="[Transaction Reference / UTR No.]")
    incident = _dup(
        details, "incident_details", "facts", "case_summary", "description",
        default="[Describe the online fraud/incident: platform, OTP sharing, scam link, etc.]",
    )
    evidence = [str(e).strip() for e in (details.get("evidence") or []) if str(e).strip()]
    if not evidence:
        evidence = [
            "Bank statement showing the unauthorized debit",
            "SMS / OTP alerts received",
            "Screenshots of chat, scam URL or fraudster profile",
            "Transaction reference IDs",
        ]

    content = f"""CYBER CRIME COMPLAINT & FINANCIAL FRAUD REPORT

Date: {_today()}

TO:
The Officer-in-Charge
Cyber Crime Police Station / National Cyber Crime Reporting Portal (cybercrime.gov.in)

SUBJECT: COMPLAINT REGARDING ONLINE FINANCIAL FRAUD / CYBER CRIME

Respected Sir / Madam,

I, {complainant}, residing at {address}, contact number {phone}, wish to report the following cyber crime incident:

1. DETAILS OF INCIDENT:
   {incident}

2. FINANCIAL DETAILS:
   Approximate Amount Involved: Rs. {amount}
   Transaction Reference / UTR Number: {transaction}

3. EVIDENCE AVAILABLE:
{_bullet_section("   EVIDENCE", evidence)}

4. PRAYER / RELIEF SOUGHT:
   It is requested that:
   a) An FIR / complaint be registered under the Information Technology Act, 2000 and applicable BNS provisions.
   b) Immediate directions be issued to the concerned bank to block/freeze the fraudster's account and the stolen funds.
   c) A proper investigation be conducted to trace the accused.

Yours Faithfully,

_________________________
{complainant}
Contact: {phone}

Note: Please also call National Cyber Fraud Helpline 1930 as early as possible to maximise fund recovery chances.

{DISCLAIMER}
"""
    return {
        "doc_type": "Cyber Crime Complaint",
        "category": SUPPORTED_DOC_TYPES["cyber"]["category"],
        "content": content.strip(),
    }


def build_rental_notice(details: dict) -> dict:
    from_name = _dup(details, "complainant_name", "tenant_name", "name", default="[Tenant / Complainant Name]")
    landlord = _dup(details, "landlord_name", "opposite_party", default="[Landlord / Opposing Party Name]")
    property_ = _dup(details, "property_address", "address", default="[Rental Property Address]")
    deposit = _dup(details, "deposit_amount", "amount", default="[Security Deposit Amount]")
    phone = _dup(details, "phone", "mobile", default="[Contact Number]")
    issue = _dup(
        details, "facts", "case_summary", "incident_details", "description",
        default="[Describe the specific grievance: deposit refund demand, notice to vacate, illegal eviction, etc.]",
    )

    content = f"""WITHOUT PREJUDICE / LEGAL NOTICE

Date: {_today()}

TO:
{landlord}
[Address of the Opposite Party]

FROM:
{from_name}
{property_}
Contact: {phone}

SUBJECT: LEGAL NOTICE REGARDING: {issue[:80].upper()}

Sir / Madam,

Under instructions from and on behalf of the undersigned, I hereby serve upon you this Legal Notice:

1. That the undersigned is the {from_name}, currently residing / having tenancy in the premises situated at {property_}.

2. FACTUAL MATRIX:
   {issue}

3. STATUTORY DEMAND:
   You are hereby called upon to:
   a) Fulfil the demands mentioned above within 15 (Fifteen) days from the receipt of this notice; and
   b) In particular, refund the security deposit of Rs. {deposit} and settle the claims arising out of the tenancy.

4. CONSEQUENCES OF NON-COMPLIANCE:
   Please take note that in case you fail to comply with the above demands within the stipulated period, the undersigned shall be constrained to initiate appropriate legal proceedings (civil and/or criminal) before the competent Court / Rent Authority / Tribunal at your sole risk as to costs and consequences.

Sincerely,

_________________________
{from_name}
(Complainant / Legal Counsel)

{DISCLAIMER}
"""
    return {
        "doc_type": "Rental Legal Notice",
        "category": SUPPORTED_DOC_TYPES["rent"]["category"],
        "content": content.strip(),
    }


def build_consumer_notice(details: dict) -> dict:
    complainant = _dup(details, "complainant_name", "name", "full_name", default="[Consumer Name]")
    seller = _dup(details, "seller_name", "company", "opposite_party", default="[Seller / Company Name]")
    address = _dup(details, "address", "residence", default="[Complainant Address]")
    product = _dup(details, "product", "service", "item", default="[Product / Service Description]")
    invoice = _dup(details, "invoice", "order_id", "bill_number", default="[Invoice / Order No.]")
    issue = _dup(
        details, "facts", "defect", "case_summary", "description",
        default="[Describe the defect or service deficiency]",
    )

    content = f"""WITHOUT PREJUDICE / LEGAL NOTICE (CONSUMER COMPLAINT)

Date: {_today()}

TO:
{seller}
[Registered Address / Customer Care]

FROM:
{complainant}
{address}

SUBJECT: LEGAL NOTICE FOR DEFECTIVE GOODS / DEFICIENT SERVICES UNDER THE CONSUMER PROTECTION ACT, 2019

Sir / Madam,

Under instructions from and on behalf of my client / self, I hereby serve this legal notice:

1. That on [Date of Purchase], my client purchased {product} (Invoice / Order No: {invoice}) from you.

2. DEFECT / SERVICE DEFICIENCY:
   {issue}

3. DEMAND:
   You are hereby called upon to provide a replacement, repair, or full refund as per the Consumer Protection Act, 2019 along with compensation for the mental harassment caused, within 15 (Fifteen) days from receipt of this notice.

4. CONSEQUENCES OF NON-COMPLIANCE:
   Failing compliance, the undersigned shall file a formal complaint before the District Consumer Disputes Redressal Commission / E-Daakhil portal and also approach the National Consumer Helpline (1915), entirely at your risk as to costs and consequences.

Sincerely,

_________________________
{complainant}

{DISCLAIMER}
"""
    return {
        "doc_type": "Consumer Complaint Notice",
        "category": SUPPORTED_DOC_TYPES["consumer"]["category"],
        "content": content.strip(),
    }


def build_copyright_notice(details: dict) -> dict:
    owner = _dup(details, "complainant_name", "owner_name", "name", default="[Copyright Owner Name]")
    infringer = _dup(details, "infringer_name", "opposite_party", default="[Infringer / Website / Platform Name]")
    work = _dup(details, "work_title", "work", "product", default="[Description of the Copyrighted Work]")
    url = _dup(details, "infringing_url", "url", "link", default="[URL where the infringing copy appears]")
    issue = _dup(
        details, "facts", "case_summary", "description",
        default="[Explain how the work has been reproduced/distributed without authorisation]",
    )

    content = f"""NOTICE OF COPYRIGHT INFRINGEMENT / TAKEDOWN DEMAND

Date: {_today()}

TO:
{infringer}
[Contact Email / Legal Department]

FROM:
{owner}

SUBJECT: INTIMATION OF COPYRIGHT INFRINGEMENT AND DEMAND FOR IMMEDIATE TAKEDOWN

Dear Sir / Madam,

I, {owner}, am the lawful owner / authorised representative of the copyrighted work described below:

1. COPYRIGHTED WORK:
   {work}

2. INFRINGEMENT DETAILS:
   The said work has been copied, reproduced or distributed without my authorisation at: {url}
   Details: {issue}

3. DEMAND:
   You are hereby directed to:
   a) Immediately remove / disable access to the infringing content within 72 (Seventy Two) hours; and
   b) Provide written confirmation of takedown and not re-upload the content.

4. CONSEQUENCES OF NON-COMPLIANCE:
   Please note that continued infringement may expose you to civil remedies (injunction and damages) and criminal liability under the Copyright Act, 1957 and the Information Technology Act, 2000.

Yours sincerely,

_________________________
{owner}

{DISCLAIMER}
"""
    return {
        "doc_type": "Copyright Takedown Notice",
        "category": SUPPORTED_DOC_TYPES["copyright"]["category"],
        "content": content.strip(),
    }


def build_rti(details: dict) -> dict:
    applicant = _dup(details, "complainant_name", "applicant_name", "name", default="[Applicant Full Name]")
    address = _dup(details, "address", "residence", default="[Applicant Complete Address]")
    authority = _dup(
        details, "public_authority", "authority", "department",
        default="[Name of the Public Authority / Department]",
    )
    info = _dup(
        details, "information_requested", "facts", "case_summary", "description",
        default="[Describe the specific information you are seeking]",
    )

    content = f"""APPLICATION UNDER THE RIGHT TO INFORMATION ACT, 2005

Date: {_today()}

TO:
The Central Public Information Officer (CPIO) / State Public Information Officer
{authority}
[Office Address]

SUBJECT: REQUEST FOR INFORMATION UNDER SECTION 6(1) OF THE RTI ACT, 2005

Respected Sir / Madam,

I, {applicant}, a citizen of India, residing at {address}, hereby request the following information under the Right to Information Act, 2005:

INFORMATION REQUESTED:
{info}

DETAILS OF APPLICANT:
Name: {applicant}
Address: {address}
Contact Number: [Optional Contact]

DECLARATION:
I hereby declare that the information requested is not covered by any of the exemptions contained in Section 8 of the RTI Act, 2005.

PRAYER:
Kindly provide the above information within 30 days as prescribed under Section 7 of the RTI Act, 2005. Enclosed herein is the prescribed application fee as applicable.

Thanking You.

Yours sincerely,

_________________________
{applicant}

{DISCLAIMER}
"""
    return {
        "doc_type": "RTI Application Form",
        "category": SUPPORTED_DOC_TYPES["rti"]["category"],
        "content": content.strip(),
    }


GENERATORS = {
    "police": build_fir,
    "cyber": build_cyber_complaint,
    "rent": build_rental_notice,
    "consumer": build_consumer_notice,
    "copyright": build_copyright_notice,
    "rti": build_rti,
}


def _gemini_available() -> bool:
    key = (settings.GEMINI_API_KEY or "").strip()
    return key.startswith("AIza") and "your_" not in key and "mock" not in key


def _gemini_fill(doc_type: str, doc_key: str, details: dict, content: str) -> str:
    if not _gemini_available():
        return content
    key = settings.GEMINI_API_KEY.strip()
    prompt = (
        "You are LegalSathi, an Indian legal document assistant. Improve and complete the "
        "following draft legal document, filling placeholders using the user details where "
        "possible and keeping the original structure and Indian legal citations. "
        f"Document type: {doc_type}. User details: {json.dumps(details)}.\n\n"
        "Ensure placeholders you cannot fill are kept as [SQUARE BRACKETS]. "
        "Return ONLY the improved document text.\n\n---\n" + content
    )
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"temperature": 0.2, "maxOutputTokens": 2048},
    }
    url = (
        "https://generativelanguage.googleapis.com/v1beta/models/"
        "gemini-1.5-flash:generateContent?key=" + key
    )
    try:
        response = requests.post(url, json=payload, timeout=30)
        response.raise_for_status()
        data = response.json()
        text = data["candidates"][0]["content"]["parts"][0]["text"].strip()
        if text.startswith("```"):
            text = re.sub(r"^```[a-zA-Z]*\n?", "", text)
            text = re.sub(r"\n?```$", "", text)
        if len(text) >= 200:
            return text
    except Exception as e:
        print(f"[document_generator] Gemini error: {e}")
    return content


def generate_document(doc_type: str, details: dict) -> dict:
    details = details or {}
    doc_key = resolve_doc_type(doc_type)
    builder = GENERATORS[doc_key]
    result = builder(details)
    content = _gemini_fill(result["doc_type"], doc_key, details, result["content"])
    title = SUPPORTED_DOC_TYPES[doc_key]["title"]
    return {
        "doc_type": result["doc_type"],
        "category": result["category"],
        "title": title,
        "content": content,
    }