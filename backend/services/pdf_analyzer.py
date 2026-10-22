"""
PDF Analyzer for LegalSathi AI.

Extracts text from uploaded PDF documents and provides:
- Text extraction
- Summary generation
- Key legal points identification
- Document categorization
"""

import json
import re
import os
import tempfile
from typing import Dict, Any, List, Optional

try:
    import pypdf
    HAS_PYPdf = True
except ImportError:
    HAS_PYPdf = False

from config.settings import settings
from services.document_generator import SUPPORTED_DOC_TYPES, resolve_doc_type, DISCLAIMER


def _extract_text_from_pdf(file_content: bytes) -> str:
    """Extract raw text from a PDF file using PyPDF2."""
    if not HAS_PYPdf:
        return ""
    
    try:
        import io
        reader = pypdf.PdfReader(io.BytesIO(file_content))
        text_parts = []
        for page in reader.pages:
            try:
                page_text = page.extract_text()
                if page_text:
                    text_parts.append(page_text)
            except Exception:
                continue
        return "\n".join(text_parts)
    except Exception:
        return ""


def _detect_legal_keywords(text: str) -> List[str]:
    """Identify legal topic keywords from extracted text."""
    text_lower = text.lower()
    keywords = []
    
    legal_keywords = {
        "domestic violence": ["domestic violence", "dv act", "protection order"],
        "rental dispute": ["rent", "landlord", "tenant", "eviction", "lease", "security deposit"],
        "consumer rights": ["consumer", "refund", "defective", "warranty", "complaint"],
        "cyber crime": ["cyber", "online fraud", "phishing", "hacking", "scam"],
        "domestic violence act": ["dv act", "protection of women", "2005"],
        "right to information": ["rti", "right to information act", "section 6"],
        "employment": ["employment", "termination", "severance", "notice period"],
        "property dispute": ["property", "ownership", "title deed", "partition"],
        "will and inheritance": ["will", "inheritance", "estate", "probate"],
        "marriage divorce": ["marriage", "divorce", "alimony", "custody", "maintenance"],
    }
    
    for topic, kws in legal_keywords.items():
        if any(kw in text_lower for kw in kws):
            keywords.append(topic)
    
    return keywords


def _summarize_text(text: str, max_chars: int = 3000) -> str:
    """Create a concise summary of the text."""
    if not text:
        return ""
    
    # Take first portion and truncate
    text = text.strip()
    if len(text) <= max_chars:
        return text
    
    # Try to split by sentences and take beginning
    sentences = re.split(r'[.!?]+', text)
    summary_sentences = sentences[:8]  # Take first ~8 sentences
    summary = ". ".join(summary_sentences)
    if len(summary) > max_chars:
        summary = summary[:max_chars - 1] + "..."
    return summary


def _extract_legal_points(text: str) -> List[str]:
    """Extract key legal points from the document text."""
    points = []
    text_lower = text.lower()
    
    # Look for common legal phrase patterns
    patterns = [
        r"under (the )?([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+act",
        r"section ([\d]+(?:[\s.-]*[A-Z][a-z]+)*)",
        r"right (to )?([a-z\s]+)",
        r"shall (be )?([a-z ]+)",
        r"must (not )?([a-z ]+)",
        r"penalty (of|for) ([^.]+?\.)",
    ]
    
    for pattern in patterns:
        matches = re.findall(pattern, text, re.IGNORECASE)
        for match in matches[:2]:  # Take top 2 per pattern
            points.append(" ".join(match) if isinstance(match, tuple) else str(match))
    
    # Deduplicate while preserving order
    seen = set()
    unique_points = []
    for p in points:
        p_lower = p.lower().strip()
        if p_lower and p_lower not in seen:
            seen.add(p_lower)
            unique_points.append(p)
    
    return unique_points[:5]  # Return top 5 points


def analyze_pdf_content(
    file_content: bytes,
    doc_type: str = "",
    details: Optional[Dict] = None
) -> Dict[str, Any]:
    """
    Analyze a PDF document and extract key information.
    
    Returns a dict with:
    - success: bool indicating if analysis was possible
    - extracted_text: raw text extracted from the PDF
    - summary: concise summary of the document
    - key_legal_points: identified legal topics/points
    - confidence_score: confidence score (0.0 - 1.0)
    """
    # Step 1: Extract text
    extracted_text = _extract_text_from_pdf(file_content)
    
    if not extracted_text.strip():
        return {
            "success": False,
            "extracted_text": "",
            "summary": "",
            "key_legal_points": [],
            "confidence_score": 0.0,
        }
    
    # Step 2: Categorize the document type
    resolved_type = resolve_doc_type(doc_type) if doc_type else "police"
    category = SUPPORTED_DOC_TYPES.get(resolved_type, {}).get("category", "General")
    
    # Step 2: Summarize
    summary = _summarize_text(extracted_text)
    
    # Step 3: Identify legal keywords
    key_legal_points = _extract_legal_points(extracted_text)
    
    # If we have known legal document types, check for specific patterns
    category_keywords = SUPPORTED_DOC_TYPES.get(resolved_type, {}).get("keywords", [])
    for kw in category_keywords:
        if kw.lower() in extracted_text.lower():
            if kw not in key_legal_points:
                key_legal_points.append(kw)
    
    # Step 4: Calculate confidence based on text quality and matches
    confidence = 0.5  # Base confidence
    if extracted_text.strip():
        confidence = 0.6
    if key_legal_points:
        confidence = min(0.9, confidence + 0.2)
    if summary and len(summary) > 50:
        confidence = min(0.95, confidence + 0.1)
    
    return {
        "success": True,
        "extracted_text": extracted_text[:10000],  # Cap at 10k chars
        "summary": summary,
        "key_legal_points": key_legal_points,
        "confidence_score": round(confidence, 2),
    }