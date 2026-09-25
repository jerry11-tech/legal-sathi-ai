# LEGALSATHI AI
## An AI-Powered, Multilingual Legal Information and Guidance Platform for Indian Citizens

### MCA Project Synopsis

---

Student Name: **Dhiraj Nimje**  
Class: **[To be provided]**  
Enrollment Number: **[To be provided]**
Guide: **[To be provided]**
University / Institution: **[To be provided]**
Academic Year / Semester: **[To be provided]**

---

## 1. Title of the Project

**Legalsathi AI: An AI-Powered, Multilingual Legal Information and Guidance Platform for Indian Citizens**

---

## 2. Introduction

Legal literacy in India is strikingly low, and professional legal advice is frequently unaffordable for large sections of the population. Every day, ordinary citizens encounter routine but stressful legal situations — unfair rent demands, wrongful termination, eve-teasing or harassment, domestic disputes, and increasingly common online financial frauds and OTP scams — where they do not know their rights, the relevant law, or the first step to take. Most available guidance is either expensive (lawyer consultations), inaccessible (dense, English-only legal texts), or unreliable (unverified online content).

Legalsathi AI addresses this gap by providing a free, web-based platform that offers conversational legal guidance grounded in actual Indian statutes, an evidence-led Case Navigator that helps a user organise their situation step by step, and automated generation of legal documents such as FIR narratives and legal notices. The system combines a large language model (Google Gemini) with a retrieval-augmented generation (RAG) pipeline over Indian legal corpora so that answers are traceable to source provisions, and it presents content in multiple languages, including Hindi and Marathi.

---

## 3. Background / Context

The Indian legal system is governed by an extensive body of central and state legislation, along with a large volume of case law. For a non-lawyer, understanding which Act applies, which provision is relevant, and what procedure to follow is extremely difficult. Government legal aid (e.g., Lok Adalats, Legal Services Authorities) exists but is not uniformly accessible, especially through online channels.

Recent advances in generative AI and large language models have made it feasible to build systems that can read, summarise, and reason over legal text at scale. When combined with techniques such as RAG — where the model is made to answer only from retrieved, verifiable source documents rather than from memory alone — the risk of "hallucinated" legal advice is substantially reduced. This motivates a platform that couples an LLM with a curated, verifiable body of Indian legal knowledge.

---

## 4. Problem Statement

The following problems were identified:

