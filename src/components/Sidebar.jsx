'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Users, Film, Flag, Heart,
  CreditCard, Megaphone, BarChart2, Settings, LogOut, Shield,
} from 'lucide-react';
import clsx from 'clsx';

const NAV = [
  { href: '/dashboard',               label: 'Overview',      icon: LayoutDashboard },
  { href: '/dashboard/users',         label: 'Users',         icon: Users },
  { href: '/dashboard/community',     label: 'Community',     icon: Film },
  { href: '/dashboard/reports',       label: 'Reports',       icon: Flag },
  { href: '/dashboard/matches',       label: 'Matches',       icon: Heart },
  { href: '/dashboard/subscriptions', label: 'Subscriptions', icon: CreditCard },
  { href: '/dashboard/broadcast',     label: 'Broadcast',     icon: Megaphone },
  { href: '/dashboard/analytics',     label: 'Analytics',     icon: BarChart2 },
  { href: '/dashboard/settings',      label: 'Settings',      icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router   = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    router.push('/login');
  };

  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-sidebar flex flex-col z-40">
      {/* Brand */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-700/50">
        <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
          <Shield className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-white font-bold text-sm leading-none">HeartLink</p>
          <p className="text-slate-400 text-xs mt-0.5">Admin Panel</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-0.5">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = href === '/dashboard'
            ? pathname === '/dashboard'
            : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                active
                  ? 'bg-primary text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-slate-700/50">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium
                     text-slate-400 hover:text-white hover:bg-red-500/20 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
