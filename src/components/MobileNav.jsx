import React from 'react';
import { LayoutDashboard, PlusCircle, MinusCircle, History, BarChart3, Settings } from 'lucide-react';

export function MobileNav({ activeTab, setActiveTab }) {
  return (
    <nav className="mobile-nav">
      <button
        className={`mobile-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
        onClick={() => setActiveTab('dashboard')}
      >
        <LayoutDashboard size={20} />
        Özet
      </button>
      <button
        className={`mobile-nav-item ${activeTab === 'incomes' ? 'active' : ''}`}
        onClick={() => setActiveTab('incomes')}
      >
        <PlusCircle size={20} />
        Gelir
      </button>
      <button
        className={`mobile-nav-item ${activeTab === 'expenses' ? 'active' : ''}`}
        onClick={() => setActiveTab('expenses')}
      >
        <MinusCircle size={20} />
        Gider
      </button>
      <button
        className={`mobile-nav-item ${activeTab === 'history' ? 'active' : ''}`}
        onClick={() => setActiveTab('history')}
      >
        <History size={20} />
        Geçmiş
      </button>
      <button
        className={`mobile-nav-item ${activeTab === 'reports' ? 'active' : ''}`}
        onClick={() => setActiveTab('reports')}
      >
        <BarChart3 size={20} />
        Rapor
      </button>
      <button
        className={`mobile-nav-item ${activeTab === 'settings' ? 'active' : ''}`}
        onClick={() => setActiveTab('settings')}
      >
        <Settings size={20} />
        Ayar
      </button>
    </nav>
  );
}
