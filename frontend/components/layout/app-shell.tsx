'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Bell,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  FileCheck,
  FileText,
  FolderOpen,
  Globe,
  HelpCircle,
  Home,
  LogOut,
  Megaphone,
  Menu,
  MessageSquare,
  Moon,
  Scale,
  Search,
  Settings,
  Shield,
  ShieldCheck,
  Sparkles,
  Star,
  Sun,
  User,
  X,
  Zap,
} from 'lucide-react';
import CommandPalette from '../command-palette';
import EmergencyHelpline from '../emergency-helpline';

const STANDALONE_ROUTES = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/admin/login',
];

function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="group flex items-center gap-2.5" aria-label="LegalSathi AI home">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy text-white shadow-soft transition group-hover:bg-royal">
        <Scale size={20} strokeWidth={2.2} />
      </span>
      {!compact && (
        <span className="flex flex-col leading-none">
          <span className="text-[15px] font-bold tracking-tight text-navy-text">
            LegalSathi <span className="text-royal">AI</span>
          </span>
          <span className="mt-1 text-[10px] font-medium text-bodytext">Legal Guidance. For Everyone.</span>
        </span>
      )}
    </Link>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [currentLang, setCurrentLang] = useState('English');

  useEffect(() => {
    try {
      const uStr = localStorage.getItem('legalsathi_user');
      if (uStr) setUser(JSON.parse(uStr));
      else setUser(null);
      const code = localStorage.getItem('legalsathi_lang') || '';
      if (code === 'hi') setCurrentLang('Hindi');
      else if (code === 'mr') setCurrentLang('Marathi');
      else setCurrentLang('English');
    } catch {}
  }, [pathname]);

  const handleLangCycle = () => {
    setCurrentLang((prev) => {
      const next = prev === 'English' ? 'Hindi' : prev === 'Hindi' ? 'Marathi' : 'English';
      const code = next === 'English' ? 'en' : next === 'Hindi' ? 'hi' : 'mr';
      try {
        localStorage.setItem('legalsathi_lang', code);
        const uStr = localStorage.getItem('legalsathi_user');
        if (uStr) {
          const u = JSON.parse(uStr);
          u.preferred_language = code;
          localStorage.setItem('legalsathi_user', JSON.stringify(u));
          setUser(u);
        }
      } catch {}
      return next;
    });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setCmdOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const navGroups = [
    {
      group: 'Core Platform',
      items: [
        { label: 'Home', href: '/', icon: <Home size={17} /> },
        { label: 'AI Legal Chat', href: '/chat', icon: <MessageSquare size={17} /> },
        { label: 'Case Navigator', href: '/navigator', icon: <Sparkles size={17} /> },
        { label: 'Document Studio', href: '/documents', icon: <FileText size={17} /> },
        { label: 'My Cases & Vault', href: '/dashboard', icon: <FolderOpen size={17} /> },
      ],
    },
    {
      group: 'Legal Tools',
      items: [
        { label: 'Saved Results', href: '/dashboard', icon: <Star size={17} /> },
        { label: 'Legal Resources', href: '/documents', icon: <BookOpen size={17} /> },
        { label: 'Complaint Generator', href: '/documents', icon: <FileCheck size={17} /> },
        { label: 'Legal Templates', href: '/documents', icon: <FileText size={17} /> },
        { label: 'Rights Awareness', href: '/#rights', icon: <Scale size={17} /> },
        { label: 'Government Schemes', href: '/#schemes', icon: <Megaphone size={17} /> },
      ],
    },
    {
      group: 'System & Support',
      items: [
        { label: 'Settings', href: '/settings', icon: <Settings size={17} /> },
        { label: 'Help Center', href: '/profile', icon: <HelpCircle size={17} /> },
      ],
    },
  ];

  const getBreadcrumb = () => {
    if (pathname === '/') return 'Overview Dashboard';
    if (pathname.startsWith('/chat')) return 'AI Legal Chat Studio';
    if (pathname.startsWith('/navigator')) return 'Interactive Case Navigator';
    if (pathname.startsWith('/documents')) return 'Document Generator & Templates';
    if (pathname.startsWith('/dashboard')) return 'My Saved Cases & Repository';
    if (pathname.startsWith('/profile')) return 'User Profile & Settings';
    if (pathname.startsWith('/admin')) return 'Enterprise Admin Control Panel';
    return 'LegalSathi AI';
  };

  const handleLogout = () => {
    localStorage.removeItem('legalsathi_token');
    localStorage.removeItem('legalsathi_user');
    localStorage.removeItem('legalsathi_admin_token');
    router.push('/login');
  };

  const isLanding = pathname === '/';
  const isStandalone =
    STANDALONE_ROUTES.includes(pathname) || pathname.startsWith('/account');

  const rootClass = `min-h-screen ${darkMode ? 'dark bg-navy-deeper text-slate-100' : 'bg-slate-50 text-navy-text'}`;

  /* ---------- STANDALONE (marketing/auth, no chrome) ---------- */
  if (isStandalone) {
    return (
      <div className={rootClass}>
        <main>{children}</main>
        <CommandPalette isOpen={cmdOpen} onClose={() => setCmdOpen(false)} />
      </div>
    );
  }

  /* ---------- MARKETING HEADER (landing page only) ---------- */
  if (isLanding) {
    const marketingNav = [
      { label: 'Home', href: '/' },
      { label: 'Features', href: '/#features' },
      { label: 'How It Works', href: '/#how-it-works' },
      { label: 'About', href: '/#about' },
    ];
    return (
      <div className={rootClass}>
        <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur">
          <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <Logo />

            <nav className="hidden lg:flex items-center gap-8" aria-label="Main navigation">
              {marketingNav.map((item, i) => {
                const isActive = i === 0 && pathname === '/';
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`relative py-1 text-sm font-medium transition ${
                      isActive
                        ? 'font-semibold text-navy-text'
                        : 'text-bodytext hover:text-navy-text'
                    }`}
                  >
                    {item.label}
                    {isActive && (
                      <span className="absolute inset-x-0 -bottom-0.5 h-0.5 rounded-full bg-royal" />
                    )}
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => setDarkMode(!darkMode)}
                aria-label="Toggle dark mode"
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-line text-navy-text transition hover:border-royal/40 hover:bg-soft"
              >
                {darkMode ? <Sun size={17} /> : <Moon size={17} />}
              </button>

              <EmergencyHelpline
                variant="icon"
                triggerClassName="hidden h-10 w-10 sm:inline-flex"
              />

              {user ? (
                <div className="flex items-center gap-2">
                  <Link
                    href="/profile"
                    className="flex items-center gap-2 rounded-lg border border-line bg-white px-3 py-2 text-sm font-semibold text-navy-text transition hover:bg-soft"
                  >
                    <User size={15} />
                    <span className="hidden sm:inline">{user.first_name}</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    aria-label="Sign out"
                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-red-200 text-red-600 transition hover:bg-red-50"
                  >
                    <LogOut size={16} />
                  </button>
                </div>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="hidden sm:inline-flex h-10 items-center rounded-lg border border-royal/40 px-4 text-sm font-semibold text-navy-text transition hover:bg-soft"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="inline-flex h-10 items-center rounded-lg bg-navy px-4 text-sm font-semibold text-white shadow-soft transition hover:bg-royal"
                  >
                    Get Started
                  </Link>
                </>
              )}

              <button
                onClick={() => setMobileOpen(true)}
                aria-label="Open menu"
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-line text-navy-text lg:hidden"
              >
                <Menu size={19} />
              </button>
            </div>
          </div>
        </header>

        <main>{children}</main>

        <CommandPalette isOpen={cmdOpen} onClose={() => setCmdOpen(false)} />

        {/* Mobile marketing drawer */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-navy-deeper/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
            <div className="absolute left-0 top-0 h-full w-72 bg-white p-5 shadow-2xl">
              <div className="flex items-center justify-between">
                <Logo />
                <button
                  onClick={() => setMobileOpen(false)}
                  aria-label="Close menu"
                  className="rounded-lg p-2 text-bodytext hover:bg-slate-100"
                >
                  <X size={18} />
                </button>
              </div>
              <nav className="mt-8 space-y-4">
                {marketingNav.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="block border-b border-slate-100 pb-3 text-[15px] font-medium text-navy-text hover:text-royal"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
              <div className="mt-8 flex flex-col gap-3">
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg border border-royal/40 px-4 py-2.5 text-center text-sm font-semibold text-navy-text"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg bg-navy px-4 py-2.5 text-center text-sm font-semibold text-white"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  /* ---------- APP SHELL (sidebar + topbar) ---------- */
  const NavList = ({ collapsedNav = false }: { collapsedNav?: boolean }) => (
    <nav className="flex-1 space-y-4 overflow-y-auto px-3 py-2">
      {navGroups.map((group, idx) => (
        <div key={idx} className="space-y-1">
          {!collapsedNav && (
            <p className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-bodytext">
              {group.group}
            </p>
          )}
          {group.items.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-semibold transition-all ${
                  isActive
                    ? 'bg-navy text-white shadow-soft'
                    : darkMode
                    ? 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    : 'text-navy-text hover:bg-soft hover:text-royal'
                } ${collapsedNav ? 'justify-center px-0' : ''}`}
                title={collapsedNav ? item.label : undefined}
              >
                {item.icon}
                {!collapsedNav && <span>{item.label}</span>}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );

  const SidebarFooter = ({ collapsedNav = false }: { collapsedNav?: boolean }) => (
    <div className="border-t border-line p-3 dark:border-slate-800">
      <div className="flex items-center gap-2">
        <button
          onClick={() => setDarkMode(!darkMode)}
          aria-label="Toggle dark mode"
          className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-line px-2 py-2 text-xs font-semibold text-navy-text transition hover:bg-soft dark:border-slate-800 dark:text-amber-400"
        >
          {darkMode ? <Sun size={15} /> : <Moon size={15} />}
          {!collapsedNav && <span>{darkMode ? 'Light' : 'Dark'}</span>}
        </button>
        <button
          onClick={handleLangCycle}
          title="Change Language"
          className="flex items-center gap-1 rounded-lg border border-line px-2.5 py-2 text-[11px] font-bold text-navy-text transition hover:bg-soft dark:border-slate-800 dark:text-slate-300"
        >
          <Globe size={13} />
          {!collapsedNav && <span>{currentLang}</span>}
        </button>
      </div>

      {!collapsedNav && (
        <div className="mt-2.5 flex items-center gap-3 rounded-lg border border-line bg-slate-50 p-2.5 dark:border-slate-800 dark:bg-slate-800/60">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy text-xs font-bold text-white uppercase">
            {user?.first_name?.[0] || 'G'}
          </div>
          <div className="min-w-0 flex-1 text-left">
            {user ? (
              <>
                <p className="truncate text-xs font-bold text-navy-text dark:text-white">
                  {user.first_name} {user.last_name}
                </p>
                <Link href="/profile" className="block truncate text-[10px] font-semibold text-royal hover:underline">
                  Profile Settings
                </Link>
              </>
            ) : (
              <>
                <p className="truncate text-xs font-bold text-navy-text dark:text-white">Guest Session</p>
                <Link href="/login" className="block truncate text-[10px] font-semibold text-royal hover:underline">
                  Sign In / Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className={`${rootClass} flex`}>
      {/* Desktop sidebar */}
      <aside
        className={`sticky top-0 hidden h-screen flex-col border-r border-line transition-all duration-300 md:flex dark:border-slate-800 ${
          darkMode ? 'bg-[#0B1331]' : 'bg-white'
        } ${collapsed ? 'w-[68px]' : 'w-[268px]'}`}
      >
        <div className={`flex h-[68px] items-center border-b border-line dark:border-slate-800 ${collapsed ? 'justify-center px-2' : 'justify-between px-4'}`}>
          <Logo compact={collapsed} />
          {!collapsed && (
            <button
              onClick={() => setCollapsed(!collapsed)}
              aria-label="Collapse sidebar"
              className="rounded-lg p-1.5 text-bodytext transition hover:bg-slate-100 dark:text-slate-400"
            >
              <ChevronLeft size={16} />
            </button>
          )}
          {collapsed && (
            <button
              onClick={() => setCollapsed(!collapsed)}
              aria-label="Expand sidebar"
              className="rounded-lg p-1.5 text-bodytext transition hover:bg-slate-100"
            >
              <ChevronRight size={16} />
            </button>
          )}
        </div>

        <div className={`p-3 ${collapsed ? 'flex justify-center' : ''}`}>
          <button
            onClick={() => setCmdOpen(true)}
            className={`flex w-full items-center justify-between rounded-lg border border-line bg-slate-50 px-3 py-2 text-xs font-semibold text-bodytext transition hover:border-royal/40 hover:bg-white hover:text-royal dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 ${
              collapsed ? 'justify-center' : ''
            }`}
          >
            <span className="flex items-center gap-2">
              <Search size={14} />
              {!collapsed && <span>Search laws &amp; tools</span>}
            </span>
            {!collapsed && <kbd className="rounded bg-line px-1.5 py-0.5 font-mono text-[10px] text-navy-text dark:bg-slate-800 dark:text-slate-400">⌘K</kbd>}
          </button>
        </div>

        <NavList collapsedNav={collapsed} />

        {!collapsed && (
          <div className="mx-3 mb-2 rounded-xl border border-line bg-soft p-3.5 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-2 text-xs font-bold text-royal">
              <Zap size={14} />
              <span>Pro Plan Active</span>
            </div>
            <p className="mt-1 text-[11px] leading-tight text-bodytext dark:text-slate-400">
              Unlimited RAG queries, instant legal drafting &amp; priority response.
            </p>
          </div>
        )}

        <SidebarFooter collapsedNav={collapsed} />
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-navy-deeper/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 flex h-full w-72 flex-col border-r border-line bg-white p-4 dark:border-slate-800 dark:bg-[#0B1331]">
            <div className="mb-4 flex items-center justify-between">
              <Logo />
              <button
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
                className="rounded-lg p-2 text-bodytext hover:bg-slate-100 dark:text-slate-300"
              >
                <X size={18} />
              </button>
            </div>
            <NavList />
            <SidebarFooter />
          </aside>
        </div>
      )}

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-[68px] items-center justify-between border-b border-line bg-white/95 px-4 backdrop-blur sm:px-6 dark:border-slate-800 dark:bg-[#0B1331]/90">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              className="rounded-lg p-1.5 text-navy-text hover:bg-slate-100 md:hidden dark:text-slate-300"
            >
              <Menu size={20} />
            </button>
            <div>
              <h2 className="text-sm font-bold tracking-tight text-navy-text dark:text-white">{getBreadcrumb()}</h2>
              <p className="hidden text-[11px] text-bodytext sm:block dark:text-slate-400">
                LegalSathi AI · Enterprise Legal Workspace
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setCmdOpen(true)}
              className="hidden items-center gap-2 rounded-lg border border-line bg-slate-50 px-3.5 py-2 text-xs font-medium text-bodytext transition hover:border-royal/40 hover:bg-white hover:text-royal sm:flex dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400"
            >
              <Search size={14} />
              <span>Ask or search anything...</span>
              <kbd className="rounded bg-line px-1.5 py-0.5 font-mono text-[10px] text-navy-text dark:bg-slate-800 dark:text-slate-400">⌘K</kbd>
            </button>

            <EmergencyHelpline
              variant="icon"
              triggerClassName="hidden h-10 w-10 sm:inline-flex"
            />

            <Link
              href="/settings"
              aria-label="Settings"
              className="rounded-lg border border-line p-2 text-navy-text transition hover:bg-slate-100 dark:border-slate-800 dark:text-slate-300"
            >
              <Settings size={16} />
            </Link>

            <button
              aria-label="Notifications"
              className="relative rounded-lg border border-line p-2 text-navy-text transition hover:bg-slate-100 dark:border-slate-800 dark:text-slate-300"
            >
              <Bell size={16} />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-royal ring-2 ring-white dark:ring-[#0B1331]" />
            </button>

            {user ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/profile"
                  className="flex items-center gap-2 rounded-lg bg-soft px-3 py-2 text-xs font-bold text-navy-text transition hover:bg-line dark:bg-slate-800 dark:text-slate-200"
                >
                  <User size={14} />
                  <span className="hidden sm:inline">{user.first_name}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  title="Sign Out"
                  className="rounded-lg border border-red-200 bg-red-50 p-2 text-red-600 transition hover:bg-red-100 dark:border-red-900/50 dark:bg-red-950 dark:text-red-400"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="rounded-lg px-3 py-2 text-xs font-bold text-navy-text hover:text-royal dark:text-slate-300"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="rounded-lg bg-navy px-3.5 py-2 text-xs font-bold text-white shadow-soft transition hover:bg-royal"
                >
                  Get Started Free
                </Link>
              </div>
            )}
          </div>
        </header>

        <main className="min-w-0 flex-1">{children}</main>
      </div>

      <CommandPalette isOpen={cmdOpen} onClose={() => setCmdOpen(false)} />
    </div>
  );
}