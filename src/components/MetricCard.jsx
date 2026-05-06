import clsx from 'clsx';

export default function MetricCard({ label, value, icon: Icon, color = 'pink', sub }) {
  const colors = {
    pink:   'bg-pink-50   text-pink-600',
    blue:   'bg-blue-50   text-blue-600',
    green:  'bg-green-50  text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
    red:    'bg-red-50    text-red-600',
    teal:   'bg-teal-50   text-teal-600',
    indigo: 'bg-indigo-50 text-indigo-600',
  };

  return (
    <div className="card p-5 flex items-start gap-4">
      <div className={clsx('p-2.5 rounded-xl flex-shrink-0', colors[color] || colors.pink)}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-bold text-slate-900 leading-none">
          {value ?? <span className="text-slate-300">—</span>}
        </p>
        <p className="text-sm text-slate-500 mt-1">{label}</p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}
