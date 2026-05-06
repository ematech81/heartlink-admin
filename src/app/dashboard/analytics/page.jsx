'use client';
import { useEffect, useState } from 'react';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Percent, Users, MapPin } from 'lucide-react';
import Header from '@/components/Header';
import MetricCard from '@/components/MetricCard';
import { AdminAPI } from '@/lib/api';

const COLORS = ['#FF4B7A', '#818CF8', '#34D399', '#FBBF24', '#60A5FA'];

export default function AnalyticsPage() {
  const [data,    setData]    = useState(null);
  const [growth,  setGrowth]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [period,  setPeriod]  = useState(30);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [a, g] = await Promise.all([AdminAPI.getAnalytics(), AdminAPI.getUserGrowth(period)]);
        setData(a); setGrowth(g);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    load();
  }, [period]);

  const genderData = data?.genderDist?.map(g => ({ name: g._id?.charAt(0).toUpperCase() + g._id?.slice(1), value: g.count })) || [];
  const planData   = data?.subscriptionDist?.map(s => ({ name: s._id?.charAt(0).toUpperCase() + s._id?.slice(1), value: s.count })) || [];

  return (
    <>
      <Header title="Analytics & Growth" subtitle="Platform performance insights" />
      <main className="flex-1 p-6 space-y-6 overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MetricCard label="Conversion Rate"    value={`${data?.conversionRate || 0}%`}                               icon={Percent} color="green" />
          <MetricCard label="Gender Split (M/F)" value={`${genderData[0]?.value || 0} / ${genderData[1]?.value || 0}`} icon={Users}   color="pink" />
          <MetricCard label="Top City"           value={data?.locationDist?.[0]?.city || '—'}                          icon={MapPin}  color="blue" />
        </div>

        <div className="flex gap-2">
          {[7, 14, 30, 60].map(d => (
            <button key={d} onClick={() => setPeriod(d)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${period === d ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
              {d}d
            </button>
          ))}
        </div>

        <div className="card p-6">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">User Registrations — Last {period} Days</h2>
          {loading ? <Loader /> : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={growth} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="pink" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF4B7A" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#FF4B7A" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94A3B8' }} tickFormatter={d => d.slice(5)} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E2E8F0' }} />
                <Area type="monotone" dataKey="count" name="New Users" stroke="#FF4B7A" fill="url(#pink)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {data?.postActivity?.length > 0 && (
          <div className="card p-6">
            <h2 className="text-sm font-semibold text-slate-700 mb-4">Community Activity</h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data.postActivity} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94A3B8' }} tickFormatter={d => d.slice(5)} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E2E8F0' }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="posts" name="Posts" fill="#FF4B7A" radius={[3,3,0,0]} />
                <Bar dataKey="likes" name="Likes" fill="#818CF8" radius={[3,3,0,0]} />
                <Bar dataKey="views" name="Views" fill="#34D399" radius={[3,3,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card p-6">
            <h2 className="text-sm font-semibold text-slate-700 mb-4">Gender Distribution</h2>
            {genderData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={genderData} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`} labelLine={false}>
                    {genderData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : <Empty />}
          </div>
          <div className="card p-6">
            <h2 className="text-sm font-semibold text-slate-700 mb-4">User Plan Distribution</h2>
            {planData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={planData} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`} labelLine={false}>
                    {planData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : <Empty />}
          </div>
        </div>

        {data?.locationDist?.length > 0 && (
          <div className="card p-6">
            <h2 className="text-sm font-semibold text-slate-700 mb-4">Top 10 Cities</h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data.locationDist} layout="vertical" margin={{ top: 0, right: 20, bottom: 0, left: 60 }}>
                <XAxis type="number" tick={{ fontSize: 10, fill: '#94A3B8' }} />
                <YAxis type="category" dataKey="city" tick={{ fontSize: 11, fill: '#64748B' }} />
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Bar dataKey="count" name="Users" fill="#FF4B7A" radius={[0,4,4,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </main>
    </>
  );
}

const Loader = () => <div className="h-52 flex items-center justify-center"><span className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /></div>;
const Empty  = () => <div className="h-48 flex items-center justify-center text-slate-300 text-sm">No data yet</div>;
