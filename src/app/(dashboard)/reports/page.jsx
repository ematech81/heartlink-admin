'use client';
import { useEffect, useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle, XCircle, Ban, AlertTriangle } from 'lucide-react';
import Header from '@/components/Header';
import { AdminAPI } from '@/lib/api';
import clsx from 'clsx';

const LIMIT = 15;

const STATUS_COLORS = {
  pending:  'bg-yellow-100 text-yellow-700',
  reviewed: 'bg-blue-100 text-blue-700',
  actioned: 'bg-red-100 text-red-700',
  ignored:  'bg-slate-100 text-slate-500',
};

const REASON_LABELS = {
  inappropriate_content: 'Inappropriate Content',
  harassment:            'Harassment',
  fake_profile:          'Fake Profile',
  spam:                  'Spam',
  other:                 'Other',
};

export default function ReportsPage() {
  const [reports,    setReports]    = useState([]);
  const [total,      setTotal]      = useState(0);
  const [page,       setPage]       = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading,    setLoading]    = useState(true);
  const [filter,     setFilter]     = useState('pending');
  const [selected,   setSelected]   = useState(null);
  const [actionId,   setActionId]   = useState(null);

  const load = useCallback(async (pg = 1) => {
    setLoading(true);
    try {
      const data = await AdminAPI.getReports({ page: pg, limit: LIMIT, status: filter });
      setReports(data.reports);
      setTotal(data.total);
      setTotalPages(data.totalPages);
      setPage(pg);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [filter]);

  useEffect(() => { load(1); }, [filter]);

  const handle = async (reportId, status, actionTaken) => {
    setActionId(reportId);
    try {
      await AdminAPI.handleReport(reportId, { status, actionTaken });
      setSelected(null);
      load(page);
    } catch (err) { alert(err.message); }
    finally { setActionId(null); }
  };

  return (
    <>
      <Header title="Reports & Moderation" subtitle={`${total} ${filter} reports`} />
      <main className="flex-1 p-6 overflow-y-auto">
        <div className="flex gap-6 h-full">

          {/* List */}
          <div className="flex-1 space-y-4">
            {/* Filter tabs */}
            <div className="card p-3 flex gap-2">
              {['pending', 'reviewed', 'actioned', 'ignored'].map(s => (
                <button
                  key={s}
                  onClick={() => setFilter(s)}
                  className={clsx(
                    'px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors',
                    filter === s ? 'bg-primary text-white' : 'text-slate-500 hover:bg-slate-100'
                  )}
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Table */}
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="text-left px-4 py-3 font-semibold text-slate-600">Reporter</th>
                      <th className="text-left px-4 py-3 font-semibold text-slate-600">Reported</th>
                      <th className="text-left px-4 py-3 font-semibold text-slate-600">Reason</th>
                      <th className="text-left px-4 py-3 font-semibold text-slate-600">Status</th>
                      <th className="text-left px-4 py-3 font-semibold text-slate-600">Date</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan={6} className="text-center py-12 text-slate-400">
                        <span className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin inline-block" />
                      </td></tr>
                    ) : reports.length === 0 ? (
                      <tr><td colSpan={6} className="text-center py-12 text-slate-400">No {filter} reports</td></tr>
                    ) : reports.map(r => (
                      <tr
                        key={r._id}
                        className={clsx('table-row cursor-pointer', selected?._id === r._id && 'bg-primary/5')}
                        onClick={() => setSelected(r)}
                      >
                        <td className="px-4 py-3">
                          <UserChip user={r.reporter} />
                        </td>
                        <td className="px-4 py-3">
                          <UserChip user={r.reported} banned={r.reported?.isBanned} />
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {REASON_LABELS[r.reason] || r.reason}
                        </td>
                        <td className="px-4 py-3">
                          <span className={clsx('badge capitalize', STATUS_COLORS[r.status])}>
                            {r.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-400 text-xs">
                          {new Date(r.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-primary text-xs font-medium">View →</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
                <p className="text-sm text-slate-400">{total} total</p>
                <div className="flex items-center gap-2">
                  <button onClick={() => load(page - 1)} disabled={page === 1}
                    className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-30">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-sm">{page} / {totalPages}</span>
                  <button onClick={() => load(page + 1)} disabled={page === totalPages}
                    className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-30">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Detail Panel */}
          {selected && (
            <div className="w-80 flex-shrink-0 space-y-4">
              <div className="card p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-slate-800">Report Details</h3>
                  <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-slate-600 text-lg">×</button>
                </div>

                <div className="space-y-3 text-sm">
                  <Field label="Reason"   value={REASON_LABELS[selected.reason] || selected.reason} />
                  <Field label="Type"     value={selected.type} />
                  <Field label="Status"   value={selected.status} />
                  {selected.description && <Field label="Description" value={selected.description} />}
                  {selected.adminNote    && <Field label="Admin Note"   value={selected.adminNote} />}
                  {selected.actionTaken !== 'none' && <Field label="Action Taken" value={selected.actionTaken} />}
                </div>

                <div className="border-t border-slate-100 pt-4">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Take Action</p>
                  <div className="space-y-2">
                    <button
                      onClick={() => handle(selected._id, 'ignored', 'none')}
                      disabled={!!actionId}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                      <XCircle className="w-4 h-4 text-slate-400" /> Ignore Report
                    </button>
                    <button
                      onClick={() => handle(selected._id, 'actioned', 'warned')}
                      disabled={!!actionId}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-yellow-700 hover:bg-yellow-50 transition-colors"
                    >
                      <AlertTriangle className="w-4 h-4" /> Warn User
                    </button>
                    <button
                      onClick={() => handle(selected._id, 'actioned', 'suspended')}
                      disabled={!!actionId}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-orange-700 hover:bg-orange-50 transition-colors"
                    >
                      <Ban className="w-4 h-4" /> Suspend Account
                    </button>
                    <button
                      onClick={() => handle(selected._id, 'actioned', 'banned')}
                      disabled={!!actionId}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-700 hover:bg-red-50 transition-colors"
                    >
                      <Ban className="w-4 h-4" /> Ban User Permanently
                    </button>
                    <button
                      onClick={() => handle(selected._id, 'reviewed', 'none')}
                      disabled={!!actionId}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-green-700 hover:bg-green-50 transition-colors"
                    >
                      <CheckCircle className="w-4 h-4" /> Mark Reviewed (No Action)
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}

function UserChip({ user, banned }) {
  if (!user) return <span className="text-slate-400 text-xs">Unknown</span>;
  return (
    <div className="flex items-center gap-2">
      <div className="w-7 h-7 rounded-full bg-slate-100 flex-shrink-0 overflow-hidden">
        {user.profilePicture
          ? <img src={user.profilePicture} alt="" className="w-full h-full object-cover" />
          : <span className="w-full h-full flex items-center justify-center text-slate-400 text-xs font-bold">
              {user.name?.[0]?.toUpperCase()}
            </span>
        }
      </div>
      <div>
        <p className="font-medium text-slate-800 text-xs">{user.name}</p>
        {banned && <span className="badge bg-red-100 text-red-600" style={{fontSize:10}}>Banned</span>}
      </div>
    </div>
  );
}

function Field({ label, value }) {
  return (
    <div>
      <p className="text-xs text-slate-400 mb-0.5">{label}</p>
      <p className="text-slate-700 capitalize">{value}</p>
    </div>
  );
}
