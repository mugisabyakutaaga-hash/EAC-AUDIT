
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import TransactionList from './components/TransactionList';
import TaxCompliance from './components/TaxCompliance';
import AuditAssistant from './components/AuditAssistant';
import ChatBot from './components/ChatBot';
import Settings from './components/Settings';
import AuditorPortal from './components/AuditorPortal';
import LandingPage from './components/LandingPage';
// Fixed: Imported missing AuditPhase and ChecklistItem types
import { Language, Transaction, DefaultCategory, UserRole, Client, EACCountry, ComplianceAlertConfig, AuditPhase, ChecklistItem } from './types';

// Fixed: Explicitly typed INITIAL_WORKFLOW as AuditPhase[] to ensure 'status' matches AuditPhaseStatus literal union
const INITIAL_WORKFLOW: AuditPhase[] = [
  { id: 'p1', name: 'Planning & Risk Assessment', status: 'completed', deadline: '2025-06-01' },
  { id: 'p2', name: 'Control Testing', status: 'in-progress', deadline: '2025-06-15' },
  { id: 'p3', name: 'Substantive Testing', status: 'pending', deadline: '2025-07-01' },
  { id: 'p4', name: 'Reporting & Opinion', status: 'pending', deadline: '2025-07-15' },
];

// Fixed: Explicitly typed INITIAL_CHECKLIST for consistency
const INITIAL_CHECKLIST: ChecklistItem[] = [
  { id: 'd1', label: 'Review KYC Documents', completed: true },
  { id: 'd2', label: 'Verify Business TIN with Revenue Authority', completed: true },
  { id: 'd3', label: 'Check Previous Audit Reports', completed: false },
  { id: 'd4', label: 'Inspect Physical Assets (Sample)', completed: false },
];

const MOCK_CLIENTS: Client[] = [
  { id: 'c1', businessName: 'Bukoto Coffee Roasters', tin: '1001004455', location: 'Kampala', country: 'Uganda', complianceStatus: 'compliant', lastAuditDate: '2025-01-10', anomalyCount: 0, complianceScore: 98, workflow: [...INITIAL_WORKFLOW], checklist: [...INITIAL_CHECKLIST] },
  { id: 'c2', businessName: 'Mombasa Logistics', tin: '1002008811', location: 'Mombasa', country: 'Kenya', complianceStatus: 'warning', lastAuditDate: '2024-12-15', anomalyCount: 3, complianceScore: 65, workflow: [...INITIAL_WORKFLOW], checklist: [...INITIAL_CHECKLIST] },
  { id: 'c3', businessName: 'Arusha Gems', tin: '1003009922', location: 'Arusha', country: 'Tanzania', complianceStatus: 'overdue', lastAuditDate: '2024-10-20', anomalyCount: 12, complianceScore: 32, workflow: [...INITIAL_WORKFLOW], checklist: [...INITIAL_CHECKLIST] },
];

const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: '1', date: '2025-05-15', description: 'Fuel Delivery', amount: 250000, currency: 'UGX', category: DefaultCategory.TRANSPORT, type: 'expense', hasReceipt: true, invoiceNumber: 'X-778', evidenceStatus: 'verified' },
  { id: '2', date: '2025-05-20', description: 'Office Supplies', amount: 25000, currency: 'UGX', category: DefaultCategory.OTHER, type: 'expense', hasReceipt: false, evidenceStatus: 'missing' },
];

