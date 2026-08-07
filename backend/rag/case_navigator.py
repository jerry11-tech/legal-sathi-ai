import json
import random
import re
import string
from typing import Dict, List, Optional
from rag.legal_engine import validate_url

DISCLAIMER = (
    "This AI Legal Case Navigator provides general legal information, structured planning, "
    "and document guidance for educational purposes under Indian law. It is NOT legal advice. "
    "Please consult a qualified advocate for official representation in court or before legal authorities."
)

DOMAINS_CONFIG = [
    {
        "domain": "Rental Disputes",
        "keywords": ["rent", "tenant", "landlord", "deposit", "eviction", "lease", "rented"],
        "authority": "Rent Control Authority / Civil Court",
        "website": "https://mohua.gov.in",
        "draft_type": "Legal Notice to Landlord",
        "questions": [
            "Which state/city is the rental property located in?",
            "Do you have a signed written Rent Agreement / Lease Deed?",
            "What is the total security deposit amount held by the landlord?",
            "Has the landlord issued any formal written eviction notice?",
        ],
        "evidence": [
            "Signed Rent Agreement / Lease Deed",
            "Security Deposit Bank Receipt / UPI Transfer Proof",
            "Rent Payment Receipts or Bank Statements",
            "WhatsApp/SMS/Email Chat Records with Landlord",
            "Photographs or Video of Property Condition",
        ],
        "documents": [
            {"doc_name": "Rent Agreement", "why_needed": "Establishes tenancy terms and deposit terms", "where_to_obtain": "Signed copy from lease execution", "accepted_formats": "PDF, JPEG, Scan"},
            {"doc_name": "Bank Statements", "why_needed": "Proves deposit paid and monthly rent transfers", "where_to_obtain": "Net banking / Bank branch statement", "accepted_formats": "PDF"},
            {"doc_name": "Identity Proof (Aadhaar/PAN)", "why_needed": "Verifies tenant identity", "where_to_obtain": "UIDAI / IT Dept", "accepted_formats": "PDF, JPEG"},
        ],
        "authorities": [
            {"name": "Rent Authority / Rent Tribunal", "role": "Resolves landlord-tenant disputes & deposit recovery", "when_to_contact": "If landlord refuses deposit refund within 30 days of vacating", "contact_guide": "Approach District Rent Collector office", "official_website": "https://mohua.gov.in"},
            {"name": "Local Police Station", "role": "Intervenes in illegal forcible lockouts or harassment", "when_to_contact": "If landlord illegally cuts electricity/water or threatens physical entry", "contact_guide": "File written complaint for illegal trespass/harassment", "official_website": "https://www.mha.gov.in"},
        ],
    },
    {
        "domain": "Women's Rights & Domestic Violence",
        "keywords": ["husband", "dowry", "wife", "domestic violence", "posh", "beaten", "harassment", "marital"],
        "authority": "Protection Officer / District Magistrate / Mahila Thana",
        "website": "https://wcd.gov.in",
        "draft_type": "Domestic Violence Application / Police Complaint",
        "questions": [
            "Are you currently residing in the shared marital household?",
            "Have you sustained any physical injuries or experienced emotional/economic abuse?",
            "Is there any active demand for dowry or property?",
            "Have you previously reported this to any helpline or police station?",
        ],
        "evidence": [
            "Medical Reports / Injury Certificates (MLC)",
            "Photographs of physical injuries or damaged property",
            "Audio/Video recordings of threats or abuse",
            "Chat logs, text messages, or call history",
            "Dowry demand list or financial transaction records",
        ],
        "documents": [
            {"doc_name": "Marriage Certificate / Marriage Photographs", "why_needed": "Establishes legal marital relationship", "where_to_obtain": "Registrar of Marriages / Personal records", "accepted_formats": "PDF, JPEG"},
            {"doc_name": "Medical Legal Certificate (MLC)", "why_needed": "Crucial evidence of physical assault", "where_to_obtain": "Government / Private Hospital Casualty", "accepted_formats": "PDF, Scan"},
            {"doc_name": "Proof of Residence", "why_needed": "Required for residence order under DV Act Sec 19", "where_to_obtain": "Electricity Bill / Aadhaar / Passport", "accepted_formats": "PDF, JPEG"},
        ],
        "authorities": [
            {"name": "District Protection Officer (DV Act)", "role": "Assists in filing DIR, obtaining protection & residence orders", "when_to_contact": "Immediately upon facing domestic violence or threat", "contact_guide": "Contact Social Welfare Dept or call Women Helpline 181/1091", "official_website": "https://wcd.gov.in"},
            {"name": "Women Police Station (Mahila Thana)", "role": "Registers FIR under Sec 498A IPC / BNS Sec 85", "when_to_contact": "For physical assault, dowry harassment, or severe cruelty", "contact_guide": "Visit local Mahila Thana or Police Station", "official_website": "https://ncw.gov.in"},
        ],
    },
    {
        "domain": "Cyber Crime & Financial Fraud",
        "keywords": ["otp", "cyber", "phishing", "scam", "bank fraud", "hacked", "stolen money", "fake call"],
        "authority": "National Cyber Crime Reporting Portal / Bank Cyber Cell",
        "website": "https://cybercrime.gov.in",
        "draft_type": "Cyber Crime Complaint & Bank Grievance Letter",
        "questions": [
            "When did the fraudulent transaction occur (date & exact time)?",
            "Did you share any OTP, UPI PIN, or password with anyone?",
            "Have you called your bank to block the account/card?",
            "What is the total financial loss amount involved?",
        ],
        "evidence": [
            "Bank Account Statement showing unauthorized debit",
            "SMS alerts and OTP messages received on phone",
            "Fraudster phone number, WhatsApp chat, or phishing link URL",
            "Transaction reference IDs / UTR numbers",
            "Screenshots of fake website / payment screen",
        ],
        "documents": [
            {"doc_name": "Bank Passbook / E-Statement", "why_needed": "Proves unauthorized money deduction", "where_to_obtain": "Net banking download / Bank passbook print", "accepted_formats": "PDF"},
            {"doc_name": "Complaint Acknowledgment Copy", "why_needed": "Required by bank for zero-liability claim", "where_to_obtain": "National Cyber Crime Portal (1930) reference", "accepted_formats": "PDF"},
            {"doc_name": "Aadhaar Card & Bank Debit Card Copy", "why_needed": "Identification for bank cyber cell report", "where_to_obtain": "Personal documents", "accepted_formats": "PDF, JPEG"},
        ],
        "authorities": [
            {"name": "National Cyber Fraud Helpline (1930)", "role": "Freezes stolen funds in victim & fraudster bank accounts", "when_to_contact": "Immediately within the Golden Hour (first 1–2 hours)", "contact_guide": "Call 1930 or register at cybercrime.gov.in", "official_website": "https://cybercrime.gov.in"},
            {"name": "Bank Nodal Officer / Cyber Cell", "role": "Investigates zero-liability claim & processes reimbursement", "when_to_contact": "Within 3 days of unauthorized debit", "contact_guide": "Submit written notice to Home Branch Manager", "official_website": "https://www.india.gov.in"},
        ],
    },
    {
        "domain": "Consumer Rights & Product Refunds",
        "keywords": ["consumer", "defective", "refund", "warranty", "seller", "online order", "repair"],
        "authority": "District Consumer Disputes Redressal Commission / E-Daakhil",
        "website": "https://consumerhelpline.gov.in",
        "draft_type": "Consumer Complaint Notice",
        "questions": [
            "What product or service did you purchase, and from which company/seller?",
            "Do you have the tax invoice / cash memo / order confirmation?",
            "What is the defect or service deficiency experienced?",
            "Did you send a formal complaint to the customer service or seller?",
        ],
        "evidence": [
            "Tax Invoice / Order Bill / Receipt",
            "Warranty Card / Service Agreement Copy",
            "Photographs / Unboxing Video showing defect",
            "Customer Support Email Thread / Chat Transcripts",
            "Job Sheet / Technician Inspection Report",
        ],
        "documents": [
            {"doc_name": "Purchase Invoice / Bill", "why_needed": "Establishes consumer status & price paid", "where_to_obtain": "Seller / E-commerce portal account", "accepted_formats": "PDF, JPEG"},
            {"doc_name": "Written Legal Notice Copy", "why_needed": "Mandatory prior notice before Consumer Court filing", "where_to_obtain": "Drafted legal notice copy sent to seller", "accepted_formats": "PDF"},
        ],
        "authorities": [
            {"name": "National Consumer Helpline (NCH - 1915)", "role": "Pre-litigation mediation & merchant dispute resolution", "when_to_contact": "When merchant rejects replacement/refund request", "contact_guide": "Call 1915 or file on consumerhelpline.gov.in", "official_website": "https://consumerhelpline.gov.in"},
            {"name": "District Consumer Commission (E-Daakhil)", "role": "Adjudicates formal consumer claims up to Rs 1 Crore", "when_to_contact": "If mediation fails or notice remains unanswered for 15 days", "contact_guide": "File petition online via edaakhil.nic.in", "official_website": "https://consumerhelpline.gov.in"},
        ],
    },
]

