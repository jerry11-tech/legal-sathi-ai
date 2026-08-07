'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  AlertTriangle,
  ArrowRight,
  Award,
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
  FolderOpen,
  Gavel,
  Globe,
  HeartHandshake,
  HelpCircle,
  KeyRound,
  Layers,
  LayoutDashboard,
  Lock,
  Megaphone,
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

  const legalCategories = [
    { title: "Women's Rights", code: "POSH / DV Act", href: "/chat?q=Women+Rights", icon: <Shield size={18} className="text-pink-600" /> },
    { title: "Children Rights", code: "POCSO / RTE", href: "/chat?q=Children+Rights", icon: <HeartHandshake size={18} className="text-amber-600" /> },
    { title: "Senior Citizen Rights", code: "Maintenance Act", href: "/chat?q=Senior+Citizen", icon: <Users size={18} className="text-purple-600" /> },
    { title: "Rental & Tenancy Laws", code: "Model Tenancy Act", href: "/chat?q=Rent+Tenancy", icon: <Building2 size={18} className="text-blue-600" /> },
    { title: "Consumer Rights", code: "Consumer Protection", href: "/chat?q=Consumer+Rights", icon: <CheckSquare size={18} className="text-emerald-600" /> },
    { title: "Cyber Crime & Fraud", code: "IT Act 2000", href: "/chat?q=Cyber+Fraud", icon: <Lock size={18} className="text-red-600" /> },
    { title: "Cyber Bullying", code: "Section 66E / 67", href: "/chat?q=Cyber+Bullying", icon: <ShieldAlert size={18} className="text-rose-600" /> },
    { title: "Employment Law", code: "Labor Code / Wages", href: "/chat?q=Employment", icon: <FileText size={18} className="text-indigo-600" /> },
    { title: "Property & Land Law", code: "Transfer of Property", href: "/chat?q=Property+Law", icon: <FolderOpen size={18} className="text-cyan-600" /> },
    { title: "Marriage & Divorce", code: "Hindu / Special Marriage", href: "/chat?q=Marriage+Divorce", icon: <Award size={18} className="text-pink-600" /> },
    { title: "Domestic Violence", code: "DV Act 2005", href: "/chat?q=Domestic+Violence", icon: <ShieldCheck size={18} className="text-red-600" /> },
    { title: "RTI (Right to Info)", code: "RTI Act 2005", href: "/chat?q=RTI", icon: <BookOpen size={18} className="text-amber-600" /> },
    { title: "Police Complaints", code: "CrPC / BNSS FIR", href: "/chat?q=Police+Complaint", icon: <Gavel size={18} className="text-blue-600" /> },
    { title: "Traffic Rules & Fines", code: "Motor Vehicles Act", href: "/chat?q=Traffic+Rules", icon: <Clock size={18} className="text-orange-600" /> },
    { title: "Income Tax & Disputes", code: "Income Tax Act 1961", href: "/chat?q=Income+Tax", icon: <FileCheck size={18} className="text-emerald-600" /> },
    { title: "Copyright Protection", code: "Copyright Act 1957", href: "/chat?q=Copyright", icon: <Sparkles size={18} className="text-purple-600" /> },
    { title: "Trademark Registration", code: "Trademarks Act", href: "/chat?q=Trademark", icon: <CheckCircle2 size={18} className="text-blue-600" /> },
    { title: "YouTube & Digital IP", code: "DMCA / IP Guidelines", href: "/chat?q=Digital+IP", icon: <Video size={18} className="text-red-600" /> },
    { title: "Education Rights", code: "RTE Act 2009", href: "/chat?q=Education+Rights", icon: <BookOpen size={18} className="text-indigo-600" /> },
    { title: "Digital Privacy", code: "DPDP Act 2023", href: "/chat?q=Digital+Privacy", icon: <Lock size={18} className="text-cyan-600" /> },
    { title: "Banking Fraud", code: "RBI Ombudsman", href: "/chat?q=Banking+Fraud", icon: <Building2 size={18} className="text-emerald-600" /> },
    { title: "POSH at Workplace", code: "POSH Act 2013", href: "/chat?q=POSH", icon: <UserCheck size={18} className="text-purple-600" /> },
    { title: "POCSO Protection", code: "POCSO Act 2012", href: "/chat?q=POCSO", icon: <ShieldAlert size={18} className="text-rose-600" /> },
    { title: "Legal Aid & Free Counsel", code: "NALSA Act 1987", href: "/chat?q=Free+Legal+Aid", icon: <Scale size={18} className="text-blue-600" /> },
    { title: "Constitution of India", code: "Fundamental Rights", href: "/chat?q=Constitution", icon: <Gavel size={18} className="text-amber-600" /> },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-16 text-slate-900 dark:text-slate-100">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-12 lg:p-16 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
        {/* Subtle Gradient Backdrops */}
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />

        <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1.5 text-xs font-extrabold text-blue-700 ring-1 ring-blue-200/80 dark:bg-blue-950/60 dark:text-blue-300 dark:ring-blue-900">
              <Sparkles size={14} className="text-blue-600 animate-pulse" />
              <span>AI-Powered Indian Legal Intelligence Platform</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.1] text-slate-900 dark:text-white">
              Know Your Rights. <br />
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 bg-clip-text text-transparent">
                Understand the Law.
              </span> <br />
              Take the Right Action.
            </h1>

            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
              LegalSathi AI helps Indian citizens understand complex laws, draft formal legal documents, navigate cases step-by-step, and receive actionable legal guidance in plain language.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <Link
                href="/chat"
                className="flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-7 py-4 text-sm font-bold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-700 transition hover:scale-[1.02]"
              >
                <Bot size={18} />
                <span>Start AI Legal Chat</span>
              </Link>
              <Link
                href="/navigator"
                className="flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-7 py-4 text-sm font-bold text-slate-800 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700 transition"
              >
                <Sparkles size={18} className="text-blue-600" />
                <span>Explore Case Navigator</span>
              </Link>
            </div>

            {/* Quick Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 text-xs font-bold text-slate-600 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800">
              <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-500 shrink-0" /> 100% Free to Use</span>
              <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-500 shrink-0" /> Multilingual (Hi/Mr/En)</span>
              <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-500 shrink-0" /> AI Powered Engine</span>
              <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-500 shrink-0" /> Secure & Encrypted</span>
              <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-500 shrink-0" /> 24/7 Virtual Assistance</span>
              <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-500 shrink-0" /> Official Govt Links</span>
            </div>
          </div>

          {/* Right Product Graphic Card */}
          <div className="lg:col-span-5">
            <div className="relative rounded-3xl border border-blue-100 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 p-6 text-white shadow-2xl space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-3 w-3 rounded-full bg-red-500" />
                  <span className="flex h-3 w-3 rounded-full bg-amber-500" />
                  <span className="flex h-3 w-3 rounded-full bg-emerald-500" />
                </div>
                <span className="text-[11px] font-mono text-slate-400">LegalSathi AI v1.0</span>
              </div>

              <div className="space-y-3 font-mono text-xs">
                <div className="rounded-xl bg-slate-800/80 p-3 text-slate-300 border border-slate-700/60">
                  <span className="text-blue-400 font-bold">&gt; Query:</span> Landlord refusing to return deposit of ₹50,000.
                </div>
                <div className="rounded-xl bg-blue-900/40 p-3.5 text-blue-100 border border-blue-800/60 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-blue-300">
                    <span className="flex items-center gap-1.5"><Scale size={14} /> Analysis Complete</span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full">Model Confidence 98%</span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    <strong className="text-white">Applicable Act:</strong> Model Tenancy Act & State Rent Control Act.
                  </p>
                  <p className="text-[11px] text-slate-300">
                    <strong className="text-white">Action Steps:</strong> 1. Issue written notice (7 days). 2. Approach Rent Authority / Tribunal.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] text-slate-400">AI Legal Intelligence</span>
                <Link href="/chat" className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1">
                  Try Demo Prompt <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CORE FEATURE CARDS GRID */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-slate-200/80 pb-4 dark:border-slate-800">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Product Capabilities</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">Core Legal Features</h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Everything you need to navigate legal issues effortlessly.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            {
              title: 'AI Legal Chat',
              desc: 'Ask questions in plain language to get clear guidance under Indian statutory laws.',
              action: 'Start Chat',
              href: '/chat',
              icon: <Bot size={22} className="text-blue-600" />,
            },
            {
              title: 'Case Navigator',
              desc: 'Convert complex legal problems into step-by-step resolution roadmaps.',
              action: 'Launch Navigator',
              href: '/navigator',
              icon: <Sparkles size={22} className="text-indigo-600" />,
            },
            {
              title: 'Documents Studio',
              desc: 'Generate formal legal notices, affidavits, complaints, and rental agreements.',
              action: 'Draft Document',
              href: '/documents',
              icon: <FileText size={22} className="text-amber-600" />,
            },
            {
              title: 'My Cases Vault',
              desc: 'Track saved legal cases, progress checklists, and generated document drafts.',
              action: 'View Vault',
              href: '/dashboard',
              icon: <FolderOpen size={22} className="text-emerald-600" />,
            },
            {
              title: 'Legal Resources',
              desc: 'Direct links to official acts, Supreme Court judgments, and government portals.',
              action: 'Explore Resources',
              href: '/documents',
              icon: <BookOpen size={22} className="text-purple-600" />,
            },
            {
              title: 'Complaint Generator',
              desc: 'Auto-generate police complaints (FIR) and consumer grievance notices.',
              action: 'Generate Complaint',
              href: '/documents',
              icon: <FileCheck size={22} className="text-rose-600" />,
            },
            {
              title: 'Legal Templates',
              desc: 'Ready-to-use legal document templates formatted for Indian legal standards.',
              action: 'View Templates',
              href: '/documents',
              icon: <Layers size={22} className="text-cyan-600" />,
            },
            {
              title: 'Rights Awareness',
              desc: 'Learn constitutional rights, tenant rights, and worker rights in simple language.',
              action: 'Learn Rights',
              href: '/chat?q=Constitutional+Rights',
              icon: <Scale size={22} className="text-blue-600" />,
            },
          ].map((card, idx) => (
            <div
              key={idx}
              className="group flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-6 transition-all duration-200 hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="space-y-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 dark:bg-slate-800 group-hover:bg-blue-50 dark:group-hover:bg-slate-800 transition">
                  {card.icon}
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">{card.title}</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{card.desc}</p>
              </div>
              <div className="pt-6">
                <Link
                  href={card.href}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  <span>{card.action}</span>
                  <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. LEGAL CATEGORIES DIRECTORY (26+ Categories) */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-slate-200/80 pb-4 dark:border-slate-800">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Legal Domains</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">Explore Legal Categories</h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Click any legal category for instant AI breakdown.</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
          {legalCategories.map((cat, i) => (
            <Link
              key={i}
              href={cat.href}
              className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-4 transition hover:border-blue-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 group"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800">{cat.icon}</div>
                  <ArrowRight size={14} className="text-slate-300 group-hover:text-blue-600 transition" />
                </div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition line-clamp-1">
                  {cat.title}
                </h4>
              </div>
              <p className="mt-2 text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase">{cat.code}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. WHY LEGALSATHI AI TRUST SECTION */}
      <section className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-10 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
        <div className="max-w-3xl mx-auto text-center space-y-3 mb-8">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Built on Trust & Verification</span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">Why Citizens Choose LegalSathi AI</h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            LegalSathi AI is built to provide trustworthy, explainable, and accessible legal guidance rooted in official Indian statutory provisions.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { title: 'Trusted Official Sources', desc: 'All citations map to official government portals (.gov.in / .nic.in).', icon: <ShieldCheck size={24} className="text-emerald-600" /> },
            { title: 'Explainable AI Logic', desc: 'No black-box answers; every response cites relevant acts and sections.', icon: <Zap size={24} className="text-blue-600" /> },
            { title: 'Multilingual Support', desc: 'Ask and read legal explanations in English, Hindi, and Marathi.', icon: <Globe size={24} className="text-purple-600" /> },
            { title: 'Privacy & Security', desc: 'End-to-end encrypted sessions with strict data protection standard.', icon: <Lock size={24} className="text-indigo-600" /> },
          ].map((item, idx) => (
            <div key={idx} className="rounded-2xl border border-slate-100 bg-slate-50/70 p-5 dark:border-slate-800 dark:bg-slate-850 space-y-2">
              <div className="h-10 w-10 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center shadow-xs">{item.icon}</div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">{item.title}</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. ANNOUNCEMENTS & LEGAL NEWS */}
      <section className="rounded-3xl border border-blue-200 bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 p-6 sm:p-8 dark:border-blue-900/50 dark:from-slate-900 dark:to-slate-900">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 font-bold text-xs">
              <Megaphone size={16} />
              <span>Latest Government Announcement (2024-2026)</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              New Criminal Criminal Laws (BNS, BNSS, BSA) Fully Implemented Across India
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              Bharatiya Nyaya Sanhita (BNS) replaced IPC, BNSS replaced CrPC, and BSA replaced Evidence Act. LegalSathi AI provides citations for both old and new acts.
            </p>
          </div>
          <Link
            href="/chat?q=BNS+BNSS+New+Criminal+Laws"
            className="shrink-0 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition"
          >
            <span>Learn About New Laws</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      {/* 6. SAAS FOOTER */}
      <footer className="border-t border-slate-200/80 pt-12 pb-8 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 space-y-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          <div className="col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-blue-600 text-white font-bold">
                <Scale size={14} />
              </span>
              <span className="font-extrabold text-sm text-slate-900 dark:text-white">LegalSathi AI</span>
            </div>
            <p className="text-xs leading-relaxed max-w-sm">
              AI-powered multilingual Legal Information and Guidance Platform democratizing legal awareness across India.
            </p>
          </div>

          <div className="space-y-2">
            <p className="font-bold text-slate-900 dark:text-white text-xs uppercase">Platform</p>
            <ul className="space-y-1.5">
              <li><Link href="/chat" className="hover:text-blue-600">AI Legal Chat</Link></li>
              <li><Link href="/navigator" className="hover:text-blue-600">Case Navigator</Link></li>
              <li><Link href="/documents" className="hover:text-blue-600">Document Studio</Link></li>
              <li><Link href="/dashboard" className="hover:text-blue-600">My Cases Vault</Link></li>
            </ul>
          </div>

          <div className="space-y-2">
            <p className="font-bold text-slate-900 dark:text-white text-xs uppercase">Legal Portals</p>
            <ul className="space-y-1.5">
              <li><a href="https://www.india.gov.in" target="_blank" rel="noreferrer" className="hover:text-blue-600">India.gov.in</a></li>
              <li><a href="https://www.indiacode.nic.in" target="_blank" rel="noreferrer" className="hover:text-blue-600">India Code Portal</a></li>
              <li><a href="https://cybercrime.gov.in" target="_blank" rel="noreferrer" className="hover:text-blue-600">CyberCrime.gov.in</a></li>
              <li><a href="https://nalsa.gov.in" target="_blank" rel="noreferrer" className="hover:text-blue-600">NALSA Legal Aid</a></li>
            </ul>
          </div>

          <div className="space-y-2">
            <p className="font-bold text-slate-900 dark:text-white text-xs uppercase">Account & Support</p>
            <ul className="space-y-1.5">
              <li><Link href="/login" className="hover:text-blue-600">Sign In</Link></li>
              <li><Link href="/register" className="hover:text-blue-600">Create Account</Link></li>
              <li><Link href="/profile" className="hover:text-blue-600">Help & Support</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-100 dark:border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
          <p>© {new Date().getFullYear()} LegalSathi AI. All rights reserved. Designed for Indian Jurisprudence.</p>
          <div className="flex items-center gap-4">
            <span className="hover:underline">Privacy Policy</span>
            <span className="hover:underline">Terms of Service</span>
            <span className="hover:underline">Legal Disclaimer</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
