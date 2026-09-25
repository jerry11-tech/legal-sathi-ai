'use client';

import Link from 'next/link';
import GovtAnnouncementsWidget from '@/components/govt-announcements-widget';
import {
  Accessibility,
  ArrowRight,
  Award,
  BookOpen,
  Bot,
  Building2,
  Check,
  CheckCircle2,
  CheckSquare,
  Clock,
  Compass,
  Crown,
  FileCheck,
  FileText,
  FolderOpen,
  Gavel,
  Globe,
  HeartHandshake,
  Info,
  Layers,
  Lock,
  Megaphone,
  MessagesSquare,
  Pin,
  Scale,
  Send,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Star,
  User,
  UserCheck,
  Users,
  Video,
  Zap,
} from 'lucide-react';

const legalCategories = [
  { title: "Women's Rights", code: "POSH / DV Act", href: "/chat?q=Women+Rights", icon: <Shield size={18} /> },
  { title: "Children Rights", code: "POCSO / RTE", href: "/chat?q=Children+Rights", icon: <HeartHandshake size={18} /> },
  { title: "Senior Citizen Rights", code: "Maintenance Act", href: "/chat?q=Senior+Citizen", icon: <Users size={18} /> },
  { title: "Rental & Tenancy Laws", code: "Model Tenancy Act", href: "/chat?q=Rent+Tenancy", icon: <Building2 size={18} /> },
  { title: "Consumer Rights", code: "Consumer Protection", href: "/chat?q=Consumer+Rights", icon: <CheckSquare size={18} /> },
  { title: "Cyber Crime & Fraud", code: "IT Act 2000", href: "/chat?q=Cyber+Fraud", icon: <Lock size={18} /> },
  { title: "Cyber Bullying", code: "Section 66E / 67", href: "/chat?q=Cyber+Bullying", icon: <ShieldAlert size={18} /> },
  { title: "Employment Law", code: "Labor Code / Wages", href: "/chat?q=Employment", icon: <FileText size={18} /> },
  { title: "Property & Land Law", code: "Transfer of Property", href: "/chat?q=Property+Law", icon: <FolderOpen size={18} /> },
  { title: "Marriage & Divorce", code: "Hindu / Special Marriage", href: "/chat?q=Marriage+Divorce", icon: <Award size={18} /> },
  { title: "Domestic Violence", code: "DV Act 2005", href: "/chat?q=Domestic+Violence", icon: <ShieldCheck size={18} /> },
  { title: "RTI (Right to Info)", code: "RTI Act 2005", href: "/chat?q=RTI", icon: <BookOpen size={18} /> },
  { title: "Police Complaints", code: "CrPC / BNSS FIR", href: "/chat?q=Police+Complaint", icon: <Gavel size={18} /> },
  { title: "Traffic Rules & Fines", code: "Motor Vehicles Act", href: "/chat?q=Traffic+Rules", icon: <Clock size={18} /> },
  { title: "Income Tax & Disputes", code: "Income Tax Act 1961", href: "/chat?q=Income+Tax", icon: <FileCheck size={18} /> },
  { title: "Copyright Protection", code: "Copyright Act 1957", href: "/chat?q=Copyright", icon: <Sparkles size={18} /> },
  { title: "Trademark Registration", code: "Trademarks Act", href: "/chat?q=Trademark", icon: <CheckCircle2 size={18} /> },
  { title: "YouTube & Digital IP", code: "DMCA / IP Guidelines", href: "/chat?q=Digital+IP", icon: <Video size={18} /> },
  { title: "Education Rights", code: "RTE Act 2009", href: "/chat?q=Education+Rights", icon: <BookOpen size={18} /> },
  { title: "Digital Privacy", code: "DPDP Act 2023", href: "/chat?q=Digital+Privacy", icon: <Lock size={18} /> },
  { title: "Banking Fraud", code: "RBI Ombudsman", href: "/chat?q=Banking+Fraud", icon: <Building2 size={18} /> },
  { title: "POSH at Workplace", code: "POSH Act 2013", href: "/chat?q=POSH", icon: <UserCheck size={18} /> },
  { title: "POCSO Protection", code: "POCSO Act 2012", href: "/chat?q=POCSO", icon: <ShieldAlert size={18} /> },
  { title: "Legal Aid & Free Counsel", code: "NALSA Act 1987", href: "/chat?q=Free+Legal+Aid", icon: <Scale size={18} /> },
  { title: "Constitution of India", code: "Fundamental Rights", href: "/chat?q=Constitution", icon: <Gavel size={18} /> },
];

