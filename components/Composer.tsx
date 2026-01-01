
import React, { useState } from 'react';
import { Platform, AICaptionSuggestion } from '../types';
import { generatePostSuggestions, analyzePostQuality } from '../services/geminiService';
import { uploadPostService } from '../services/uploadPostService';

const Composer: React.FC = () => {
  const [content, setContent] = useState('');
  // Fix: Used Platform.TWITTER from enum
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>([Platform.TWITTER]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [suggestions, setSuggestions] = useState<AICaptionSuggestion[]>([]);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [scheduledDate, setScheduledDate] = useState('');
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const togglePlatform = (p: Platform) => {
    setSelectedPlatforms(prev => 
      prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]
    );
  };

  const handleAISuggest = async () => {
    if (!content.trim()) return;
    setIsGenerating(true);
    setSuggestions([]);
    try {
      const res = await generatePostSuggestions(content, selectedPlatforms[0]);
      setSuggestions(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAnalyze = async () => {
    if (!content.trim()) return;
    setIsAnalyzing(true);
    try {
        const res = await analyzePostQuality(content);
        setAnalysis(res);
    } catch (err) {
        console.error(err);
    } finally {
        setIsAnalyzing(false);
    }
  }

  const handlePost = async () => {
    try {
      setStatus(null);
      const res = await uploadPostService.createPost({
        content,
        platforms: selectedPlatforms,
        scheduledAt: scheduledDate || undefined,
        status: scheduledDate ? 'scheduled' : 'published'
      });
      setStatus({ type: 'success', message: res.message || 'Action completed!' });
      if (!scheduledDate) setContent('');
    } catch (err: any) {
      setStatus({ type: 'error', message: err.message || 'Something went wrong' });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-800">Create New Post</h2>
          <div className="flex space-x-2">
            {/* Fix: Cast Object.values to Platform array and added type safety */}
            {(Object.values(Platform) as Platform[]).map(p => (
              <button
                key={p}
                onClick={() => togglePlatform(p)}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  selectedPlatforms.includes(p) 
                    ? 'bg-indigo-600 text-white shadow-md' 
                    : 'bg-slate-100 text-slate-400 grayscale hover:grayscale-0'
                }`}
                title={p}
              >
                <span className="capitalize text-[10px] font-bold">{p[0]}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="relative">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's happening? Use AI to polish your thoughts..."
              className="w-full h-40 p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none text-slate-700"
            />
            <div className="absolute bottom-4 right-4 text-xs text-slate-400 font-medium">
              {content.length} characters
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button 
              onClick={handleAISuggest}
              disabled={isGenerating || !content}
              className="flex items-center px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition disabled:opacity-50"
            >
              <svg className={`w-4 h-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              AI Magic Suggestions
            </button>
            <button 
                onClick={handleAnalyze}
                disabled={isAnalyzing || !content}
                className="flex items-center px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition disabled:opacity-50"
            >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                AI Quality Check
            </button>
          </div>

          {analysis && (
            <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
                <p className="text-sm font-semibold text-emerald-800 mb-1">Post Insight:</p>
                <p className="text-sm text-emerald-700 italic">"{analysis}"</p>
            </div>
          )}

          {suggestions.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fadeIn">
              {suggestions.map((s, i) => (
                <div key={i} className="p-4 bg-white border border-slate-200 rounded-xl hover:border-indigo-300 transition-colors group">
                  <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider">{s.tone}</span>
                  <p className="text-sm text-slate-600 mt-2 line-clamp-3">{s.text}</p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {s.hashtags.map(h => <span key={h} className="text-[10px] text-slate-400">#{h}</span>)}
                  </div>
                  <button 
                    onClick={() => setContent(s.text + ' ' + s.hashtags.map(h => '#'+h).join(' '))}
                    className="mt-3 text-xs font-semibold text-indigo-600 group-hover:underline"
                  >
                    Use this version
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="pt-6 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <label className="text-sm font-medium text-slate-500 whitespace-nowrap">Schedule for:</label>
              <input 
                type="datetime-local" 
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
              />
            </div>
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => setContent('')}
                className="px-6 py-2 text-slate-500 font-medium hover:text-slate-700"
              >
                Clear
              </button>
              <button 
                onClick={handlePost}
                className="px-8 py-2 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transform transition active:scale-95"
              >
                {scheduledDate ? 'Schedule via Upload-Post' : 'Post Now'}
              </button>
            </div>
          </div>

          {status && (
            <div className={`mt-4 p-4 rounded-xl text-sm font-medium ${status.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {status.message}
            </div>
          )}
        </div>
      </div>
      
      <div className="bg-indigo-900 rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="relative z-10 flex items-center justify-between">
            <div>
                <h3 className="text-2xl font-bold mb-2">Power up your distribution</h3>
                <p className="text-indigo-200 max-w-lg">SocialPilot uses the official <b>Upload-Post API</b> to ensure your content reaches all your audiences instantly and reliably.</p>
            </div>
            <div className="hidden lg:block">
                <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center animate-pulse">
                    <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                </div>
            </div>
        </div>
        <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-indigo-600/20 rounded-full"></div>
      </div>
    </div>
  );
};

export default Composer;
