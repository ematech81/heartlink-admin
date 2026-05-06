'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';

export default function DashboardLayout({ children }) {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const user  = localStorage.getItem('adminUser');
    if (!token) { router.replace('/login'); return; }
    try {
      const u = JSON.parse(user);
      if (u?.role !== 'admin') { router.replace('/login'); }
    } catch (_) { router.replace('/login'); }
  }, [router]);

  return (
    <div className="flex min-h-screen bg-surface">
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col min-h-screen overflow-hidden">
        {children}
      </div>
    </div>
  );
}
