
import React from 'react';
import ReactDOM from 'react-dom/client';

const App = () => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-slate-100 p-8 text-center font-sans">
    <div className="w-20 h-20 bg-indigo-600 rounded-2xl flex items-center justify-center mb-8 animate-bounce shadow-2xl shadow-indigo-500/40 rotate-3">
      <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    </div>
    
    <h1 className="text-4xl font-black mb-4 tracking-tighter">SocialPilot Engine <span className="text-indigo-500">v2.0</span></h1>
    <p className="text-slate-400 max-w-lg mx-auto leading-relaxed mb-8">
      Your production-ready automation backend is humming. Now with <strong>Gemini AI Enrichment</strong> for automatic caption generation.
    </p>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-4xl">
      <div className="p-6 bg-slate-800/50 rounded-2xl border border-slate-700 hover:border-indigo-500/50 transition-colors">
        <h3 className="text-xs font-black text-indigo-400 uppercase mb-3 tracking-widest">Scheduler</h3>
        <p className="text-lg font-bold">Active</p>
        <p className="text-xs text-slate-500 mt-1">Checking every 30m</p>
      </div>
      
      <div className="p-6 bg-slate-800/50 rounded-2xl border border-slate-700 hover:border-emerald-500/50 transition-colors">
        <h3 className="text-xs font-black text-emerald-400 uppercase mb-3 tracking-widest">AI Content</h3>
        <p className="text-lg font-bold">Enabled</p>
        <p className="text-xs text-slate-500 mt-1">Gemini 3 Flash Ready</p>
      </div>

      <div className="p-6 bg-slate-800/50 rounded-2xl border border-slate-700 hover:border-amber-500/50 transition-colors">
        <h3 className="text-xs font-black text-amber-400 uppercase mb-3 tracking-widest">Endpoints</h3>
        <div className="space-y-1 mt-2">
           <p className="text-[10px] font-mono text-slate-500">POST /api/trigger-sync</p>
           <p className="text-[10px] font-mono text-slate-500">GET /api/debug/verify-integrations</p>
        </div>
      </div>
    </div>

    <div className="mt-12 p-4 bg-indigo-950/30 border border-indigo-500/20 rounded-xl text-sm text-indigo-300">
      Tip: Set status to <code className="bg-indigo-900 px-2 py-0.5 rounded text-white">pending-ai</code> in your sheet to auto-generate captions.
    </div>
  </div>
);

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<App />);
