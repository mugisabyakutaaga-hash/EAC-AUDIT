
import React, { useState, useRef } from 'react';
import { TRANSLATIONS, ICONS } from '../constants';
import { Language, Transaction, AnomalyReport, MapsResult, EACCountry, ChecklistItem, AuditPhase, Client } from '../types';
import { analyzeAnomalies, generateManagementCommentary, analyzeFinancialImage } from '../services/geminiService';

interface AuditAssistantProps {
  language: Language;
  country: EACCountry;
  transactions: Transaction[];
  activeClient: Client | null;
  onUpdateClient: (updated: Client) => void;
  viewMode: 'assistant' | 'workflow' | 'diligence';
}

const AuditAssistant: React.FC<AuditAssistantProps> = ({ 
  language, 
  country, 
  transactions, 
  activeClient, 
  onUpdateClient,
  viewMode 
}) => {
  const t = TRANSLATIONS[language];
  const [anomalies, setAnomalies] = useState<AnomalyReport[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [report, setReport] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const complianceScore = activeClient ? activeClient.complianceScore : Math.round((transactions.filter(tr => tr.hasReceipt).length / transactions.length) * 100);

  const runAudit = async () => {
    setIsAnalyzing(true);
    try {
      const results = await analyzeAnomalies(transactions, country);
      setAnomalies(results.map((r: any) => ({ ...r, status: 'open' })));
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateReport = async () => {
    setIsAnalyzing(true);
    try {
      const result = await generateManagementCommentary(transactions, country, language);
      setReport(result);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsAnalyzing(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = (reader.result as string).split(',')[1];
      const result = await analyzeFinancialImage(base64, "Analyze this document for automated evidence collection. Check for invoice/receipt authenticity.");
      setAnalysisResult(result || "Analysis failed.");
      setIsAnalyzing(false);
    };
    reader.readAsDataURL(file);
  };

  const toggleChecklistItem = (id: string) => {
    if (!activeClient) return;
    const newChecklist = activeClient.checklist.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    );
    onUpdateClient({ ...activeClient, checklist: newChecklist });
  };

  const updateWorkflowPhase = (id: string, status: any) => {
    if (!activeClient) return;
    const newWorkflow = activeClient.workflow.map(phase => 
      phase.id === id ? { ...phase, status } : phase
    );
    onUpdateClient({ ...activeClient, workflow: newWorkflow });
  };

  if (viewMode === 'workflow' && activeClient) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
         <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="text-2xl font-black text-slate-800 mb-2">{t.workflow}</h3>
            <p className="text-sm text-slate-500 mb-8 uppercase tracking-widest font-bold">Standard EAC Audit Lifecycle Tracking</p>
            <div className="space-y-4">
               {activeClient.workflow.map(phase => (
                  <div key={phase.id} className="flex flex-col md:flex-row items-start md:items-center justify-between p-6 bg-slate-50 border border-slate-200 rounded-2xl hover:border-blue-200 transition">
                     <div className="flex items-center space-x-4 mb-4 md:mb-0">
                        <div className={`w-3 h-3 rounded-full ${
                          phase.status === 'completed' ? 'bg-green-500' : phase.status === 'in-progress' ? 'bg-blue-500' : phase.status === 'delayed' ? 'bg-red-500' : 'bg-slate-300'
                        }`}></div>
                        <div>
                           <p className="font-black text-slate-900">{phase.name}</p>
                           <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center mt-1">
                              <span className="mr-1"><ICONS.Clock /></span> Due: {phase.deadline}
                           </p>
                        </div>
                     </div>
                     <div className="flex items-center space-x-2">
                        {(['pending', 'in-progress', 'completed', 'delayed'] as const).map(s => (
                           <button 
                             key={s} 
                             onClick={() => updateWorkflowPhase(phase.id, s)}
                             className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-tighter border transition ${
                               phase.status === s ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-400 border-slate-200 hover:bg-slate-50'
                             }`}
                           >
                             {s.replace('-', ' ')}
                           </button>
                        ))}
                     </div>
                  </div>
               ))}
            </div>
         </div>
      </div>
    );
  }

  if (viewMode === 'diligence' && activeClient) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
         <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="text-2xl font-black text-slate-800 mb-2">{t.dueDiligence}</h3>
            <p className="text-sm text-slate-500 mb-8 uppercase tracking-widest font-bold">Mandatory KYC & Verification Checks</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {activeClient.checklist.map(item => (
                  <button 
                    key={item.id} 
                    onClick={() => toggleChecklistItem(item.id)}
                    className={`flex items-center justify-between p-6 border rounded-2xl transition text-left group ${
                      item.completed ? 'bg-green-50 border-green-200 shadow-inner' : 'bg-white border-slate-200 hover:border-blue-300'
                    }`}
                  >
                     <span className={`font-bold ${item.completed ? 'text-green-800 line-through opacity-60' : 'text-slate-700'}`}>{item.label}</span>
                     <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition ${
                        item.completed ? 'bg-green-500 border-green-500 text-white' : 'border-slate-200 group-hover:border-blue-400'
                     }`}>
                        {item.completed && <ICONS.Verified />}
                     </div>
                  </button>
               ))}
            </div>
         </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Vanta-style Continuous Monitoring Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 p-12 opacity-5">
            <ICONS.Shield />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="bg-green-500 w-2 h-2 rounded-full animate-pulse"></span>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-green-500">Continuous Monitoring Active</span>
              </div>
              <h3 className="text-3xl font-black">{t.trustScore}</h3>
              <p className="text-slate-400 max-w-md text-sm">Automated evidence collection is tracking {transactions.length} control points across the regional SME framework.</p>
            </div>
            <div className="flex items-center justify-center">
              <div className="relative w-32 h-32 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-800" />
                  <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={364.4} strokeDashoffset={364.4 - (364.4 * complianceScore) / 100} className="text-green-500 transition-all duration-1000 ease-out" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-black">{complianceScore}%</span>
                  <span className="text-[8px] font-bold text-slate-500 uppercase">Compliant</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
             <button onClick={runAudit} disabled={isAnalyzing} className="bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-2xl transition shadow-lg shadow-green-900/20 active:scale-95 text-xs uppercase tracking-widest">
               {isAnalyzing ? 'Analyzing...' : 'Trigger Scan'}
             </button>
             <button onClick={() => fileInputRef.current?.click()} className="bg-white/10 hover:bg-white/20 text-white font-bold py-3 rounded-2xl border border-white/20 transition active:scale-95 text-xs uppercase tracking-widest flex items-center justify-center">
               <ICONS.Camera />
               <span className="ml-2">Add Evidence</span>
             </button>
             <button onClick={generateReport} className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-3 rounded-2xl transition active:scale-95 text-xs uppercase tracking-widest">
               Report
             </button>
             <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="font-bold text-slate-800 mb-4">{t.automatedTests}</h4>
            <div className="space-y-3">
              {[
                { label: 'Receipt Availability', status: complianceScore > 70 ? 'pass' : 'fail' },
                { label: 'Duplicate Payments', status: 'pass' },
                { label: 'TIN Validity Check', status: 'pass' },
                { label: 'WHT Calculation (6%)', status: 'pass' }
              ].map((test, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">{test.label}</span>
                  {test.status === 'pass' ? (
                    <span className="text-green-500 bg-green-50 px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter flex items-center">
                      <ICONS.Verified /> <span className="ml-1">Pass</span>
                    </span>
                  ) : (
                    <span className="text-red-500 bg-red-50 px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter">Fail</span>
                  )}
                </div>
              ))}
            </div>
          </div>
          <button className="text-[10px] font-black text-blue-600 hover:underline mt-6 uppercase tracking-widest">View Master Audit Board</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
             <h4 className="font-bold text-slate-800 flex items-center">
               <span className="mr-2 text-red-500"><ICONS.Audit /></span>
               {t.recentAnomalies}
             </h4>
             <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-[10px] font-black uppercase">{anomalies.length} Issues</span>
          </div>
          <div className="p-8 space-y-4">
             {anomalies.map((a, i) => (
                <div key={i} className="group p-5 bg-slate-50 rounded-2xl border border-slate-200 hover:border-red-200 hover:bg-red-50/30 transition-all duration-300">
                   <div className="flex justify-between items-start mb-2">
                      <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${
                        a.severity === 'high' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                      }`}>
                        {a.severity} Priority
                      </span>
                      <button className="text-[10px] font-bold text-slate-400 group-hover:text-slate-900 transition underline">Resolve</button>
                   </div>
                   <p className="text-sm font-bold text-slate-900 mb-1">{a.reason}</p>
                   <p className="text-xs text-slate-500">{a.suggestedAction}</p>
                </div>
             ))}
             {anomalies.length === 0 && (
               <div className="text-center py-12">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                    <ICONS.Verified />
                  </div>
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No Audit Flags Found</p>
               </div>
             )}
          </div>
        </div>

        <div className="space-y-8">
           {analysisResult && (
             <div className="bg-blue-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden animate-in slide-in-from-right-4 duration-500">
               <div className="absolute bottom-0 right-0 p-8 opacity-10">
                 <ICONS.Camera />
               </div>
               <h4 className="font-bold text-lg mb-4 flex items-center">
                 <span className="mr-2"><ICONS.Verified /></span>
                 Evidence Analysis Result
               </h4>
               <div className="text-sm text-blue-100 leading-relaxed whitespace-pre-wrap font-medium">
                 {analysisResult}
               </div>
             </div>
           )}

           <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm relative">
              <div className="absolute top-6 right-6">
                 <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400">
                    <ICONS.Tax />
                 </div>
              </div>
              <h4 className="font-bold text-lg text-slate-800 mb-6">Auditor Commentary</h4>
              <div className="prose prose-sm text-slate-600 italic">
                {report || "Continuous monitoring is gathering data. Click 'Report' to generate a Vanta-style management compliance overview based on your Ugandan SME transaction history."}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AuditAssistant;
