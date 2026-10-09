import React, { useState } from 'react';
import { 
  Tag, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  Car, 
  CheckCircle2, 
  Sparkles,
  Search
} from 'lucide-react';

const VEHICLE_CATEGORIES = [
  { id: 'Ticari / Minibüs', label: '🚐 Ticari / Minibüs (Courier, Doblo)', short: 'Ticari' },
  { id: 'Binek', label: '🚗 Binek Otomobil', short: 'Binek' },
  { id: 'SUV / Arazi', label: '🚙 SUV / Arazi / Jeep', short: 'SUV' },
  { id: 'Motosiklet', label: '🛵 Motosiklet', short: 'Motosiklet' }
];

export function ServicesStaffTab({ services = [], onAddService, onDeleteService, onUpdateService }) {
  const [activeCategory, setActiveCategory] = useState('Ticari / Minibüs');
  const [searchTerm, setSearchTerm] = useState('');

  // Yeni Hizmet Ekleme Form Durumları
  const [newServiceName, setNewServiceName] = useState('');
  const [newServicePrice, setNewServicePrice] = useState('');

  // Hızlı Fiyat / Ad Düzenleme Durumu
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState('');

  const [notification, setNotification] = useState('');

  const showNotification = (text) => {
    setNotification(text);
    setTimeout(() => setNotification(''), 3000);
  };

  // Yeni Hizmet Ekle
  const handleAddService = async (e) => {
    if (e) e.preventDefault();
    if (!newServiceName.trim()) {
      alert('Lütfen hizmet adını giriniz.');
      return;
    }
    if (!newServicePrice || Number(newServicePrice) <= 0) {
      alert('Lütfen geçerli bir fiyat giriniz.');
      return;
    }

    await onAddService({
      name: newServiceName.trim(),
      vehicle_type: activeCategory,
      price: Number(newServicePrice)
    });

    setNewServiceName('');
    setNewServicePrice('');
    showNotification(`"${newServiceName.trim()}" hizmeti ${activeCategory} listesine eklendi!`);
  };

  // Fiyat Düzenleme Başlat
  const handleStartEdit = (service) => {
    setEditingId(service.id);
    setEditName(service.name);
    setEditPrice(service.price.toString());
  };

  // Fiyat Düzenleme Kaydet
  const handleSaveEdit = async (id) => {
    if (!editName.trim()) {
      alert('Hizmet adı boş olamaz.');
      return;
    }
    if (!editPrice || Number(editPrice) <= 0) {
      alert('Lütfen geçerli bir fiyat giriniz.');
      return;
    }

    if (onUpdateService) {
      await onUpdateService(id, {
        name: editName.trim(),
        vehicle_type: activeCategory,
        price: Number(editPrice)
      });
    }

    setEditingId(null);
    showNotification(`"${editName.trim()}" fiyatı başarıyla güncellendi!`);
  };

  // Hizmet Sil
  const handleDelete = async (service) => {
    if (window.confirm(`"${service.name}" hizmetini silmek istediğinize emin misiniz?`)) {
      await onDeleteService(service.id);
      showNotification(`"${service.name}" silindi.`);
    }
  };

  // Seçili Kategoriye Göre Filtrele
  const categoryServices = services.filter(s => {
    const srvType = s.vehicle_type || 'Binek';
    const matchesCategory = srvType === activeCategory;
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      {/* BAŞLIK & ÖZET */}
      <div className="glass-card mb-4">
        <div className="flex-between" style={{ flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Tag size={22} className="text-cyan" />
              Yıkama & Hizmet Fiyat Listesi
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Araç sınıflarına göre ayrılmış fiyatları tek tıkla düzenleyin veya yeni hizmet ekleyin.
            </p>
          </div>
          <span className="pay-pill nakit" style={{ fontSize: '0.85rem' }}>
            Toplam: {services.length} Hizmet
          </span>
        </div>
      </div>

      {/* BİLDİRİM KUTUSU */}
      {notification && (
        <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid var(--accent-emerald)', padding: '12px 16px', borderRadius: '12px', color: 'var(--accent-emerald)', fontSize: '0.9rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={18} />
          <b>{notification}</b>
        </div>
      )}

      {/* ARAÇ SINIFI SEKMELERİ (BÜYÜK VE NET) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', marginBottom: '20px' }}>
        {VEHICLE_CATEGORIES.map(cat => {
          const isSelected = activeCategory === cat.id;
          const count = services.filter(s => (s.vehicle_type || 'Binek') === cat.id).length;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                setActiveCategory(cat.id);
                setEditingId(null);
              }}
              style={{
                padding: '14px 16px',
                borderRadius: '14px',
                border: '2px solid',
                borderColor: isSelected ? 'var(--accent-cyan)' : 'rgba(255,255,255,0.08)',
                background: isSelected ? 'rgba(6, 182, 212, 0.15)' : 'rgba(255,255,255,0.02)',
                color: isSelected ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                fontWeight: isSelected ? 800 : 500,
                fontSize: '0.92rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'all 0.2s ease',
                boxShadow: isSelected ? '0 4px 15px rgba(6, 182, 212, 0.25)' : 'none'
              }}
            >
              <span>{cat.label}</span>
              <span style={{ 
                background: isSelected ? 'var(--accent-cyan)' : 'rgba(255,255,255,0.08)', 
                color: isSelected ? '#000' : 'var(--text-muted)',
                padding: '2px 8px',
                borderRadius: '10px',
                fontSize: '0.75rem',
                fontWeight: 700
              }}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* YENİ HİZMET EKLEME FORMU (Seçili Kategoriye Doğrudan Tek Satırda) */}
      <div className="glass-card mb-4" style={{ border: '1px solid rgba(6, 182, 212, 0.2)' }}>
        <h3 style={{ fontSize: '0.95rem', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
          <Plus size={16} className="text-cyan" />
          <span><b>{activeCategory}</b> Kategorisine Yeni Hizmet Ekle</span>
        </h3>

        <form onSubmit={handleAddService} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 2, minWidth: '220px' }}>
            <input
              type="text"
              className="form-control"
              placeholder="Hizmet Adı (Örn: Koltuk Yıkama, Pasta Cila...)"
              value={newServiceName}
              onChange={(e) => setNewServiceName(e.target.value)}
              required
            />
          </div>

          <div style={{ flex: 1, minWidth: '130px' }}>
            <input
              type="number"
              className="form-control"
              placeholder="Fiyat (₺)"
              value={newServicePrice}
              onChange={(e) => setNewServicePrice(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ padding: '12px 20px', fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}
          >
            <Plus size={18} />
            Hizmeti Ekle
          </button>
        </form>
      </div>

      {/* HİZMET VE FİYAT KARTLARI LİSTESİ */}
      <div className="glass-card">
        <div className="flex-between mb-4">
          <h3 style={{ fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={18} className="text-emerald" />
            <span>{activeCategory} Fiyat Listesi</span>
          </h3>

          {/* Hızlı Arama Kutusu */}
          <div style={{ position: 'relative', maxWidth: '240px', width: '100%' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="form-control"
              style={{ paddingLeft: '36px', paddingRight: '12px', paddingTop: '8px', paddingBottom: '8px', fontSize: '0.85rem' }}
              placeholder="Hizmet ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {categoryServices.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
            <p style={{ fontSize: '0.95rem', marginBottom: '8px' }}>Bu kategoriye ait hizmet bulunamadı.</p>
            <small>Yukarıdaki formu kullanarak hemen bir hizmet ve fiyat ekleyebilirsiniz.</small>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '14px' }}>
            {categoryServices.map(srv => {
              const isEditing = editingId === srv.id;

              return (
                <div
                  key={srv.id}
                  style={{
                    background: isEditing ? 'rgba(6, 182, 212, 0.08)' : 'rgba(255,255,255,0.03)',
                    border: '1px solid',
                    borderColor: isEditing ? 'var(--accent-cyan)' : 'rgba(255,255,255,0.08)',
                    borderRadius: '16px',
                    padding: '18px 16px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '12px',
                    transition: 'all 0.2s ease',
                    boxShadow: isEditing ? '0 4px 20px rgba(6, 182, 212, 0.2)' : 'none'
                  }}
                >
                  {isEditing ? (
                    /* DÜZENLEME MODU INPUTLARI */
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div>
                        <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '2px', display: 'block' }}>Hizmet Adı</label>
                        <input
                          type="text"
                          className="form-control"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          style={{ padding: '8px 10px', fontSize: '0.9rem' }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '2px', display: 'block' }}>Fiyat (₺)</label>
                        <input
                          type="number"
                          className="form-control"
                          value={editPrice}
                          onChange={(e) => setEditPrice(e.target.value)}
                          style={{ padding: '8px 10px', fontSize: '0.9rem' }}
                          autoFocus
                        />
                      </div>

                      <div className="flex-center gap-2 mt-2">
                        <button
                          type="button"
                          className="btn btn-emerald btn-sm"
                          style={{ flex: 1, padding: '8px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                          onClick={() => handleSaveEdit(srv.id)}
                        >
                          <Check size={14} /> Kaydet
                        </button>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '8px 12px', fontSize: '0.8rem' }}
                          onClick={() => setEditingId(null)}
                        >
                          <X size={14} /> İptal
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* NORMAL GÖRÜNÜM KARTI */
                    <>
                      <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                          {srv.vehicle_type || 'Binek'}
                        </div>
                        <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3 }}>
                          {srv.name}
                        </div>
                      </div>

                      <div className="flex-between" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '12px' }}>
                        <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>
                          ₺{Number(srv.price).toLocaleString('tr-TR')}
                        </div>

                        <div className="flex-center gap-1">
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleStartEdit(srv)}
                            style={{ padding: '6px 10px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent-cyan)' }}
                            title="Fiyatı Değiştir"
                          >
                            <Edit3 size={13} /> Düzenle
                          </button>
                          <button
                            type="button"
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDelete(srv)}
                            style={{ padding: '6px 8px' }}
                            title="Hizmeti Sil"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
