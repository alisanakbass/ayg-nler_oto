import React, { useState, useMemo } from 'react';
import { Calendar, Download, FileSpreadsheet, TrendingUp, TrendingDown, DollarSign, PieChart, Printer } from 'lucide-react';

export function ReportsTab({ incomes = [], expenses = [] }) {
  const currentMonthStr = new Date().toISOString().substring(0, 7); // "2026-07"
  const [selectedMonth, setSelectedMonth] = useState(currentMonthStr);

  // Available Months list from data dates
  const availableMonths = useMemo(() => {
    const monthsSet = new Set([currentMonthStr]);
    incomes.forEach(i => { if (i.date) monthsSet.add(i.date.substring(0, 7)); });
    expenses.forEach(e => { if (e.date) monthsSet.add(e.date.substring(0, 7)); });
    return Array.from(monthsSet).sort().reverse();
  }, [incomes, expenses, currentMonthStr]);

  // Filtered dataset for selected month
  const monthlyIncomes = useMemo(() => {
    return incomes.filter(i => (i.date || '').startsWith(selectedMonth));
  }, [incomes, selectedMonth]);

  const monthlyExpenses = useMemo(() => {
    return expenses.filter(e => (e.date || '').startsWith(selectedMonth));
  }, [expenses, selectedMonth]);

  // Totals
  const totalInc = useMemo(() => monthlyIncomes.reduce((acc, curr) => acc + Number(curr.amount || 0), 0), [monthlyIncomes]);
  const totalExp = useMemo(() => monthlyExpenses.reduce((acc, curr) => acc + Number(curr.amount || 0), 0), [monthlyExpenses]);
  const netProfit = totalInc - totalExp;

  // Breakdown by Payment Method
  const paymentBreakdown = useMemo(() => {
    const res = { Nakit: 0, 'Kredi Kartı': 0, IBAN: 0 };
    monthlyIncomes.forEach(inc => {
      const type = inc.payment_type || 'Nakit';
      res[type] = (res[type] || 0) + Number(inc.amount || 0);
    });
    return res;
  }, [monthlyIncomes]);

  // Breakdown by Expense Category
  const expenseCategoryBreakdown = useMemo(() => {
    const res = {};
    monthlyExpenses.forEach(exp => {
      const cat = exp.category || 'Diğer';
      res[cat] = (res[cat] || 0) + Number(exp.amount || 0);
    });
    return res;
  }, [monthlyExpenses]);

  // CSV Export functionality
  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,\uFEFF"; // UTF-8 BOM for Turkish characters in Excel
    csvContent += "TÜR;TARİH;BAŞLIK / PLAKA;HİZMET / KATEGORİ;ÖDEME YÖNTEMİ;TUTAR (TL);NOT\n";

    monthlyIncomes.forEach(i => {
      csvContent += `GELİR;${i.date};${i.plate};${i.service_name};${i.payment_type};${i.amount};${i.note || ''}\n`;
    });

    monthlyExpenses.forEach(e => {
      csvContent += `GİDER;${e.date};${e.title};${e.category};${e.payment_type};-${e.amount};${e.note || ''}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Aygun_Oto_Yikama_Rapor_${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div>
      {/* Month Selector & Export Actions */}
      <div className="glass-card mb-4">
        <div className="flex-between" style={{ flexWrap: 'wrap', gap: '16px' }}>
          <div className="flex-center gap-3">
            <Calendar size={22} className="text-cyan" />
            <div>
              <h2 style={{ fontSize: '1.1rem' }}>Aylık Mali Rapor</h2>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Rapor Dönemi Seçin</span>
            </div>
          </div>

          <div className="flex-center gap-2">
            <select
              className="form-control"
              style={{ width: 'auto', fontWeight: 'bold' }}
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              {availableMonths.map(m => {
                const [year, month] = m.split('-');
                const monthNames = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
                const name = monthNames[parseInt(month, 10) - 1] || m;
                return (
                  <option key={m} value={m}>
                    {name} {year} Raporu
                  </option>
                );
              })}
            </select>

            <button className="btn btn-emerald" onClick={handleExportCSV}>
              <FileSpreadsheet size={18} />
              Excel / CSV İndir
            </button>

            <button className="btn btn-secondary" onClick={handlePrint}>
              <Printer size={18} />
              Yazdır
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="stat-grid mb-4">
        <div className="glass-card stat-card income">
          <span className="stat-label">Aylık Toplam Ciro</span>
          <div className="stat-value text-emerald">₺{totalInc.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{monthlyIncomes.length} Gelir İşlemi</span>
        </div>

        <div className="glass-card stat-card expense">
          <span className="stat-label">Aylık Toplam Gider</span>
          <div className="stat-value text-rose">₺{totalExp.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{monthlyExpenses.length} Gider İşlemi</span>
        </div>

        <div className="glass-card stat-card net">
          <span className="stat-label">Aylık Net Kâr</span>
          <div className={`stat-value ${netProfit >= 0 ? 'text-blue' : 'text-rose'}`}>
            ₺{netProfit.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
          </div>
          <span style={{ fontSize: '0.75rem', color: netProfit >= 0 ? 'var(--accent-emerald)' : 'var(--accent-rose)' }}>
            {totalInc > 0 ? `%${((netProfit / totalInc) * 100).toFixed(1)} Kâr Oranı` : 'Veri Yok'}
          </span>
        </div>

        <div className="glass-card stat-card count">
          <span className="stat-label">Nakit Kasa Girişi</span>
          <div className="stat-value text-amber">₺{(paymentBreakdown['Nakit'] || 0).toLocaleString('tr-TR')}</div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Fiziki Nakit Toplamı</span>
        </div>
      </div>

      {/* Payment & Category Details */}
      <div className="form-grid mb-4">
        {/* Ödeme Türleri Özeti */}
        <div className="glass-card">
          <h3 style={{ fontSize: '1rem', marginBottom: '16px' }}>Ödeme Yöntemlerine Göre Gelir</h3>
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Yöntem</th>
                  <th>Toplam Tutar</th>
                  <th>Oran</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><span className="pay-pill nakit">Nakit</span></td>
                  <td style={{ fontWeight: 700 }}>₺{(paymentBreakdown['Nakit'] || 0).toLocaleString('tr-TR')}</td>
                  <td>{totalInc > 0 ? `%${(((paymentBreakdown['Nakit'] || 0) / totalInc) * 100).toFixed(0)}` : '%0'}</td>
                </tr>
                <tr>
                  <td><span className="pay-pill kart">Kredi Kartı</span></td>
                  <td style={{ fontWeight: 700 }}>₺{(paymentBreakdown['Kredi Kartı'] || 0).toLocaleString('tr-TR')}</td>
                  <td>{totalInc > 0 ? `%${(((paymentBreakdown['Kredi Kartı'] || 0) / totalInc) * 100).toFixed(0)}` : '%0'}</td>
                </tr>
                <tr>
                  <td><span className="pay-pill iban">IBAN / Havale</span></td>
                  <td style={{ fontWeight: 700 }}>₺{(paymentBreakdown['IBAN'] || 0).toLocaleString('tr-TR')}</td>
                  <td>{totalInc > 0 ? `%${(((paymentBreakdown['IBAN'] || 0) / totalInc) * 100).toFixed(0)}` : '%0'}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Gider Kategorileri Özeti */}
        <div className="glass-card">
          <h3 style={{ fontSize: '1rem', marginBottom: '16px' }}>Gider Kategorileri Dağılımı</h3>
          {Object.keys(expenseCategoryBreakdown).length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Bu ay için gider kaydı yok.</p>
          ) : (
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Kategori</th>
                    <th>Tutar</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(expenseCategoryBreakdown).map(([cat, amt]) => (
                    <tr key={cat}>
                      <td>{cat}</td>
                      <td className="text-rose" style={{ fontWeight: 700 }}>₺{amt.toLocaleString('tr-TR')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
