'use client';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Search, Filter, ChevronLeft, ChevronRight, Ban, Trash2, Crown, Eye } from 'lucide-react';
import Header from '@/components/Header';
import { AdminAPI } from '@/lib/api';
import clsx from 'clsx';

const LIMIT = 20;

export default function UsersPage() {
  const [users,      setUsers]      = useState([]);
  const [total,      setTotal]      = useState(0);
  const [page,       setPage]       = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState('');
  const [status,     setStatus]     = useState('');
  const [plan,       setPlan]       = useState('');
  const [gender,     setGender]     = useState('');
  const [actionId,   setActionId]   = useState(null);

  const load = useCallback(async (pg = 1) => {
    setLoading(true);
    try {
      const data = await AdminAPI.getUsers({ page: pg, limit: LIMIT, search, status, plan, gender });
      setUsers(data.users);
      setTotal(data.total);
      setTotalPages(data.totalPages);
      setPage(pg);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [search, status, plan, gender]);

  useEffect(() => { load(1); }, [load]);

  const banToggle = async (user) => {
    if (!confirm(`${user.isBanned ? 'Unban' : 'Ban'} ${user.name}?`)) return;
    setActionId(user._id);
    try {
      await AdminAPI.updateUser(user._id, { isBanned: !user.isBanned, isActive: user.isBanned });
      load(page);
    } catch (err) { alert(err.message); }
    finally { setActionId(null); }
  };

  const deleteUser = async (user) => {
    if (!confirm(`Permanently delete ${user.name}? This cannot be undone.`)) return;
    setActionId(user._id);
    try {
      await AdminAPI.deleteUser(user._id);
      load(page);
    } catch (err) { alert(err.message); }
    finally { setActionId(null); }
  };

  const upgradeUser = async (user) => {
    if (!confirm(`Give ${user.name} a free 30-day subscription?`)) return;
    setActionId(user._id);
    const expiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    try {
      await AdminAPI.updateUser(user._id, {
        isSubscribed: true, subscriptionPlan: 'monthly',
        subscriptionExpiry: expiry.toISOString(),
      });
      load(page);
    } catch (err) { alert(err.message); }
    finally { setActionId(null); }
  };

  return (
    <>
      <Header title="User Management" subtitle={`${total.toLocaleString()} total users`} />
      <main className="flex-1 p-6 space-y-4 overflow-y-auto">
        <div className="card p-4 flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input className="input pl-9" placeholder="Search name, email, phone…" value={search}
              onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && load(1)} />
          </div>
          <select className="input w-36" value={status} onChange={e => setStatus(e.target.value)}>
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="banned">Banned</option>
          </select>
          <select className="input w-36" value={plan} onChange={e => setPlan(e.target.value)}>
            <option value="">All Plans</option>
            <option value="free">Free</option>
            <option value="boosted">Boosted</option>
            <option value="subscribed">Subscribed</option>
          </select>
          <select className="input w-32" value={gender} onChange={e => setGender(e.target.value)}>
            <option value="">All Genders</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
          <button className="btn-primary px-5" onClick={() => load(1)}>
            <Filter className="w-4 h-4 inline mr-1.5" />Filter
          </button>
        </div>

        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">User</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Location</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Status</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Plan</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Joined</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="text-center py-12 text-slate-400">
                    <span className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin inline-block" />
                  </td></tr>
                ) : users.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-12 text-slate-400">No users found</td></tr>
                ) : users.map(u => (
                  <tr key={u._id} className="table-row">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-slate-100 flex-shrink-0 overflow-hidden">
                          {u.profilePicture
                            ? <img src={u.profilePicture} alt={u.name} className="w-full h-full object-cover" />
                            : <span className="w-full h-full flex items-center justify-center text-slate-400 font-bold text-sm">
                                {u.name?.[0]?.toUpperCase()}
                              </span>
                          }
                        </div>
                        <div>
                          <p className="font-medium text-slate-800">{u.name}</p>
                          <p className="text-xs text-slate-400">{u.email || u.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{u.city}, {u.country}</td>
                    <td className="px-4 py-3">
                      <span className={clsx('badge', u.isBanned ? 'bg-red-100 text-red-700' : u.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500')}>
                        {u.isBanned ? 'Banned' : u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={clsx('badge', u.isSubscribed ? 'bg-purple-100 text-purple-700' : u.isBoosted ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-500')}>
                        {u.isSubscribed ? '⭐ Subscribed' : u.isBoosted ? '⚡ Boosted' : 'Free'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {new Date(u.createdAt).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Link href={`/dashboard/users/${u._id}`}
                          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors" title="View">
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button onClick={() => upgradeUser(u)} disabled={actionId === u._id || u.isSubscribed}
                          className="p-1.5 rounded-lg hover:bg-purple-50 text-purple-500 transition-colors disabled:opacity-30" title="Upgrade">
                          <Crown className="w-4 h-4" />
                        </button>
                        <button onClick={() => banToggle(u)} disabled={actionId === u._id}
                          className={clsx('p-1.5 rounded-lg transition-colors', u.isBanned ? 'hover:bg-green-50 text-green-500' : 'hover:bg-orange-50 text-orange-500')}
                          title={u.isBanned ? 'Unban' : 'Ban'}>
                          <Ban className="w-4 h-4" />
                        </button>
                        <button onClick={() => deleteUser(u)} disabled={actionId === u._id}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-white">
            <p className="text-sm text-slate-500">
              Showing {((page - 1) * LIMIT) + 1}–{Math.min(page * LIMIT, total)} of {total}
            </p>
            <div className="flex items-center gap-2">
              <button onClick={() => load(page - 1)} disabled={page === 1}
                className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-30"><ChevronLeft className="w-4 h-4" /></button>
              <span className="text-sm font-medium text-slate-700">{page} / {totalPages}</span>
              <button onClick={() => load(page + 1)} disabled={page === totalPages}
                className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-30"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
