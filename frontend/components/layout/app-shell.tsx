'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ChevronLeft,
  ChevronRight,
  FileText,
  FolderOpen,
  Home,
  Menu,
  MessageSquare,
  Moon,
  Search,
  Settings,
  Shield,
  Sparkles,
  Sun,
  X,
} from 'lucide-react';
import CommandPalette from '../command-palette';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    try {
      const uStr = localStorage.getItem('legalsathi_user');
      if (uStr) setUser(JSON.parse(uStr));
    } catch {}
  }, [pathname]);

  // Global Ctrl + K listener
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

  const navItems = [
    { label: 'Home', href: '/', icon: <Home size={18} /> },
    { label: 'AI Chat', href: '/chat', icon: <MessageSquare size={18} /> },
    { label: 'Case Navigator', href: '/navigator', icon: <Sparkles size={18} /> },
    { label: 'Documents', href: '/documents', icon: <FileText size={18} /> },
    { label: 'My Cases', href: '/dashboard', icon: <FolderOpen size={18} /> },
  ];

  return (
    <div className={`flex min-h-screen ${darkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      {/* Sidebar for Desktop */}
      <aside
        className={`hidden md:flex flex-col border-r transition-all duration-300 z-20 ${
          darkMode ? 'border-slate-800 bg-slate-900' : 'border-slate-200/80 bg-white'
        } ${collapsed ? 'w-16' : 'w-64'}`}
      >
        {/* Sidebar Header */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-slate-100 dark:border-slate-800">
          {!collapsed && (
            <Link href="/" className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-600/30">
                <Shield size={16} />
              </span>
              <span className="font-bold text-base tracking-tight text-slate-900 dark:text-white">
                LegalSathi <span className="text-blue-600">AI</span>
              </span>
            </Link>
          )}
          {collapsed && (
            <Link href="/" className="mx-auto flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
              <Shield size={16} />
            </Link>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 transition"
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Command Palette Quick Trigger */}
        <div className="p-3">
          <button
            onClick={() => setCmdOpen(true)}
            className={`w-full flex items-center gap-2.5 rounded-xl border px-3 py-2 text-xs font-semibold transition ${
              darkMode
                ? 'border-slate-800 bg-slate-850 text-slate-400 hover:border-slate-700'
                : 'border-slate-200/80 bg-slate-50 text-slate-500 hover:border-blue-300 hover:bg-white hover:text-blue-600'
            }`}
          >
            <Search size={14} />
            {!collapsed && <span>Search (Ctrl + K)</span>}
          </button>
        </div>

        {/* Main Navigation Links */}
        <nav className="flex-1 space-y-1.5 p-3">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-bold transition ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/20'
                    : darkMode
                    ? 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                } ${collapsed ? 'justify-center px-0' : ''}`}
                title={collapsed ? item.label : undefined}
              >
                {item.icon}
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer Profile & Dark Mode */}
        <div className="border-t border-slate-100 dark:border-slate-800 p-3 space-y-2">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`w-full flex items-center gap-3 rounded-xl p-2.5 text-xs font-semibold transition ${
              darkMode ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100'
            } ${collapsed ? 'justify-center' : ''}`}
          >
            {darkMode ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} />}
            {!collapsed && <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>}
          </button>

          {!collapsed && (
            <div className="flex items-center gap-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 p-2.5 border border-slate-100 dark:border-slate-800">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white uppercase">
                {user?.first_name?.[0] || 'G'}
              </div>
              <div className="overflow-hidden text-left flex-1">
                {user ? (
                  <>
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {user.first_name} {user.last_name}
                    </p>
                    <Link href="/profile" className="text-[10px] text-blue-600 hover:underline block truncate font-semibold">
                      Profile & Account
                    </Link>
                  </>
                ) : (
                  <>
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">Guest User</p>
                    <Link href="/login" className="text-[10px] text-blue-600 hover:underline block truncate font-semibold">
                      Sign In / Register
                    </Link>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Drawer Navigation */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => setMobileOpen(false)} />
          <div className="relative flex w-64 flex-col bg-white dark:bg-slate-900 p-4 shadow-xl">
            <div className="flex items-center justify-between pb-4 border-b">
              <span className="font-bold text-base">LegalSathi AI</span>
              <button onClick={() => setMobileOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <nav className="mt-4 space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold ${
                    pathname === item.href ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile Header Bar */}
        <header className="flex h-14 items-center justify-between border-b px-4 md:hidden bg-white dark:bg-slate-900 dark:border-slate-800">
          <button onClick={() => setMobileOpen(true)} className="p-1 text-slate-600">
            <Menu size={20} />
          </button>
          <span className="font-bold text-sm">LegalSathi AI</span>
          <button onClick={() => setCmdOpen(true)} className="p-1 text-slate-600">
            <Search size={18} />
          </button>
        </header>

        {/* Page Children */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>

      {/* Command Palette Modal */}
      <CommandPalette isOpen={cmdOpen} onClose={() => setCmdOpen(false)} />
    </div>
  );
}
