'use client';
import { useEffect, useState, useCallback } from 'react';
import { CreditCard, ChevronLeft, ChevronRight, RefreshCw, XCircle } from 'lucide-react';
import Header from '@/components/Header';
import MetricCard from '@/components/MetricCard';
import { AdminAPI } from '@/lib/api';
import clsx from 'clsx';

const LIMIT = 20;

export default function SubscriptionsPage() {
  const [users,      setUsers]      = useState([]);
  const [total,      setTotal]      = useState(0);
  const [page,       setPage]       = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [revenue,    setRevenue]    = useState({});
  const [loading,    setLoading]    = useState(true);
  const [plan,       setPlan]       = useState('');
  const [actionId,   setActionId]   = useState(null);

  const load = useCallback(async (pg = 1) => {
    setLoading(true);
    try {
      const data = await AdminAPI.getSubscriptions({ page: pg, limit: LIMIT, plan });
      setUsers(data.users); setTotal(data.total); setTotalPages(data.totalPages);
      setRevenue(data.revenue || {}); setPage(pg);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [plan]);

  useEffect(() => { load(1); }, [plan]);

  const cancelSub = async (user) => {
    if (!confirm(`Cancel ${user.name}'s subscription?`)) return;
    setActionId(user._id);
    try { await AdminAPI.updateSubscription(user._id, { isSubscribed: false, subscriptionPlan: null, subscriptionExpiry: null }); load(page); }
    catch (err) { alert(err.message); }
    finally { setActionId(null); }
  };

  const extendSub = async (user) => {
    const expiry = new Date(Math.max(Date.now(), new Date(user.subscriptionExpiry || Date.now())) + 30*24*60*60*1000);
    setActionId(user._id);
    try { await AdminAPI.updateSubscription(user._id, { isSubscribed: true, subscriptionPlan: user.subscriptionPlan || 'monthly', subscriptionExpiry: expiry.toISOString() }); load(page); }
    catch (err) { alert(err.message); }
    finally { setActionId(null); }
  };

  const fmt = (n) => n?.toLocaleString() ?? '—';

  return (
    <>
      <Header title="Subscriptions & Revenue" subtitle="Manage paid accounts" />
      <main className="flex-1 p-6 space-y-6 overflow-y-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard label="Total Subscribed" value={fmt(total)}                                          icon={CreditCard} color="purple" />
          <MetricCard label="Monthly Plan"      value={fmt(revenue.monthly)}                               icon={CreditCard} color="blue"   />
          <MetricCard label="Yearly Plan"       value={fmt(revenue.yearly)}                                icon={CreditCard} color="teal"   />
          <MetricCard label="Est. MRR"          value={`₦${fmt(Math.round(revenue.estimatedMonthlyRevenue))}`} icon={CreditCard} color="green"  />
        </div>

        <div className="card p-4 flex gap-3 items-center">
          <label className="text-sm font-medium text-slate-600">Filter:</label>
          {['', 'monthly', 'yearly'].map(p => (
            <button key={p || 'all'} onClick={() => setPlan(p)}
              className={clsx('px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors',
                plan === p ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200')}>
              {p || 'All'}
            </button>
          ))}
        </div>

        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">User</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Plan</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Expires</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={4} className="text-center py-12"><span className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin inline-block" /></td></tr>
                ) : users.length === 0 ? (
                  <tr><td colSpan={4} className="text-center py-12 text-slate-400">No subscriptions found</td></tr>
                ) : users.map(u => {
                  const expired = u.subscriptionExpiry && new Date(u.subscriptionExpiry) < new Date();
                  return (
                    <tr key={u._id} className="table-row">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 overflow-hidden flex-shrink-0">
                            {u.profilePicture ? <img src={u.profilePicture} alt="" className="w-full h-full object-cover" />
                              : <span className="w-full h-full flex items-center justify-center text-slate-400 font-bold text-xs">{u.name?.[0]?.toUpperCase()}</span>}
                          </div>
                          <div><p className="font-medium text-slate-800">{u.name}</p><p className="text-xs text-slate-400">{u.email}</p></div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {u.isSubscribed
                          ? <span className={clsx('badge', u.subscriptionPlan === 'yearly' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700')}>⭐ {u.subscriptionPlan || 'monthly'}</span>
                          : u.isBoosted ? <span className="badge bg-orange-100 text-orange-700">⚡ Boosted</span> : '—'}
                      </td>
                      <td className="px-4 py-3">
                        {u.subscriptionExpiry
                          ? <span className={clsx('text-sm', expired ? 'text-red-500 font-medium' : 'text-slate-600')}>
                              {expired ? '⚠ Expired · ' : ''}{new Date(u.subscriptionExpiry).toLocaleDateString()}
                            </span>
                          : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button onClick={() => extendSub(u)} disabled={actionId === u._id}
                            className="p-1.5 rounded-lg hover:bg-green-50 text-green-600 transition-colors" title="Extend 30 days">
                            <RefreshCw className="w-4 h-4" />
                          </button>
                          <button onClick={() => cancelSub(u)} disabled={actionId === u._id}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors" title="Cancel">
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
            <p className="text-sm text-slate-400">{total} subscribers</p>
            <div className="flex items-center gap-2">
              <button onClick={() => load(page - 1)} disabled={page === 1} className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-30"><ChevronLeft className="w-4 h-4" /></button>
              <span className="text-sm">{page} / {totalPages}</span>
              <button onClick={() => load(page + 1)} disabled={page === totalPages} className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-30"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
