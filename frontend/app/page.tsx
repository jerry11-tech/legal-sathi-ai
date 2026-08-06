'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Bot,
  Building2,
  CheckCircle2,
  CheckSquare,
  Clock,
  Code2,
  Cpu,
  Database,
  FileCheck,
  FileSearch,
  FileText,
  Globe,
  HelpCircle,
  KeyRound,
  Layers,
  LayoutDashboard,
  Lock,
  Mic,
  PhoneCall,
  Scale,
  Search,
  Send,
  Server,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  UserCheck,
  Users,
  Video,
  Zap,
} from 'lucide-react';

export default function Home() {
  const router = useRouter();

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 space-y-16 text-slate-900">
      {/* Landing Header Top Bar */}
      <div className="flex items-center justify-between border-b border-slate-200/80 pb-4">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
            <Scale size={18} />
          </span>
          <span className="font-bold text-lg text-slate-900">LegalSathi AI</span>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/login"
            className="rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="rounded-xl bg-blue-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition"
          >
            Create Account
          </Link>
          <Link
            href="/chat"
            className="hidden sm:inline-flex rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200 transition"
          >
            Continue as Guest ➔
          </Link>
        </div>
      </div>
      {/* SECTION 1 — HERO */}
      <section className="text-center max-w-4xl mx-auto space-y-6 pt-4">
        <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1.5 text-xs font-bold text-blue-700 ring-1 ring-blue-200">
          <Sparkles size={14} className="text-blue-600" /> AI-Powered Indian Legal Guidance Platform
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight text-slate-900">
          Know Your Rights. <br />
          <span className="text-blue-600">Understand the Law.</span> <br />
          Take the Right Action.
        </h1>

        <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-3xl mx-auto">
          LegalSathi AI is an AI-powered multilingual legal information and guidance platform that helps people understand Indian laws in simple language. It provides legal information, personalized action plans, document generation, official government resources, and step-by-step guidance for common legal issues.
        </p>

        <div className="flex flex-col items-center justify-center gap-4 pt-2">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto">
            <Link
              href="/login"
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-7 py-3.5 text-sm font-bold text-slate-800 hover:bg-slate-50 shadow-xs transition"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-700 transition"
            >
              <Sparkles size={18} /> Create Free Account
            </Link>
          </div>

          <Link
            href="/chat"
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 underline underline-offset-4 transition"
          >
            Continue as Guest (5 free chats) ➔
          </Link>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 pt-4 text-xs font-bold text-slate-600">
          <span className="flex items-center gap-1.5"><CheckCircle2 size={16} className="text-emerald-500" /> Free to Use</span>
          <span className="flex items-center gap-1.5"><CheckCircle2 size={16} className="text-emerald-500" /> Multilingual Support</span>
          <span className="flex items-center gap-1.5"><CheckCircle2 size={16} className="text-emerald-500" /> AI Powered</span>
          <span className="flex items-center gap-1.5"><CheckCircle2 size={16} className="text-emerald-500" /> Secure & Private</span>
        </div>
      </section>

      {/* SECTION 2 — WHAT IS LEGALSATHI AI? */}
      <section className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-10 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Left Illustration / Product Card */}
          <div className="rounded-2xl border border-blue-100 bg-gradient-to-tr from-blue-600 via-indigo-600 to-blue-700 p-8 text-white space-y-4 shadow-xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-md">
              <Scale size={24} />
            </div>
            <h3 className="text-xl font-extrabold leading-snug">
              Democratizing Legal Information across India
            </h3>
            <p className="text-xs sm:text-sm text-blue-100 leading-relaxed">
              LegalSathi AI converts legal jargon into plain language, mapping out verified legal procedures, rights, statutory provisions, and complaint drafts.
            </p>
            <div className="rounded-xl bg-white/10 p-3 text-[11px] font-semibold flex items-center gap-2 border border-white/20">
              <ShieldCheck size={16} className="text-emerald-300 shrink-0" />
              <span>Verified Government Links & Statutory References Included</span>
            </div>
          </div>

          {/* Right Content */}
          <div className="space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Product Overview</span>
            <h2 className="text-2xl font-bold text-slate-900">What is LegalSathi AI?</h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              LegalSathi AI is an intelligent legal information platform designed to make Indian laws easier to understand for everyone.
            </p>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Instead of reading complex legal documents or searching across multiple government websites, users can simply describe their legal issue in plain language.
            </p>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              The AI analyzes the situation and provides structured legal information, applicable laws, user rights, evidence requirements, government authorities, official resources, and practical next steps.
            </p>

            <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-3 text-xs text-amber-900 flex items-start gap-2">
              <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
              <span>
                <strong>Educational Guidance:</strong> LegalSathi AI provides legal information and guidance. It does not provide formal legal representation or replace a licensed advocate.
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3 — HOW LEGALSATHI HELPS YOU */}
      <section className="space-y-6">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Comprehensive Capabilities</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">How LegalSathi Helps You</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { title: 'AI Legal Assistant', desc: 'Ask questions in plain language and receive clear legal explanations.', icon: <Bot size={20} className="text-blue-600" /> },
            { title: 'Case Navigator', desc: 'Convert complex legal problems into step-by-step resolution roadmaps.', icon: <Sparkles size={20} className="text-indigo-600" /> },
            { title: 'Legal Action Planner', desc: 'Timeline actions: Immediate, 24 Hours, 7 Days, and long-term steps.', icon: <Clock size={20} className="text-emerald-600" /> },
            { title: 'Document Generator', desc: 'Create automated FIR complaints, legal notices, and RTI forms.', icon: <FileText size={20} className="text-amber-600" /> },
            { title: 'Document Analyzer', desc: 'Extract key clauses and summarize legal notices or contracts.', icon: <FileSearch size={20} className="text-rose-600" /> },
            { title: 'Evidence Checklist', desc: 'Track pending, uploaded, and verified proof for your case.', icon: <CheckSquare size={20} className="text-cyan-600" /> },
            { title: 'Government Links', desc: 'Direct access to verified official government portals (.gov.in / .nic.in).', icon: <Globe size={20} className="text-blue-600" /> },
            { title: 'Multilingual Support', desc: 'Understand Indian laws in English, Hindi, Marathi, and regional languages.', icon: <BookOpen size={20} className="text-purple-600" /> },
            { title: 'Voice Support', desc: 'Describe legal problems via voice input for accessible assistance.', icon: <Mic size={20} className="text-pink-600" /> },
            { title: 'Official Helpline Directory', desc: 'Direct access to Women (1091), Child (1098), and Cyber (1930) helplines.', icon: <PhoneCall size={20} className="text-red-600" /> },
            { title: 'Verified Legal Info', desc: 'Cited provisions from IPC, CrPC, IT Act, POCSO, DV Act, and Rent Acts.', icon: <ShieldCheck size={20} className="text-emerald-600" /> },
            { title: 'Download Reports', desc: 'Download editable complaint drafts and action plan TXT/PDF files.', icon: <FileCheck size={20} className="text-blue-600" /> },
          ].map((item, idx) => (
            <div key={idx} className="rounded-2xl border border-slate-200 bg-white p-5 space-y-2 shadow-2xs hover:border-blue-300 transition">
              <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center">{item.icon}</div>
              <h3 className="font-bold text-sm text-slate-900">{item.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 4 — HOW IT WORKS */}
      <section className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="text-center space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600">7-Step Resolution Process</span>
          <h2 className="text-2xl font-bold text-slate-900">How It Works</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
          {[
            { step: 1, title: 'Describe Problem', desc: 'Enter legal issue in plain words' },
            { step: 2, title: 'AI Analysis', desc: 'AI analyzes facts & urgency' },
            { step: 3, title: 'Laws Identified', desc: 'Statutory provisions mapped' },
            { step: 4, title: 'Rights Explained', desc: 'Your legal protections listed' },
            { step: 5, title: 'Evidence Listed', desc: 'Required documents & proof' },
            { step: 6, title: 'Action Plan', desc: 'Timeline roadmap generated' },
            { step: 7, title: 'Draft Notice', desc: 'Generate complaint / FIR' },
          ].map((s) => (
            <div key={s.step} className="rounded-2xl border border-slate-200 bg-slate-50/60 p-3.5 space-y-1 text-center">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-[11px] font-bold text-white">
                {s.step}
              </span>
              <h4 className="text-xs font-bold text-slate-900">{s.title}</h4>
              <p className="text-[10px] text-slate-500 leading-tight">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 5 — WHO CAN USE THIS? */}
      <section className="space-y-6">
        <div className="text-center space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Accessible To Everyone</span>
          <h2 className="text-2xl font-bold text-slate-900">Who Can Use LegalSathi AI?</h2>
        </div>

        <div className="flex flex-wrap gap-2.5 justify-center">
          {[
            'Students', 'Working Professionals', 'Women', 'Senior Citizens', 'Parents',
            'Tenants', 'Consumers', 'Small Businesses', 'Content Creators', 'YouTubers',
            'Freelancers', 'Citizens Seeking Legal Info',
          ].map((user, idx) => (
            <span key={idx} className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-2xs flex items-center gap-2">
              <UserCheck size={14} className="text-blue-600" /> {user}
            </span>
          ))}
        </div>
      </section>

      {/* SECTION 6 — LEGAL CATEGORIES */}
      <section className="space-y-6">
        <div className="text-center space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Supported Domains</span>
          <h2 className="text-2xl font-bold text-slate-900">Explore Legal Categories</h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {[
            { label: "Women's Rights", query: 'My husband demands dowry and harasses me.' },
            { label: "Children's Rights", query: 'What protections exist under the POCSO Act for minor children?' },
            { label: 'Senior Citizen Rights', query: 'Can a senior citizen claim maintenance under Indian law?' },
            { label: 'Rental Laws', query: 'My landlord is refusing to return my security deposit.' },
            { label: 'Consumer Rights', query: 'I bought a defective product online and seller refuses refund.' },
            { label: 'Cyber Crime', query: 'Someone stole money from my bank account via an OTP fraud.' },
            { label: 'Cyber Bullying', query: 'Someone is posting morphed photos of me online and trolling me.' },
            { label: 'Police Complaints', query: 'How to file an FIR if police refuse to record a complaint?' },
            { label: 'Property Disputes', query: 'What legal documents are required for ancestral property partition?' },
            { label: 'Employment Law', query: 'My employer terminated me without notice and withheld my salary.' },
            { label: 'Copyright & YouTube', query: 'Someone copied my written work without permission online.' },
            { label: 'RTI Applications', query: 'How to file an RTI application to seek government information?' },
            { label: 'Family Law', query: 'What is the procedure for legal separation or mutual divorce?' },
            { label: 'Traffic Rules', query: 'What are my rights if a traffic police officer issues an illegal fine?' },
          ].map((cat, idx) => (
            <button
              key={idx}
              onClick={() => router.push(`/chat?q=${encodeURIComponent(cat.query)}`)}
              className="group rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-2xs hover:border-blue-300 hover:bg-blue-50/40 transition"
            >
              <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 flex items-center justify-between">
                {cat.label} <ArrowRight size={12} />
              </h4>
            </button>
          ))}
        </div>
      </section>

      {/* SECTION 7 — WHY USE LEGALSATHI AI? */}
      <section className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="text-center space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600">The LegalSathi Advantage</span>
          <h2 className="text-2xl font-bold text-slate-900">Why Use LegalSathi AI?</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { old: 'Searching across multiple scattered government websites', new: 'Ask one plain language query and get immediate structured legal clarity.' },
            { old: 'Reading complicated, intimidating legalese and statutory codes', new: 'Receive simple, plain English/Hindi explanations with practical rights.' },
            { old: 'Wondering what steps to take or who to contact', new: 'Receive a personalized, chronological action plan and authority guide.' },
            { old: 'Relying on unverified blogs or social media legal advice', new: 'Access verified official government portal links (.gov.in / .nic.in).' },
          ].map((item, idx) => (
            <div key={idx} className="rounded-2xl border border-slate-200 p-5 space-y-3 bg-slate-50/50">
              <div className="rounded-xl bg-red-50 p-2.5 text-xs text-red-800 font-semibold border border-red-100 flex items-center gap-2">
                <span className="text-red-600 font-bold">❌ Before:</span> {item.old}
              </div>
              <div className="rounded-xl bg-emerald-50 p-2.5 text-xs text-emerald-800 font-bold border border-emerald-100 flex items-center gap-2">
                <span className="text-emerald-600 font-bold">✓ With LegalSathi:</span> {item.new}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 8 — TECHNOLOGY STACK SHOWCASE */}
      <section className="space-y-6">
        <div className="text-center space-y-2 max-w-3xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Architectural Transparency</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Built Using Modern AI & Web Technologies</h2>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            LegalSathi AI combines Artificial Intelligence, Natural Language Processing, Retrieval-Augmented Generation (RAG), and modern web technologies to provide reliable legal information.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Group 1: AI & ML */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 space-y-3 shadow-2xs">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600 border-b pb-3">
              <Cpu size={18} /> AI & Machine Learning
            </div>
            <div className="flex flex-wrap gap-1.5">
              {['FastAPI', 'Python 3.12', 'Google Gemini API', 'Sentence Transformers', 'FAISS Vector DB', 'LangChain', 'RAG Pipeline', 'Prompt Engineering'].map((t) => (
                <span key={t} className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">{t}</span>
              ))}
            </div>
          </div>

          {/* Group 2: Frontend & UX */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 space-y-3 shadow-2xs">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-600 border-b pb-3">
              <Code2 size={18} /> Frontend Architect
            </div>
            <div className="flex flex-wrap gap-1.5">
              {['Next.js 14', 'React 18', 'TypeScript', 'Tailwind CSS', 'ShadCN UI', 'Lucide Icons', 'Framer Motion', 'PWA Ready'].map((t) => (
                <span key={t} className="rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700">{t}</span>
              ))}
            </div>
          </div>

          {/* Group 3: Backend & Database */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 space-y-3 shadow-2xs">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-600 border-b pb-3">
              <Server size={18} /> Backend & Database
            </div>
            <div className="flex flex-wrap gap-1.5">
              {['FastAPI', 'Pydantic v2', 'PostgreSQL', 'SQLite', 'SQLAlchemy 2.0', 'JWT Auth', 'REST APIs', 'Docker Container'].map((t) => (
                <span key={t} className="rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">{t}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 9 — SECURITY & PRIVACY */}
      <section className="space-y-6">
        <div className="text-center space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Privacy First</span>
          <h2 className="text-2xl font-bold text-slate-900">Security & Privacy Standards</h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { title: 'Encrypted Auth', icon: <KeyRound size={18} className="text-blue-600" /> },
            { title: 'Secure File Upload', icon: <FileCheck size={18} className="text-indigo-600" /> },
            { title: 'Role-Based Access', icon: <ShieldCheck size={18} className="text-emerald-600" /> },
            { title: 'Private Sessions', icon: <Lock size={18} className="text-amber-600" /> },
            { title: 'Verified GOV Sources', icon: <Globe size={18} className="text-cyan-600" /> },
            { title: 'Zero Data Sharing', icon: <Shield size={18} className="text-rose-600" /> },
          ].map((item, idx) => (
            <div key={idx} className="rounded-2xl border border-slate-200 bg-white p-4 text-center space-y-2 shadow-2xs">
              <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50">{item.icon}</div>
              <h4 className="text-xs font-bold text-slate-900">{item.title}</h4>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 10 — LEGAL DISCLAIMER CARD */}
      <section className="rounded-3xl border border-amber-200 bg-amber-50/80 p-6 sm:p-8 space-y-3">
        <div className="flex items-center gap-2.5 text-amber-900 font-bold text-base">
          <AlertTriangle size={20} className="text-amber-600" /> Official Legal Disclaimer
        </div>
        <p className="text-xs sm:text-sm text-amber-900/90 leading-relaxed">
          LegalSathi AI provides legal information and educational guidance based on publicly available Indian laws and government resources. It does not provide legal advice and does not replace a qualified lawyer. For legal representation or case-specific advice, users should consult a licensed advocate.
        </p>
      </section>
    </div>
  );
}
