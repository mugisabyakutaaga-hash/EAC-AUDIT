
import React, { useState } from 'react';
import { Language, EACCountry, ComplianceAlertConfig, UserRole } from '../types';
import { TRANSLATIONS, ICONS, EAC_METADATA } from '../constants';

interface SettingsProps {
  language: Language;
  setLanguage: (l: Language) => void;
  country: EACCountry;
  setCountry: (c: EACCountry) => void;
  customCategories: string[];
  onAddCustomCategory: (cat: string) => void;
  onRemoveCustomCategory: (cat: string) => void;
  role: UserRole;
  alertConfig: ComplianceAlertConfig;
  setAlertConfig: (cfg: ComplianceAlertConfig) => void;
}

const Settings: React.FC<SettingsProps> = ({ 
  language, 
  setLanguage, 
  country,
  setCountry,
  customCategories, 
  onAddCustomCategory, 
  onRemoveCustomCategory,
  role,
  alertConfig,
  setAlertConfig
}) => {
  const t = TRANSLATIONS[language];
  const [newCat, setNewCat] = useState('');

  const EAC_COUNTRIES: EACCountry[] = ['Uganda', 'Kenya', 'Tanzania', 'Rwanda', 'Burundi', 'SouthSudan', 'DRC', 'Somalia'];

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <h4 className="text-lg font-black text-slate-800 mb-6 uppercase tracking-tight">Regional Setup</h4>
          <div className="space-y-6">
            <label className="block">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">{t.hqLocation}</span>
              <select 
                value={country}
                onChange={(e) => setCountry(e.target.value as EACCountry)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-slate-900 font-bold focus:ring-4 focus:ring-green-500/10 outline-none transition"
              >
                {EAC_COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </label>

            <label className="block">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">System Language</span>
              <select 
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-slate-900 font-bold focus:ring-4 focus:ring-green-500/10 outline-none transition"
              >
                <option value="en">English (Universal)</option>
                <option value="lg">Luganda (Uganda Focus)</option>
                <option value="sw">Swahili (EAC Regional)</option>
              </select>
            </label>
          </div>
        </div>

        {role === 'auditor' && (
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
            <h4 className="text-lg font-black text-slate-800 mb-6 uppercase tracking-tight">{t.complianceAlerts}</h4>
            <div className="space-y-6">
               <label className="block">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">{t.lowScoreAlert}</span>
                <input 
                  type="number"
                  value={alertConfig.scoreThreshold}
                  onChange={(e) => setAlertConfig({...alertConfig, scoreThreshold: Number(e.target.value)})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-slate-900 font-bold outline-none"
                />
              </label>
              <label className="block">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">{t.highIssuesAlert}</span>
                <input 
                  type="number"
                  value={alertConfig.issueThreshold}
                  onChange={(e) => setAlertConfig({...alertConfig, issueThreshold: Number(e.target.value)})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-slate-900 font-bold outline-none"
                />
              </label>
              <label className="block">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">{t.deadlineAlert}</span>
                <input 
                  type="number"
                  value={alertConfig.deadlineAlertDays}
                  onChange={(e) => setAlertConfig({...alertConfig, deadlineAlertDays: Number(e.target.value)})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-slate-900 font-bold outline-none"
                />
              </label>
            </div>
          </div>
        )}

        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <h4 className="text-lg font-black text-slate-800 mb-6 uppercase tracking-tight">{t.customCategories}</h4>
          <div className="space-y-4">
            <div className="flex gap-3">
              <input 
                type="text" 
                value={newCat}
                onChange={(e) => setNewCat(e.target.value)}
                placeholder="e.g. Regional Freight"
                className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-medium outline-none"
              />
              <button onClick={() => { onAddCustomCategory(newCat); setNewCat(''); }} className="bg-green-600 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase">Add</button>
            </div>
            <div className="flex flex-wrap gap-2 pt-4">
              {customCategories.map(cat => (
                <span key={cat} className="bg-slate-100 text-slate-600 border border-slate-200 rounded-full px-4 py-1.5 text-xs font-black uppercase tracking-tighter flex items-center gap-2">
                  {cat}
                  <button onClick={() => onRemoveCustomCategory(cat)} className="text-slate-400 hover:text-red-500 transition">&times;</button>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <ICONS.Verified />
        </div>
        <h4 className="text-xl font-black mb-4">EAC Compliance Profile</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-6">
           <div><p className="text-[10px] font-black text-slate-500 uppercase mb-1">Business TIN</p><p className="font-bold text-lg">1001004455</p></div>
           <div><p className="text-[10px] font-black text-slate-500 uppercase mb-1">EAC Status</p><p className="font-bold text-lg text-green-500">Certified</p></div>
           <div><p className="text-[10px] font-black text-slate-500 uppercase mb-1">Local Body</p><p className="font-bold text-lg">{EAC_METADATA[country].bodies}</p></div>
           <div><p className="text-[10px] font-black text-slate-500 uppercase mb-1">Audit Firm</p><p className="font-bold text-lg">Regional CPA</p></div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
