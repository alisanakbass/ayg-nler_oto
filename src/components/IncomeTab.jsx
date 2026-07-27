import React, { useState, useRef } from 'react';
import { PlusCircle, CheckCircle2, Sparkles, Plus, X } from 'lucide-react';

export function IncomeTab({ services = [], onAddIncome, onAddService }) {
  const [plate, setPlate] = useState('');
  const [vehicleType, setVehicleType] = useState('Binek');
  const [serviceName, setServiceName] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentType, setPaymentType] = useState('Nakit');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [successMessage, setSuccessMessage] = useState('');

  // Multi-Select Services State
  const [selectedServiceIds, setSelectedServiceIds] = useState([]);

  // Input Refs for Sequential ENTER Navigation
  const plateInputRef = useRef(null);
  const vehicleTypeSelectRef = useRef(null);
  const serviceNameInputRef = useRef(null);
  const amountInputRef = useRef(null);
  const paymentSelectRef = useRef(null);
  const dateInputRef = useRef(null);
  const noteInputRef = useRef(null);

  // Quick Service Modal State
  const [showQuickServiceModal, setShowQuickServiceModal] = useState(false);
  const [newSrvName, setNewSrvName] = useState('');
  const [newSrvType, setNewSrvType] = useState('Binek');
  const [newSrvPrice, setNewSrvPrice] = useState('');

  const handleQuickAddService = async (e) => {
    e.preventDefault();
    if (!newSrvName.trim() || !newSrvPrice || Number(newSrvPrice) <= 0) return;
    let createdItem = null;
    if (onAddService) {
      createdItem = await onAddService({
        name: newSrvName.trim(),
        vehicle_type: newSrvType,
        price: Number(newSrvPrice)
      });
    }
    if (createdItem) {
      handleToggleService(createdItem);
    }
    setNewSrvName('');
    setNewSrvPrice('');
    setShowQuickServiceModal(false);
  };

  // Multi-select service chip toggle
  const handleToggleService = (service) => {
    let nextIds;
    if (selectedServiceIds.includes(service.id)) {
      nextIds = selectedServiceIds.filter(id => id !== service.id);
    } else {
      nextIds = [...selectedServiceIds, service.id];
    }
    setSelectedServiceIds(nextIds);

    const selectedObjs = services.filter(s => nextIds.includes(s.id));
    if (selectedObjs.length > 0) {
      const names = selectedObjs.map(s => s.name).join(' + ');
      const total = selectedObjs.reduce((acc, curr) => acc + Number(curr.price || 0), 0);
      setServiceName(names);
      setAmount(total.toString());
      if (service.vehicle_type) {
        setVehicleType(service.vehicle_type);
      }
    } else {
      setServiceName('');
      setAmount('');
    }
  };

  // Format Plate input automatically
  const handlePlateChange = (e) => {
    const val = e.target.value.toUpperCase().replace(/\s+/g, ' ');
    setPlate(val);
  };

  // Sequential ENTER Key Handlers
  const handlePlateKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      vehicleTypeSelectRef.current?.focus();
    }
  };

  const handleVehicleTypeKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      serviceNameInputRef.current?.focus();
    }
  };

  const handleServiceNameKeyDown = (e) => {
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
    if (!plate.trim()) {
      alert('Lütfen araç plakasını giriniz.');
      plateInputRef.current?.focus();
      return;
    }
    if (!serviceName.trim()) {
      alert('Lütfen yapılan hizmeti seçiniz veya yazınız.');
      serviceNameInputRef.current?.focus();
      return;
    }
    if (!amount || Number(amount) <= 0) {
      alert('Lütfen geçerli bir tutar giriniz.');
      amountInputRef.current?.focus();
      return;
    }

    const newIncome = {
      plate: plate.trim(),
      vehicle_type: vehicleType,
      service_name: serviceName,
      amount: Number(amount),
      payment_type: paymentType,
      note: note.trim(),
      date
    };

    await onAddIncome(newIncome);

    // Reset Form & Multi Select Chips
    setPlate('');
    setServiceName('');
    setAmount('');
    setNote('');
    setSelectedServiceIds([]);
    setSuccessMessage(`${plate.trim()} plakalı araç yıkama kaydı başarıyla eklendi!`);
    setTimeout(() => setSuccessMessage(''), 4000);

    // Re-focus back to Plate input for next entry
    setTimeout(() => {
      plateInputRef.current?.focus();
    }, 100);
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      {/* Gelir Ekle Formu */}
      <div className="glass-card">
        <div className="flex-between mb-4">
          <h2 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <PlusCircle size={24} className="text-emerald" />
            Hızlı Yıkama & Gelir Girişi
          </h2>
          {plate && (
            <div className="plate-badge" style={{ fontSize: '1.1rem' }}>
              {plate}
            </div>
          )}
        </div>

        {successMessage && (
          <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid var(--accent-emerald)', padding: '14px', borderRadius: '10px', color: 'var(--accent-emerald)', fontSize: '0.9rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={20} />
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* 1. Plaka & 2. Araç Tipi */}
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">1. Araç Plakası (ENTER ↵)</label>
              <input
                ref={plateInputRef}
                type="text"
                className="form-control"
                placeholder="Örn: 34 ABC 123"
                value={plate}
                onChange={handlePlateChange}
                onKeyDown={handlePlateKeyDown}
                autoFocus
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">2. Araç Tipi (ENTER ↵)</label>
              <select
                ref={vehicleTypeSelectRef}
                className="form-control"
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value)}
                onKeyDown={handleVehicleTypeKeyDown}
              >
                <option value="Binek">Binek Otomobil</option>
                <option value="SUV / Arazi">SUV / Arazi</option>
                <option value="Ticari / Minibüs">Ticari / Minibüs</option>
                <option value="Motosiklet">Motosiklet</option>
              </select>
            </div>
          </div>

          {/* 3. Hizmet Seçim Hızlı Chip'leri */}
          <div className="form-group">
            <div className="flex-between mb-2">
              <label className="form-label" style={{ marginBottom: 0 }}>
                3. Hızlı Hizmet Seçimi <span style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)' }}>(Çoklu Seçilebilir)</span>
              </label>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setShowQuickServiceModal(!showQuickServiceModal)}
                style={{ fontSize: '0.75rem', padding: '4px 8px', color: 'var(--accent-cyan)' }}
              >
                <Plus size={14} /> + Yeni Hizmet Ekle
              </button>
            </div>

            {/* Quick Service Add Mini Form */}
            {showQuickServiceModal && (
              <div style={{ background: 'rgba(6, 182, 212, 0.1)', border: '1px solid var(--accent-cyan)', padding: '12px', borderRadius: '12px', marginBottom: '12px' }}>
                <div className="flex-between mb-2">
                  <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--accent-cyan)' }}>Yeni Hizmet Çipi Oluştur</span>
                  <button type="button" onClick={() => setShowQuickServiceModal(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
                    <X size={16} />
                  </button>
                </div>
                <div className="form-grid" style={{ marginBottom: '8px' }}>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Hizmet Adı (Örn: Koltuk Yıkama)"
                    value={newSrvName}
                    onChange={(e) => setNewSrvName(e.target.value)}
                  />
                  <select className="form-control" value={newSrvType} onChange={(e) => setNewSrvType(e.target.value)}>
                    <option value="Binek">Binek</option>
                    <option value="SUV / Arazi">SUV / Arazi</option>
                    <option value="Ticari / Minibüs">Ticari</option>
                    <option value="Motosiklet">Motosiklet</option>
                  </select>
                </div>
                <div className="flex-between gap-2">
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Fiyat ₺ (Örn: 250)"
                    value={newSrvPrice}
                    onChange={(e) => setNewSrvPrice(e.target.value)}
                  />
                  <button type="button" className="btn btn-emerald btn-sm" onClick={handleQuickAddService} style={{ whiteSpace: 'nowrap' }}>
                    Kaydet & Seç
                  </button>
                </div>
              </div>
            )}

            <div className="chip-grid">
              {services.map((srv) => {
                const isSelected = selectedServiceIds.includes(srv.id);
                return (
                  <div
                    key={srv.id}
                    className={`chip-item ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleToggleService(srv)}
                  >
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{srv.vehicle_type || 'Binek'}</span>
                    <span>{srv.name}</span>
                    <span className="chip-price">₺{srv.price}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 4. Hizmet Adı & 5. Tutar Manuel Input */}
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">4. Hizmet Tanımı (ENTER ↵)</label>
              <input
                ref={serviceNameInputRef}
                type="text"
                className="form-control"
                placeholder="İç-Dış Yıkama, Pasta Cila..."
                value={serviceName}
                onChange={(e) => setServiceName(e.target.value)}
                onKeyDown={handleServiceNameKeyDown}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">5. Toplam Tutar (TL) * (ENTER ↵)</label>
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

          {/* 6. Ödeme Türü & 7. Tarih */}
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">6. Ödeme Yöntemi (ENTER ↵)</label>
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
              <label className="form-label">7. İşlem Tarihi (ENTER ↵)</label>
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
            <label className="form-label">8. Not / Açıklama (ENTER ↵ ile KAYDET)</label>
            <input
              ref={noteInputRef}
              type="text"
              className="form-control"
              placeholder="Ekstra istekler..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              onKeyDown={handleNoteKeyDown}
            />
          </div>

          <button type="submit" className="btn btn-emerald btn-full mt-4" style={{ padding: '16px', fontSize: '1.05rem' }}>
            <Sparkles size={20} />
            Yıkama Kaydını Kaydet (ENTER ↵)
          </button>
        </form>
      </div>
    </div>
  );
}
