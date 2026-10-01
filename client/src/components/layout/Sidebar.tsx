'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { SOCIETY_NAME, SOCIETY_TAGLINE } from '@/lib/constants';
import {
  LayoutDashboard,
  CreditCard,
  MessageSquare,
  AlertTriangle,
  Users,
  BarChart3,
  FileText,
  Settings,
  Home,
  Shield,
  Sparkles,
  MoreHorizontal,
  X,
  Building2,
  Wrench,
  Bell,
} from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  roles?: string[];
}

const navItems: NavItem[] = [
  { href: '/', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
  { href: '/notices', label: 'Notices & Events', icon: <Bell className="w-5 h-5" /> },
  { href: '/maintenance', label: 'Maintenance', icon: <CreditCard className="w-5 h-5" /> },
  { href: '/complaints', label: 'My Complaints', icon: <MessageSquare className="w-5 h-5" /> },
  { href: '/assets', label: 'Society Assets', icon: <Building2 className="w-5 h-5" /> },
  { href: '/services', label: 'Society Services', icon: <Wrench className="w-5 h-5" /> },
  { href: '/emergency', label: 'Emergency', icon: <AlertTriangle className="w-5 h-5" /> },
];

const adminItems: NavItem[] = [
  { href: '/admin/users', label: 'Manage Users', icon: <Users className="w-5 h-5" />, roles: ['manager', 'admin'] },
  { href: '/admin/payments', label: 'All Payments', icon: <BarChart3 className="w-5 h-5" />, roles: ['manager', 'admin'] },
  { href: '/admin/complaints', label: 'All Complaints', icon: <FileText className="w-5 h-5" />, roles: ['manager', 'admin'] },
  { href: '/admin/assets', label: 'Assets', icon: <Settings className="w-5 h-5" />, roles: ['manager', 'admin'] },
];

// Mobile bottom navigation items (limited for mobile UX)
const mobileNavItems: NavItem[] = [
  { href: '/', label: 'Home', icon: <Home className="w-5 h-5" /> },
  { href: '/maintenance', label: 'Bills', icon: <CreditCard className="w-5 h-5" /> },
  { href: '/complaints', label: 'Complaints', icon: <MessageSquare className="w-5 h-5" /> },
  { href: '/emergency', label: 'SOS', icon: <AlertTriangle className="w-5 h-5" /> },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [showMobileAdminMenu, setShowMobileAdminMenu] = useState(false);

  const isAdmin = user && ['manager', 'admin'].includes(user.role);

  return (
    <>
      {/* Desktop Sidebar - Modern Dark Theme */}
      <aside className="hidden lg:flex flex-col w-64 bg-slate-900 fixed left-0 top-16 bottom-0 overflow-y-auto border-r border-slate-800">
        {/* User Badge */}
        <div className="p-4 border-b border-slate-800">
          <div className="flex items-center gap-3 p-3 bg-slate-850/60 bg-slate-800/60 rounded-xl border border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-600 to-teal-800 flex items-center justify-center shrink-0">
              <span className="text-white font-bold text-xs">
                {user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-xs truncate">{user?.name}</p>
              <p className="text-slate-400 text-[11px]">Flat {user?.flat_no}</p>
            </div>
            {isAdmin && (
              <Shield className="w-4 h-4 text-teal-400 shrink-0" />
            )}
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-6">
          {/* Main Navigation */}
          <div className="space-y-1">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-3 mb-2">
              Society Hub
            </p>
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150',
                  pathname === item.href
                    ? 'bg-teal-700 text-white shadow-md shadow-teal-900/40 font-bold'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                )}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ))}
          </div>

          {/* Admin Section */}
          {isAdmin && (
            <div className="space-y-1 pt-2 border-t border-slate-800">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-3 mb-2">
                Administration
              </p>
              <div className="space-y-1">
                {adminItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150',
                      pathname === item.href
                        ? 'bg-teal-700 text-white shadow-md shadow-teal-900/40 font-bold'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    )}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-800">
          <div className="p-3 bg-slate-800/80 rounded-xl flex items-center gap-3 border border-slate-800">
            <div className="w-8 h-8 rounded-lg bg-teal-600/20 text-teal-400 flex items-center justify-center shrink-0">
              <Building2 className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-white text-xs font-bold truncate">{SOCIETY_NAME}</p>
              <p className="text-teal-400 text-[10px] truncate">{SOCIETY_TAGLINE}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 z-50 shadow-lg">
        <div className="flex justify-around items-center h-16 px-2 max-w-md mx-auto">
          {mobileNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center flex-1 py-1.5 rounded-xl transition-all',
                pathname === item.href
                  ? 'text-teal-700 font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              )}
            >
              <div className={cn(
                'p-1.5 rounded-lg transition-all',
                pathname === item.href && 'bg-teal-50 text-teal-700'
              )}>
                {item.icon}
              </div>
              <span className="text-[10px] font-medium mt-0.5">{item.label}</span>
            </Link>
          ))}

          {/* Admin "More" Button */}
          {isAdmin && (
            <button
              onClick={() => setShowMobileAdminMenu(true)}
              className={cn(
                'flex flex-col items-center justify-center flex-1 py-1.5 rounded-xl transition-all',
                pathname.startsWith('/admin')
                  ? 'text-teal-700 font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              )}
            >
              <div className={cn(
                'p-1.5 rounded-lg transition-all',
                pathname.startsWith('/admin') && 'bg-teal-50 text-teal-700'
              )}>
                <MoreHorizontal className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-medium mt-0.5">Admin</span>
            </button>
          )}
        </div>
      </nav>

      {/* Mobile Admin Slide-up Menu */}
      {isAdmin && showMobileAdminMenu && (
        <>
          {/* Backdrop */}
          <div
            className="lg:hidden fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[60]"
            onClick={() => setShowMobileAdminMenu(false)}
          />

          {/* Slide-up Panel */}
          <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl z-[70] animate-in slide-in-from-bottom duration-300 border-t border-slate-200">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900">Administration Menu</h3>
              <button
                onClick={() => setShowMobileAdminMenu(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-1 pb-8">
              {adminItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setShowMobileAdminMenu(false)}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all',
                    pathname === item.href
                      ? 'bg-teal-50 text-teal-800 font-bold'
                      : 'text-slate-600 hover:bg-slate-50'
                  )}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  );
}
