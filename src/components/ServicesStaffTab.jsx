import React, { useState, useRef } from 'react';
import { Tag, Users, Plus, Trash2, CheckCircle2, DollarSign } from 'lucide-react';

export function ServicesStaffTab({ services = [], staffList = [], onAddService, onDeleteService, onAddStaff, onDeleteStaff }) {
  // Service Form State & Refs
  const [srvName, setSrvName] = useState('');
  const [srvType, setSrvType] = useState('Binek');
  const [srvPrice, setSrvPrice] = useState('');

  const srvNameRef = useRef(null);
  const srvTypeRef = useRef(null);
  const srvPriceRef = useRef(null);

  // Staff Form State & Refs
  const [staffName, setStaffName] = useState('');
  const [staffPhone, setStaffPhone] = useState('');
  const [staffComm, setStaffComm] = useState('10');

  const staffNameRef = useRef(null);
  const staffPhoneRef = useRef(null);
  const staffCommRef = useRef(null);

  const [msg, setMsg] = useState('');

  // Service Form ENTER Navigation
  const handleSrvNameKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      srvTypeRef.current?.focus();
    }
  };

  const handleSrvTypeKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      srvPriceRef.current?.focus();
    }
  };

  const handleSrvPriceKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCreateService(e);
    }
  };

  const handleCreateService = async (e) => {
    if (e) e.preventDefault();
    if (!srvName || !srvPrice) {
      alert('Lütfen hizmet tanımı ve fiyatını giriniz.');
      srvNameRef.current?.focus();
      return;
    }
    await onAddService({ name: srvName.trim(), vehicle_type: srvType, price: Number(srvPrice) });
    setSrvName('');
    setSrvPrice('');
    setMsg('Yeni hizmet tanımlandı!');
    setTimeout(() => setMsg(''), 3000);
    setTimeout(() => srvNameRef.current?.focus(), 100);
  };

  // Staff Form ENTER Navigation
  const handleStaffNameKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      staffPhoneRef.current?.focus();
    }
  };

  const handleStaffPhoneKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      staffCommRef.current?.focus();
    }
  };

  const handleStaffCommKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCreateStaff(e);
    }
  };

  const handleCreateStaff = async (e) => {
    if (e) e.preventDefault();
    if (!staffName) {
      alert('Lütfen personel adını giriniz.');
      staffNameRef.current?.focus();
      return;
    }
    await onAddStaff({ name: staffName.trim(), phone: staffPhone.trim(), commission_rate: Number(staffComm) });
    setStaffName('');
    setStaffPhone('');
    setMsg('Yeni personel eklendi!');
    setTimeout(() => setMsg(''), 3000);
    setTimeout(() => staffNameRef.current?.focus(), 100);
  };

  return (
    <div className="form-grid-responsive">
      {/* Hizmet & Fiyat Yönetimi */}
      <div className="glass-card">
        <div className="flex-between mb-4">
          <h2 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Tag size={20} className="text-cyan" />
            Hizmet & Fiyat Listesi
          </h2>
        </div>

        {msg && (
          <div style={{ color: 'var(--accent-emerald)', padding: '8px', background: 'rgba(16,185,129,0.1)', borderRadius: '8px', marginBottom: '12px' }}>
            {msg}
          </div>
        )}

        <form onSubmit={handleCreateService} className="mb-4">
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Hizmet Tanımı (ENTER ↵)</label>
              <input
                ref={srvNameRef}
                type="text"
                className="form-control"
                placeholder="Örn: Seramik Kaplama"
                value={srvName}
                onChange={(e) => setSrvName(e.target.value)}
                onKeyDown={handleSrvNameKeyDown}
                autoFocus
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Araç Tipi (ENTER ↵)</label>
              <select
                ref={srvTypeRef}
                className="form-control"
                value={srvType}
                onChange={(e) => setSrvType(e.target.value)}
                onKeyDown={handleSrvTypeKeyDown}
              >
                <option value="Binek">Binek</option>
                <option value="SUV / Arazi">SUV / Arazi</option>
                <option value="Ticari / Minibüs">Ticari</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Fiyat (TL) (ENTER ↵ ile KAYDET)</label>
            <input
              ref={srvPriceRef}
              type="number"
              className="form-control"
              placeholder="0.00"
              value={srvPrice}
              onChange={(e) => setSrvPrice(e.target.value)}
              onKeyDown={handleSrvPriceKeyDown}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary btn-full">
            <Plus size={18} /> Yeni Hizmet Ekle (ENTER ↵)
          </button>
        </form>

        <div className="table-responsive" style={{ maxHeight: '350px', overflowY: 'auto' }}>
          <table className="custom-table">
            <thead>
              <tr>
                <th>Hizmet</th>
                <th>Araç Tipi</th>
                <th>Fiyat</th>
                <th>Sil</th>
              </tr>
            </thead>
            <tbody>
              {services.map(s => (
                <tr key={s.id}>
                  <td><b>{s.name}</b></td>
                  <td>{s.vehicle_type}</td>
                  <td className="text-cyan">₺{s.price}</td>
                  <td>
                    <button className="btn btn-danger btn-sm" onClick={() => onDeleteService(s.id)}>
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Personel & Prim Takibi */}
      <div className="glass-card">
        <div className="flex-between mb-4">
          <h2 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={20} className="text-amber" />
            Personel Yönetimi & Primler
          </h2>
        </div>

        <form onSubmit={handleCreateStaff} className="mb-4">
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Personel Adı (ENTER ↵)</label>
              <input
                ref={staffNameRef}
                type="text"
                className="form-control"
                placeholder="Örn: Ahmet Usta"
                value={staffName}
                onChange={(e) => setStaffName(e.target.value)}
                onKeyDown={handleStaffNameKeyDown}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Telefon (ENTER ↵)</label>
              <input
                ref={staffPhoneRef}
                type="text"
                className="form-control"
                placeholder="0555..."
                value={staffPhone}
                onChange={(e) => setStaffPhone(e.target.value)}
                onKeyDown={handleStaffPhoneKeyDown}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Prim Oranı (%) (ENTER ↵ ile KAYDET)</label>
            <input
              ref={staffCommRef}
              type="number"
              className="form-control"
              placeholder="10"
              value={staffComm}
              onChange={(e) => setStaffComm(e.target.value)}
              onKeyDown={handleStaffCommKeyDown}
            />
          </div>

          <button type="submit" className="btn btn-secondary btn-full">
            <Plus size={18} /> Personel Ekle (ENTER ↵)
          </button>
        </form>

        <div className="table-responsive" style={{ maxHeight: '350px', overflowY: 'auto' }}>
          <table className="custom-table">
            <thead>
              <tr>
                <th>Ad Soyad</th>
                <th>Telefon</th>
                <th>Prim Oranı</th>
                <th>Sil</th>
              </tr>
            </thead>
            <tbody>
              {staffList.map(st => (
                <tr key={st.id}>
                  <td><b>{st.name}</b></td>
                  <td>{st.phone || '-'}</td>
                  <td>%{st.commission_rate || 0} Prim</td>
                  <td>
                    <button className="btn btn-danger btn-sm" onClick={() => onDeleteStaff(st.id)}>
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