const trustIndicators = [
  { icon: <Check size={13} strokeWidth={3} />, label: 'AI Powered' },
  { icon: <Check size={13} strokeWidth={3} />, label: 'Verified Sources' },
  { icon: <Globe size={13} strokeWidth={2.4} />, label: 'Multilingual' },
  { icon: <Lock size={13} strokeWidth={2.4} />, label: 'Secure & Private' },
];

const features = [
  {
    title: 'AI Legal Chat Assistant',
    desc: 'Get instant answers with verified legal information.',
    href: '/chat',
    icon: <MessagesSquare size={21} />,
  },
  {
    title: 'Case Navigator',
    desc: 'Analyze your case and get a step-by-step action plan.',
    href: '/navigator',
    icon: <Compass size={21} />,
  },
  {
    title: 'Document Generator',
    desc: 'Create legal documents with ready-to-use templates.',
    href: '/documents',
    icon: <FileText size={21} />,
  },
  {
    title: 'Evidence Vault',
    desc: 'Securely store and manage your evidence files.',
    href: '/documents',
    icon: <ShieldCheck size={21} />,
  },
  {
    title: 'Legal Announcements',
    desc: 'Stay updated with the latest government notifications and law changes.',
    href: '/#schemes',
    icon: <Megaphone size={21} />,
  },
  {
    title: 'Profile & Account',
    desc: 'Manage your profile, settings and account securely.',
    href: '/profile',
    icon: <User size={21} />,
  },
  {
    title: 'Multi-Language Support',
    desc: 'Get help in multiple languages for better accessibility.',
    href: '/chat',
    icon: <Globe size={21} />,
  },
];

const steps = [
  { num: '01', title: 'Ask', desc: 'Describe your legal issue.', icon: <MessagesSquare size={18} />, tint: 'bg-soft text-royal' },
  { num: '02', title: 'Analyze', desc: 'Get domain & relevant laws.', icon: <Compass size={18} />, tint: 'bg-soft text-royal' },
  { num: '03', title: 'Plan', desc: 'View action plan & next steps.', icon: <ClipboardCheck />, tint: 'bg-emerald-50 text-mint' },
  { num: '04', title: 'Generate', desc: 'Create legal documents.', icon: <FileText size={18} />, tint: 'bg-emerald-50 text-mint' },
  { num: '05', title: 'Save', desc: 'Store evidence & track case.', icon: <FolderOpen size={18} />, tint: 'bg-orange-50 text-orange-600' },
  { num: '06', title: 'Access', desc: 'Get updates & support.', icon: <Globe size={18} />, tint: 'bg-emerald-50 text-emerald-600' },
];

const securityChecks = [
  'Original files are not overwritten',
  'Protected copies are generated separately',
  'Sensitive information can be redacted',
  'SHA-256 hashing for file integrity',
  'Authentication protects user access',
  'Audit logs record important operations',
];

function ClipboardCheck() {
  return (
    <span className="flex h-[18px] w-[18px] items-center justify-center">
      <CheckCircle2 size={18} />
    </span>
  );
}

