import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Header } from './components/Header';
import { MobileNav } from './components/MobileNav';
import { Dashboard } from './components/Dashboard';
import { IncomeTab } from './components/IncomeTab';
import { ExpenseTab } from './components/ExpenseTab';
import { dataService } from './services/dataService';

const HistoryTab = lazy(() => import('./components/HistoryTab').then(m => ({ default: m.HistoryTab })));
const ReportsTab = lazy(() => import('./components/ReportsTab').then(m => ({ default: m.ReportsTab })));
const ServicesStaffTab = lazy(() => import('./components/ServicesStaffTab').then(m => ({ default: m.ServicesStaffTab })));

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [services, setServices] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [incomes, setIncomes] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load initial data
  const loadAllData = async () => {
    setLoading(true);
    try {
      const [srv, stf, inc, exp] = await Promise.all([
        dataService.getServices(),
        dataService.getStaff(),
        dataService.getIncomes(),
        dataService.getExpenses()
      ]);
      setServices(srv || []);
      setStaffList(stf || []);
      setIncomes(inc || []);
      setExpenses(exp || []);
    } catch (e) {
      console.error('Data load error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Handlers
  const handleAddIncome = async (newIncome) => {
    const created = await dataService.addIncome(newIncome);
    setIncomes(prev => [created, ...prev]);
  };

  const handleDeleteIncome = async (id) => {
    await dataService.deleteIncome(id);
    setIncomes(prev => prev.filter(i => i.id !== id));
  };

  const handleAddExpense = async (newExpense) => {
    const created = await dataService.addExpense(newExpense);
    setExpenses(prev => [created, ...prev]);
  };

  const handleDeleteExpense = async (id) => {
    await dataService.deleteExpense(id);
    setExpenses(prev => prev.filter(e => e.id !== id));
  };

  const handleAddService = async (newSrv) => {
    const created = await dataService.addService(newSrv);
    setServices(prev => [...prev, created]);
  };

  const handleDeleteService = async (id) => {
    await dataService.deleteService(id);
    setServices(prev => prev.filter(s => s.id !== id));
  };

  const handleUpdateService = async (id, updatedFields) => {
    const updated = await dataService.updateService(id, updatedFields);
    setServices(prev => prev.map(s => s.id === id ? { ...s, ...updatedFields } : s));
  };

  const handleAddStaff = async (newStaff) => {
    const created = await dataService.addStaff(newStaff);
    setStaffList(prev => [...prev, created]);
  };

  const handleDeleteStaff = async (id) => {
    await dataService.deleteStaff(id);
    setStaffList(prev => prev.filter(st => st.id !== id));
  };

  return (
    <div className="app-container">
      {/* Header Bar */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSettings={() => setActiveTab('settings')}
      />

      {/* Main Content View */}
      {loading ? (
        <div className="flex-center" style={{ minHeight: '300px', flexDirection: 'column', gap: '16px' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--accent-cyan)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
          <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
          <span style={{ color: 'var(--text-secondary)' }}>Aygün Oto Yıkama Verileri Yükleniyor...</span>
        </div>
      ) : (
        <main style={{ minHeight: '500px' }}>
          {activeTab === 'dashboard' && (
            <Dashboard
              incomes={incomes}
              expenses={expenses}
              onNavigate={setActiveTab}
            />
          )}

          {activeTab === 'incomes' && (
            <IncomeTab
              services={services}
              incomes={incomes}
              onAddIncome={handleAddIncome}
              onDeleteIncome={handleDeleteIncome}
              onAddService={handleAddService}
            />
          )}

          {activeTab === 'expenses' && (
            <ExpenseTab
              expenses={expenses}
              onAddExpense={handleAddExpense}
              onDeleteExpense={handleDeleteExpense}
            />
          )}

          <Suspense fallback={
            <div className="flex-center" style={{ minHeight: '200px', color: 'var(--text-secondary)' }}>
              Yükleniyor...
            </div>
          }>
            {activeTab === 'history' && (
              <HistoryTab
                incomes={incomes}
                expenses={expenses}
                onDeleteIncome={handleDeleteIncome}
                onDeleteExpense={handleDeleteExpense}
              />
            )}

            {activeTab === 'reports' && (
              <ReportsTab
                incomes={incomes}
                expenses={expenses}
              />
            )}

            {activeTab === 'services_staff' && (
              <ServicesStaffTab
                services={services}
                onAddService={handleAddService}
                onDeleteService={handleDeleteService}
                onUpdateService={handleUpdateService}
              />
            )}

            {activeTab === 'settings' && (
              <ServicesStaffTab
                services={services}
                onAddService={handleAddService}
                onDeleteService={handleDeleteService}
                onUpdateService={handleUpdateService}
              />
            )}
          </Suspense>
        </main>
      )}

      {/* Mobile Bottom Navigation */}
      <MobileNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}