DEFAULT_CONFIG = {
    "domain": "General Legal Guidance",
    "authority": "District Legal Services Authority (DLSA) / Local Civil Court",
    "website": "https://www.indiacode.nic.in",
    "draft_type": "Representation Letter / Legal Notice Template",
    "questions": [
        "What specific legal category best describes your situation?",
        "When did the dispute or incident first take place?",
        "Which state or city in India does this involve?",
        "What key resolution or outcome are you seeking?",
    ],
    "evidence": [
        "Written agreements, contracts, or notices",
        "Bank statements or financial receipts",
        "Email, SMS, or WhatsApp correspondence",
        "Government IDs and address proof",
    ],
    "documents": [
        {"doc_name": "Government Identity Proof", "why_needed": "Identification for legal filings", "where_to_obtain": "Aadhaar / Voter ID / Passport", "accepted_formats": "PDF, JPEG"},
        {"doc_name": "Relevant Agreement / Incident Proof", "why_needed": "Establishes facts of the case", "where_to_obtain": "Personal files / Party correspondence", "accepted_formats": "PDF, JPEG"},
    ],
    "authorities": [
        {"name": "District Legal Services Authority (DLSA)", "role": "Provides free legal aid, advice, and mediation", "when_to_contact": "For guidance or free lawyer assistance", "contact_guide": "Visit District Court premises or call NALSA 15100", "official_website": "https://nalsa.gov.in"},
        {"name": "Local Police Station / Civil Court", "role": "Registers formal complaints and civil petitions", "when_to_contact": "When formal legal action is required", "contact_guide": "Approach local jurisdiction police station or advocate", "official_website": "https://www.indiacode.nic.in"},
    ],
}


