'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft, Ban, Trash2, Crown, MapPin, Calendar, Mail,
  Phone, Heart, MessageSquare, Film, Flag, Shield,
} from 'lucide-react';
import Header from '@/components/Header';
import { AdminAPI } from '@/lib/api';
import clsx from 'clsx';

export default function UserDetailPage() {
  const { id }    = useParams();
  const router    = useRouter();
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);

  const load = async () => {
    try {
      const d = await AdminAPI.getUserById(id);
      setData(d);
    } catch (err) {
      alert(err.message);
      router.back();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const update = async (fields) => {
    setSaving(true);
    try {
      await AdminAPI.updateUser(id, fields);
      await load();
    } catch (err) { alert(err.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!confirm('Permanently delete this user? Cannot be undone.')) return;
    setSaving(true);
    try {
      await AdminAPI.deleteUser(id);
      router.push('/dashboard/users');
    } catch (err) { alert(err.message); setSaving(false); }
  };

  if (loading) return (
    <>
      <Header title="User Profile" />
      <main className="flex-1 flex items-center justify-center">
        <span className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </main>
    </>
  );

  const { user, stats } = data || {};

  return (
    <>
      <Header title="User Profile" subtitle={user?.name} />
      <main className="flex-1 p-6 space-y-6 overflow-y-auto">

        <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800">
          <ArrowLeft className="w-4 h-4" /> Back to Users
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Profile Card */}
          <div className="card p-6 flex flex-col items-center text-center gap-4">
            <div className="w-24 h-24 rounded-2xl bg-slate-100 overflow-hidden">
              {user?.profilePicture
                ? <img src={user.profilePicture} alt={user.name} className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-slate-300">
                    {user?.name?.[0]?.toUpperCase()}
                  </div>
              }
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">{user?.name}</h2>
              <p className="text-sm text-slate-500 capitalize">{user?.gender}, {user?.city}</p>
              <div className="flex flex-wrap gap-1.5 justify-center mt-2">
                <span className={clsx('badge', user?.isBanned ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700')}>
                  {user?.isBanned ? 'Banned' : 'Active'}
                </span>
                {user?.isSubscribed && <span className="badge bg-purple-100 text-purple-700">⭐ Subscribed</span>}
                {user?.isBoosted   && <span className="badge bg-orange-100 text-orange-700">⚡ Boosted</span>}
                {user?.isVerified  && <span className="badge bg-blue-100 text-blue-700">✓ Verified</span>}
              </div>
            </div>

            {/* Actions */}
            <div className="w-full space-y-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => update({ isBanned: !user?.isBanned, isActive: user?.isBanned })}
                disabled={saving}
                className={clsx('w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors',
                  user?.isBanned
                    ? 'bg-green-50 text-green-700 hover:bg-green-100'
                    : 'bg-orange-50 text-orange-700 hover:bg-orange-100'
                )}
              >
                <Ban className="w-4 h-4" />
                {user?.isBanned ? 'Unban User' : 'Ban User'}
              </button>
              {!user?.isSubscribed && (
                <button
                  onClick={() => update({
                    isSubscribed: true,
                    subscriptionPlan: 'monthly',
                    subscriptionExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                  })}
                  disabled={saving}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors"
                >
                  <Crown className="w-4 h-4" /> Grant 30-Day Premium
                </button>
              )}
              {user?.role !== 'admin' && (
                <button
                  onClick={() => update({ role: 'admin' })}
                  disabled={saving}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                >
                  <Shield className="w-4 h-4" /> Make Admin
                </button>
              )}
              <button
                onClick={handleDelete}
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium bg-red-50 text-red-700 hover:bg-red-100 transition-colors"
              >
                <Trash2 className="w-4 h-4" /> Delete Account
              </button>
            </div>
          </div>

          {/* Details */}
          <div className="lg:col-span-2 space-y-4">
            {/* Info */}
            <div className="card p-5">
              <h3 className="text-sm font-semibold text-slate-700 mb-4">Account Information</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <Info icon={Mail}     label="Email"    value={user?.email || '—'} />
                <Info icon={Phone}    label="Phone"    value={user?.phone || '—'} />
                <Info icon={MapPin}   label="Location" value={`${user?.city}, ${user?.country}`} />
                <Info icon={Calendar} label="Joined"   value={new Date(user?.createdAt).toLocaleDateString('en-GB', { day:'2-digit', month:'long', year:'numeric' })} />
                <Info icon={Calendar} label="Last Seen" value={user?.lastSeen ? new Date(user.lastSeen).toLocaleDateString() : '—'} />
                <Info icon={Shield}   label="Auth Provider" value={user?.authProvider} />
              </div>
            </div>

            {/* Stats */}
            <div className="card p-5">
              <h3 className="text-sm font-semibold text-slate-700 mb-4">Activity Stats</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <StatBox icon={Heart}          label="Matches"  value={stats?.matchCount}   color="text-pink-500" />
                <StatBox icon={MessageSquare}  label="Messages" value={stats?.messageCount} color="text-blue-500" />
                <StatBox icon={Film}           label="Posts"    value={stats?.postCount}    color="text-orange-500" />
                <StatBox icon={Flag}           label="Reports"  value={stats?.reportCount}  color="text-red-500" />
              </div>
            </div>

            {/* Bio */}
            {user?.bio && (
              <div className="card p-5">
                <h3 className="text-sm font-semibold text-slate-700 mb-2">Bio</h3>
                <p className="text-sm text-slate-600">{user.bio}</p>
              </div>
            )}

            {/* Photos */}
            {user?.photos?.length > 0 && (
              <div className="card p-5">
                <h3 className="text-sm font-semibold text-slate-700 mb-3">Photos ({user.photos.length})</h3>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {user.photos.map((ph, i) => (
                    <a key={i} href={ph} target="_blank" rel="noopener noreferrer">
                      <img src={ph} alt={`Photo ${i + 1}`} className="w-full aspect-square object-cover rounded-lg hover:opacity-80 transition-opacity" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}

function Info({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
      <div>
        <p className="text-xs text-slate-400">{label}</p>
        <p className="font-medium text-slate-700 break-all">{value}</p>
      </div>
    </div>
  );
}

function StatBox({ icon: Icon, label, value, color }) {
  return (
    <div className="text-center p-3 bg-slate-50 rounded-xl">
      <Icon className={clsx('w-5 h-5 mx-auto mb-1', color)} />
      <p className="text-lg font-bold text-slate-800">{value ?? '—'}</p>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  );
}
