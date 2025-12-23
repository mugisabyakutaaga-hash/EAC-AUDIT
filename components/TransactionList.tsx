
import React, { useRef, useState } from 'react';
import { TRANSLATIONS, ICONS, EAC_METADATA } from '../constants';
import { Language, Transaction, DefaultCategory, EACCountry } from '../types';
import { extractReceiptData } from '../services/geminiService';

interface TransactionListProps {
  language: Language;
  country: EACCountry;
  transactions: Transaction[];
  customCategories: string[];
  onAddTransaction: (t: Transaction) => void;
}

const TransactionList: React.FC<TransactionListProps> = ({ language, country, transactions, customCategories, onAddTransaction }) => {
  const t = TRANSLATIONS[language];
  const meta = EAC_METADATA[country];
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [reviewTransaction, setReviewTransaction] = useState<Partial<Transaction> | null>(null);

  const toggleRow = (id: string) => {
    const newSet = new Set(expandedRows);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setExpandedRows(newSet);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: meta.currency,
      maximumFractionDigits: 0
    }).format(val);
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setIsScanning(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = (reader.result as string).split(',')[1];
      try {
        const extracted = await extractReceiptData(base64, country);
        setReviewTransaction({ ...extracted, hasReceipt: true, type: extracted.type || 'expense' });
      } finally { setIsScanning(false); }
    };
    reader.readAsDataURL(file);
  };

  const confirmReview = () => {
    if (!reviewTransaction) return;
    const amount = Number(reviewTransaction.amount) || 0;
    const isExpense = reviewTransaction.type === 'expense';
    
    // Regional Tax Calculation
    const vatRate = meta.vat;
    const vat = isExpense ? amount * vatRate : 0;
    const wht = (isExpense && (reviewTransaction.category === 'Rent' || reviewTransaction.category === 'Professional Services')) ? amount * 0.05 : 0;

    const newTransaction: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      date: reviewTransaction.date || new Date().toISOString().split('T')[0],
      description: reviewTransaction.description || 'Entry',
      amount: amount,
      currency: meta.currency,
      category: reviewTransaction.category || 'Other',
      type: (reviewTransaction.type as 'income' | 'expense') || 'expense',
      hasReceipt: true,
      invoiceNumber: reviewTransaction.invoiceNumber,
      dueDate: reviewTransaction.dueDate,
      taxCalculated: isExpense ? { vat, wht, lst: 0, netAmount: amount / (1 + vatRate) } : undefined
    };
    onAddTransaction(newTransaction);
    setReviewTransaction(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <h3 className="text-xl font-bold text-slate-800">{t.transactions} ({country})</h3>
          <select 
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium shadow-sm outline-none"
          >
            <option value="all">{t.all}</option>
            <option value="income">{t.income}</option>
            <option value="expense">{t.expense}</option>
          </select>
        </div>
        <button 
          onClick={() => fileInputRef.current?.click()}
          disabled={isScanning}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-xl font-bold flex items-center shadow-lg transition disabled:bg-green-400"
        >
          {isScanning ? <span className="animate-pulse">Analyzing...</span> : <><ICONS.Camera /><span className="ml-2">{t.scanReceipt}</span></>}
        </button>
        <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} accept="image/*" />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="w-10 pl-4 py-4"></th>
              <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
              <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</th>
              <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Amount</th>
              <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {transactions.filter(tr => filterType === 'all' || tr.type === filterType).map(transaction => (
              <React.Fragment key={transaction.id}>
                <tr className="hover:bg-slate-50 cursor-pointer" onClick={() => toggleRow(transaction.id)}>
                  <td className="pl-4 py-4">{transaction.taxCalculated && <ICONS.ChevronDown />}</td>
                  <td className="px-4 py-4 text-sm">{transaction.date}</td>
                  <td className="px-4 py-4 font-bold">{transaction.description}</td>
                  <td className={`px-4 py-4 font-black text-right ${transaction.type === 'income' ? 'text-green-600' : 'text-slate-900'}`}>
                    {formatCurrency(transaction.amount)}
                  </td>
                  <td className="px-4 py-4 text-center">
                    {transaction.hasReceipt ? <span className="text-green-500"><ICONS.Verified /></span> : <span className="text-slate-300">●</span>}
                  </td>
                </tr>
                {expandedRows.has(transaction.id) && transaction.taxCalculated && (
                  <tr className="bg-slate-50/50">
                    <td colSpan={5} className="px-14 py-4">
                      <div className="bg-white p-4 rounded-xl border border-slate-200 grid grid-cols-3 gap-4">
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase">{t.vatRate} ({meta.vat * 100}%)</p>
                          <p className="text-sm font-bold">{formatCurrency(transaction.taxCalculated.vat)}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase">Net Value</p>
                          <p className="text-sm font-bold text-green-700">{formatCurrency(transaction.taxCalculated.netAmount)}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase">Evidence</p>
                          <p className="text-xs font-medium text-slate-500">Regional Compliant</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {reviewTransaction && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-md">
          <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden p-8 space-y-6">
            <h3 className="font-black text-xl text-slate-800">{t.reviewTransaction}</h3>
            <div className="grid grid-cols-2 gap-4">
              <input type="date" value={reviewTransaction.date || ''} onChange={(e) => setReviewTransaction({...reviewTransaction, date: e.target.value})} className="border p-3 rounded-xl" />
              <input type="number" value={reviewTransaction.amount || ''} onChange={(e) => setReviewTransaction({...reviewTransaction, amount: Number(e.target.value)})} className="border p-3 rounded-xl font-black" />
            </div>
            <input type="text" value={reviewTransaction.description || ''} onChange={(e) => setReviewTransaction({...reviewTransaction, description: e.target.value})} placeholder="Merchant" className="w-full border p-3 rounded-xl" />
            <div className="flex gap-4">
              <button onClick={() => setReviewTransaction(null)} className="flex-1 bg-slate-100 py-4 rounded-xl font-bold">Cancel</button>
              <button onClick={confirmReview} className="flex-2 bg-green-600 text-white py-4 rounded-xl font-bold">Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionList;
