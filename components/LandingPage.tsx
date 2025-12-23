
import React, { useState } from 'react';
import { TRANSLATIONS, ICONS, EAC_METADATA } from '../constants';
import { Language, UserRole } from '../types';

interface LandingPageProps {
  language: Language;
  onLogin: (role: UserRole) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ language, onLogin }) => {
  const t = TRANSLATIONS[language];
  const [activeLegalPage, setActiveLegalPage] = useState<'terms' | 'privacy' | 'certs' | null>(null);

  const LegalModal = () => {
    if (!activeLegalPage) return null;

    const content = {
      terms: {
        title: 'Terms of Service',
        sections: [
          { subtitle: '1. AI-Driven Advisory Disclaimer', text: 'EAC-Auditor provides automated financial advisory powered by Mugisolo AI. While we strive for 99% accuracy, automated outputs must be reviewed by a certified CPA as per the Accountants Act (Cap 294) in Uganda and similar regional legislations.' },
          { subtitle: '2. User Responsibility', text: 'Users are responsible for the authenticity of uploaded documents. EAC-Auditor is not liable for penalties resulting from the submission of forged receipts or fraudulent data to revenue authorities.' },
          { subtitle: '3. Jurisdictional Compliance', text: 'This platform operates under the EAC Common Market Protocol. Disputes are subject to the laws of the member state where the business is registered.' }
        ]
      },
      privacy: {
        title: 'Privacy Policy',
        sections: [
          { subtitle: '1. Data Protection Compliance', text: 'We strictly adhere to the Uganda Data Protection and Privacy Act (2019) and Kenya Data Protection Act (2019). Your data is encrypted at rest and in transit.' },
          { subtitle: '2. Data Residency', text: 'Financial records are hosted in certified regional data centers (NITA-U partners) to ensure sovereignty and low-latency access for local SMEs.' },
          { subtitle: '3. AI Training', text: 'Mugisolo AI learns from anonymized transaction patterns to improve regional tax detection. No personally identifiable information (PII) is used for external model training.' }
        ]
      },
      certs: {
        title: 'Regional Certifications',
        sections: [
          { subtitle: 'Regulatory Alignment', text: 'EAC-Auditor is designed in alignment with the digital standards of the following bodies:' },
          { subtitle: 'Certifying Partners', text: '• ICPAU (Uganda): Automated Audit Trail Standards\n• ICPAK (Kenya): iTax API Integration Protocol\n• NBAA (Tanzania): EFDMS Compliance Verification\n• ICPAR (Rwanda): EBM v2.0 Signature Validation' },
          { subtitle: 'Technical Standards', text: 'We utilize ISO 27001 certified cloud infrastructure and NITA-U approved e-signature gateways.' }
        ]
      }
    }[activeLegalPage];

    return (
      <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-300">
          <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight">{content.title}</h3>
            <button onClick={() => setActiveLegalPage(null)} className="text-slate-400 hover:text-slate-900 transition p-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <div className="p-8 overflow-y-auto space-y-8">
            {content.sections.map((sec, i) => (
              <div key={i} className="space-y-2">
                <h4 className="font-black text-slate-900 uppercase text-xs tracking-widest">{sec.subtitle}</h4>
                <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">{sec.text}</p>
              </div>
            ))}
          </div>
          <div className="p-6 bg-slate-50 border-t border-slate-100 text-center">
            <button onClick={() => setActiveLegalPage(null)} className="bg-slate-900 text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest active:scale-95 transition">Close Document</button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 overflow-hidden">
      <LegalModal />
      
      {/* Hero Section */}
      <section className="relative bg-slate-900 text-white pt-20 pb-32 px-6">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none overflow-hidden">
          <div className="absolute top-10 left-10 w-64 h-64 bg-green-500 rounded-full blur-[100px]"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-500 rounded-full blur-[120px]"></div>
        </div>

        <div className="max-w-6xl mx-auto relative z-10 text-center">
          <div className="inline-flex items-center space-x-2 bg-white/10 border border-white/20 px-4 py-2 rounded-full mb-8 backdrop-blur-md">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-xs font-black uppercase tracking-widest text-green-400">East African Community (EAC) Certified</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter leading-tight">
            The Future of Audit & Compliance <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600 italic">Powered by mugisolo ai</span>
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-12 font-medium">
            EAC-Auditor is the first automated compliance infrastructure designed for the EAC. 
            From URA e-Tax to KRA iTax, we bridge the gap between business and regulation.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
             <button onClick={() => onLogin('client')} className="bg-green-600 hover:bg-green-500 text-white px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition shadow-2xl shadow-green-900/40 active:scale-95">
               SME Client Login
             </button>
             <button onClick={() => onLogin('auditor')} className="bg-white text-slate-900 px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition shadow-2xl active:scale-95">
               Auditor Portal Access
             </button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-6xl mx-auto -mt-20 px-6 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-10 rounded-3xl shadow-xl border border-slate-100 hover:border-green-200 transition-all duration-300">
            <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center text-green-600 mb-6 shadow-sm">
              <ICONS.Tax />
            </div>
            <h3 className="text-xl font-black text-slate-800 mb-4">Regional Tax Logic</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              Automated VAT, WHT, and LST calculations tailored for Kenya, Uganda, Tanzania, and Rwanda. XML filing ready.
            </p>
          </div>
          <div className="bg-white p-10 rounded-3xl shadow-xl border border-slate-100 hover:border-green-200 transition-all duration-300">
            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-6 shadow-sm">
              <ICONS.Shield />
            </div>
            <h3 className="text-xl font-black text-slate-800 mb-4">Continuous Audit</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              Vanta-inspired evidence collection and real-time anomaly detection. We keep your trust score at 100%.
            </p>
          </div>
          <div className="bg-white p-10 rounded-3xl shadow-xl border border-slate-100 hover:border-green-200 transition-all duration-300">
            <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-900 mb-6 shadow-sm">
              <ICONS.Chat />
            </div>
            <h3 className="text-xl font-black text-slate-800 mb-4">Localized AI Advisory</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              Chat with an AI that understands Luganda, Swahili, and the intricate financial nuances of the African market.
            </p>
          </div>
        </div>
      </section>

      {/* Role Selection CTA */}
      <section className="max-w-4xl mx-auto px-6 pb-32 text-center">
        <h2 className="text-3xl font-black text-slate-800 mb-12 uppercase tracking-tight">Enter Your Workspace</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div 
            onClick={() => onLogin('client')}
            className="group cursor-pointer bg-white border-2 border-slate-100 rounded-3xl p-8 hover:border-green-600 hover:shadow-2xl transition-all duration-500 text-left"
          >
            <div className="flex justify-between items-start mb-8">
               <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-green-100 group-hover:text-green-600 transition-colors">
                  <ICONS.Dashboard />
               </div>
               <span className="text-[10px] font-black text-slate-400 uppercase group-hover:text-green-600">For SMEs</span>
            </div>
            <h4 className="text-2xl font-black text-slate-800 mb-2">Business Owner</h4>
            <p className="text-sm text-slate-500 mb-8">Manage transactions, scan receipts, and monitor your tax compliance status daily.</p>
            <div className="flex items-center text-green-600 font-bold text-sm uppercase tracking-widest">
              Get Started <span className="ml-2 group-hover:translate-x-2 transition-transform">→</span>
            </div>
          </div>

          <div 
            onClick={() => onLogin('auditor')}
            className="group cursor-pointer bg-white border-2 border-slate-100 rounded-3xl p-8 hover:border-slate-900 hover:shadow-2xl transition-all duration-500 text-left"
          >
            <div className="flex justify-between items-start mb-8">
               <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                  <ICONS.Users />
               </div>
               <span className="text-[10px] font-black text-slate-400 uppercase group-hover:text-slate-900">For CPAs</span>
            </div>
            <h4 className="text-2xl font-black text-slate-800 mb-2">Audit Professional</h4>
            <p className="text-sm text-slate-500 mb-8">Manage a portfolio of clients, perform cross-entity risk analysis, and generate reports.</p>
            <div className="flex items-center text-slate-900 font-bold text-sm uppercase tracking-widest">
              Open Portal <span className="ml-2 group-hover:translate-x-2 transition-transform">→</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-100 py-12 px-6 border-t border-slate-200">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center text-slate-400 text-[10px] font-black uppercase tracking-widest">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
             <div className="w-6 h-6 bg-green-600 rounded flex items-center justify-center text-white font-bold">E</div>
             <span>EAC-Auditor © 2025</span>
          </div>
          <div className="flex space-x-8">
            <button onClick={() => setActiveLegalPage('terms')} className="hover:text-slate-900 uppercase">Terms</button>
            <button onClick={() => setActiveLegalPage('privacy')} className="hover:text-slate-900 uppercase">Privacy</button>
            <button onClick={() => setActiveLegalPage('certs')} className="hover:text-slate-900 uppercase">Regional Certifications</button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
