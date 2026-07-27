import React, { useState, useEffect, useRef } from 'react';
import { MinusCircle, CheckCircle2 } from 'lucide-react';

const EXPENSE_CATEGORIES = [
  'Kira',
  'Fatura (Elektrik/Su/Doğalgaz)',
  'Malzeme & Kimyasal',
  'Personel & Maaş',
  'Yemek & İkram',
  'Ekipman & Bakım/Tamir',
  'Diğer'
];

export function ExpenseTab({ onAddExpense }) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Malzeme & Kimyasal');
  const [amount, setAmount] = useState('');
  const [paymentType, setPaymentType] = useState('Nakit');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Input Refs for Sequential ENTER Navigation
  const titleInputRef = useRef(null);
  const categorySelectRef = useRef(null);
  const amountInputRef = useRef(null);
  const paymentSelectRef = useRef(null);
  const dateInputRef = useRef(null);
  const noteInputRef = useRef(null);

  // Sequential ENTER Key Handlers
  const handleTitleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      categorySelectRef.current?.focus();
    }
  };

  const handleCategoryKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      amountInputRef.current?.focus();
    }
  };

  const handleAmountKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      paymentSelectRef.current?.focus();
    }
  };

  const handlePaymentKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      dateInputRef.current?.focus();
    }
  };

  const handleDateKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      noteInputRef.current?.focus();
    }
  };

  const handleNoteKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!title.trim()) {
      alert('Lütfen gider başlığını giriniz.');
      titleInputRef.current?.focus();
      return;
    }
    if (!amount || Number(amount) <= 0) {
      alert('Lütfen geçerli bir tutar giriniz.');
      amountInputRef.current?.focus();
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

    setTimeout(() => {
      titleInputRef.current?.focus();
    }, 100);
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      {/* Gider Ekle Formu */}
      <div className="glass-card">
        <div className="flex-between mb-4">
          <h2 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MinusCircle size={24} className="text-rose" />
            Yeni Gider Girişi
          </h2>
        </div>

        {successMessage && (
          <div style={{ background: 'rgba(244, 63, 94, 0.15)', border: '1px solid var(--accent-rose)', padding: '14px', borderRadius: '10px', color: 'var(--accent-rose)', fontSize: '0.9rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={20} />
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">1. Gider Başlığı / Açıklama * (ENTER ↵)</label>
            <input
              ref={titleInputRef}
              type="text"
              className="form-control"
              placeholder="Örn: 20L Şampuan Alımı, Dükkan Kirası, Elektrik Faturası"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={handleTitleKeyDown}
              autoFocus
              required
            />
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">2. Gider Kategorisi (ENTER ↵)</label>
              <select
                ref={categorySelectRef}
                className="form-control"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                onKeyDown={handleCategoryKeyDown}
              >
                {EXPENSE_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">3. Tutar (TL) * (ENTER ↵)</label>
              <input
                ref={amountInputRef}
                type="number"
                step="0.01"
                className="form-control"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                onKeyDown={handleAmountKeyDown}
                required
              />
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">4. Ödeme Yöntemi (ENTER ↵)</label>
              <select
                ref={paymentSelectRef}
                className="form-control"
                value={paymentType}
                onChange={(e) => setPaymentType(e.target.value)}
                onKeyDown={handlePaymentKeyDown}
              >
                <option value="Nakit">Nakit</option>
                <option value="Kredi Kartı">Kredi Kartı</option>
                <option value="IBAN">IBAN / Havale</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">5. İşlem Tarihi (ENTER ↵)</label>
              <input
                ref={dateInputRef}
                type="date"
                className="form-control"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                onKeyDown={handleDateKeyDown}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">6. Ek Not / Fiş No (ENTER ↵ ile KAYDET)</label>
            <input
              ref={noteInputRef}
              type="text"
              className="form-control"
              placeholder="Fiş veya fatura numarası ekleyin..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              onKeyDown={handleNoteKeyDown}
            />
          </div>

          <button type="submit" className="btn btn-danger btn-full mt-4" style={{ padding: '16px', fontSize: '1.05rem' }}>
            Gider Kaydını Ekle (ENTER ↵)
          </button>
        </form>
      </div>
    </div>
  );
}
