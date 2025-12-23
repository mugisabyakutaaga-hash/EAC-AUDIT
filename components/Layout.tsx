
import React, { ReactNode } from 'react';
import { ICONS, TRANSLATIONS } from '../constants';
import { Language, UserRole, Client } from '../types';

interface LayoutProps {
  children: ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  language: Language;
  role: UserRole;
  onLogout: () => void;
  activeClient: Client | null;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab, language, role, onLogout, activeClient }) => {
  const t = TRANSLATIONS[language];

  const clientNavItems = [
    { id: 'dashboard', label: t.dashboard, icon: <ICONS.Dashboard /> },
    { id: 'transactions', label: t.transactions, icon: <ICONS.Transactions /> },
    { id: 'tax', label: t.taxCompliance, icon: <ICONS.Tax /> },
    { id: 'audit', label: t.auditAssistant, icon: <ICONS.Audit /> },
    { id: 'chat', label: 'AI Advisory', icon: <ICONS.Chat /> },
    { id: 'settings', label: t.settings, icon: <ICONS.Settings /> },
  ];

  const auditorNavItems = [
    { id: 'portfolio', label: t.clientPortfolio, icon: <ICONS.Users /> },
    { id: 'chat', label: 'AI Co-Pilot', icon: <ICONS.Chat /> },
    { id: 'settings', label: t.settings, icon: <ICONS.Settings /> },
  ];

  const auditorHubItems = [
    { id: 'dashboard', label: t.dashboard, icon: <ICONS.Dashboard /> },
    { id: 'transactions', label: t.transactions, icon: <ICONS.Transactions /> },
    { id: 'tax', label: t.taxCompliance, icon: <ICONS.Tax /> },
    { id: 'audit', label: t.auditHub, icon: <ICONS.Audit /> },
    { id: 'workflow', label: t.workflow, icon: <ICONS.Clock /> },
    { id: 'diligence', label: t.dueDiligence, icon: <ICONS.Shield /> },
    { id: 'chat', label: 'AI Advisory', icon: <ICONS.Chat /> },
    { id: 'settings', label: t.settings, icon: <ICONS.Settings /> },
  ];

  let navItems = role === 'auditor' && !activeClient ? auditorNavItems : clientNavItems;
  if (role === 'auditor' && activeClient) {
    navItems = auditorHubItems;
  }

  return (
    <div className="flex flex-col min-h-screen md:flex-row">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-white sticky top-0 h-screen shadow-2xl">
        <div className="p-6 flex items-center space-x-2 border-b border-slate-800">
          <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center font-bold text-white shadow-lg">E</div>
          <h1 className="text-xl font-bold tracking-tight">EAC-Auditor <span className="text-green-500">AI</span></h1>
        </div>
        
        <div className="px-4 py-4">
           <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50 mb-6">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Signed In As</p>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-200 capitalize">{role === 'auditor' && !activeClient ? t.auditorPortal : activeClient ? `Audit: ${activeClient.businessName[0]}.` : t.clientPortal}</span>
                <button 
                  onClick={onLogout}
                  className="text-[10px] font-bold text-red-500 hover:text-red-400 transition"
                >
                  Logout
                </button>
              </div>
           </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                activeTab === item.id 
                  ? 'bg-green-600 text-white shadow-lg shadow-green-900/40' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex-shrink-0">{item.icon}</div>
              <span className="font-medium text-sm truncate">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-slate-800">
          <div className="flex items-center space-x-3 text-[10px] text-slate-500 uppercase font-black tracking-widest">
            Regional Framework 2025
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 pb-24 md:pb-0 overflow-auto bg-slate-50">
        {/* Top Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
          <div className="md:hidden flex items-center space-x-2">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center font-bold text-white">E</div>
            <h1 className="text-lg font-bold">EAC-Auditor AI</h1>
          </div>
          
          <div className="hidden md:flex items-center space-x-4">
            {activeClient ? (
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Selected Client:</span>
                <div className="bg-slate-100 px-3 py-1 rounded-lg border border-slate-200 flex items-center">
                  <span className="text-sm font-bold text-slate-700">{activeClient.businessName}</span>
                  <span className="ml-2 text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-black uppercase">{activeClient.country}</span>
                </div>
              </div>
            ) : (
              <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">
                {role === 'auditor' ? t.auditorPortal : t.clientPortal}
              </h2>
            )}
          </div>

          <div className="flex items-center space-x-4">
            <div className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-[10px] font-black border border-green-100 flex items-center shadow-sm uppercase">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
              Encrypted Session
            </div>
            {activeClient && (
              <button 
                onClick={onLogout} // Repurpose for exit client hub if needed, but App.tsx handles Exit Session
                className="hidden" 
              ></button>
            )}
          </div>
        </header>

        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          {activeClient && (
             <div className="mb-8 flex flex-col sm:flex-row justify-between items-center bg-white border border-slate-200 p-6 rounded-3xl shadow-sm gap-4">
                <div className="flex items-center">
                   <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-black mr-5 shadow-lg">{activeClient.businessName[0]}</div>
                   <div>
                      <div className="flex items-center space-x-2">
                         <h4 className="font-black text-slate-800 text-lg">{activeClient.businessName}</h4>
                         <span className="bg-blue-100 text-blue-700 text-[8px] font-black uppercase px-2 py-0.5 rounded-full border border-blue-200">{activeClient.country} Hub</span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Managed Entity • TIN {activeClient.tin}</p>
                   </div>
                </div>
                <button onClick={() => window.location.reload()} className="bg-slate-100 border border-slate-200 text-slate-600 text-[10px] font-black uppercase tracking-widest px-6 py-3 rounded-xl transition active:scale-95">Exit Session</button>
             </div>
          )}
          {children}
        </div>
      </main>

      {/* Bottom Nav for Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 flex justify-around p-2 z-20 shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.1)]">
        {navItems.slice(0, 5).map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
              activeTab === item.id ? 'text-green-600' : 'text-slate-400'
            }`}
          >
            <div className="w-5 h-5">{item.icon}</div>
            <span className="text-[8px] mt-1 font-bold uppercase tracking-tighter truncate max-w-[50px]">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Layout;
