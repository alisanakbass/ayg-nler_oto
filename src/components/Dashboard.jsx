import React, { useState, useMemo } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Car, CreditCard, Banknote, Landmark, ArrowUpRight, ArrowDownRight, Calendar } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell } from 'recharts';

export function Dashboard({ incomes = [], expenses = [], onNavigate }) {
  const [timeRange, setTimeRange] = useState('this_month'); // 'today', 'this_month', 'all'

  // Filtered Data according to selected time range
  const { filteredIncomes, filteredExpenses } = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const currentYearMonth = todayStr.substring(0, 7);

    if (timeRange === 'today') {
      return {
        filteredIncomes: incomes.filter(i => i.date === todayStr),
        filteredExpenses: expenses.filter(e => e.date === todayStr)
      };
    } else if (timeRange === 'this_month') {
      return {
        filteredIncomes: incomes.filter(i => (i.date || '').startsWith(currentYearMonth)),
        filteredExpenses: expenses.filter(e => (e.date || '').startsWith(currentYearMonth))
      };
    }
    return { filteredIncomes: incomes, filteredExpenses: expenses };
  }, [incomes, expenses, timeRange]);

  // Calculations
  const totalIncome = useMemo(() => filteredIncomes.reduce((acc, curr) => acc + Number(curr.amount || 0), 0), [filteredIncomes]);
  const totalExpense = useMemo(() => filteredExpenses.reduce((acc, curr) => acc + Number(curr.amount || 0), 0), [filteredExpenses]);
  const netProfit = totalIncome - totalExpense;
  const totalWashCount = filteredIncomes.length;

  // Payment Breakdown for Pie Chart
  const paymentData = useMemo(() => {
    const breakdown = { Nakit: 0, 'Kredi Kartı': 0, IBAN: 0 };
    filteredIncomes.forEach(inc => {
      const type = inc.payment_type || 'Nakit';
      breakdown[type] = (breakdown[type] || 0) + Number(inc.amount || 0);
    });
    return [
      { name: 'Nakit', value: breakdown['Nakit'], color: '#10b981' },
      { name: 'Kredi Kartı', value: breakdown['Kredi Kartı'], color: '#3b82f6' },
      { name: 'IBAN', value: breakdown['IBAN'], color: '#c084fc' }
    ].filter(d => d.value > 0);
  }, [filteredIncomes]);

  // Daily Trend for Area Chart
  const chartData = useMemo(() => {
    const dateMap = {};
    
    filteredIncomes.forEach(i => {
      const d = i.date;
      if (!dateMap[d]) dateMap[d] = { date: d, Gelir: 0, Gider: 0 };
      dateMap[d].Gelir += Number(i.amount || 0);
    });

    filteredExpenses.forEach(e => {
      const d = e.date;
      if (!dateMap[d]) dateMap[d] = { date: d, Gelir: 0, Gider: 0 };
      dateMap[d].Gider += Number(e.amount || 0);
    });

    return Object.values(dateMap).sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredIncomes, filteredExpenses]);

  return (
    <div>
      {/* Top Filter Bar */}
      <div className="flex-between mb-4">
        <h2 style={{ fontSize: '1.25rem' }}>İşletme Genel Bakış</h2>
        <div className="flex-center gap-2">
          <Calendar size={16} className="text-secondary" />
          <select
            className="form-control"
            style={{ width: 'auto', padding: '6px 12px', fontSize: '0.85rem' }}
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <option value="today">Bugün</option>
            <option value="this_month">Bu Ay</option>
            <option value="all">Tüm Zamanlar</option>
          </select>
        </div>
      </div>

      {/* Statistical Cards */}
      <div className="stat-grid">
        <div className="glass-card stat-card income">
          <div className="flex-between">
            <span className="stat-label">Toplam Gelir (Ciro)</span>
            <div style={{ color: 'var(--accent-emerald)', background: 'rgba(16, 185, 129, 0.15)', padding: '6px', borderRadius: '8px' }}>
              <TrendingUp size={18} />
            </div>
          </div>
          <div className="stat-value text-emerald">
            ₺{totalIncome.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {filteredIncomes.length} Adet İşlem
          </span>
        </div>

        <div className="glass-card stat-card expense">
          <div className="flex-between">
            <span className="stat-label">Toplam Gider</span>
            <div style={{ color: 'var(--accent-rose)', background: 'rgba(244, 63, 94, 0.15)', padding: '6px', borderRadius: '8px' }}>
              <TrendingDown size={18} />
            </div>
          </div>
          <div className="stat-value text-rose">
            ₺{totalExpense.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {filteredExpenses.length} Kalem Gider
          </span>
        </div>

        <div className="glass-card stat-card net">
          <div className="flex-between">
            <span className="stat-label">Net Kâr / Zarar</span>
            <div style={{ color: 'var(--accent-blue)', background: 'rgba(59, 130, 246, 0.15)', padding: '6px', borderRadius: '8px' }}>
              <DollarSign size={18} />
            </div>
          </div>
          <div className={`stat-value ${netProfit >= 0 ? 'text-blue' : 'text-rose'}`}>
            ₺{netProfit.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
          </div>
          <span style={{ fontSize: '0.75rem', color: netProfit >= 0 ? 'var(--accent-emerald)' : 'var(--accent-rose)' }}>
            {netProfit >= 0 ? '▲ Kârdasınız' : '▼ Zarardasınız'}
          </span>
        </div>

        <div className="glass-card stat-card count">
          <div className="flex-between">
            <span className="stat-label">Yıkanan Araç Sayısı</span>
            <div style={{ color: 'var(--accent-amber)', background: 'rgba(245, 158, 11, 0.15)', padding: '6px', borderRadius: '8px' }}>
              <Car size={18} />
            </div>
          </div>
          <div className="stat-value text-amber">
            {totalWashCount} <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>Araç</span>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Seçili Dönemde
          </span>
        </div>
      </div>

      {/* Quick Action Buttons */}
      <div className="form-grid mb-4">
        <button
          className="btn btn-emerald btn-full"
          onClick={() => onNavigate('incomes')}
          style={{ padding: '16px' }}
        >
          <ArrowUpRight size={20} />
          + Hızlı Yıkama / Gelir Ekle
        </button>

        <button
          className="btn btn-danger btn-full"
          onClick={() => onNavigate('expenses')}
          style={{ padding: '16px' }}
        >
          <ArrowDownRight size={20} />
          - Yeni Gider Kaydı Girişi
        </button>
      </div>

      {/* Visual Charts */}
      <div className="form-grid mb-4" style={{ gridTemplateColumns: '2fr 1fr' }}>
        {/* Daily Trend Chart */}
        <div className="glass-card">
          <h3 style={{ fontSize: '1rem', marginBottom: '16px' }}>Gelir - Gider Zaman Grafiği</h3>
          {chartData.length > 0 ? (
            <div style={{ width: '100%', height: 240 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorGelir" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorGider" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip
                    contentStyle={{ background: '#12192c', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                    labelStyle={{ color: '#94a3b8' }}
                  />
                  <Area type="monotone" dataKey="Gelir" stroke="#10b981" fillOpacity={1} fill="url(#colorGelir)" strokeWidth={2} />
                  <Area type="monotone" dataKey="Gider" stroke="#f43f5e" fillOpacity={1} fill="url(#colorGider)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex-center" style={{ height: 200, color: 'var(--text-muted)' }}>
              Henüz kayıtlı grafik verisi yok.
            </div>
          )}
        </div>

        {/* Payment Breakdown Pie */}
        <div className="glass-card">
          <h3 style={{ fontSize: '1rem', marginBottom: '16px' }}>Ödeme Türü Dağılımı</h3>
          {paymentData.length > 0 ? (
            <div style={{ width: '100%', height: 240, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie
                    data={paymentData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {paymentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val) => `₺${Number(val).toLocaleString('tr-TR')}`} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-center gap-3 mt-4" style={{ flexWrap: 'wrap', fontSize: '0.75rem' }}>
                {paymentData.map(d => (
                  <div key={d.name} className="flex-center gap-1">
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: d.color }}></span>
                    <span>{d.name}: <b>₺{d.value.toLocaleString('tr-TR')}</b></span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex-center" style={{ height: 200, color: 'var(--text-muted)' }}>
              Ödeme verisi bulunmuyor.
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="glass-card">
        <div className="flex-between mb-4">
          <h3 style={{ fontSize: '1rem' }}>Son Gelir Kayıtları</h3>
          <button className="btn btn-secondary btn-sm" onClick={() => onNavigate('incomes')}>
            Tümünü Gör
          </button>
        </div>

        {incomes.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Henüz kayıtlı gelir yok.</p>
        ) : (
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Tarih</th>
                  <th>Plaka</th>
                  <th>Araç Tipi</th>
                  <th>Hizmet</th>
                  <th>Ödeme</th>
                  <th>Tutar</th>
                </tr>
              </thead>
              <tbody>
                {incomes.slice(0, 5).map(item => (
                  <tr key={item.id}>
                    <td>{item.date}</td>
                    <td>
                      <span className="plate-badge">{item.plate}</span>
                    </td>
                    <td>{item.vehicle_type}</td>
                    <td>{item.service_name}</td>
                    <td>
                      <span className={`pay-pill ${(item.payment_type || '').toLowerCase().replace(' ', '')}`}>
                        {item.payment_type}
                      </span>
                    </td>
                    <td className="text-emerald" style={{ fontWeight: 700 }}>
                      +₺{Number(item.amount).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
