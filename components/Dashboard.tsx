
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const data = [
  { name: 'Mon', engagement: 400 },
  { name: 'Tue', engagement: 300 },
  { name: 'Wed', engagement: 600 },
  { name: 'Thu', engagement: 800 },
  { name: 'Fri', engagement: 500 },
  { name: 'Sat', engagement: 900 },
  { name: 'Sun', engagement: 700 },
];

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Scheduled', value: '12', color: 'text-indigo-600', sub: '+2 from last week' },
          { label: 'Published (30d)', value: '45', color: 'text-emerald-600', sub: '98% success rate' },
          { label: 'Total Engagement', value: '12.4k', color: 'text-orange-600', sub: '+12.5% increase' },
          { label: 'Avg. Reach', value: '3.1k', color: 'text-rose-600', sub: 'Per post average' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <p className="text-sm font-medium text-slate-500 mb-1">{stat.label}</p>
            <h3 className={`text-3xl font-bold ${stat.color} mb-2`}>{stat.value}</h3>
            <p className="text-xs text-slate-400 font-medium">{stat.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-slate-800">Engagement Overview</h3>
            <select className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-600">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                />
                <Bar dataKey="engagement" radius={[6, 6, 0, 0]}>
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 5 ? '#4f46e5' : '#e2e8f0'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Upcoming Activity</h3>
          <div className="space-y-6">
            {[
              { time: '14:30 PM', title: 'Product Launch Announcement', platform: 'Twitter' },
              { time: 'Tomorrow, 10:00 AM', title: 'Weekly Tech Digest', platform: 'LinkedIn' },
              { time: 'Tomorrow, 18:00 PM', title: 'Lifestyle Feature', platform: 'Instagram' },
            ].map((item, i) => (
              <div key={i} className="flex items-start space-x-4">
                <div className="w-1.5 h-12 bg-indigo-100 rounded-full relative">
                  <div className="absolute top-0 left-0 w-full h-4 bg-indigo-600 rounded-full"></div>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase">{item.time}</p>
                  <h4 className="text-sm font-semibold text-slate-800 mt-1">{item.title}</h4>
                  <p className="text-xs text-indigo-600 mt-0.5">{item.platform}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-8 py-3 bg-slate-50 text-slate-600 text-sm font-bold rounded-xl hover:bg-slate-100 transition">
            View All Schedule
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
