# LegalSathi AI

## Know Your Rights Before It's Too Late.
An AI-powered multilingual Legal Information and Guidance Platform.

> **Disclaimer**: This platform provides legal information, not legal advice. Always consult a qualified lawyer for official legal matters.

## Architecture
- **Frontend**: Next.js, React, Tailwind CSS, shadcn/ui
- **Backend**: FastAPI, Python 3.12, SQLAlchemy, Pydantic
- **Database**: PostgreSQL
- **AI/RAG**: LangChain, ChromaDB, Sentence Transformers, Gemini API

## Project Structure
- `/frontend`: Next.js web application
- `/backend`: FastAPI REST APIs and RAG pipeline
- `/database`: PostgreSQL schemas and migrations
- `/chroma`: Local vector store for Embeddings
- `/knowledge_base`: PDFs and text files for the Legal RAG

## Getting Started

### Prerequisites
- Docker & Docker Compose
- Node.js (for local frontend development)
- Python 3.12 (for local backend development)

### Running with Docker (Recommended)
1. Clone the repository
2. Copy `.env.example` to `.env`
3. Run `docker-compose up --build`
4. Access Frontend at `http://localhost:3000`
5. Access Backend API Docs at `http://localhost:8000/docs`

### Legal Domains Covered
- Women's Rights
- Children's Rights
- Senior Citizen Rights
- Rental Laws
- Cyber Bullying
- Copyright
- Consumer Rights
- Cyber Fraud
- Police Complaints
