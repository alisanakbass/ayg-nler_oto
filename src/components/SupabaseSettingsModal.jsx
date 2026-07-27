import React, { useState } from 'react';
import { Database, Key, Copy, Check, ExternalLink, Globe, Sparkles } from 'lucide-react';
import { isSupabaseConfigured } from '../lib/supabase';

export function SupabaseSettingsModal({ onClose }) {
  const [copied, setCopied] = useState(false);

  const sqlScript = `-- Supabase Paneli -> SQL Editor sayfasına yapıştırıp çalıştırın:
CREATE TABLE IF NOT EXISTS public.services (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    vehicle_type TEXT DEFAULT 'Binek',
    price NUMERIC(10,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.incomes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    plate TEXT NOT NULL,
    vehicle_type TEXT DEFAULT 'Binek',
    service_name TEXT NOT NULL,
    amount NUMERIC(10,2) NOT NULL DEFAULT 0,
    payment_type TEXT NOT NULL DEFAULT 'Nakit',
    staff_name TEXT DEFAULT '',
    note TEXT DEFAULT '',
    date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.expenses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'Diğer',
    amount NUMERIC(10,2) NOT NULL DEFAULT 0,
    payment_type TEXT NOT NULL DEFAULT 'Nakit',
    note TEXT DEFAULT '',
    date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public Read Write Services" ON public.services FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Read Write Incomes" ON public.incomes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Read Write Expenses" ON public.expenses FOR ALL USING (true) WITH CHECK (true);`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(sqlScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="glass-card mb-4">
      <div className="flex-between mb-4">
        <h2 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Database size={22} className="text-cyan" />
          Supabase Veritabanı & Netlify Kurulum Rehberi
        </h2>
        <button className="btn btn-secondary btn-sm" onClick={onClose}>Kapat</button>
      </div>

      {/* Current Status Box */}
      <div className={`status-badge ${isSupabaseConfigured ? 'supabase' : 'local'}`} style={{ padding: '12px 16px', fontSize: '0.9rem', width: '100%', justifyContent: 'flex-start', marginBottom: '20px' }}>
        <Sparkles size={18} />
        {isSupabaseConfigured
          ? 'Tebrikler! Supabase canlı veritabanı aktif ve verileriniz bulutta saklanıyor.'
          : 'Şu an Demo / Yerel Moddasınız. Verileriniz bu cihazın hafızasında saklanır. Supabase bağlayarak tüm cihazlarınızda eşitleyebilirsiniz.'
        }
      </div>

      <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Step 1: Supabase Setup */}
        <div>
          <h3 style={{ fontSize: '1rem', color: 'var(--accent-cyan)', marginBottom: '10px' }}>
            1. Supabase Bağlantısı Nasıl Yapılır?
          </h3>
          <ol style={{ paddingLeft: '20px', fontSize: '0.875rem', lineHeight: '1.7', color: 'var(--text-secondary)' }}>
            <li><a href="https://supabase.com" target="_blank" rel="noreferrer" style={{ color: 'var(--accent-blue)' }}>Supabase.com</a> adresinde ücretsiz hesap açın ve yeni bir proje oluşturun.</li>
            <li>Proje ayarlarından (Project Settings -&gt; API) <b>URL</b> ve <b>anon public key</b> değerlerini alın.</li>
            <li>Projenizdeki <b>.env</b> dosyasına veya Netlify Çevre Değişkenlerine (Environment Variables) bu iki değeri ekleyin:</li>
          </ol>

          <pre style={{ background: '#070a14', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.8rem', color: '#10b981', margin: '12px 0', overflowX: 'auto' }}>
            <code>{`VITE_SUPABASE_URL=https://proje-id.supabase.co\nVITE_SUPABASE_ANON_KEY=eyJhbGciOi...`}</code>
          </pre>

          <h3 style={{ fontSize: '1rem', color: 'var(--accent-cyan)', marginTop: '20px', marginBottom: '10px' }}>
            2. Netlify'da Ücretsiz Yayınlama
          </h3>
          <ol style={{ paddingLeft: '20px', fontSize: '0.875rem', lineHeight: '1.7', color: 'var(--text-secondary)' }}>
            <li>Proje klasörünüzü GitHub'a yükleyin veya Netlify CLI / Drag & Drop ile yükleyin.</li>
            <li>Netlify Site Settings -&gt; Environment Variables kısmına <code>VITE_SUPABASE_URL</code> ve <code>VITE_SUPABASE_ANON_KEY</code> ekleyin.</li>
            <li>Proje içinde hazırladığımız <b>netlify.toml</b> dosyası sayesinde yönlendirmeler otomatik çalışır.</li>
          </ol>
        </div>

        {/* Step 2: SQL Script */}
        <div>
          <div className="flex-between mb-2">
            <h3 style={{ fontSize: '1rem', color: 'var(--accent-emerald)' }}>
              Supabase SQL Tablo Kodu
            </h3>
            <button className="btn btn-secondary btn-sm" onClick={copyToClipboard}>
              {copied ? <Check size={14} className="text-emerald" /> : <Copy size={14} />}
              {copied ? 'Kopyalandı!' : 'Kopyala'}
            </button>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
            Supabase sol menüsündeki SQL Editor sayfasına bu kodu yapıştırıp "Run"a basın:
          </p>

          <pre style={{ background: '#070a14', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.75rem', color: '#94a3b8', maxHeight: '280px', overflowY: 'auto' }}>
            <code>{sqlScript}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}
