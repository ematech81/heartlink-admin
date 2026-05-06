'use client';
import { useEffect, useState } from 'react';
import { Bell, User } from 'lucide-react';

export default function Header({ title, subtitle }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('adminUser');
      if (stored) setUser(JSON.parse(stored));
    } catch (_) {}
  }, []);

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-100">
      <div>
        <h1 className="text-lg font-bold text-slate-900">{title}</h1>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        <button className="relative p-2 rounded-lg hover:bg-slate-50 transition-colors">
          <Bell className="w-5 h-5 text-slate-500" />
        </button>
        <div className="flex items-center gap-2.5 pl-3 border-l border-slate-100">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="w-4 h-4 text-primary" />
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-slate-800 leading-none">{user?.name || 'Admin'}</p>
            <p className="text-xs text-slate-500 mt-0.5 capitalize">{user?.role || 'admin'}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
