'use client';
import { useEffect, useState } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import {
  Users, UserCheck, UserPlus, Heart, MessageSquare, Film,
  Zap, CreditCard, Flag, Ban,
} from 'lucide-react';
import Header from '@/components/Header';
import MetricCard from '@/components/MetricCard';
import { AdminAPI } from '@/lib/api';

export default function OverviewPage() {
  const [stats,   setStats]   = useState(null);
  const [growth,  setGrowth]  = useState([]);
  const [posts,   setPosts]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [s, g, a] = await Promise.all([
          AdminAPI.getStats(),
          AdminAPI.getUserGrowth(30),
          AdminAPI.getAnalytics(),
        ]);
        setStats(s);
        setGrowth(g);
        setPosts(a.postActivity || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const fmt = (n) => (n >= 1000 ? `${(n / 1000).toFixed(1)}k` : n ?? '—');

  return (
    <>
      <Header title="Overview" subtitle="Platform health at a glance" />
      <main className="flex-1 p-6 space-y-6 overflow-y-auto">

        <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          <MetricCard label="Total Users"     value={fmt(stats?.totalUsers)}      icon={Users}         color="pink"   />
          <MetricCard label="Active Today"    value={fmt(stats?.activeToday)}     icon={UserCheck}     color="green"  />
          <MetricCard label="New This Week"   value={fmt(stats?.newThisWeek)}     icon={UserPlus}      color="blue"   />
          <MetricCard label="Total Matches"   value={fmt(stats?.totalMatches)}    icon={Heart}         color="purple" />
          <MetricCard label="Messages Sent"   value={fmt(stats?.totalMessages)}   icon={MessageSquare} color="teal"   />
          <MetricCard label="Posts (24h)"     value={fmt(stats?.postsToday)}      icon={Film}          color="orange" />
          <MetricCard label="Boosted Users"   value={fmt(stats?.boostedUsers)}    icon={Zap}           color="indigo" />
          <MetricCard label="Subscribed"      value={fmt(stats?.subscribedUsers)} icon={CreditCard}    color="green"  />
          <MetricCard label="Pending Reports" value={fmt(stats?.pendingReports)}  icon={Flag}          color="red"    />
          <MetricCard label="Banned Users"    value={fmt(stats?.bannedUsers)}     icon={Ban}           color="red"    />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="card p-6">
            <h2 className="text-sm font-semibold text-slate-700 mb-4">User Growth — Last 30 Days</h2>
            {loading ? (
              <div className="h-52 flex items-center justify-center">
                <span className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={210}>
                <LineChart data={growth} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94A3B8' }} tickFormatter={d => d.slice(5)} interval="preserveStartEnd" />
                  <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E2E8F0' }} />
                  <Line type="monotone" dataKey="count" name="New Users" stroke="#FF4B7A" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="card p-6">
            <h2 className="text-sm font-semibold text-slate-700 mb-4">Community Activity — Last 30 Days</h2>
            {loading ? (
              <div className="h-52 flex items-center justify-center">
                <span className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={210}>
                <BarChart data={posts} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94A3B8' }} tickFormatter={d => d.slice(5)} interval="preserveStartEnd" />
                  <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E2E8F0' }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="posts" name="Posts" fill="#FF4B7A" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="likes" name="Likes" fill="#818CF8" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card p-5">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Platform Health</p>
            <div className="space-y-2.5">
              <Stat label="Subscribed rate"  value={`${stats ? Math.round((stats.subscribedUsers / Math.max(stats.totalUsers, 1)) * 100) : 0}%`} />
              <Stat label="Daily active rate" value={`${stats ? Math.round((stats.activeToday / Math.max(stats.totalUsers, 1)) * 100) : 0}%`} />
              <Stat label="Boost penetration" value={`${stats ? Math.round((stats.boostedUsers / Math.max(stats.totalUsers, 1)) * 100) : 0}%`} />
            </div>
          </div>
          <div className="card p-5">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Est. Revenue (₦)</p>
            <div className="space-y-2.5">
              <Stat label="Monthly subs" value={`₦${((stats?.subscribedUsers || 0) * 2500).toLocaleString()}`} />
              <Stat label="Boost revenue" value={`₦${((stats?.boostedUsers || 0) * 1000).toLocaleString()}`} />
              <Stat label="Total MRR"    value={`₦${(((stats?.subscribedUsers || 0) * 2500) + ((stats?.boostedUsers || 0) * 1000)).toLocaleString()}`} />
            </div>
          </div>
          <div className="card p-5">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Moderation</p>
            <div className="space-y-2.5">
              <Stat label="Pending reports" value={stats?.pendingReports ?? '—'} urgent={stats?.pendingReports > 0} />
              <Stat label="Banned accounts" value={stats?.bannedUsers ?? '—'} />
              <Stat label="Posts today"     value={stats?.postsToday ?? '—'} />
            </div>
          </div>
        </div>

      </main>
    </>
  );
}

function Stat({ label, value, urgent }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-slate-500">{label}</span>
      <span className={`text-sm font-semibold ${urgent ? 'text-red-500' : 'text-slate-800'}`}>{value}</span>
    </div>
  );
}
