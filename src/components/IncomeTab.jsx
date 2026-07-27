import React, { useState, useEffect } from 'react';
import { PlusCircle, Search, Trash2, CheckCircle2, Car, Sparkles, Plus, X, ChevronLeft, ChevronRight, Smartphone, QrCode, Radio, Check, Loader2 } from 'lucide-react';

export function IncomeTab({ services = [], staffList = [], incomes = [], onAddIncome, onDeleteIncome, onAddService }) {
  const [plate, setPlate] = useState('');
  const [vehicleType, setVehicleType] = useState('Binek');
  const [serviceName, setServiceName] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentType, setPaymentType] = useState('Nakit');
  const [staffName, setStaffName] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Quick Service Modal State
  const [showQuickServiceModal, setShowQuickServiceModal] = useState(false);
  const [newSrvName, setNewSrvName] = useState('');
  const [newSrvType, setNewSrvType] = useState('Binek');
  const [newSrvPrice, setNewSrvPrice] = useState('');

  // NFC & QR Payment Modals State
  const [showNFCModal, setShowNFCModal] = useState(false);
  const [nfcStatus, setNfcStatus] = useState('waiting'); // 'waiting', 'processing', 'success'
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrStatus, setQrStatus] = useState('waiting'); // 'waiting', 'success'

  const handleQuickAddService = async (e) => {
    e.preventDefault();
    if (!newSrvName.trim() || !newSrvPrice || Number(newSrvPrice) <= 0) return;
    if (onAddService) {
      await onAddService({
        name: newSrvName.trim(),
        vehicle_type: newSrvType,
        price: Number(newSrvPrice)
      });
    }
    setServiceName(newSrvName.trim());
    setVehicleType(newSrvType);
    setAmount(newSrvPrice.toString());
    setNewSrvName('');
    setNewSrvPrice('');
    setShowQuickServiceModal(false);
  };

  // Handle service chip selection
  const handleSelectService = (service) => {
    setServiceName(service.name);
    setAmount(service.price.toString());
    if (service.vehicle_type) {
      setVehicleType(service.vehicle_type);
    }
  };

  // Format Plate input automatically
  const handlePlateChange = (e) => {
    const val = e.target.value.toUpperCase().replace(/\s+/g, ' ');
    setPlate(val);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!plate.trim()) {
      alert('Lütfen araç plakasını giriniz.');
      return;
    }
    if (!serviceName.trim()) {
      alert('Lütfen yapılan hizmeti seçiniz veya yazınız.');
      return;
    }
    if (!amount || Number(amount) <= 0) {
      alert('Lütfen geçerli bir tutar giriniz.');
      return;
    }

    const newIncome = {
      plate: plate.trim(),
      vehicle_type: vehicleType,
      service_name: serviceName,
      amount: Number(amount),
      payment_type: paymentType,
      staff_name: staffName,
      note: note.trim(),
      date
    };

    await onAddIncome(newIncome);

    // Reset Form
    setPlate('');
    setServiceName('');
    setAmount('');
    setNote('');
    setSuccessMessage(`${plate.trim()} plakalı araç yıkama kaydı başarıyla eklendi!`);
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  const filteredIncomes = incomes.filter(inc => 
    (inc.plate || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (inc.service_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (inc.staff_name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const totalPages = Math.ceil(filteredIncomes.length / itemsPerPage) || 1;
  const paginatedIncomes = filteredIncomes.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // NFC Payment Trigger
  const handleStartNFCPayment = () => {
    if (!amount || Number(amount) <= 0) {
      alert('Lütfen önce hizmet tutarını giriniz.');
      return;
    }
    setPaymentType('Kredi Kartı');
    setNfcStatus('waiting');
    setShowNFCModal(true);

    if (/Android|iPhone/i.test(navigator.userAgent)) {
      try {
        window.location.href = `paytrpos://pay?amount=${amount}&plate=${encodeURIComponent(plate || 'OTO')}`;
      } catch (e) {
        console.log('SoftPOS launch fallback');
      }
    }
  };

  const handleSimulateNFCTap = () => {
    setNfcStatus('processing');
    setTimeout(() => {
      setNfcStatus('success');
    }, 1200);
  };

  // QR Payment Trigger
  const handleStartQRPayment = () => {
    if (!amount || Number(amount) <= 0) {
      alert('Lütfen önce hizmet tutarını giriniz.');
      return;
    }
    setPaymentType('Kredi Kartı');
    setQrStatus('waiting');
    setShowQRModal(true);
  };

  return (
    <div className="form-grid-responsive">
      {/* Gelir Ekle Formu */}
      <div className="glass-card">
        <div className="flex-between mb-4">
          <h2 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <PlusCircle size={22} className="text-emerald" />
            Hızlı Yıkama & Gelir Girişi
          </h2>
          {plate && (
            <div className="plate-badge" style={{ fontSize: '1rem' }}>
              {plate}
            </div>
          )}
        </div>

        {successMessage && (
          <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid var(--accent-emerald)', padding: '12px', borderRadius: '10px', color: 'var(--accent-emerald)', fontSize: '0.875rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={18} />
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Plaka & Araç Tipi */}
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Araç Plakası *</label>
              <input
                type="text"
                className="form-control"
                placeholder="Örn: 34 ABC 123"
                value={plate}
                onChange={handlePlateChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Araç Tipi</label>
              <select
                className="form-control"
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value)}
              >
                <option value="Binek">Binek Otomobil</option>
                <option value="SUV / Arazi">SUV / Arazi</option>
                <option value="Ticari / Minibüs">Ticari / Minibüs</option>
                <option value="Motosiklet">Motosiklet</option>
              </select>
            </div>
          </div>

          {/* Hizmet Seçim Hızlı Chip'leri */}
          <div className="form-group">
            <div className="flex-between mb-2">
              <label className="form-label" style={{ marginBottom: 0 }}>Hızlı Hizmet Seçimi</label>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setShowQuickServiceModal(!showQuickServiceModal)}
                style={{ fontSize: '0.75rem', padding: '4px 8px', color: 'var(--accent-cyan)' }}
              >
                <Plus size={14} /> + Yeni Hizmet Çipi Ekle
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
              {services.map((srv) => (
                <div
                  key={srv.id}
                  className={`chip-item ${serviceName === srv.name && vehicleType === srv.vehicle_type ? 'selected' : ''}`}
                  onClick={() => handleSelectService(srv)}
                >
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{srv.vehicle_type || 'Binek'}</span>
                  <span>{srv.name}</span>
                  <span className="chip-price">₺{srv.price}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Hizmet Adı & Tutar Manuel Input */}
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Hizmet Adı *</label>
              <input
                type="text"
                className="form-control"
                placeholder="İç-Dış Yıkama, Pasta Cila..."
                value={serviceName}
                onChange={(e) => setServiceName(e.target.value)}
                required
              />
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
      {/* NFC Payment Modal */}
      {showNFCModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div className="glass-card" style={{ maxWidth: '420px', width: '100%', textCenter: 'center', textAlign: 'center', border: '1px solid var(--accent-cyan)' }}>
            <div className="flex-between mb-4">
              <span className="status-badge supabase" style={{ fontSize: '0.8rem' }}>
                <Smartphone size={14} /> SoftPOS NFC Aktif
              </span>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowNFCModal(false)}>
                <X size={16} />
              </button>
            </div>

            {nfcStatus === 'waiting' && (
              <div>
                <div style={{ width: '80px', height: '80px', margin: '0 auto 16px', borderRadius: '50%', background: 'rgba(6, 182, 212, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px dashed var(--accent-cyan)', animation: 'pulse 1.5s infinite' }}>
                  <Radio size={40} className="text-cyan" />
                </div>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Kartınızı Telefonun Arkasına Dokundurun</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '16px' }}>
                  {plate ? <b>{plate}</b> : 'Araç'} - Tutar: <b className="text-cyan">₺{amount}</b>
                </p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
                  NFC özelliği aktif cep telefonunuzun arkasına temassız kartı yaklaştırın...
                </p>
                <button className="btn btn-emerald btn-full" onClick={handleSimulateNFCTap}>
                  <Radio size={18} /> Kart Dokunduruldu (Test Onayı)
                </button>
              </div>
            )}

            {nfcStatus === 'processing' && (
              <div style={{ padding: '20px 0' }}>
                <Loader2 size={48} className="text-cyan" style={{ margin: '0 auto 16px', animation: 'spin 1s linear infinite' }} />
                <h3>Ödeme Alınıyor...</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Bankanızla güvenli iletişim kuruluyor</p>
              </div>
            )}

            {nfcStatus === 'success' && (
              <div>
                <div style={{ width: '70px', height: '70px', margin: '0 auto 16px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-emerald)' }}>
                  <Check size={40} />
                </div>
                <h3 className="text-emerald" style={{ fontSize: '1.3rem', marginBottom: '8px' }}>Ödeme Başarılı!</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '20px' }}>
                  ₺{amount} tutarındaki temassız kart ödemesi onaylandı.
                </p>
                <button
                  className="btn btn-primary btn-full"
                  onClick={() => {
                    setShowNFCModal(false);
                  }}
                >
                  Tamam (Kaydı Bitir)
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* QR Payment Modal */}
      {showQRModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div className="glass-card" style={{ maxWidth: '420px', width: '100%', textAlign: 'center', border: '1px solid var(--accent-blue)' }}>
            <div className="flex-between mb-4">
              <span className="status-badge" style={{ background: 'rgba(59, 130, 246, 0.15)', color: 'var(--accent-blue)', fontSize: '0.8rem' }}>
                <QrCode size={14} /> Dinamik Ödeme QR Kodu
              </span>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowQRModal(false)}>
                <X size={16} />
              </button>
            </div>

            {qrStatus === 'waiting' && (
              <div>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '6px' }}>Müşteriye QR Kodu Okutun</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '16px' }}>
                  Plaka: <b>{plate || 'Oto Yıkama'}</b> | Tutar: <b className="text-emerald">₺{amount}</b>
                </p>

                {/* Dynamic QR Code Image */}
                <div style={{ background: '#fff', padding: '16px', borderRadius: '16px', display: 'inline-block', marginBottom: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.4)' }}>
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(`AYGUN_OTO_YIKAMA:${plate}:${amount}:TRY`)}`}
                    alt="Ödeme QR Kodu"
                    style={{ width: '180px', height: '180px', display: 'block' }}
                  />
                </div>

                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                  Müşteri cep telefonu kamerasıyla okutarak ödemeyi tamamlar.
                </p>

                <button
                  className="btn btn-emerald btn-full"
                  onClick={() => setQrStatus('success')}
                >
                  <CheckCircle2 size={18} /> Ödeme Tamamlandı (Onayla)
                </button>
              </div>
            )}

            {qrStatus === 'success' && (
              <div>
                <div style={{ width: '70px', height: '70px', margin: '0 auto 16px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-emerald)' }}>
                  <Check size={40} />
                </div>
                <h3 className="text-emerald" style={{ fontSize: '1.3rem', marginBottom: '8px' }}>QR Ödeme Alındı!</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '20px' }}>
                  ₺{amount} tutarındaki dijital ödeme onaylandı.
                </p>
                <button className="btn btn-primary btn-full" onClick={() => setShowQRModal(false)}>
                  Tamam
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Ödeme Yöntemi & Hızlı Mobil Ödeme Butonları */}
      <div className="form-grid">
        <div className="form-group">
          <label className="form-label flex-between">
            <span>Ödeme Yöntemi</span>
            <span style={{ fontSize: '0.7rem', color: 'var(--accent-cyan)' }}>Mobil POS Aktif</span>
          </label>
          <select
            className="form-control"
            value={paymentType}
            onChange={(e) => setPaymentType(e.target.value)}
          >
            <option value="Nakit">Nakit</option>
            <option value="Kredi Kartı">Kredi Kartı</option>
            <option value="IBAN">IBAN / Havale</option>
          </select>

          {/* Quick Mobile Payment Buttons */}
          <div className="flex-center gap-2 mt-2">
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              style={{ flex: 1, fontSize: '0.75rem', background: 'rgba(6, 182, 212, 0.15)', borderColor: 'rgba(6, 182, 212, 0.3)', color: 'var(--accent-cyan)' }}
              onClick={handleStartNFCPayment}
            >
              <Smartphone size={14} /> NFC Kart Dokundur
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              style={{ flex: 1, fontSize: '0.75rem', background: 'rgba(59, 130, 246, 0.15)', borderColor: 'rgba(59, 130, 246, 0.3)', color: 'var(--accent-blue)' }}
              onClick={handleStartQRPayment}
            >
              <QrCode size={14} /> QR Kod Oluştur
            </button>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Yıkayan Personel</label>
          <select
            className="form-control"
            value={staffName}
            onChange={(e) => setStaffName(e.target.value)}
          >
            <option value="">-- Personel Seçin (Opsiyonel) --</option>
            {staffList.map(st => (
              <option key={st.id} value={st.name}>{st.name}</option>
            ))}
          </select>
        </div>
      </div>

          {/* Tarih & Not */}
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">İşlem Tarihi</label>
              <input
                type="date"
                className="form-control"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Not / Açıklama</label>
              <input
                type="text"
                className="form-control"
                placeholder="Ekstra istekler..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
          </div>

          <button type="submit" className="btn btn-emerald btn-full mt-4">
            <Sparkles size={18} />
            Yıkama Kaydını Kaydet
          </button>
        </form>
      </div>

      {/* Kayıtlı Gelirler Listesi */}
      <div className="glass-card">
        <div className="flex-between mb-4">
          <h2 style={{ fontSize: '1.2rem' }}>Gelir Geçmişi</h2>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Toplam: {incomes.length} Kayıt
          </span>
        </div>

        {/* Search Input */}
        <div className="form-group mb-4">
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="form-control"
              style={{ paddingLeft: '38px' }}
              placeholder="Plaka veya Hizmet Ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {filteredIncomes.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Aramaya uygun gelir kaydı bulunamadı.</p>
        ) : (
          <div className="table-responsive" style={{ maxHeight: '520px', overflowY: 'auto' }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Tarih</th>
                  <th>Plaka</th>
                  <th>Hizmet</th>
                  <th>Ödeme</th>
                  <th>Tutar</th>
                  <th>Sil</th>
                </tr>
              </thead>
              <tbody>
                {paginatedIncomes.map((inc) => (
                  <tr key={inc.id}>
                    <td style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>{inc.date}</td>
                    <td>
                      <span className="plate-badge">{inc.plate}</span>
                    </td>
                    <td>
                      <div>{inc.service_name}</div>
                      {inc.staff_name && <small style={{ color: 'var(--accent-cyan)' }}>{inc.staff_name}</small>}
                    </td>
                    <td>
                      <span className={`pay-pill ${(inc.payment_type || '').toLowerCase().replace(' ', '')}`}>
                        {inc.payment_type}
                      </span>
                    </td>
                    <td className="text-emerald" style={{ fontWeight: 700 }}>
                      ₺{Number(inc.amount).toLocaleString('tr-TR')}
                    </td>
                    <td>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => {
                          if (confirm(`${inc.plate} plakalı ${inc.amount} TL kaydını silmek istediğinize emin misiniz?`)) {
                            onDeleteIncome(inc.id);
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
        {filteredIncomes.length > itemsPerPage && (
          <div className="flex-between mt-4" style={{ paddingTop: '12px', borderTop: '1px solid var(--border-color)', fontSize: '0.85rem' }}>
            <button
              className="btn btn-secondary btn-sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              style={{ opacity: currentPage === 1 ? 0.5 : 1, cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
            >
              <ChevronLeft size={16} /> Önceki
            </button>
            <span style={{ color: 'var(--text-secondary)' }}>
              Sayfa <b>{currentPage}</b> / {totalPages} (Toplam {filteredIncomes.length} Kayıt)
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
