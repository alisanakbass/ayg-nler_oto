import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, 
  Sparkles, 
  CheckCircle2, 
  Car, 
  RefreshCw, 
  Zap, 
  PlusCircle, 
  Image as ImageIcon,
  Check,
  Key,
  Info
} from 'lucide-react';
import { 
  compressImage, 
  identifyVehicleFromImage, 
  getGeminiApiKey,
  setGeminiApiKey
} from '../services/vehicleRecognitionService';

const VEHICLE_CATEGORIES = ['Ticari / Minibüs', 'Binek', 'SUV / Arazi', 'Motosiklet'];

export function IncomeTab({ services = [], staffList = [], onAddIncome, onAddService }) {
  // Aktif Giriş Modu: 'quick_camera' (Varsayılan - Fotoğraflı Hızlı) veya 'classic_form' (Klasik Detaylı)
  const [entryMode, setEntryMode] = useState('quick_camera');

  // ==========================================
  // 1. FOTOĞRAFLI HIZLI KAYIT DURUMLARI (AI)
  // ==========================================
  const [photo, setPhoto] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [detectedCategory, setDetectedCategory] = useState('Ticari / Minibüs');
  const [detectedModel, setDetectedModel] = useState('Ford Tourneo Courier');
  const [detectedPlate, setDetectedPlate] = useState('');
  const [selectedQuickServiceIds, setSelectedQuickServiceIds] = useState([]);
  const [quickSuccess, setQuickSuccess] = useState('');
  
  // Gemini API Anahtarı Modal Durumu
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState(() => getGeminiApiKey());
  const [hasApiKey, setHasApiKey] = useState(() => Boolean(getGeminiApiKey()));

  const cameraInputRef = useRef(null);
  const fileInputRef = useRef(null);

  // ==========================================
  // 2. KLASİK FORM DURUMLARI
  // ==========================================
  const [plate, setPlate] = useState('');
  const [vehicleType, setVehicleType] = useState('Binek');
  const [activeChipCategory, setActiveChipCategory] = useState('Binek');
  const [serviceName, setServiceName] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentType, setPaymentType] = useState('Nakit');
  const [staffName, setStaffName] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [classicSuccessMessage, setClassicSuccessMessage] = useState('');
  const [selectedServiceIds, setSelectedServiceIds] = useState([]);

  // Klasik Form Ref'leri
  const plateInputRef = useRef(null);
  const vehicleTypeSelectRef = useRef(null);
  const serviceNameInputRef = useRef(null);
  const amountInputRef = useRef(null);
  const paymentSelectRef = useRef(null);
  const staffSelectRef = useRef(null);
  const dateInputRef = useRef(null);
  const noteInputRef = useRef(null);

  useEffect(() => {
    if (vehicleType) {
      setActiveChipCategory(vehicleType);
    }
  }, [vehicleType]);

  // ==========================================
  // FOTOĞRAF ÇEKME & AI ANALİZİ
  // ==========================================
  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // 1. Görseli optimize et ve sıkıştır (500px, süper hızlı)
      const compressed = await compressImage(file, 500, 0.75);
      setPhoto(compressed);
      setIsAnalyzing(true);

      // 2. Gemini 3.1 Flash-Lite ile doğrudan tespit
      const result = await identifyVehicleFromImage(compressed);
      if (result) {
        const cat = result.vehicleType || 'Ticari / Minibüs';
        const guess = result.modelGuess || 'Araç';
        setDetectedCategory(cat);
        setDetectedModel(guess);
        if (result.plate) {
          setDetectedPlate(result.plate);
        }

        // Kategoriye ait ilk hizmeti otomatik seç
        const matchingServices = services.filter(s => (s.vehicle_type || 'Binek') === cat);
        if (matchingServices.length > 0) {
          setSelectedQuickServiceIds([matchingServices[0].id]);
        }
      }
    } catch (err) {
      console.error('Fotoğraf işleme hatası:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleToggleQuickService = (serviceId) => {
    if (selectedQuickServiceIds.includes(serviceId)) {
      setSelectedQuickServiceIds(selectedQuickServiceIds.filter(id => id !== serviceId));
    } else {
      setSelectedQuickServiceIds([...selectedQuickServiceIds, serviceId]);
    }
  };

  const handleQuickCategoryChange = (cat) => {
    setDetectedCategory(cat);
    const catServices = services.filter(s => (s.vehicle_type || 'Binek') === cat);
    if (catServices.length > 0) {
      setSelectedQuickServiceIds([catServices[0].id]);
    } else {
      setSelectedQuickServiceIds([]);
    }
  };

  // Hızlı Hizmet Seçimlerinden Toplam Tutar ve İsim
  const selectedServicesList = services.filter(s => selectedQuickServiceIds.includes(s.id));
  const quickTotalAmount = selectedServicesList.reduce((acc, curr) => acc + Number(curr.price || 0), 0);
  const quickServiceName = selectedServicesList.map(s => s.name).join(' + ') || 'Yıkama';

  // ==========================================
  // HIZLI FOTOĞRAFLI KAYIT GÖNDERME (1 TIKLA)
  // ==========================================
  const handleQuickSubmit = async () => {
    const finalModel = detectedModel.trim() || 'Araç';

    if (selectedQuickServiceIds.length === 0) {
      alert('Lütfen bir yıkama türü seçiniz (İç Dış, Sadece Dış vb.).');
      return;
    }

    const newIncome = {
      plate: finalModel, // Açıklama ve Plaka alanına doğrudan Araç Modeli yazılır
      vehicle_model: finalModel,
      vehicle_type: detectedCategory,
      service_name: quickServiceName,
      amount: quickTotalAmount,
      payment_type: 'Nakit',
      staff_name: '',
      photo: '', // Fotoğraf veritabanına kaydedilmez
      note: 'Hızlı Yıkama',
      date: new Date().toISOString().split('T')[0]
    };

    await onAddIncome(newIncome);

    setQuickSuccess(`✨ ${finalModel} (${quickServiceName} - ₺${quickTotalAmount}) onaylandı!`);
    setTimeout(() => setQuickSuccess(''), 4000);

    // Formu temizle ve bir sonraki araca hazırla
    setPhoto(null);
    setSelectedQuickServiceIds([]);
  };

  const handleSaveApiKey = () => {
    setGeminiApiKey(apiKeyInput);
    setHasApiKey(Boolean(apiKeyInput.trim()));
    setShowKeyModal(false);
  };

  // ==========================================
  // KLASİK FORM İŞLEMLERİ
  // ==========================================
  const handleToggleClassicService = (service) => {
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

  const handleClassicSubmit = async (e) => {
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
      staff_name: staffName,
      note: note.trim(),
      date
    };

    await onAddIncome(newIncome);

    setPlate('');
    setServiceName('');
    setAmount('');
    setNote('');
    setSelectedServiceIds([]);
    setClassicSuccessMessage(`${plate.trim()} plakalı araç yıkama kaydı başarıyla eklendi!`);
    setTimeout(() => setClassicSuccessMessage(''), 4000);
    setTimeout(() => plateInputRef.current?.focus(), 100);
  };

  const classicFilteredServices = services.filter(s => {
    if (activeChipCategory === 'all') return true;
    return (s.vehicle_type || 'Binek') === activeChipCategory;
  });

  const quickCategoryServices = services.filter(s => (s.vehicle_type || 'Binek') === detectedCategory);

  return (
    <div style={{ maxWidth: '840px', margin: '0 auto' }}>
      {/* Üst Mod Geçiş Sekmeleri */}
      <div className="flex-between mb-4" style={{ flexWrap: 'wrap', gap: '8px' }}>
        <div className="flex-center gap-2" style={{ background: 'rgba(255,255,255,0.03)', padding: '6px', borderRadius: '16px', border: '1px solid var(--border-color)', flex: 1 }}>
          <button
            type="button"
            onClick={() => setEntryMode('quick_camera')}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '12px 16px',
              borderRadius: '12px',
              border: 'none',
              fontSize: '0.95rem',
              fontWeight: 700,
              cursor: 'pointer',
              background: entryMode === 'quick_camera' ? 'linear-gradient(135deg, var(--accent-cyan), var(--accent-blue))' : 'transparent',
              color: entryMode === 'quick_camera' ? '#fff' : 'var(--text-secondary)',
              boxShadow: entryMode === 'quick_camera' ? '0 4px 15px rgba(6, 182, 212, 0.3)' : 'none',
              transition: 'all 0.25s ease'
            }}
          >
            <Camera size={20} />
            <span>📸 Fotoğraflı Hızlı Kayıt (AI)</span>
          </button>

          <button
            type="button"
            onClick={() => setEntryMode('classic_form')}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '12px 16px',
              borderRadius: '12px',
              border: 'none',
              fontSize: '0.95rem',
              fontWeight: 600,
              cursor: 'pointer',
              background: entryMode === 'classic_form' ? 'rgba(255,255,255,0.1)' : 'transparent',
              color: entryMode === 'classic_form' ? '#fff' : 'var(--text-secondary)',
              transition: 'all 0.25s ease'
            }}
          >
            <PlusCircle size={18} />
            <span>⌨️ Klasik Form Girişi</span>
          </button>
        </div>

        {/* Gemini Vision API Anahtar Ayar Butonu */}
        <button
          type="button"
          onClick={() => setShowKeyModal(true)}
          className="btn btn-secondary btn-sm"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.8rem',
            padding: '10px 14px',
            borderRadius: '12px',
            borderColor: hasApiKey ? 'var(--accent-emerald)' : 'var(--border-color)',
            color: hasApiKey ? 'var(--accent-emerald)' : 'var(--text-secondary)'
          }}
          title="Google Gemini Vision API Ayarı"
        >
          <Key size={14} />
          <span>{hasApiKey ? '✨ Gemini AI Aktif' : '🔑 Gemini Key Ekle'}</span>
        </button>
      </div>

      {/* GEMINI API KEY MODALI */}
      {showKeyModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ maxWidth: '480px', width: '100%', background: 'var(--bg-secondary)', borderRadius: '18px', padding: '24px', border: '1px solid var(--border-color)', boxShadow: '0 20px 50px rgba(0,0,0,0.6)' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={20} className="text-cyan" />
              Google Gemini Vision Kurulumu
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: 1.5 }}>
              Fotoğraftaki <b>"Ford Tourneo Courier"</b> veya <b>"Fiat Doblo"</b> gibi model isimlerini ve amblemleri %100 doğrulukla tanıması için Google Gemini API anahtarınızı buraya girebilirsiniz.
            </p>
            <div className="form-group mb-3">
              <label className="form-label">Gemini API Key</label>
              <input
                type="password"
                className="form-control"
                placeholder="AIzaSy..."
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
              />
            </div>
            <div className="flex-between">
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)', textDecoration: 'underline' }}
              >
                Ücretsiz Key Al (Google AI Studio)
              </a>
              <div className="flex-center gap-2">
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowKeyModal(false)}>
                  Kapat
                </button>
                <button type="button" className="btn btn-emerald btn-sm" onClick={handleSaveApiKey}>
                  Kaydet
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 1. MOD: FOTOĞRAFLI HIZLI KAYIT (SADECE FOTOĞRAF + HİZMET + ONAYLA)     */}
      {/* ==================================================================== */}
      {entryMode === 'quick_camera' && (
        <div className="glass-card" style={{ border: '1px solid rgba(6, 182, 212, 0.25)' }}>
          <div className="flex-between mb-3">
            <div>
              <h2 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Zap size={24} className="text-cyan" />
                Hızlı Yıkama Kaydı
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Fotoğrafı çekin, araç otomatik tanınsın. Hizmeti seçip onaylayın!
              </p>
            </div>
            {quickSuccess && (
              <span className="pay-pill nakit" style={{ fontSize: '0.85rem' }}>Kaydedildi</span>
            )}
          </div>

          {/* Başarı Mesajı */}
          {quickSuccess && (
            <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid var(--accent-emerald)', padding: '14px', borderRadius: '12px', color: 'var(--accent-emerald)', fontSize: '0.95rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <CheckCircle2 size={22} />
              <b>{quickSuccess}</b>
            </div>
          )}

          {/* Gizli Dosya ve Kamera Inputları */}
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            style={{ display: 'none' }}
            onChange={handlePhotoUpload}
          />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handlePhotoUpload}
          />

          {/* ADIM 1: FOTOĞRAF ÇEKME VEYA ÖNİZLEME ALANI */}
          <div style={{ marginBottom: '20px' }}>
            {!photo ? (
              <div 
                style={{
                  border: '2px dashed rgba(6, 182, 212, 0.4)',
                  borderRadius: '16px',
                  padding: '36px 20px',
                  textAlign: 'center',
                  background: 'rgba(6, 182, 212, 0.03)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onClick={() => cameraInputRef.current?.click()}
              >
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(6, 182, 212, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: 'var(--accent-cyan)' }}>
                  <Camera size={32} />
                </div>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '6px' }}>Aracın Fotoğrafını Çekin</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                  Arkadan veya ön-çaprazdan çekmeniz modeli 1 saniyede tanır.
                </p>
                <div className="flex-center gap-3">
                  <button
                    type="button"
                    className="btn btn-primary"
                    style={{ padding: '12px 24px', fontSize: '0.95rem', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      cameraInputRef.current?.click();
                    }}
                  >
                    <Camera size={20} />
                    Kamerayı Aç (Fotoğraf Çek)
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ padding: '12px 18px', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                  >
                    <ImageIcon size={18} />
                    Galeriden Seç
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '16px', padding: '14px', border: '1px solid var(--border-color)', display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', width: '130px', height: '95px', borderRadius: '12px', overflow: 'hidden', flexShrink: 0, border: '1px solid var(--border-color)' }}>
                  <img src={photo} alt="Çekilen Araç" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  {isAnalyzing && (
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <RefreshCw size={24} className="text-cyan" style={{ animation: 'spin 1s linear infinite' }} />
                    </div>
                  )}
                </div>

                <div style={{ flex: 1, minWidth: '220px' }}>
                  {isAnalyzing ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-cyan)' }}>
                      <RefreshCw size={18} style={{ animation: 'spin 1s linear infinite' }} />
                      <span style={{ fontWeight: 600 }}>Araç Modeli Tanınıyor...</span>
                    </div>
                  ) : (
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-emerald)', padding: '2px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Check size={12} /> Tespit Edildi
                        </span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{detectedCategory}</span>
                      </div>
                      <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                        {detectedModel}
                      </div>
                    </div>
                  )}

                  <div className="flex-center gap-2 mt-2" style={{ justifyContent: 'flex-start' }}>
                    <button
                      type="button"
                      className="btn btn-sm btn-secondary"
                      onClick={() => cameraInputRef.current?.click()}
                      style={{ fontSize: '0.75rem', padding: '4px 10px' }}
                    >
                      <RefreshCw size={12} /> Tekrar Çek
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm btn-danger"
                      onClick={() => setPhoto(null)}
                      style={{ fontSize: '0.75rem', padding: '4px 10px' }}
                    >
                      Kaldır
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ARAÇ SINIFI SEÇİMİ (Gerekirse değiştirmek için 4 buton) */}
          <div style={{ marginBottom: '18px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '8px' }}>
              {VEHICLE_CATEGORIES.map(cat => {
                const isSelected = detectedCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => handleQuickCategoryChange(cat)}
                    style={{
                      padding: '10px 8px',
                      borderRadius: '12px',
                      border: '1px solid',
                      borderColor: isSelected ? 'var(--accent-cyan)' : 'rgba(255,255,255,0.08)',
                      background: isSelected ? 'rgba(6, 182, 212, 0.15)' : 'rgba(255,255,255,0.03)',
                      color: isSelected ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                      fontWeight: isSelected ? 700 : 500,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {cat === 'Ticari / Minibüs' && '🚐 Ticari'}
                    {cat === 'Binek' && '🚗 Binek'}
                    {cat === 'SUV / Arazi' && '🚙 SUV'}
                    {cat === 'Motosiklet' && '🛵 Motor'}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ADIM 2: HİZMETİ İŞARETLE (YIKAMA TÜRÜ SEÇİMİ) */}
          <div style={{ marginBottom: '22px' }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={16} className="text-emerald" />
                <span>Hizmeti İşaretleyin</span>
              </div>
              <span style={{ fontSize: '0.85rem', color: 'var(--accent-emerald)', fontWeight: 700 }}>
                {quickServiceName} — ₺{quickTotalAmount.toLocaleString('tr-TR')}
              </span>
            </label>

            {quickCategoryServices.length === 0 ? (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Bu araç sınıfı için henüz kayıtlı yıkama paketi yok.
              </p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '10px' }}>
                {quickCategoryServices.map(srv => {
                  const isSelected = selectedQuickServiceIds.includes(srv.id);
                  return (
                    <div
                      key={srv.id}
                      onClick={() => handleToggleQuickService(srv.id)}
                      style={{
                        padding: '16px 14px',
                        borderRadius: '14px',
                        border: '2px solid',
                        borderColor: isSelected ? 'var(--accent-emerald)' : 'rgba(255,255,255,0.08)',
                        background: isSelected ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255,255,255,0.02)',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        position: 'relative'
                      }}
                    >
                      {isSelected && (
                        <div style={{ position: 'absolute', top: '10px', right: '10px', width: '20px', height: '20px', borderRadius: '50%', background: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000' }}>
                          <Check size={13} strokeWidth={3} />
                        </div>
                      )}
                      <div style={{ fontSize: '0.95rem', fontWeight: 700, color: isSelected ? '#fff' : 'var(--text-primary)', marginBottom: '4px' }}>
                        {srv.name}
                      </div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>
                        ₺{Number(srv.price).toLocaleString('tr-TR')}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ADIM 3: GÖNDER / ONAYLA (1 TIKLA) */}
          <button
            type="button"
            className="btn btn-emerald btn-full"
            onClick={handleQuickSubmit}
            style={{
              padding: '18px',
              fontSize: '1.15rem',
              fontWeight: 800,
              boxShadow: '0 6px 20px rgba(16, 185, 129, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px'
            }}
          >
            <Zap size={22} />
            <span>🚀 Kaydı Onayla (₺{quickTotalAmount.toLocaleString('tr-TR')})</span>
          </button>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 2. MOD: KLASİK FORM GİRİŞİ (MEVCUT PLAKA & MANUEL FORM)               */}
      {/* ==================================================================== */}
      {entryMode === 'classic_form' && (
        <div className="glass-card">
          <div className="flex-between mb-4">
            <h2 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <PlusCircle size={24} className="text-emerald" />
              Klasik Plakalı Yıkama & Gelir Girişi
            </h2>
            {plate && (
              <div className="plate-badge" style={{ fontSize: '1.1rem' }}>
                {plate}
              </div>
            )}
          </div>

          {classicSuccessMessage && (
            <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid var(--accent-emerald)', padding: '14px', borderRadius: '10px', color: 'var(--accent-emerald)', fontSize: '0.9rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={20} />
              {classicSuccessMessage}
            </div>
          )}

          <form onSubmit={handleClassicSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">1. Araç Plakası (ENTER ↵)</label>
                <input
                  ref={plateInputRef}
                  type="text"
                  className="form-control"
                  placeholder="Örn: 34 ABC 123"
                  value={plate}
                  onChange={(e) => setPlate(e.target.value.toUpperCase().replace(/\s+/g, ' '))}
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
                  onChange={(e) => {
                    setVehicleType(e.target.value);
                    setActiveChipCategory(e.target.value);
                  }}
                >
                  <option value="Binek">🚗 Binek Otomobil</option>
                  <option value="SUV / Arazi">🚙 SUV / Arazi / Jeep</option>
                  <option value="Ticari / Minibüs">🚐 Ticari / Minibüs / Vito</option>
                  <option value="Motosiklet">🛵 Motosiklet</option>
                </select>
              </div>
            </div>

            <div className="form-group mb-4" style={{ background: 'rgba(0,0,0,0.15)', padding: '16px', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
              <div className="flex-between mb-3" style={{ flexWrap: 'wrap', gap: '8px' }}>
                <label className="form-label" style={{ marginBottom: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Car size={18} className="text-cyan" />
                  <span>3. Hızlı Hizmet Seçimi</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)' }}>(Çoklu Seçilebilir)</span>
                </label>
              </div>

              <div className="chip-grid">
                {classicFilteredServices.map((srv) => {
                  const isSelected = selectedServiceIds.includes(srv.id);
                  return (
                    <div
                      key={srv.id}
                      className={`chip-item ${isSelected ? 'selected' : ''}`}
                      onClick={() => handleToggleClassicService(srv)}
                    >
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{srv.vehicle_type || 'Binek'}</span>
                      <span>{srv.name}</span>
                      <span className="chip-price">₺{srv.price}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">4. Hizmet Tanımı</label>
                <input
                  ref={serviceNameInputRef}
                  type="text"
                  className="form-control"
                  placeholder="İç-Dış Yıkama, Pasta Cila..."
                  value={serviceName}
                  onChange={(e) => setServiceName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">5. Toplam Tutar (TL) *</label>
                <input
                  ref={amountInputRef}
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
                <label className="form-label">6. Ödeme Yöntemi</label>
                <select
                  ref={paymentSelectRef}
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
                <label className="form-label">7. Yıkamayı Yapan Personel</label>
                <select
                  ref={staffSelectRef}
                  className="form-control"
                  value={staffName}
                  onChange={(e) => setStaffName(e.target.value)}
                >
                  <option value="">-- Personel Seçin (Opsiyonel) --</option>
                  {staffList.map(stf => (
                    <option key={stf.id} value={stf.name}>{stf.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">8. İşlem Tarihi</label>
                <input
                  ref={dateInputRef}
                  type="date"
                  className="form-control"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">9. Not / Açıklama</label>
                <input
                  ref={noteInputRef}
                  type="text"
                  className="form-control"
                  placeholder="Ekstra istekler..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>
            </div>

            <button type="submit" className="btn btn-emerald btn-full mt-4" style={{ padding: '16px', fontSize: '1.05rem' }}>
              <Sparkles size={20} />
              Klasik Formu Kaydet (ENTER ↵)
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
