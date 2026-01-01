
import React, { useEffect, useState } from 'react';
// Fix: Added SocialAccount interface and Platform enum
import { SocialAccount, Platform } from '../types';
import { uploadPostService } from '../services/uploadPostService';

const Accounts: React.FC = () => {
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    uploadPostService.getConnectedAccounts().then(data => {
      setAccounts(data);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="p-8 text-center text-slate-500">Loading accounts...</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Connected Profiles</h2>
          <p className="text-slate-500">Manage your social identities and distribution channels.</p>
        </div>
        <button className="px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition">
          + Add Account
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {accounts.map((account) => (
          <div key={account.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition group">
            <div className="flex items-center space-x-4 mb-6">
              <div className="relative">
                <img src={account.avatar} alt={account.username} className="w-14 h-14 rounded-2xl object-cover border-2 border-slate-50" />
                {/* Fix: Used Platform enum members for conditional logic */}
                <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center border-2 border-white shadow-sm ${
                  account.platform === Platform.TWITTER ? 'bg-sky-500' :
                  account.platform === Platform.LINKEDIN ? 'bg-blue-700' :
                  account.platform === Platform.INSTAGRAM ? 'bg-pink-600' : 'bg-slate-800'
                }`}>
                  <span className="text-[10px] text-white font-bold uppercase">{account.platform[0]}</span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-lg font-bold text-slate-800 truncate">{account.username}</h4>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{account.platform}</p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className={`w-2 h-2 rounded-full mr-2 ${account.connected ? 'bg-green-500' : 'bg-slate-300'}`}></div>
                <span className="text-xs font-bold text-slate-500">{account.connected ? 'ACTIVE' : 'DISCONNECTED'}</span>
              </div>
              <div className="flex space-x-2">
                 <button className="p-2 text-slate-400 hover:text-indigo-600 transition">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  </svg>
                </button>
                <button className="p-2 text-slate-400 hover:text-rose-600 transition">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}

        <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center group hover:border-indigo-300 transition-colors cursor-pointer">
          <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-slate-400 group-hover:text-indigo-600 transition mb-3 shadow-sm">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <span className="text-sm font-bold text-slate-500 group-hover:text-indigo-600">Connect New Platform</span>
        </div>
      </div>
    </div>
  );
};

export default Accounts;
