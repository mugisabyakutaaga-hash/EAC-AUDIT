
import React, { useState, useMemo } from 'react';
import { TRANSLATIONS, ICONS } from '../constants';
import { Language, Client } from '../types';

interface AuditorPortalProps {
  language: Language;
  clients: Client[];
  onSelectClient: (client: Client) => void;
}

const AuditorPortal: React.FC<AuditorPortalProps> = ({ language, clients, onSelectClient }) => {
  const t = TRANSLATIONS[language];
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'compliance' | 'risk'>('name');

  const stats = useMemo(() => ({
    total: clients.length,
    risk: clients.filter(c => c.complianceStatus !== 'compliant').length,
    anomalies: clients.reduce((sum, c) => sum + c.anomalyCount, 0),
    avgScore: Math.round(clients.reduce((sum, c) => sum + (c.complianceScore || 0), 0) / clients.length)
  }), [clients]);

  const filteredAndSortedClients = useMemo(() => {
    let result = clients.filter(c => 
      c.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.tin.includes(searchQuery)
    );

    result.sort((a, b) => {
      if (sortBy === 'name') return a.businessName.localeCompare(b.businessName);
      if (sortBy === 'compliance') return b.complianceScore - a.complianceScore;
      if (sortBy === 'risk') return b.anomalyCount - a.anomalyCount;
      return 0;
    });

    return result;
  }, [clients, searchQuery, sortBy]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Portfolio Size</p>
          <div className="flex items-end space-x-2">
            <h3 className="text-4xl font-black text-slate-900">{stats.total}</h3>
            <span className="text-slate-400 text-xs font-bold uppercase mb-2">Entities</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm border-l-4 border-l-orange-500">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Risk Exposure</p>
          <div className="flex items-end space-x-2">
            <h3 className="text-4xl font-black text-orange-600">{stats.risk}</h3>
            <span className="text-orange-300 text-xs font-bold uppercase mb-2">High Risk</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm border-l-4 border-l-red-500">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Portfolio Flags</p>
          <div className="flex items-end space-x-2">
            <h3 className="text-4xl font-black text-red-600">{stats.anomalies}</h3>
            <span className="text-red-300 text-xs font-bold uppercase mb-2">Issues</span>
          </div>
        </div>
        <div className="bg-slate-900 p-6 rounded-3xl text-white shadow-xl">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Portfolio Score</p>
          <div className="flex items-end space-x-2">
            <h3 className="text-4xl font-black text-green-500">{stats.avgScore}%</h3>
            <span className="text-slate-600 text-xs font-bold uppercase mb-2">Health</span>
          </div>
        </div>
      </div>

      {/* Client List controls */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
         <div className="relative w-full md:w-96">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </div>
            <input 
              type="text" 
              placeholder={t.searchClients}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-500/20 transition"
            />
         </div>
         <div className="flex items-center space-x-4 w-full md:w-auto">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.sortBy}:</span>
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-black uppercase outline-none focus:ring-2 focus:ring-green-500/20"
            >
              <option value="name">Name</option>
              <option value="compliance">Compliance Score</option>
              <option value="risk">Risk / Issues</option>
            </select>
         </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
           <div>
              <h4 className="font-bold text-slate-800 text-lg">{t.clientPortfolio}</h4>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Audit Readiness Framework: ICPAU 2025</p>
           </div>
           <div className="flex space-x-3">
              <button className="text-[10px] font-black bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 transition shadow-sm uppercase tracking-widest active:scale-95">Portfolio Export</button>
              <button className="text-[10px] font-black bg-green-600 px-4 py-2.5 rounded-xl text-white hover:bg-green-700 transition shadow-lg shadow-green-900/10 uppercase tracking-widest active:scale-95">Add New Client</button>
           </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Client Name / TIN</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Trust Score</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Compliance Posture</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Open Issues</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAndSortedClients.map((client) => (
                <tr key={client.id} className="group hover:bg-slate-50/80 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                       <span className="font-bold text-slate-900 text-sm group-hover:text-green-700 transition-colors">{client.businessName}</span>
                       <span className="text-[10px] text-slate-400 font-medium tracking-tight">TIN: {client.tin} • {client.location}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                     <div className="flex items-center">
                        <div className="w-24 h-1.5 bg-slate-100 rounded-full mr-3">
                           <div className={`h-full rounded-full ${client.complianceScore > 70 ? 'bg-green-500' : 'bg-orange-500'}`} style={{ width: `${client.complianceScore}%` }}></div>
                        </div>
                        <span className="text-xs font-black text-slate-700">{client.complianceScore}%</span>
                     </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                      client.complianceStatus === 'compliant' 
                        ? 'bg-green-100 text-green-700 border border-green-200' 
                        : client.complianceStatus === 'warning'
                        ? 'bg-orange-100 text-orange-700 border border-orange-200'
                        : 'bg-red-100 text-red-700 border border-red-200'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full mr-2 ${
                        client.complianceStatus === 'compliant' ? 'bg-green-500' : 'bg-orange-500'
                      }`}></span>
                      {client.complianceStatus}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <span className={`font-black text-sm ${client.anomalyCount > 0 ? 'text-red-600' : 'text-slate-400'}`}>
                      {client.anomalyCount}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button 
                      onClick={() => onSelectClient(client)}
                      className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest px-5 py-2.5 rounded-xl hover:bg-green-600 transition shadow-sm active:scale-95 flex items-center inline-flex"
                    >
                      Audit Hub
                    </button>
                  </td>
                </tr>
              ))}
              {filteredAndSortedClients.length === 0 && (
                <tr>
                   <td colSpan={5} className="px-8 py-12 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">No matching clients found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AuditorPortal;
