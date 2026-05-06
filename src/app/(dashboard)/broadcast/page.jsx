'use client';
import { useState } from 'react';
import { Send, Users, Zap, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import Header from '@/components/Header';
import { AdminAPI } from '@/lib/api';
import clsx from 'clsx';

const TARGETS = [
  { value: 'all',      label: 'All Users',        icon: Users,  desc: 'Every active, non-banned user' },
  { value: 'premium',  label: 'Subscribed Users',  icon: Zap,    desc: 'Users with active subscription' },
  { value: 'boosted',  label: 'Boosted Users',     icon: Zap,    desc: 'Users with active boost' },
  { value: 'inactive', label: 'Inactive (7+ days)', icon: Clock,  desc: 'Users not seen in over a week' },
];

const TEMPLATES = [
  { label: 'New Match!',       title: '💝 You have a new match!', body: 'Someone liked you back. Open HeartLink to start chatting!' },
  { label: 'Engagement nudge', title: '👀 People are viewing your profile', body: 'Complete your profile to get more matches and connections.' },
  { label: 'Community promo',  title: '🎉 Something new in your community', body: 'Check out the latest posts and connect with people near you.' },
  { label: 'Boost promo',      title: '⚡ Boost your profile today',          body: 'Get 10x more visibility for just ₦1,000. Limited time offer!' },
];

export default function BroadcastPage() {
  const [target,  setTarget]  = useState('all');
  const [title,   setTitle]   = useState('');
  const [body,    setBody]    = useState('');
  const [sending, setSending] = useState(false);
  const [result,  setResult]  = useState(null);

  const applyTemplate = (t) => { setTitle(t.title); setBody(t.body); };

  const send = async () => {
    if (!title.trim() || !body.trim()) return alert('Title and body are required.');
    if (!confirm(`Send notification to ${TARGETS.find(t => t.value === target)?.label}?`)) return;
    setSending(true);
    setResult(null);
    try {
      const data = await AdminAPI.broadcast({ target, title, body });
      setResult({ success: true, message: data.message, sent: data.sent });
    } catch (err) {
      setResult({ success: false, message: err.message || 'Failed to send' });
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <Header title="Broadcast Messaging" subtitle="Send push notifications to users" />
      <main className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-2xl space-y-6">

          {/* Target selection */}
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-slate-700 mb-4">1. Select Target Audience</h3>
            <div className="grid grid-cols-2 gap-3">
              {TARGETS.map(t => (
                <button
                  key={t.value}
                  onClick={() => setTarget(t.value)}
                  className={clsx(
                    'flex items-start gap-3 p-3 rounded-xl border-2 text-left transition-all',
                    target === t.value
                      ? 'border-primary bg-primary/5'
                      : 'border-slate-100 hover:border-slate-200'
                  )}
                >
                  <t.icon className={clsx('w-5 h-5 mt-0.5 flex-shrink-0', target === t.value ? 'text-primary' : 'text-slate-400')} />
                  <div>
                    <p className={clsx('text-sm font-semibold', target === t.value ? 'text-primary' : 'text-slate-700')}>
                      {t.label}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">{t.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Quick Templates */}
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-slate-700 mb-4">2. Quick Templates (optional)</h3>
            <div className="flex flex-wrap gap-2">
              {TEMPLATES.map(t => (
                <button
                  key={t.label}
                  onClick={() => applyTemplate(t)}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-sm text-slate-600 transition-colors"
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Compose */}
          <div className="card p-5 space-y-4">
            <h3 className="text-sm font-semibold text-slate-700">3. Compose Notification</h3>

            {/* Preview */}
            {(title || body) && (
              <div className="bg-slate-800 rounded-xl p-4 text-white">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded bg-primary flex items-center justify-center text-xs">❤</div>
                  <span className="text-xs text-slate-400">HeartLink · now</span>
                </div>
                <p className="text-sm font-semibold">{title || 'Notification title'}</p>
                <p className="text-xs text-slate-300 mt-0.5">{body || 'Notification body…'}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">
                Title <span className="text-slate-400 font-normal">({title.length}/65)</span>
              </label>
              <input
                className="input"
                placeholder="e.g. 💝 You have a new match!"
                value={title}
                maxLength={65}
                onChange={e => setTitle(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">
                Message <span className="text-slate-400 font-normal">({body.length}/178)</span>
              </label>
              <textarea
                className="input resize-none"
                rows={3}
                placeholder="Notification body text…"
                value={body}
                maxLength={178}
                onChange={e => setBody(e.target.value)}
              />
            </div>
          </div>

          {/* Result */}
          {result && (
            <div className={clsx(
              'flex items-start gap-3 p-4 rounded-xl',
              result.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
            )}>
              {result.success
                ? <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                : <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />}
              <div>
                <p className="font-medium">{result.message}</p>
                {result.sent !== undefined && (
                  <p className="text-sm mt-0.5 opacity-75">Delivered to {result.sent} devices</p>
                )}
              </div>
            </div>
          )}

          {/* Send */}
          <button
            onClick={send}
            disabled={sending || !title.trim() || !body.trim()}
            className="btn-primary flex items-center gap-2 px-8 py-3"
          >
            {sending
              ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <Send className="w-4 h-4" />}
            {sending ? 'Sending…' : 'Send Notification'}
          </button>
        </div>
      </main>
    </>
  );
}
