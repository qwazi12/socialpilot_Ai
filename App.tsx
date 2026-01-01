
import React, { useState, useEffect } from 'react';
import { Post, Platform, UploadPostConfig } from './types';
import { generateSmartCaption } from './services/geminiService';
import { UploadPostService } from './services/uploadPostService';

// --- Sub-components ---

const StatCard = ({ label, value, icon, color }: any) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center space-x-4">
    <div className={`p-3 rounded-xl ${color} bg-opacity-10 ${color.replace('text-', 'bg-')}`}>
      {icon}
    </div>
    <div>
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
    </div>
  </div>
);

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'composer' | 'history' | 'settings'>('dashboard');
  const [posts, setPosts] = useState<Post[]>([]);
  const [config, setConfig] = useState<UploadPostConfig>({
    apiKey: localStorage.getItem('UP_API_KEY') || '',
    userId: localStorage.getItem('UP_USER_ID') || 'admin_user'
  });
  const [isSyncing, setIsSyncing] = useState(false);

  // Sync Logic (Browser-side implementation of the requested automation)
  const runManualSync = async () => {
    setIsSyncing(true);
    const now = new Date();
    
    const updatedPosts = [...posts];
    for (let i = 0; i < updatedPosts.length; i++) {
      const post = updatedPosts[i];
      if (post.status === 'Scheduled' && new Date(post.scheduledTime) <= now) {
        try {
          await UploadPostService.uploadVideo(post, config);
          updatedPosts[i] = { ...post, status: 'Posted', notes: 'Success' };
        } catch (e: any) {
          updatedPosts[i] = { ...post, status: 'Failed', notes: e.message };
        }
      }
    }
    setPosts(updatedPosts);
    setTimeout(() => setIsSyncing(false), 1000);
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col sticky top-0 h-screen">
        <div className="p-8">
          <div className="flex items-center space-x-2 text-indigo-600 mb-8">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span className="text-xl font-black tracking-tight text-slate-900">SocialPilot</span>
          </div>
          
          <nav className="space-y-1">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
              { id: 'composer', label: 'Studio', icon: 'M12 4v16m8-8H4' },
              { id: 'history', label: 'History', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
              { id: 'settings', label: 'Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                  activeTab === item.id 
                  ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-sm shadow-indigo-100/50' 
                  : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} />
                </svg>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-slate-100">
          <button 
            onClick={runManualSync}
            disabled={isSyncing}
            className={`w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-xl font-bold transition-all ${
              isSyncing ? 'bg-slate-100 text-slate-400' : 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700'
            }`}
          >
            <svg className={`w-5 h-5 ${isSyncing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>{isSyncing ? 'Syncing...' : 'Run Sync Now'}</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10 overflow-y-auto">
        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="flex justify-between items-end">
              <div>
                <h2 className="text-3xl font-bold tracking-tight">Overview</h2>
                <p className="text-slate-500 font-medium">Your multi-platform performance at a glance.</p>
              </div>
              <div className="flex bg-white p-1 rounded-xl shadow-sm border border-slate-200">
                <button className="px-4 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-lg">Last 7 Days</button>
                <button className="px-4 py-1.5 text-sm font-semibold bg-slate-900 text-white shadow-md rounded-lg">Last 30 Days</button>
              </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <StatCard label="Scheduled" value={posts.filter(p => p.status === 'Scheduled').length} color="text-indigo-600" icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" strokeWidth="2"/></svg>} />
              <StatCard label="Success" value={posts.filter(p => p.status === 'Posted').length} color="text-emerald-600" icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" strokeWidth="2"/></svg>} />
              <StatCard label="Failed" value={posts.filter(p => p.status === 'Failed').length} color="text-rose-600" icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="2"/></svg>} />
              <StatCard label="Connected" value="3" color="text-amber-600" icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z" strokeWidth="2"/></svg>} />
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
              <h3 className="text-lg font-bold mb-6">Recent Activity</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-50 text-slate-400 text-sm font-bold uppercase tracking-wider">
                      <th className="pb-4">Content</th>
                      <th className="pb-4">Platforms</th>
                      <th className="pb-4">Time</th>
                      <th className="pb-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {posts.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-10 text-center text-slate-400 italic">No activity yet. Head to the Studio to start.</td>
                      </tr>
                    ) : (
                      posts.map(post => (
                        <tr key={post.id} className="group hover:bg-slate-50/50 transition-colors">
                          <td className="py-4 font-semibold text-slate-800">{post.title}</td>
                          <td className="py-4">
                            <div className="flex -space-x-1">
                              {post.platforms.map(p => (
                                <div key={p} className="w-7 h-7 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-bold uppercase text-slate-500">
                                  {p[0]}
                                </div>
                              ))}
                            </div>
                          </td>
                          <td className="py-4 text-sm text-slate-500">
                            {new Date(post.scheduledTime).toLocaleString()}
                          </td>
                          <td className="py-4">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                              post.status === 'Posted' ? 'bg-emerald-100 text-emerald-700' :
                              post.status === 'Scheduled' ? 'bg-indigo-100 text-indigo-700' :
                              'bg-rose-100 text-rose-700'
                            }`}>
                              {post.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'composer' && (
          <ComposerView onSave={(post) => {
            setPosts([post, ...posts]);
            setActiveTab('dashboard');
          }} />
        )}

        {activeTab === 'settings' && (
          <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in scale-95 duration-300">
            <h2 className="text-3xl font-bold">API Configuration</h2>
            <div className="bg-white p-8 rounded-2xl border border-slate-200 space-y-6 shadow-sm">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Upload-Post API Key</label>
                <input 
                  type="password"
                  value={config.apiKey}
                  onChange={(e) => {
                    const val = e.target.value;
                    setConfig(prev => ({ ...prev, apiKey: val }));
                    localStorage.setItem('UP_API_KEY', val);
                  }}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all"
                  placeholder="Enter your API key..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">User ID</label>
                <input 
                  type="text"
                  value={config.userId}
                  onChange={(e) => {
                    const val = e.target.value;
                    setConfig(prev => ({ ...prev, userId: val }));
                    localStorage.setItem('UP_USER_ID', val);
                  }}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all"
                  placeholder="Your username/ID"
                />
              </div>
              <div className="pt-4 flex items-center justify-between border-t border-slate-100">
                <p className="text-xs text-slate-400 italic">Credentials are stored locally in your browser.</p>
                <button className="px-6 py-2 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition shadow-md">
                  Verify Credentials
                </button>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-100 p-6 rounded-2xl flex items-start space-x-4">
              <div className="p-2 bg-amber-100 rounded-lg text-amber-700">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
              </div>
              <div>
                <h4 className="font-bold text-amber-900">Security Note</h4>
                <p className="text-sm text-amber-800/80">Never share your API keys. SocialPilot uses browser storage to keep keys accessible only to you.</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
           <div className="space-y-8 animate-in fade-in duration-500">
              <h2 className="text-3xl font-bold tracking-tight">Full History</h2>
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                 <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between">
                    <input type="text" placeholder="Search logs..." className="bg-white border border-slate-200 px-4 py-1.5 rounded-lg text-sm w-64" />
                    <button className="text-sm font-bold text-indigo-600 hover:text-indigo-700">Export CSV</button>
                 </div>
                 <div className="divide-y divide-slate-100">
                    {posts.map(p => (
                      <div key={p.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                        <div>
                          <h4 className="font-bold text-slate-800">{p.title}</h4>
                          <p className="text-xs text-slate-400 mt-1">{p.id} • Created {new Date(p.createdAt).toLocaleDateString()}</p>
                          {p.notes && <p className="text-xs text-rose-500 mt-1 font-mono">{p.notes}</p>}
                        </div>
                        <div className="flex items-center space-x-4">
                          <span className={`text-xs font-black uppercase tracking-widest ${p.status === 'Posted' ? 'text-emerald-500' : 'text-slate-400'}`}>
                            {p.status}
                          </span>
                          <button className="p-2 text-slate-400 hover:text-indigo-600">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" strokeWidth="2"/><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" strokeWidth="2"/></svg>
                          </button>
                        </div>
                      </div>
                    ))}
                 </div>
              </div>
           </div>
        )}
      </main>
    </div>
  );
}

// --- Component: Composer ---

function ComposerView({ onSave }: { onSave: (p: Post) => void }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    topic: '',
    driveLink: '',
    platforms: [] as Platform[],
    scheduledTime: '',
    caption: '',
    hashtags: [] as string[]
  });
  const [isGenerating, setIsGenerating] = useState(false);

  const handleAISuggest = async () => {
    if (!formData.topic) return;
    setIsGenerating(true);
    try {
      const result = await generateSmartCaption(formData.topic, formData.platforms);
      setFormData(prev => ({ 
        ...prev, 
        caption: result.caption, 
        hashtags: result.hashtags 
      }));
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const togglePlatform = (p: Platform) => {
    setFormData(prev => ({
      ...prev,
      platforms: prev.platforms.includes(p) 
        ? prev.platforms.filter(x => x !== p) 
        : [...prev.platforms, p]
    }));
  };

  return (
    <div className="max-w-4xl mx-auto animate-in zoom-in-95 duration-300">
      <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
        {/* Progress Bar */}
        <div className="h-2 w-full bg-slate-50 flex">
          <div className={`h-full bg-indigo-600 transition-all duration-500 ${step === 1 ? 'w-1/3' : step === 2 ? 'w-2/3' : 'w-full'}`} />
        </div>

        <div className="p-10 space-y-10">
          {step === 1 && (
            <div className="space-y-8 animate-in slide-in-from-right-8 duration-300">
              <header>
                <h3 className="text-2xl font-bold">Content Basics</h3>
                <p className="text-slate-500 font-medium">Define your project and distribution channels.</p>
              </header>

              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Project Title</label>
                  <input 
                    type="text" 
                    value={formData.title}
                    onChange={e => setFormData(p => ({ ...p, title: e.target.value }))}
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none" 
                    placeholder="e.g. Q4 Launch Video"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Drive File Link</label>
                  <input 
                    type="text" 
                    value={formData.driveLink}
                    onChange={e => setFormData(p => ({ ...p, driveLink: e.target.value }))}
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none" 
                    placeholder="paste g-drive url"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-sm font-bold text-slate-700">Select Platforms</label>
                <div className="flex flex-wrap gap-3">
                  {(['tiktok', 'instagram', 'youtube', 'twitter', 'linkedin'] as Platform[]).map(p => (
                    <button
                      key={p}
                      onClick={() => togglePlatform(p)}
                      className={`px-6 py-2.5 rounded-xl text-sm font-bold border transition-all ${
                        formData.platforms.includes(p)
                        ? 'bg-slate-900 border-slate-900 text-white shadow-lg'
                        : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                      }`}
                    >
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button 
                  disabled={!formData.title || !formData.driveLink || formData.platforms.length === 0}
                  onClick={() => setStep(2)}
                  className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-2xl shadow-xl shadow-indigo-200 hover:bg-indigo-700 disabled:opacity-50 disabled:shadow-none transition-all"
                >
                  Continue to Studio
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8 animate-in slide-in-from-right-8 duration-300">
              <header>
                <h3 className="text-2xl font-bold">Studio Intelligence</h3>
                <p className="text-slate-500 font-medium">Use AI to craft the perfect caption for your media.</p>
              </header>

              <div className="space-y-6">
                <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100 flex items-end space-x-4">
                   <div className="flex-1 space-y-2">
                      <label className="text-xs font-bold text-indigo-700 uppercase">Context for AI</label>
                      <input 
                        type="text" 
                        value={formData.topic}
                        onChange={e => setFormData(p => ({ ...p, topic: e.target.value }))}
                        className="w-full bg-white border border-indigo-200 px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-indigo-400"
                        placeholder="What is this video about?" 
                      />
                   </div>
                   <button 
                    onClick={handleAISuggest}
                    disabled={isGenerating}
                    className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition flex items-center space-x-2"
                   >
                     {isGenerating ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>}
                     <span>Generate</span>
                   </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label className="text-sm font-bold text-slate-700">Final Caption</label>
                    <textarea 
                      value={formData.caption}
                      onChange={e => setFormData(p => ({ ...p, caption: e.target.value }))}
                      className="w-full h-40 px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                    />
                  </div>
                  <div className="space-y-4 flex flex-col">
                    <label className="text-sm font-bold text-slate-700">Schedule Time</label>
                    <input 
                      type="datetime-local" 
                      value={formData.scheduledTime}
                      onChange={e => setFormData(p => ({ ...p, scheduledTime: e.target.value }))}
                      className="px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                    <div className="mt-auto p-5 bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
                      <p className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-tighter">Tags</p>
                      <div className="flex flex-wrap gap-2">
                        {formData.hashtags.map(h => <span key={h} className="px-2 py-1 bg-white rounded-md text-[10px] font-bold text-indigo-600 shadow-sm border border-slate-100">#{h}</span>)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-6">
                <button onClick={() => setStep(1)} className="px-6 py-3 font-bold text-slate-400 hover:text-slate-600">Back</button>
                <button 
                  disabled={!formData.caption || !formData.scheduledTime}
                  onClick={() => onSave({
                    id: Math.random().toString(36).substr(2, 9),
                    title: formData.title,
                    description: formData.caption + '\n\n' + formData.hashtags.map(h => '#'+h).join(' '),
                    videoUrl: formData.driveLink,
                    platforms: formData.platforms,
                    status: 'Scheduled',
                    scheduledTime: formData.scheduledTime,
                    createdAt: new Date().toISOString()
                  })}
                  className="px-10 py-4 bg-slate-900 text-white font-bold rounded-2xl shadow-xl hover:bg-black transition-all transform active:scale-95"
                >
                  Schedule Post
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