const DEFAULT_ALERTS: ComplianceAlertConfig = {
  scoreThreshold: 70,
  issueThreshold: 5,
  deadlineAlertDays: 7
};

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => localStorage.getItem('uga_isLoggedIn') === 'true');
  const [role, setRole] = useState<UserRole>(() => (localStorage.getItem('uga_role') as UserRole) || 'client');
  const [activeTab, setActiveTab] = useState<string>(role === 'auditor' ? 'portfolio' : 'dashboard');
  const [language, setLanguage] = useState<Language>('en');
  const [country, setCountry] = useState<EACCountry>(() => (localStorage.getItem('uga_country') as EACCountry) || 'Uganda');
  const [activeClient, setActiveClient] = useState<Client | null>(null);
  
  const [clients, setClients] = useState<Client[]>(() => {
    const saved = localStorage.getItem('uga_clients');
    return saved ? JSON.parse(saved) : MOCK_CLIENTS;
  });

  const [alertConfig, setAlertConfig] = useState<ComplianceAlertConfig>(() => {
    const saved = localStorage.getItem('uga_alerts');
    return saved ? JSON.parse(saved) : DEFAULT_ALERTS;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('uga_transactions');
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });
  
  const [customCategories, setCustomCategories] = useState<string[]>(() => {
    const saved = localStorage.getItem('uga_custom_categories');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => { localStorage.setItem('uga_role', role); }, [role]);
  useEffect(() => { localStorage.setItem('uga_isLoggedIn', isLoggedIn.toString()); }, [isLoggedIn]);
  useEffect(() => { localStorage.setItem('uga_country', country); }, [country]);
  useEffect(() => { localStorage.setItem('uga_transactions', JSON.stringify(transactions)); }, [transactions]);
  useEffect(() => { localStorage.setItem('uga_clients', JSON.stringify(clients)); }, [clients]);
  useEffect(() => { localStorage.setItem('uga_alerts', JSON.stringify(alertConfig)); }, [alertConfig]);

  const handleLogin = (selectedRole: UserRole) => {
    setRole(selectedRole);
    setIsLoggedIn(true);
    setActiveTab(selectedRole === 'auditor' ? 'portfolio' : 'dashboard');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setActiveClient(null);
  };

  const handleSelectClient = (client: Client) => {
    setActiveClient(client);
    setCountry(client.country); 
    setActiveTab('dashboard');
  };

  const updateClientData = (updated: Client) => {
    setClients(prev => prev.map(c => c.id === updated.id ? updated : c));
    setActiveClient(updated);
  };

  const renderContent = () => {
    if (role === 'auditor' && activeTab === 'portfolio' && !activeClient) {
      return <AuditorPortal language={language} clients={clients} onSelectClient={handleSelectClient} />;
    }

    switch (activeTab) {
      case 'portfolio': return <AuditorPortal language={language} clients={clients} onSelectClient={handleSelectClient} />;
      case 'dashboard': return <Dashboard language={language} transactions={transactions} />;
      case 'transactions': return <TransactionList language={language} country={country} transactions={transactions} customCategories={customCategories} onAddTransaction={(t) => setTransactions([t, ...transactions])} />;
      case 'tax': return <TaxCompliance language={language} country={country} transactions={transactions} />;
      case 'audit': return <AuditAssistant language={language} transactions={transactions} country={country} activeClient={activeClient} onUpdateClient={updateClientData} viewMode="assistant" />;
      case 'workflow': return <AuditAssistant language={language} transactions={transactions} country={country} activeClient={activeClient} onUpdateClient={updateClientData} viewMode="workflow" />;
      case 'diligence': return <AuditAssistant language={language} transactions={transactions} country={country} activeClient={activeClient} onUpdateClient={updateClientData} viewMode="diligence" />;
      case 'chat': return <ChatBot language={language} country={country} />;
      case 'settings': return <Settings language={language} setLanguage={setLanguage} country={country} setCountry={setCountry} customCategories={customCategories} onAddCustomCategory={(c) => setCustomCategories([...customCategories, c])} onRemoveCustomCategory={(c) => setCustomCategories(customCategories.filter(x => x !== c))} role={role} alertConfig={alertConfig} setAlertConfig={setAlertConfig} />;
      default: return <Dashboard language={language} transactions={transactions} />;
    }
  };

  if (!isLoggedIn) {
    return <LandingPage language={language} onLogin={handleLogin} />;
  }

  return (
    <Layout 
      activeTab={activeTab} 
      setActiveTab={setActiveTab} 
      language={language} 
      role={role} 
      onLogout={handleLogout} 
      activeClient={activeClient}
    >
      {renderContent()}
    </Layout>
  );
};

export default App;