function HeroChatMockup() {
  const domains = ['Women’s Rights', 'Children’s Rights', 'Senior Citizens', 'Rental Laws', 'Cyber Crime', 'Copyright', 'Consumer Rights'];
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-panel">
      <div className="flex">
        {/* Sidebar */}
        <div className="hidden w-[30%] border-r border-line bg-slate-50/80 sm:block">
          <div className="border-b border-line px-4 py-3.5">
            <p className="text-[13px] font-bold text-navy-text">
              LegalSathi <span className="text-royal">AI</span>
            </p>
            <p className="text-[10px] text-bodytext">Legal Guidance. For Everyone.</p>
          </div>
          <div className="space-y-1 px-3 py-3">
            {[
              { icon: <Star size={13} />, label: 'New Chat' },
              { icon: <Pin size={13} />, label: 'Pinned' },
              { icon: <Clock size={13} />, label: 'Recent' },
            ].map((it, i) => (
              <div key={i} className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-navy-text">
                <span className="text-royal">{it.icon}</span>
                {it.label}
              </div>
            ))}
          </div>
          <div className="px-4 pb-1 pt-2 text-[10px] font-bold uppercase tracking-wider text-bodytext">Legal Domains</div>
          <div className="space-y-0.5 px-3 pb-4">
            {domains.map((d, i) => (
              <div key={i} className="flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-[11px] text-bodytext">
                <span className="h-1.5 w-1.5 rounded-full bg-royal/70" />
                {d}
              </div>
            ))}
            <div className="px-2.5 pt-1 text-[11px] font-semibold text-royal">More →</div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-navy text-white">
                <Bot size={15} />
              </span>
              <div>
                <p className="text-xs font-bold text-navy-text">Legal Chat Assistant</p>
                <p className="flex items-center gap-1 text-[10px] font-medium text-emerald-600">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Online
                </p>
              </div>
            </div>
            <div className="flex gap-2 text-bodytext">
              <CheckCircle2 size={15} />
              <Star size={15} />
            </div>
          </div>

          <div className="flex-1 space-y-3 px-4 py-4">
            <div className="flex justify-end">
              <p className="max-w-[240px] rounded-2xl rounded-br-sm bg-royal px-3.5 py-2.5 text-xs leading-relaxed text-white">
                I am facing harassment at my workplace. What are my rights?
              </p>
            </div>

            <div className="rounded-xl border border-line bg-white p-3.5 shadow-soft">
              <p className="text-[11px] font-semibold text-navy-text">
                Here’s a summary of your rights under the POSH Act, 2013:
              </p>
              <ul className="mt-2 space-y-1.5 text-[11px] leading-relaxed text-bodytext">
                <li className="flex gap-2"><Check size={12} className="mt-0.5 shrink-0 text-emerald-500" /> You have the right to a safe and respectful workplace.</li>
                <li className="flex gap-2"><Check size={12} className="mt-0.5 shrink-0 text-emerald-500" /> The Internal Complaints Committee (ICC) must be formed in every organization with 10+ employees.</li>
                <li className="flex gap-2"><Check size={12} className="mt-0.5 shrink-0 text-emerald-500" /> You can file a complaint within 3 months of the incident.</li>
              </ul>
              <div className="mt-2 flex items-center justify-between">
                <span className="flex items-center gap-1 text-[11px] font-bold text-royal">Show more <ArrowRight size={12} /></span>
                <span className="rounded-full bg-[#16A085]/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600">Confidence: 92%</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-soft px-2.5 py-1 text-[10px] font-bold text-royal">
                <Shield size={11} /> Women’s Rights
              </span>
            </div>
          </div>

          <div className="border-t border-line px-4 py-3">
            <div className="flex items-center gap-2 rounded-full border border-line bg-slate-50 px-4 py-2.5">
              <span className="flex-1 text-[11px] text-bodytext">Ask a legal question...</span>
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-royal text-white">
                <Send size={13} />
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const year = new Date().getFullYear();

  return (
    <div className="text-navy-text">
      {/* ============ HERO ============ */}
      <section id="hero" className="relative overflow-hidden bg-hero">
        <div className="pointer-events-none absolute -right-40 -top-40 h-[480px] w-[480px] rounded-full bg-[#E4EFFF] blur-3xl" />
        <div className="pointer-events-none absolute -left-32 top-24 h-[360px] w-[360px] rounded-full bg-soft blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
            <div className="lg:col-span-6">
              <span className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-royal shadow-soft">
                <Sparkles size={13} />
                AI-Powered Legal Assistant
              </span>

              <h1 className="mt-5 text-[38px] font-bold leading-[1.1] tracking-tight text-navy-text sm:text-5xl lg:text-[52px]">
                Your Legal Support
                <br />
                <span className="text-navy-deeper">Starts Here</span>
              </h1>

              <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-bodytext">
                Get instant legal guidance, understand your rights, find relevant laws and take
                the right steps — all in one place.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2">
                {trustIndicators.map((t, i) => (
                  <span key={i} className="flex items-center gap-2 text-[13px] font-semibold text-navy-text">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-royal/10 text-royal">
                      {t.icon}
                    </span>
                    {t.label}
                  </span>
                ))}
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link
                  href="/register"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-navy px-6 text-sm font-semibold text-white shadow-navy transition hover:bg-royal"
                >
                  Get Started <ArrowRight size={16} />
                </Link>
                <Link
                  href="/chat"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-md border border-royal/40 bg-white px-6 text-sm font-semibold text-navy-text transition hover:bg-soft"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-royal/10 text-royal">
                    <svg width="10" height="12" viewBox="0 0 10 12" fill="currentColor" aria-hidden="true">
                      <path d="M1 1.5v9l8-4.5-8-4.5Z" />
                    </svg>
                  </span>
                  Watch Demo
                </Link>
              </div>
            </div>

            <div className="lg:col-span-6">
              <HeroChatMockup />
            </div>
          </div>
        </div>
      </section>

      {/* ============ TRUST STRIP ============ */}
      <section id="trust" className="border-y border-line bg-soft">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-0 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
          {[
            { icon: <Lock size={20} />, title: 'Secure Processing', desc: 'Your data is protected with modern security practices.' },
            { icon: <ShieldCheck size={20} />, title: 'Privacy Focused', desc: 'Your information stays confidential and in your control.' },
            { icon: <Globe size={20} />, title: 'Multilingual Support', desc: 'Access legal information in your preferred language.' },
            { icon: <Accessibility size={20} />, title: 'Accessibility Ready', desc: 'From text to Braille, we make legal support inclusive.' },
          ].map((c, i) => (
            <div
              key={i}
              className={`flex items-start gap-4 px-6 py-7 lg:px-8 ${i > 0 ? 'lg:border-l lg:border-line' : ''} ${
                i % 2 === 1 ? 'sm:border-l sm:border-line' : ''
              } ${i >= 2 ? 'sm:border-t sm:border-line lg:border-t-0' : ''}`}
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-royal shadow-soft">
                {c.icon}
              </span>
              <div>
                <h3 className="text-sm font-bold text-navy-text">{c.title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-bodytext">{c.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ============ FEATURES ============ */}
      <section id="features" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-bold uppercase tracking-[0.15em] text-royal">Key Features</span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-navy-text sm:text-4xl">
            Everything you need for legal support
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-bodytext">
            Powerful tools to help you understand, protect and manage your legal matters.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => (
            <Link
              key={i}
              href={f.href}
              className="group flex flex-col justify-between rounded-xl border border-line bg-white p-6 shadow-soft transition-all duration-200 hover:-translate-y-1 hover:border-royal/40 hover:shadow-card"
            >
              <div>
                <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-soft text-royal transition group-hover:bg-royal group-hover:text-white">
                  {f.icon}
                </span>
                <h3 className="mt-4 text-[16px] font-bold text-navy-text">{f.title}</h3>
                <p className="mt-2 text-[13px] leading-relaxed text-bodytext">{f.desc}</p>
              </div>
              <span className="mt-5 flex items-center gap-1.5 text-[13px] font-semibold text-royal">
                <span className="opacity-0 transition group-hover:opacity-100">Here</span>
                <ArrowRight size={15} className="-ml-1 transition-transform duration-200 group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ============ LEGAL CATEGORIES ============ */}
      <section id="categories" className="border-t border-line bg-white">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.15em] text-royal">Legal Domains</span>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-navy-text">Explore legal categories</h2>
              <p className="mt-3 text-[15px] text-bodytext">Click any legal category for an instant AI breakdown.</p>
            </div>
            <Link
              href="/chat"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-royal px-5 text-sm font-semibold text-white transition hover:bg-bright"
            >
              Ask LegalSathi AI <ArrowRight size={15} />
            </Link>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {legalCategories.map((cat, i) => (
              <Link
                key={i}
                href={cat.href}
                className="group flex flex-col justify-between rounded-xl border border-line bg-white p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-royal/40 hover:shadow-soft"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-soft text-royal">
                      {cat.icon}
                    </span>
                    <ArrowRight size={14} className="text-line transition group-hover:text-royal" />
                  </div>
                  <h4 className="line-clamp-1 text-xs font-bold text-navy-text">{cat.title}</h4>
                </div>
                <p className="mt-2 text-[10px] font-semibold uppercase text-bodytext">{cat.code}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ============ ANNOUNCEMENTS ============ */}
      <section id="schemes" className="border-t border-line bg-slate-50/70">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="mb-10 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-royal text-white">
              <Megaphone size={18} />
            </span>
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-navy-text">Legal announcements & law updates</h2>
              <p className="text-sm text-bodytext">Verified government notifications and gazette updates.</p>
            </div>
          </div>
          <GovtAnnouncementsWidget />

          <div className="mt-10 rounded-xl border border-line bg-soft p-6 sm:p-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="flex gap-4">
                <span className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-navy text-white sm:flex">
                  <Gavel size={20} />
                </span>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-royal">New Criminal Laws · 2024–2026</p>
                  <h3 className="mt-1 text-lg font-bold text-navy-text">
                    BNS, BNSS and BSA now replace the IPC, CrPC and Evidence Act.
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-bodytext">
                    LegalSathi AI provides citations for both the old and the new acts, so you always stay aligned with current law.
                  </p>
                </div>
              </div>
              <Link
                href="/chat?q=BNS+BNSS+New+Criminal+Laws"
                className="shrink-0 inline-flex h-11 items-center justify-center gap-2 rounded-md bg-navy px-5 text-sm font-semibold text-white transition hover:bg-royal"
              >
                Learn About New Laws <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ============ HOW IT WORKS ============ */}
      <section id="how-it-works" className="bg-[#F0F6FF]">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <span className="text-xs font-bold uppercase tracking-[0.15em] text-royal">How It Works</span>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-navy-text">Get help in 6 simple steps</h2>
              <p className="mt-4 text-[15px] leading-relaxed text-bodytext">
                From your question to action — LegalSathi AI guides you every step of the way.
              </p>
              <Link
                href="/chat"
                className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-md bg-navy px-5 text-sm font-semibold text-white transition hover:bg-royal"
              >
                Start Now <ArrowRight size={15} />
              </Link>
            </div>

            <div className="lg:col-span-8">
              <div className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-3">
                {steps.map((s, i) => (
                  <div key={s.num} className="relative">
                    {i < steps.length - 1 && (
                      <span className="absolute -right-6 top-5 hidden text-royal/40 sm:block">
                        <ArrowRight size={16} />
                      </span>
                    )}
                    <div className="flex items-start gap-3.5">
                      <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${s.tint}`}>
                        {s.icon}
                      </span>
                      <div>
                        <p className="text-[11px] font-bold tracking-wide text-bodytext">{s.num}</p>
                        <h3 className="text-[15px] font-bold text-navy-text">{s.title}</h3>
                        <p className="mt-1 text-xs leading-relaxed text-bodytext">{s.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ SECURITY + ACCESSIBILITY ============ */}
      <section id="rights" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-emerald-100 bg-[#F0FBF8] p-8">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-mint text-white">
              <ShieldCheck size={22} />
            </span>
            <h2 className="mt-5 text-2xl font-bold text-navy-text">Security & Privacy</h2>
            <p className="mt-1 text-sm font-semibold text-mint">Your data, your control.</p>
            <p className="mt-3 text-sm leading-relaxed text-bodytext">
              We follow strict security practices to keep your information safe and private.
            </p>
            <ul className="mt-6 space-y-3">
              {securityChecks.map((c, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-navy-text">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white text-mint shadow-soft">
                    <Check size={12} strokeWidth={3} />
                  </span>
                  {c}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-accentpurple/20 bg-[#F3F2FD] p-8">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-accentpurple text-white">
              <Accessibility size={22} />
            </span>
            <h2 className="mt-5 text-2xl font-bold text-navy-text">Accessibility</h2>
            <p className="mt-1 text-sm font-semibold text-accentpurple">Documents should be accessible to everyone.</p>
            <p className="mt-3 text-sm leading-relaxed text-bodytext">
              We support Braille output so that important information can be read by all.
            </p>

            <div className="mt-6 flex items-center gap-4 rounded-xl border border-accentpurple/25 bg-white p-5">
              <div className="grid grid-cols-2 gap-x-2 gap-y-1.5" aria-hidden="true">
                {[[1, 4], [1, 2], [2, 5], [1], [2, 5], [2, 5], [1, 4]].map((row, i) => (
                  <div key={i} className="col-span-2 flex gap-1.5">
                    {[0, 1].map((col) => (
                      <span
                        key={col}
                        className={`h-2 w-2 rounded-full ${row.includes(col + 1) ? 'bg-navy' : 'border border-line'}`}
                      />
                    ))}
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-navy-text">Text</span>
                <ArrowRight size={15} className="text-accentpurple" />
                <span className="rounded-full bg-accentpurple/10 px-3 py-1 text-xs font-bold text-accentpurple">Braille</span>
              </div>
            </div>
          </div>
        </div>

        {/* Legal disclaimer */}
        <div id="disclaimer" className="mt-10 flex items-start gap-3 rounded-xl border border-line bg-slate-50 px-5 py-4">
          <Info size={17} className="mt-0.5 shrink-0 text-royal" />
          <p className="text-xs leading-relaxed text-bodytext">
            <span className="font-bold text-navy-text">Legal Disclaimer:</span> LegalSathi AI provides general legal
            information for educational purposes only and is not a substitute for professional legal advice. Always
            consult a licensed advocate for official legal representation or advice on your specific case.
          </p>
        </div>
      </section>

      {/* ============ FINAL CTA ============ */}
      <section id="cta" className="relative overflow-hidden bg-navy-deeper">
        <div className="pointer-events-none absolute -right-32 top-0 h-[420px] w-[420px] rounded-full bg-bright/20 blur-3xl" />
        <div className="pointer-events-none absolute -left-24 bottom-0 h-[300px] w-[300px] rounded-full bg-accentpurple/15 blur-3xl" />
        <div className="relative mx-auto flex max-w-7xl flex-col items-start gap-10 px-4 py-20 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="max-w-xl">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-bright">Ready to get started?</span>
            <h2 className="mt-4 text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl">
              Protect your rights. Get the legal support you deserve.
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-slate-300">
              Start using LegalSathi AI today and take control of your legal journey.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/register"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-gradient-to-r from-royal to-bright px-6 text-sm font-semibold text-white transition hover:opacity-95"
              >
                Get Started <ArrowRight size={16} />
              </Link>
              <Link
                href="/chat"
                className="inline-flex h-12 items-center justify-center rounded-md border border-white/25 px-6 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Try Demo
              </Link>
            </div>
          </div>

          <div className="relative hidden lg:block">
            <div className="absolute inset-0 -m-10 rounded-full bg-gradient-to-br from-bright/25 to-transparent blur-2xl" />
            <span className="relative flex h-40 w-40 items-center justify-center rounded-3xl border border-white/10 bg-white/5">
              <Crown size={64} className="text-soft" />
            </span>
          </div>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer id="about" className="bg-navy-deeper text-slate-300">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-12">
            <div className="md:col-span-5">
              <div className="flex items-center gap-2.5">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white">
                  <Scale size={20} />
                </span>
                <span className="text-[15px] font-bold text-white">
                  LegalSathi <span className="text-bright">AI</span>
                </span>
              </div>
              <p className="mt-3 text-sm font-medium text-slate-400">Legal Guidance. For Everyone.</p>
              <div className="mt-6 space-y-2 text-xs leading-relaxed text-slate-400">
                <a href="https://www.india.gov.in" target="_blank" rel="noreferrer" className="block transition hover:text-white">
                  India.gov.in
                </a>
                <a href="https://www.indiacode.nic.in" target="_blank" rel="noreferrer" className="block transition hover:text-white">
                  India Code Portal
                </a>
                <a href="https://cybercrime.gov.in" target="_blank" rel="noreferrer" className="block transition hover:text-white">
                  CyberCrime.gov.in
                </a>
                <a href="https://nalsa.gov.in" target="_blank" rel="noreferrer" className="block transition hover:text-white">
                  NALSA Legal Aid
                </a>
              </div>
            </div>

            <div className="md:col-span-3">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Explore</p>
              <ul className="mt-4 space-y-3 text-sm">
                <li><a href="/#features" className="transition hover:text-white">Features</a></li>
                <li><a href="/#how-it-works" className="transition hover:text-white">How It Works</a></li>
                <li><a href="/#about" className="transition hover:text-white">About</a></li>
                <li><a href="/#disclaimer" className="transition hover:text-white">Disclaimer</a></li>
              </ul>
            </div>

            <div className="md:col-span-4">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Platform</p>
              <ul className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <li><Link href="/chat" className="transition hover:text-white">AI Legal Chat</Link></li>
                <li><Link href="/navigator" className="transition hover:text-white">Case Navigator</Link></li>
                <li><Link href="/documents" className="transition hover:text-white">Document Studio</Link></li>
                <li><Link href="/dashboard" className="transition hover:text-white">My Cases Vault</Link></li>
                <li><Link href="/login" className="transition hover:text-white">Sign In</Link></li>
                <li><Link href="/register" className="transition hover:text-white">Create Account</Link></li>
              </ul>
            </div>
          </div>

          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 text-xs text-slate-400 sm:flex-row">
            <p>© {year} LegalSathi AI. All rights reserved.</p>
            <p>
              <a href="/#disclaimer" className="transition hover:text-white">Privacy</a>
              <span className="mx-2">·</span>
              <a href="/#disclaimer" className="transition hover:text-white">Terms</a>
              <span className="mx-2">·</span>
              <a href="/#disclaimer" className="transition hover:text-white">Legal Disclaimer</a>
            </p>
          </div>
        </div>
      </footer>

      {/* Scroll CTA button (floating on landing) */}
      <Link
        href="/chat"
        className="fixed bottom-6 left-6 z-30 hidden items-center gap-2 rounded-full bg-navy px-4 py-2.5 text-xs font-semibold text-white shadow-navy transition hover:bg-royal lg:inline-flex"
        aria-label="Start a legal chat"
      >
        <Bot size={15} /> Ask a legal question
      </Link>
    </div>
  );
}