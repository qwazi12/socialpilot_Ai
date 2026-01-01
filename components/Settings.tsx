
import React, { useState } from 'react';
// Fix: uploadPostService is now exported correctly from the service file
import { uploadPostService } from '../services/uploadPostService';

const Settings: React.FC = () => {
  const [apiKey, setApiKey] = useState(uploadPostService.getApiKey() || '');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    uploadPostService.setApiKey(apiKey);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-8 border-b border-slate-100">
          <h2 className="text-2xl font-bold text-slate-800">Integration Settings</h2>
          <p className="text-slate-500 mt-1">Configure your API connections to external services.</p>
        </div>
        <div className="p-8 space-y-8">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-bold text-slate-700">Upload-Post API Key</label>
              <a href="https://upload-post.com/dashboard/api" target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-indigo-600 hover:underline">Get your key here</a>
            </div>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your API key..."
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
            />
            <p className="text-xs text-slate-400">Your API key is used to authenticate requests to the Upload-Post distribution network. It is stored locally in your browser.</p>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-4">
             {saved && <span className="text-sm text-green-600 font-medium">Settings saved!</span>}
             <button 
              onClick={handleSave}
              className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition"
             >
               Save Configuration
             </button>
          </div>
        </div>
      </div>

      <div className="mt-8 bg-amber-50 rounded-2xl p-6 border border-amber-100">
        <div className="flex items-start space-x-4">
          <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h4 className="text-sm font-bold text-amber-800">Security Note</h4>
            <p className="text-sm text-amber-700 mt-1">The Gemini AI API key is pre-configured via the environment. Only the Upload-Post key needs to be managed here to enable content distribution.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
