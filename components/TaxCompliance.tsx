
import React from 'react';
import { TRANSLATIONS, EAC_METADATA } from '../constants';
import { Language, Transaction, EACCountry } from '../types';

interface TaxComplianceProps {
  language: Language;
  country: EACCountry;
  transactions: Transaction[];
}

const TaxCompliance: React.FC<TaxComplianceProps> = ({ language, country, transactions }) => {
  const t = TRANSLATIONS[language];
  const meta = EAC_METADATA[country];

  const totalVAT = transactions.reduce((acc, curr) => acc + (curr.taxCalculated?.vat || 0), 0);
  const totalWHT = transactions.reduce((acc, curr) => acc + (curr.taxCalculated?.wht || 0), 0);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: meta.currency,
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <h3 className="text-xl font-black text-slate-800">{meta.authority} Integration</h3>
          <p className="text-sm text-slate-500 mt-1">Regional nexus active. Compliance score tracked via EAC protocols.</p>
        </div>
        <div className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-xs font-black border border-green-200 shadow-sm">
          CONNECTED
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6">{t.vatRate} - Regional Consumption Tax</h4>
            <div className="space-y-4">
               <div className="flex justify-between items-center py-3 border-b border-slate-50">
                  <span className="text-sm text-slate-500">Input Tax Credit</span>
                  <span className="font-bold text-slate-900">{formatCurrency(totalVAT)}</span>
               </div>
               <div className="flex justify-between items-center py-4 font-black text-xl border-t border-slate-100">
                  <span className="text-slate-800">Estimated Liability</span>
                  <span className="text-red-600">{formatCurrency(totalVAT * 1.5)}</span>
               </div>
            </div>
          </div>
          <button className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest mt-8 hover:bg-slate-800 transition shadow-lg active:scale-95">
             Generate {meta.authority} XML
          </button>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6">{t.whtRate} - Regional Withholding</h4>
          <div className="space-y-4">
             <div className="p-4 bg-slate-50 rounded-2xl text-xs text-slate-600 font-medium leading-relaxed mb-4">
                In the EAC Common Market, {meta.authority} mandates a rate of approx. 5-6% for specified non-resident and resident services.
             </div>
             <div className="flex justify-between items-center py-3 border-b border-slate-50">
                <span className="text-sm text-slate-500">Accrued WHT</span>
                <span className="font-bold text-slate-900">{formatCurrency(totalWHT)}</span>
             </div>
             <div className="flex justify-between items-center py-3">
                <span className="text-sm text-slate-500">Local Gov Levies (LST)</span>
                <span className="font-bold text-slate-900">{formatCurrency(0)}</span>
             </div>
             <button className="w-full bg-white border border-slate-200 text-slate-700 py-4 rounded-2xl font-black text-xs uppercase tracking-widest mt-8 hover:bg-slate-50 transition active:scale-95">
                Download Certificate Bundle
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaxCompliance;
