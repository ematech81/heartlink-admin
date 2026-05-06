'use client';
import { useState } from 'react';
import { Settings, DollarSign, Zap, Shield, Info } from 'lucide-react';
import Header from '@/components/Header';

const SECTIONS = [
  { icon: DollarSign, title: 'Subscription Pricing (Naira)', fields: [
    { key: 'monthlyPrice', label: 'Monthly Plan',  placeholder: '2500',  type: 'number' },
    { key: 'yearlyPrice',  label: 'Yearly Plan',   placeholder: '18000', type: 'number' },
  ]},
  { icon: Zap, title: 'Boost Settings', fields: [
    { key: 'boostPrice',    label: 'Boost Price (₦)',         placeholder: '1000', type: 'number' },
    { key: 'boostDuration', label: 'Boost Duration (hours)',  placeholder: '24',   type: 'number' },
  ]},
  { icon: Shield, title: 'Moderation', fields: [
    { key: 'maxReports',      label: 'Auto-Ban After Reports', placeholder: '5',  type: 'number' },
    { key: 'postExpiryHours', label: 'Post Expiry (hours)',    placeholder: '24', type: 'number' },
  ]},
];

export default function SettingsPage() {
  const [values, setValues] = useState({});
  const [saved,  setSaved]  = useState(false);

  const handleSave = () => {
    console.log('Settings:', values);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <>
      <Header title="Settings" subtitle="App configuration and rules" />
      <main className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-2xl space-y-6">
          <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl">
            <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-700">
              To apply changes in production, update the corresponding environment variables on your Railway deployment.
            </p>
          </div>

          {SECTIONS.map(section => (
            <div key={section.title} className="card p-5">
              <div className="flex items-center gap-2 mb-4">
                <section.icon className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-semibold text-slate-700">{section.title}</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {section.fields.map(f => (
                  <div key={f.key}>
                    <label className="block text-sm font-medium text-slate-600 mb-1">{f.label}</label>
                    <input type={f.type} className="input" placeholder={f.placeholder}
                      value={values[f.key] ?? ''} onChange={e => setValues(p => ({ ...p, [f.key]: e.target.value }))} />
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="card p-5">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-semibold text-slate-700">Admin Access</h3>
            </div>
            <p className="text-sm text-slate-500">
              To create a new admin, run <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">node scripts/makeAdmin.js &lt;email&gt;</code> in the backend, or set <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">role: "admin"</code> directly in MongoDB Atlas.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={handleSave} className="btn-primary flex items-center gap-2">
              <Settings className="w-4 h-4" /> Save Settings
            </button>
            {saved && <span className="text-sm text-green-600 font-medium">✓ Saved</span>}
          </div>
        </div>
      </main>
    </>
  );
}