def generate_case_code() -> str:
    digits = "".join(random.choices(string.digits, k=4))
    return f"CASE-2026-{digits}"


def match_domain_config(query: str) -> dict:
    q = query.lower()
    for cfg in DOMAINS_CONFIG:
        for kw in cfg["keywords"]:
            if kw in q:
                return cfg
    return DEFAULT_CONFIG


class CaseNavigatorEngine:
    def analyze_case(self, query: str, answers: Optional[Dict[str, str]] = None, case_code: Optional[str] = None) -> dict:
        answers = answers or {}
        cfg = match_domain_config(query)
        code = case_code or generate_case_code()

        answered_count = len(answers)
        total_questions = len(cfg["questions"])

        # Determine urgency
        q_lower = query.lower()
        if any(w in q_lower for w in ["threat", "assault", "beaten", "otp", "police", "evicting today", "emergency", "stolen"]):
            urgency = "Critical"
        elif any(w in q_lower for w in ["deposit", "refund", "notice", "harass", "fraud", "hacked"]):
            urgency = "High"
        else:
            urgency = "Medium"

        # Construct Action Plan
        action_plan = {
            "immediate_actions": [
                {
                    "step": 1,
                    "title": "Preserve All Physical & Digital Evidence",
                    "purpose": "Prevent tampering or accidental deletion of vital proof",
                    "why_it_matters": "Indian courts and police require unedited proof under Section 65B IT Act.",
                    "expected_outcome": "Solid evidentiary base for legal notices or FIR.",
                },
                {
                    "step": 2,
                    "title": "File Initial Complaint / Call Emergency Helpline",
                    "purpose": "Establish official timestamped record of the issue",
                    "why_it_matters": "Proves prompt action and eliminates allegations of delay.",
                    "expected_outcome": "Reference number or acknowledgment receipt generated.",
                },
            ],
            "actions_24h": [
                {
                    "step": 3,
                    "title": "Send Written Grievance or Demand Notice",
                    "purpose": "Give the opposing party a formal statutory opportunity to rectify",
                    "why_it_matters": "Required by most civil and consumer statutes prior to litigation.",
                    "expected_outcome": "Opposing party responds or defaults, strengthening your court position.",
                },
            ],
            "actions_7d": [
                {
                    "step": 4,
                    "title": "Organize Full Evidence Packet & File Formal Application",
                    "purpose": "Approach the designated statutory authority",
                    "why_it_matters": "Initiates formal legal proceedings before the competent tribunal/court.",
                    "expected_outcome": "Summons or notice issued to the opposite party.",
                },
            ],
            "long_term_actions": [
                {
                    "step": 5,
                    "title": "Track Hearing Dates & Legal Mediation",
                    "purpose": "Achieve final binding court decree or settlement agreement",
                    "why_it_matters": "Ensures full legal enforcement and recovery of damages.",
                    "expected_outcome": "Final judgment, refund order, or binding settlement.",
                },
            ],
        }

        # Evidence Checklist - All default to pending until actual file upload
        evidence_list = []
        for i, item_name in enumerate(cfg["evidence"]):
            evidence_list.append({
                "id": f"ev-{i+1}",
                "item": item_name,
                "description": f"Essential proof supporting {cfg['domain']}",
                "status": "pending",
            })

        # Required Documents
        docs_list = cfg["documents"]

        # Authorities
        auth_list = []
        for a in cfg["authorities"]:
            auth_list.append({
                "name": a["name"],
                "role": a["role"],
                "when_to_contact": a["when_to_contact"],
                "contact_guide": a["contact_guide"],
                "official_website": validate_url(a["official_website"]),
            })

        # Timeline Steps
        timeline = [
            {"id": "t1", "step_name": "Issue Reported & Categorized", "description": f"Domain identified as {cfg['domain']}", "completed": True},
            {"id": "t2", "step_name": "Information & Clarification", "description": f"Collected {answered_count}/{total_questions} key detail inputs", "completed": answered_count >= 2},
            {"id": "t3", "step_name": "Evidence Assembly", "description": "Organizing chat logs, invoices, agreements & receipts", "completed": False},
            {"id": "t4", "step_name": "Legal Notice / Draft Generation", "description": f"Generating {cfg['draft_type']}", "completed": False},
            {"id": "t5", "step_name": "Authority Submission", "description": f"Submitting to {cfg['authority']}", "completed": False},
            {"id": "t6", "step_name": "Resolution & Enforcement", "description": "Final settlement or court order execution", "completed": False},
        ]

        # Risk Analysis
        risk_analysis = [
            {
                "risk_type": "Missing Written Proof",
                "description": "Oral promises or unrecorded phone calls are difficult to prove in court.",
                "recommendation": "Send a formal email or WhatsApp message summarizing past oral conversations.",
            },
            {
                "risk_type": "Statutory Limitation Period",
                "description": "Delaying filing past statutory deadlines can extinguish legal rights.",
                "recommendation": "File your formal complaint within 15–30 days of the incident.",
            },
        ]

        # Calculation of completion progress
        progress_pct = min(100, 20 + (answered_count * 15))

        return {
            "case_id": code,
            "case_summary": query,
            "legal_category": cfg["domain"],
            "urgency_level": urgency,
            "confidence_score": 0.92,
            "progress_percentage": progress_pct,
            "clarifying_questions": [
                {"id": f"q-{i+1}", "question": q, "answered": f"q-{i+1}" in answers, "answer_value": answers.get(f"q-{i+1}", "")}
                for i, q in enumerate(cfg["questions"])
            ],
            "action_plan": action_plan,
            "evidence_checklist": evidence_list,
            "required_documents": docs_list,
            "authorities": auth_list,
            "timeline_steps": timeline,
            "risk_analysis": risk_analysis,
            "draft_type": cfg["draft_type"],
            "disclaimer": DISCLAIMER,
        }

    def generate_draft_document(self, draft_type: str, case_summary: str, details: Optional[dict] = None) -> dict:
        details = details or {}
        complainant = details.get("complainant_name", "[Your Full Name]")
        opposite = details.get("opposite_party", "[Opposing Party / Company / Landlord Name]")
        location = details.get("location", "[City, State]")
        date_str = details.get("date", "2026-08-06")

        if "Notice" in draft_type:
            title = f"LEGAL NOTICE FOR {draft_type.upper()}"
            content = f"""WITHOUT PREJUDICE / LEGAL NOTICE

Date: {date_str}
Location: {location}

TO:
{opposite}

FROM:
{complainant}

SUBJECT: LEGAL NOTICE REGARDING {case_summary.upper()}

Sir/Madam,

Under instructions from my client / on my own behalf, I hereby serve you with this Legal Notice:

1. That the Complainant resides at {location} and entered into a legal transaction / relationship with you.
2. Factual Matrix: {case_summary}
3. That despite repeated requests and oral assurances, you have failed to resolve the grievance or fulfill your statutory/contractual obligation.
4. That your actions amount to a breach of law and cause severe financial loss and mental harassment.

DEMAND:
You are hereby called upon to settle this matter and fulfill the claim within 15 (Fifteen) days from the receipt of this Notice. Failing which, civil and criminal legal proceedings will be initiated against you before the competent Court/Tribunal entirely at your risk as to costs and consequences.

Sincerely,
{complainant}
"""
        elif "Cyber" in draft_type:
            title = "FORMAL CYBER CRIME COMPLAINT DRAFT"
            content = f"""TO THE OFFICER-IN-CHARGE
CYBER CRIME POLICE STATION / NATIONAL CYBER CRIME PORTAL

Date: {date_str}
Complainant Name: {complainant}
Location: {location}

SUBJECT: COMPLAINT REGARDING CYBER FRAUD / FINANCIAL SCAM

Respected Sir/Madam,

I wish to lodge a formal cyber crime complaint regarding an incident of online fraud:

1. Details of Incident: {case_summary}
2. Approximate Financial Loss / Impact: As described.
3. Relevant Evidence Attached: Bank statement copies, transaction IDs, phone numbers, screenshots.

PRAYER:
It is requested that:
a) An investigation be registered immediately under the Information Technology Act, 2000.
b) Directives be issued to block the fraudster bank accounts/handles to freeze stolen funds.

Yours faithfully,
{complainant}
"""
        else:
            title = f"FORMAL COMPLAINT / REPRESENTATION DRAFT ({draft_type.upper()})"
            content = f"""TO THE COMPETENT AUTHORITY
{location}

Date: {date_str}
Applicant: {complainant}
Opposing Party: {opposite}

SUBJECT: FORMAL COMPLAINT REGARDING {case_summary.upper()}

Respected Sir/Madam,

I am submitting this written complaint for your immediate intervention:

1. Facts of the Case: {case_summary}
2. Legal Provisions Involved: Statutory guidelines under applicable Indian Law.
3. Relief Sought: Immediate investigation, restoration of rights, and appropriate action against the opposing party.

Thanking You,

Yours sincerely,
{complainant}
"""

        return {
            "title": title,
            "draft_type": draft_type,
            "content": content.strip(),
        }


nav_engine = CaseNavigatorEngine()
