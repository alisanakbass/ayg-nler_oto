import React, { useState, useRef } from 'react';
import { Tag, Plus, Trash2 } from 'lucide-react';

export function ServicesStaffTab({ services = [], onAddService, onDeleteService }) {
  // Service Form State & Refs
  const [srvName, setSrvName] = useState('');
  const [srvType, setSrvType] = useState('Binek');
  const [srvPrice, setSrvPrice] = useState('');

  const srvNameRef = useRef(null);
  const srvTypeRef = useRef(null);
  const srvPriceRef = useRef(null);

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

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      {/* Hizmet & Fiyat Yönetimi */}
      <div className="glass-card">
        <div className="flex-between mb-4">
          <h2 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Tag size={20} className="text-cyan" />
            Hizmet & Fiyat Yönetim Listesi
          </h2>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Toplam: {services.length} Hizmet
          </span>
        </div>

        {msg && (
          <div style={{ color: 'var(--accent-emerald)', padding: '8px', background: 'rgba(16,185,129,0.1)', borderRadius: '8px', marginBottom: '12px' }}>
            {msg}
          </div>
        )}

        <form onSubmit={handleCreateService} className="mb-4">
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">1. Hizmet Tanımı (ENTER ↵)</label>
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
              <label className="form-label">2. Araç Tipi (ENTER ↵)</label>
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
                <option value="Motosiklet">Motosiklet</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">3. Fiyat (TL) (ENTER ↵ ile KAYDET)</label>
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

        <div className="table-responsive" style={{ maxHeight: '450px', overflowY: 'auto' }}>
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
                  <td className="text-cyan" style={{ fontWeight: 700 }}>₺{s.price}</td>
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
    </div>
  );
}
