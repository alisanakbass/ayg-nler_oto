import React from 'react';
import { Car, LayoutDashboard, PlusCircle, MinusCircle, History, BarChart3, Settings, LogOut, Lock } from 'lucide-react';

export function Header({ activeTab, setActiveTab, isAuthenticated, onLogout }) {
  return (
    <header className="app-header">
      <div className="brand-logo">
        <div className="logo-icon">
          <Car size={26} />
        </div>
        <div>
          <h1 className="brand-title">AYGÜN OTO YIKAMA</h1>
          <span className="brand-subtitle">Gelir & Gider Yönetimi</span>
        </div>
      </div>

      {/* Desktop Navigation */}
      <nav className="nav-bar-desktop">
        <button
          className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          <LayoutDashboard size={18} />
          Özet
        </button>
        <button
          className={`nav-item ${activeTab === 'incomes' ? 'active' : ''}`}
          onClick={() => setActiveTab('incomes')}
        >
          <PlusCircle size={18} />
          Gelir Ekle
        </button>
        <button
          className={`nav-item ${activeTab === 'expenses' ? 'active' : ''}`}
          onClick={() => setActiveTab('expenses')}
        >
          <MinusCircle size={18} />
          Gider Ekle
        </button>
        <button
          className={`nav-item ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          <History size={18} />
          İşlem Geçmişi
        </button>
        <button
          className={`nav-item ${activeTab === 'reports' ? 'active' : ''}`}
          onClick={() => setActiveTab('reports')}
        >
          <BarChart3 size={18} />
          Raporlar
        </button>
        <button
          className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          <Settings size={18} />
          Ayarlar
        </button>
      </nav>

      {/* Security Status & Lock Button */}
      {isAuthenticated && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={onLogout}
            title="Sistemi Kilitle"
            style={{ padding: '8px 14px', color: '#f87171', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Lock size={16} />
            <span>Kilitle</span>
          </button>
        </div>
      )}
    </header>
  );
}
