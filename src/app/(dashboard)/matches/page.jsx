'use client';
import { useEffect, useState } from 'react';
import { Heart, MessageSquare, Zap, Activity } from 'lucide-react';
import Header from '@/components/Header';
import MetricCard from '@/components/MetricCard';
import { AdminAPI } from '@/lib/api';

export default function MatchesPage() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AdminAPI.getMatches()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const fmt = (n) => (n ?? '—').toLocaleString?.() ?? '—';

  return (
    <>
      <Header title="Matches & Conversations" subtitle="Platform connection overview" />
      <main className="flex-1 p-6 space-y-6 overflow-y-auto">

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <span className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <MetricCard label="Total Matches"      value={fmt(data?.totalMatches)}   icon={Heart}          color="pink" />
              <MetricCard label="Total Likes Sent"   value={fmt(data?.totalLikes)}     icon={Zap}            color="orange" />
              <MetricCard label="New Matches (7d)"   value={fmt(data?.recentMatches)}  icon={Activity}       color="green" />
              <MetricCard label="Messages (24h)"     value={fmt(data?.recentMessages)} icon={MessageSquare}  color="blue" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="card p-6">
                <h3 className="text-sm font-semibold text-slate-700 mb-4">Match Funnel</h3>
                <div className="space-y-4">
                  <FunnelBar label="Total Likes"   value={data?.totalLikes}   max={data?.totalLikes}   color="bg-orange-400" />
                  <FunnelBar label="Mutual Matches" value={data?.totalMatches} max={data?.totalLikes}   color="bg-primary" />
                  <FunnelBar label="Active Chats"  value={data?.recentMessages} max={data?.totalMatches} color="bg-blue-500" />
                </div>
              </div>

              <div className="card p-6">
                <h3 className="text-sm font-semibold text-slate-700 mb-4">Key Ratios</h3>
                <div className="space-y-3 text-sm">
                  <Ratio
                    label="Like → Match Rate"
                    value={data?.totalLikes > 0
                      ? `${((data.totalMatches / data.totalLikes) * 100).toFixed(1)}%`
                      : '—'}
                  />
                  <Ratio
                    label="Match → Message Rate"
                    value={data?.totalMatches > 0
                      ? `${Math.min(100, ((data.recentMessages / data.totalMatches) * 100)).toFixed(1)}%`
                      : '—'}
                  />
                  <Ratio
                    label="New Matches This Week"
                    value={fmt(data?.recentMatches)}
                  />
                  <Ratio
                    label="Messages Sent Today"
                    value={fmt(data?.recentMessages)}
                  />
                </div>
                <div className="mt-6 p-4 bg-amber-50 rounded-xl">
                  <p className="text-xs font-semibold text-amber-800 mb-1">⚠ Privacy Notice</p>
                  <p className="text-xs text-amber-700">
                    Individual conversation content is not visible to admins.
                    Only aggregate statistics are shown to protect user privacy.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </>
  );
}

function FunnelBar({ label, value, max, color }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div>
      <div className="flex justify-between text-xs text-slate-500 mb-1">
        <span>{label}</span>
        <span className="font-semibold text-slate-700">{(value ?? 0).toLocaleString()}</span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function Ratio({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-slate-500">{label}</span>
      <span className="font-semibold text-slate-800">{value}</span>
    </div>
  );
}
