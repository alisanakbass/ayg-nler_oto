import React, { useState } from 'react';
import { MinusCircle, Search, Trash2, CheckCircle2, Tag } from 'lucide-react';

const EXPENSE_CATEGORIES = [
  'Kira',
  'Fatura (Elektrik/Su/Doğalgaz)',
  'Malzeme & Kimyasal',
  'Personel & Maaş',
  'Yemek & İkram',
  'Ekipman & Bakım/Tamir',
  'Diğer'
];

export function ExpenseTab({ expenses = [], onAddExpense, onDeleteExpense }) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Malzeme & Kimyasal');
  const [amount, setAmount] = useState('');
  const [paymentType, setPaymentType] = useState('Nakit');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('Tümü');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Lütfen gider başlığını giriniz.');
      return;
    }
    if (!amount || Number(amount) <= 0) {
      alert('Lütfen geçerli bir tutar giriniz.');
      return;
    }

    const newExpense = {
      title: title.trim(),
      category,
      amount: Number(amount),
      payment_type: paymentType,
      date,
      note: note.trim()
    };

    await onAddExpense(newExpense);

    setTitle('');
    setAmount('');
    setNote('');
    setSuccessMessage(`${title.trim()} gider kaydı eklendi!`);
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  const filteredExpenses = expenses.filter(exp => {
    const matchesSearch = (exp.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (exp.note || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategoryFilter === 'Tümü' || exp.category === selectedCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="form-grid-responsive">
      {/* Gider Ekle Formu */}
      <div className="glass-card">
        <div className="flex-between mb-4">
          <h2 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MinusCircle size={22} className="text-rose" />
            Yeni Gider Girişi
          </h2>
        </div>

        {successMessage && (
          <div style={{ background: 'rgba(244, 63, 94, 0.15)', border: '1px solid var(--accent-rose)', padding: '12px', borderRadius: '10px', color: 'var(--accent-rose)', fontSize: '0.875rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={18} />
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Gider Başlığı / Açıklama *</label>
            <input
              type="text"
              className="form-control"
              placeholder="Örn: 20L Şampuan Alımı, Dükkan Kirası, Elektrik Faturası"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Gider Kategorisi</label>
              <select
                className="form-control"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {EXPENSE_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Tutar (TL) *</label>
              <input
                type="number"
                step="0.01"
                className="form-control"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Ödeme Yöntemi</label>
              <select
                className="form-control"
                value={paymentType}
                onChange={(e) => setPaymentType(e.target.value)}
              >
                <option value="Nakit">Nakit</option>
                <option value="Kredi Kartı">Kredi Kartı</option>
                <option value="IBAN">IBAN / Havale</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">İşlem Tarihi</label>
              <input
                type="date"
                className="form-control"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Ek Not / Fiş No</label>
            <input
              type="text"
              className="form-control"
              placeholder="Fiş veya fatura numarası ekleyin..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          <button type="submit" className="btn btn-danger btn-full mt-4">
            Gider Kaydını Ekle
          </button>
        </form>
      </div>

      {/* Kayıtlı Giderler Listesi */}
      <div className="glass-card">
        <div className="flex-between mb-4">
          <h2 style={{ fontSize: '1.2rem' }}>Gider Geçmişi</h2>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {expenses.length} Kayıt
          </span>
        </div>

        {/* Filter Controls */}
        <div className="form-grid mb-4">
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="form-control"
              style={{ paddingLeft: '38px' }}
              placeholder="Gider başlığı ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            className="form-control"
            value={selectedCategoryFilter}
            onChange={(e) => setSelectedCategoryFilter(e.target.value)}
          >
            <option value="Tümü">Tüm Kategoriler</option>
            {EXPENSE_CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {filteredExpenses.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Gider kaydı bulunamadı.</p>
        ) : (
          <div className="table-responsive" style={{ maxHeight: '520px', overflowY: 'auto' }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Tarih</th>
                  <th>Gider Başlığı</th>
                  <th>Kategori</th>
                  <th>Tutar</th>
                  <th>Sil</th>
                </tr>
              </thead>
              <tbody>
                {filteredExpenses.map((exp) => (
                  <tr key={exp.id}>
                    <td style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>{exp.date}</td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{exp.title}</div>
                      {exp.note && <small style={{ color: 'var(--text-muted)' }}>{exp.note}</small>}
                    </td>
                    <td>
                      <span className="pay-pill" style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-secondary)' }}>
                        {exp.category}
                      </span>
                    </td>
                    <td className="text-rose" style={{ fontWeight: 700 }}>
                      -₺{Number(exp.amount).toLocaleString('tr-TR')}
                    </td>
                    <td>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => {
                          if (confirm(`${exp.title} giderini silmek istediğinize emin misiniz?`)) {
                            onDeleteExpense(exp.id);
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
      </div>
    </div>
  );
}
