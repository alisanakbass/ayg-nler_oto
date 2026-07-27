import React, { useState, useRef } from 'react';
import { Tag, Plus, Trash2, Edit3, Check, X } from 'lucide-react';

export function ServicesStaffTab({ services = [], onAddService, onDeleteService, onUpdateService }) {
  // Service Form State & Refs
  const [srvName, setSrvName] = useState('');
  const [srvType, setSrvType] = useState('Binek');
  const [srvPrice, setSrvPrice] = useState('');

  const srvNameRef = useRef(null);
  const srvTypeRef = useRef(null);
  const srvPriceRef = useRef(null);

  // Inline Editing State
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editType, setEditType] = useState('Binek');
  const [editPrice, setEditPrice] = useState('');

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

  const startEditing = (srv) => {
    setEditingId(srv.id);
    setEditName(srv.name);
    setEditType(srv.vehicle_type || 'Binek');
    setEditPrice(srv.price.toString());
  };

  const cancelEditing = () => {
    setEditingId(null);
  };

  const saveEditing = async (id) => {
    if (!editName.trim() || !editPrice || Number(editPrice) <= 0) {
      alert('Lütfen geçerli bir hizmet tanımı ve fiyat giriniz.');
      return;
    }
    if (onUpdateService) {
      await onUpdateService(id, {
        name: editName.trim(),
        vehicle_type: editType,
        price: Number(editPrice)
      });
    }
    setEditingId(null);
    setMsg('Hizmet fiyatı başarıyla güncellendi!');
    setTimeout(() => setMsg(''), 3000);
  };

  return (
    <div style={{ maxWidth: '820px', margin: '0 auto' }}>
      {/* Hizmet & Fiyat Yönetimi */}
      <div className="glass-card">
        <div className="flex-between mb-4">
          <h2 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Tag size={20} className="text-cyan" />
            Hizmet & Fiyat Listesi Düzenleme
          </h2>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Toplam: {services.length} Hizmet
          </span>
        </div>

        {msg && (
          <div style={{ color: 'var(--accent-emerald)', padding: '10px', background: 'rgba(16,185,129,0.15)', border: '1px solid var(--accent-emerald)', borderRadius: '8px', marginBottom: '16px', fontSize: '0.875rem' }}>
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
                <option value="Ticari / Minibüs">Ticari / Minibüs</option>
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

        <div className="table-responsive" style={{ maxHeight: '480px', overflowY: 'auto' }}>
          <table className="custom-table">
            <thead>
              <tr>
                <th>Hizmet Tanımı</th>
                <th>Araç Tipi</th>
                <th>Fiyat (TL)</th>
                <th style={{ width: '120px' }}>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {services.map(s => {
                const isEditing = editingId === s.id;
                return (
                  <tr key={s.id}>
                    <td>
                      {isEditing ? (
                        <input
                          type="text"
                          className="form-control"
                          style={{ padding: '4px 8px', fontSize: '0.85rem' }}
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                        />
                      ) : (
                        <b>{s.name}</b>
                      )}
                    </td>
                    <td>
                      {isEditing ? (
                        <select
                          className="form-control"
                          style={{ padding: '4px 8px', fontSize: '0.85rem' }}
                          value={editType}
                          onChange={(e) => setEditType(e.target.value)}
                        >
                          <option value="Binek">Binek</option>
                          <option value="SUV / Arazi">SUV / Arazi</option>
                          <option value="Ticari / Minibüs">Ticari / Minibüs</option>
                          <option value="Motosiklet">Motosiklet</option>
                        </select>
                      ) : (
                        s.vehicle_type
                      )}
                    </td>
                    <td>
                      {isEditing ? (
                        <input
                          type="number"
                          className="form-control"
                          style={{ padding: '4px 8px', fontSize: '0.85rem', maxWidth: '100px' }}
                          value={editPrice}
                          onChange={(e) => setEditPrice(e.target.value)}
                        />
                      ) : (
                        <span className="text-cyan" style={{ fontWeight: 800, fontSize: '0.95rem' }}>
                          ₺{Number(s.price).toLocaleString('tr-TR')}
                        </span>
                      )}
                    </td>
                    <td>
                      {isEditing ? (
                        <div className="flex-center gap-1">
                          <button
                            className="btn btn-emerald btn-sm"
                            style={{ padding: '4px 8px' }}
                            onClick={() => saveEditing(s.id)}
                            title="Kaydet"
                          >
                            <Check size={14} />
                          </button>
                          <button
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '4px 8px' }}
                            onClick={cancelEditing}
                            title="İptal"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex-center gap-1">
                          <button
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '4px 8px', color: 'var(--accent-cyan)' }}
                            onClick={() => startEditing(s)}
                            title="Fiyat Düzenle"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            style={{ padding: '4px 8px' }}
                            onClick={() => {
                              if (confirm(`${s.name} (${s.vehicle_type}) hizmetini silmek istediğinize emin misiniz?`)) {
                                onDeleteService(s.id);
                              }
                            }}
                            title="Sil"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
