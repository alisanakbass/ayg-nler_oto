import React, { useState, useMemo } from 'react';
import { History, Search, Trash2, ChevronLeft, ChevronRight, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export function HistoryTab({ incomes = [], expenses = [], onDeleteIncome, onDeleteExpense }) {
  const [filterType, setFilterType] = useState('all'); // 'all', 'incomes', 'expenses'
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Combine and format history items
  const combinedHistory = useMemo(() => {
    const formattedIncomes = incomes.map(i => ({
      ...i,
      type: 'income',
      title: `${i.plate} - ${i.service_name}`,
      categoryOrType: i.payment_type
    }));

    const formattedExpenses = expenses.map(e => ({
      ...e,
      type: 'expense',
      service_name: e.category,
      categoryOrType: e.category
    }));

    let merged = [];
    if (filterType === 'incomes') {
      merged = formattedIncomes;
    } else if (filterType === 'expenses') {
      merged = formattedExpenses;
    } else {
      merged = [...formattedIncomes, ...formattedExpenses];
    }

    // Sort by date descending
    return merged.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  }, [incomes, expenses, filterType]);

  // Filtered by search
  const filteredItems = useMemo(() => {
    return combinedHistory.filter(item => {
      const search = searchTerm.toLowerCase();
      return (
        (item.plate || '').toLowerCase().includes(search) ||
        (item.title || '').toLowerCase().includes(search) ||
        (item.service_name || '').toLowerCase().includes(search) ||
        (item.note || '').toLowerCase().includes(search)
      );
    });
  }, [combinedHistory, searchTerm]);

  // Reset page when filter changes
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage) || 1;
  const paginatedItems = filteredItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleFilterChange = (type) => {
    setFilterType(type);
    setCurrentPage(1);
  };

  return (
    <div>
      {/* Header Bar */}
      <div className="glass-card mb-4">
        <div className="flex-between" style={{ flexWrap: 'wrap', gap: '16px' }}>
          <div className="flex-center gap-3">
            <History size={24} className="text-cyan" />
            <div>
              <h2 style={{ fontSize: '1.2rem' }}>İşlem Geçmişi & Hareketler</h2>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Tüm Gelir ve Gider Dökümü</span>
            </div>
          </div>

          {/* Filter Type Buttons */}
          <div className="flex-center gap-2">
            <button
              className={`btn btn-sm ${filterType === 'all' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => handleFilterChange('all')}
            >
              Tüm İşlemler ({combinedHistory.length})
            </button>
            <button
              className={`btn btn-sm ${filterType === 'incomes' ? 'btn-emerald' : 'btn-secondary'}`}
              onClick={() => handleFilterChange('incomes')}
            >
              <ArrowUpRight size={14} /> Gelirler ({incomes.length})
            </button>
            <button
              className={`btn btn-sm ${filterType === 'expenses' ? 'btn-danger' : 'btn-secondary'}`}
              onClick={() => handleFilterChange('expenses')}
            >
              <ArrowDownRight size={14} /> Giderler ({expenses.length})
            </button>
          </div>
        </div>
      </div>

      {/* Main Table Glass Card */}
      <div className="glass-card">
        {/* Search Bar */}
        <div className="form-group mb-4">
          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="form-control"
              style={{ paddingLeft: '42px', fontSize: '0.95rem' }}
              placeholder="Plaka, hizmet adı veya gider araması yapın..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>

        {filteredItems.length === 0 ? (
          <div className="flex-center" style={{ minHeight: '200px', flexDirection: 'column', gap: '8px', color: 'var(--text-muted)' }}>
            <p>Aranan kriterlere uygun işlem kaydı bulunamadı.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Tür</th>
                  <th>Tarih</th>
                  <th>Açıklama / Plaka</th>
                  <th>Detay / Hizmet</th>
                  <th>Ödeme / Kategori</th>
                  <th>Tutar</th>
                  <th>İşlem</th>
                </tr>
              </thead>
              <tbody>
                {paginatedItems.map((item) => (
                  <tr key={`${item.type}-${item.id}`}>
                    <td>
                      {item.type === 'income' ? (
                        <span className="pay-pill nakit" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <ArrowUpRight size={12} /> Gelir
                        </span>
                      ) : (
                        <span className="pay-pill" style={{ background: 'rgba(244,63,94,0.15)', color: 'var(--accent-rose)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <ArrowDownRight size={12} /> Gider
                        </span>
                      )}
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.date}</td>
                    <td>
                      {item.type === 'income' ? (
                        <span className="plate-badge">{item.plate}</span>
                      ) : (
                        <b>{item.title}</b>
                      )}
                    </td>
                    <td>
                      <div>{item.service_name}</div>
                      {item.note && <small style={{ color: 'var(--text-muted)' }}>{item.note}</small>}
                    </td>
                    <td>
                      <span className="pay-pill" style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-secondary)' }}>
                        {item.payment_type || item.category}
                      </span>
                    </td>
                    <td style={{ fontWeight: 800, fontSize: '0.95rem' }} className={item.type === 'income' ? 'text-emerald' : 'text-rose'}>
                      {item.type === 'income' ? '+' : '-'}₺{Number(item.amount).toLocaleString('tr-TR')}
                    </td>
                    <td>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => {
                          if (item.type === 'income') {
                            if (confirm(`${item.plate} kaydını silmek istediğinize emin misiniz?`)) {
                              onDeleteIncome(item.id);
                            }
                          } else {
                            if (confirm(`${item.title} giderini silmek istediğinize emin misiniz?`)) {
                              onDeleteExpense(item.id);
                            }
                          }
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        {filteredItems.length > itemsPerPage && (
          <div className="flex-between mt-4" style={{ paddingTop: '16px', borderTop: '1px solid var(--border-color)', fontSize: '0.85rem' }}>
            <button
              className="btn btn-secondary btn-sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              style={{ opacity: currentPage === 1 ? 0.5 : 1, cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
            >
              <ChevronLeft size={16} /> Önceki
            </button>
            <span style={{ color: 'var(--text-secondary)' }}>
              Sayfa <b>{currentPage}</b> / {totalPages} (Toplam {filteredItems.length} Kayıt)
            </span>
            <button
              className="btn btn-secondary btn-sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              style={{ opacity: currentPage === totalPages ? 0.5 : 1, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
            >
              Sonraki <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