- Low legal awareness among Indian citizens regarding their rights and obligations in everyday situations.
- Poor accessibility of the justice system for users who cannot afford or easily reach legal counsel.
- The complexity and English-centricity of legal texts create a language barrier for speakers of Hindi, Marathi, and other Indian languages.
- The absence of a single, low-cost, trustworthy channel that guides a layperson from "I have a problem" to "here is what the law says and what I can do next."
- For common grievance categories (rental disputes, workplace issues, women's rights, cyber/financial fraud), there is no free automated tool that produces a written case record and draft legal document with citations to the law.

---

## 5. Need for the Project

The need arises from three observable gaps: cost, language, and structure. Lawyers charge fees beyond the reach of many users; legal documents and statutes are written for professionals; and unstructured online queries rarely produce a complete, step-by-step outcome. A platform that offers grounded answers in the user's own language, walks them through their situation, and drafts preliminary legal documents at no cost directly addresses all three gaps. This makes the project socially relevant as well as technically challenging — an appropriate fit for an MCA major project.

---

## 6. Aim

To design, build, and deploy a web-based, multilingual AI system that provides Indian citizens with free, source-backed legal information, step-by-step guidance for common legal situations, and automated drafting of legal documents, using a retrieval-augmented large language model.

---

## 7. Objectives

- To provide conversational answers to legal questions in multiple Indian languages (English, Hindi, Marathi) with references to applicable laws.
- To implement a retrieval-augmented generation pipeline so that answers are grounded in a maintained corpus of Indian legal documents.
- To build a Case Navigator that collects structured facts from the user, assesses category and urgency, and produces tailored guidance and a saved case record.
- To automate the generation of common legal documents, including FIR complaint narratives and legal notices.
- To maintain a central repository of verified government announcements (gazette-derived) affecting citizens.
- To provide a secure user module (registration, authentication, profile) and an administrative dashboard for user management, statistics, and auditing.
- To deploy the application to production (frontend on Vercel, backend on Render) and validate the complete workflow end to end.

---

## 8. Proposed System / Proposed Solution

The system is proposed as a full-stack, three-tier web application.

The frontend is a responsive single-page application built with Next.js and React that presents the interface for chat, case navigation, document generation, and the evidence vault. A thin proxy layer on the frontend forwards requests to the backend with enforced timeouts, insulating the user interface from backend failures with graceful 503 responses.

The backend is a REST API built with Python and FastAPI exposing modules for authentication, chat, navigation, document generation, evidence storage, announcements, and administration. It integrates Google Gemini for generation and extends it with a RAG retrieval layer over a curated corpus of Indian legal acts and summaries. Persistent user data is stored in SQLite through SQLAlchemy, with JWT-based authentication.

Currently **fully implemented and live**: the AI chat, Case Navigator, document generator, evidence vault, admin dashboard, user registration/login, and multilingual responses form a working production platform accessible at a public URL. Proposed enhancements (persistent database, notification delivery, and expanded law coverage) are described in the Future Scope section.

---

## 9. Methodology

The project follows an iterative software-development lifecycle:

1. **Requirement analysis** — capture user personas (citizens, students, low-income users) and the legal situations to be covered.
2. **System design** — define the API contracts, database schema, and frontend layout.
3. **RAG pipeline construction** — collect open legal documents and verified gazette announcements, clean and structure the text, create a searchable index, and define a retrieval strategy.
4. **Generation layer** — prompt Gemini with retrieved source passages and strict instructions to cite the sources and to refuse to act as a substitute for a lawyer.
5. **Case Navigator logic** — a rule-based stage that detects domains and emergencies from the user's description (e.g., urgency keywords), then drives structured data collection and guided output generation.
6. **Frontend integration** — build pages for chat, navigator, documents, vault, login, and administration.
7. **Testing and deployment** — automated API smoke tests, role-based access checks, deployment to Vercel and Render, and end-to-end verification.

For the AI/ML workflow, the project does not train a custom model; it uses a pre-trained commercial LLM through its API. The retrieval corpus acts as the "data layer": documents are cleaned, split into retrieval units, and indexed; the retrieved units are injected into the prompt; and outputs are evaluated qualitatively against source documents for correctness, citation fidelity, and language fluency. Future work may add offline embeddings and fine-tuning for Indian legal terminology. Datasets, preprocessing, and per-module corpus details are to be documented under **[To be provided]** if the guide requires an explicit dataset annexure.

---

## 10. System Architecture / Workflow Description

The architecture is organised as a set of layers:

- **Presentation Layer (Next.js/React, hosted on Vercel):** User interface for chat, case navigation, document generation, evidence vault, authentication, and the admin panel.
- **API Proxy Layer (Next.js server routes):** Forwards client calls to the backend with an 8-second timeout and standardised error fallbacks.
- **Application Layer (Python/FastAPI, hosted on Render):** Business logic, validation, JWT authentication, and auditing.
- **AI Layer:** Google Gemini generation endpoint combined with the retrieval index over the legal corpus (RAG).
- **Data Layer:** SQLite/SQLAlchemy for users, sessions, cases, documents, audit logs, settings, announcements, and uploaded file metadata.

A typical workflow for a user is: register and log in, ask a legal question in the AI chat, receive an answer with citations, describe their situation in the Case Navigator, receive a structured analysis with urgency and domain, optionally generate a draft FIR or notice, and save it. Administrative users monitor usage through the dashboard and can suspend, activate, or remove users and review audit trails.

---

## 11. Modules of the System

- **Authentication and User Management:** registration, login, profile update, password change/reset, role-based access (user/admin).
- **AI Legal Chat:** conversational interface with grounded, cited responses and emergency-situation detection.
- **Case Navigator:** domain and urgency detection, structured fact collection, guidance generation, case saving and retrieval.
- **Legal Document Generator:** automated drafting of FIR narratives, legal notices, and other standard templates.
- **Evidence Vault:** secure upload, storage, hashing, and retrieval of user evidence files.
- **Announcements / Law Sync:** ingestion and display of verified government announcements with source verification metadata.
- **RAG Engine:** corpus indexing, retrieval, and citation assembly for grounded answers.
- **Administration:** statistics, user management, document and template management, system settings, and audit logs.

---

## 12. Technologies and Tools Used

- **Frontend:** TypeScript, Next.js 16, React 19, Tailwind CSS, Lucide icons, Framer Motion; deployed on Vercel.
- **Backend:** Python 3, FastAPI, SQLAlchemy, Pydantic, JWT-based authentication; deployed on Render.
- **Database:** SQLite (development and current deployment), with PostgreSQL proposed for production persistence.
- **AI/ML:** Google Gemini API with a retrieval-augmented generation pipeline.
- **Version Control and CI:** Git, GitHub.
- **Testing:** API-level smoke tests and manual end-to-end verification.

---

## 13. Expected Results / Outcomes

- A freely accessible web platform that answers legal questions in a user's preferred language, with references to applicable provisions.
- A Case Navigator that converts a user's description into a structured, actionable case record with urgency and domain classification.
- Automatically generated drafts of common legal documents (FIR narratives, legal notices) that the user can review and take forward.
- Administrative oversight of users, content, and activity.
- Production deployment that has been verified end to end: registration, login, chat, case saving, and document generation all function against a live backend.

The project does not make unsupported claims about prediction accuracy or court outcomes; success is measured by functional availability, correctness of citations against the corpus, and usability of the guided workflow.

---

## 14. Scope of the Project

The scope of the current implementation covers the most common everyday legal situations: rental and property disputes, workplace and employment issues, women's rights and harassment, and cyber/financial fraud including OTP and phishing scams. Content is provided in English, Hindi, and Marathi. The system produces information and draft documents and does not replace professional legal services. It is hosted as a public cloud deployment suitable for demonstration and academic evaluation.

---

## 15. Limitations

- The system provides general legal information and guidance; it is not a substitute for a lawyer and cannot be held responsible for court outcomes.
- Law coverage is limited to the acts and documents included in the retrieval corpus.
- An LLM can occasionally produce plausible but incorrect content; citation grounding mitigates but does not eliminate this risk.
- The current SQLite database runs on serverless/ephemeral storage, so data may be lost when the backend is redeployed; a persistent database is required for production.
- Real-time document delivery (email/SMS) and custom notifications require external services and are not configured.
- External API usage incurs cost and depends on provider availability.

---

## 16. Future Scope

- Migration to a persistent hosted database (e.g., PostgreSQL) to retain users and records across deployments.
- Offline embedding-based retrieval and region-specific fine-tuned models for better Indian-language fidelity.
- Integration with court-case tracking (e-Courts) and legal-aid helplines.
- A companion mobile application and voice-assisted interaction (speech-to-text and text-to-speech in Indian languages).
- Delivered notifications (email/SMS) for verification, password reset, and case updates.
- Expansion of the corpus to additional Acts, states, and languages, with periodic automated updates.

---

## 17. Conclusion

Legalsathi AI demonstrates how modern generative AI can be applied to a pressing social problem: making legal information free, understandable, and available in the user's own language. By grounding model answers in a verifiable corpus of Indian law, structuring the user's narrative through a Case Navigator, and automating the drafting of common legal documents, the project provides a practical, deployable tool for citizens. The implemented system is live, tested end to end, and provides a strong foundation for further enhancement in the areas of persistence, scale, and multilingual AI capability.

---

## 18. References

[To be provided — examples below, to be verified and reformatted per college style, e.g., APA/IEEE:]

- Google Generative AI / Gemini API documentation. https://ai.google.dev/gemini-api/docs
- FastAPI documentation. https://fastapi.tiangolo.com/
- Next.js documentation. https://nextjs.org/docs
- React documentation. https://react.dev
- SQLAlchemy documentation. https://www.sqlalchemy.org/
- India Code — digital repository of central and state Acts. https://www.indiacode.nic.in/
- Bharatiya Nyaya Sanhita and related recent Indian legislation (as applicable to the modules).

---

## Placeholders to Complete before Submission

- Student name / enrollment number: **[To be provided]**
- University / Institution: **[To be provided]**
- Project guide: **[To be provided]**
- Academic year / semester: **[To be provided]**
- Project type (Mini/Major/Final Year): **[To be provided]**
- Dataset annexure details (if the guide requires explicit dataset documentation): **[To be provided]**
- References formatted per the institution's citation standard: **[To be provided]**