import { supabase, isSupabaseConfigured } from '../lib/supabase';

// LocalStorage varsayılan veriler (Supabase henüz baglanmadiysa kullanılacak)
const INITIAL_SERVICES = [
  { id: '1', name: 'İç - Dış Yıkama', vehicle_type: 'Binek', price: 300 },
  { id: '2', name: 'İç - Dış Yıkama', vehicle_type: 'SUV / Arazi', price: 400 },
  { id: '3', name: 'İç - Dış Yıkama', vehicle_type: 'Ticari / Minibüs', price: 500 },
  { id: '4', name: 'Detaylı İç Temizlik', vehicle_type: 'Binek', price: 2500 },
  { id: '5', name: 'Pasta Cila & Boya Koruma', vehicle_type: 'Binek', price: 4000 },
  { id: '6', name: 'Seramik Kaplama', vehicle_type: 'Binek', price: 8000 },
  { id: '7', name: 'Motor Yıkama & Bakım', vehicle_type: 'Binek', price: 600 },
  { id: '8', name: 'Koltuk Yıkama & Leke Çıkarma', vehicle_type: 'Binek', price: 1500 }
];

const INITIAL_STAFF = [
  { id: '1', name: 'Ahmet Usta', phone: '0555 111 22 33', commission_rate: 10 },
  { id: '2', name: 'Mehmet Eleman', phone: '0555 222 33 44', commission_rate: 10 }
];

const getLocal = (key, defaultVal) => {
  const saved = localStorage.getItem(key);
  if (!saved) {
    localStorage.setItem(key, JSON.stringify(defaultVal));
    return defaultVal;
  }
  try {
    return JSON.parse(saved);
  } catch (e) {
    return defaultVal;
  }
};

const setLocal = (key, val) => {
  localStorage.setItem(key, JSON.stringify(val));
};

// In-memory cache for ultra-fast tab switches
let serviceCache = null;
let staffCache = null;

export const dataService = {
  // Hizmetler (Services)
  async getServices() {
    if (serviceCache) return serviceCache;
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('services').select('*').order('price', { ascending: true });
      if (!error && data) {
        serviceCache = data;
        setLocal('aygun_services', data);
        return data;
      }
    }
    const localData = getLocal('aygun_services', INITIAL_SERVICES);
    serviceCache = localData;
    return localData;
  },

  async addService(service) {
    serviceCache = null; // Invalidate cache
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('services').insert([service]).select();
      if (!error && data) return data[0];
    }
    const current = getLocal('aygun_services', INITIAL_SERVICES);
    const newItem = { ...service, id: Date.now().toString(), created_at: new Date().toISOString() };
    const updated = [...current, newItem];
    setLocal('aygun_services', updated);
    return newItem;
  },

  async deleteService(id) {
    serviceCache = null; // Invalidate cache
    if (isSupabaseConfigured) {
      await supabase.from('services').delete().eq('id', id);
      return true;
    }
    const current = getLocal('aygun_services', INITIAL_SERVICES);
    const updated = current.filter(item => item.id !== id);
    setLocal('aygun_services', updated);
    return true;
  },

  // Gelirler (Incomes / Sales)
  async getIncomes() {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('incomes').select('*').order('date', { ascending: false });
      if (!error && data) return data;
    }
    return getLocal('aygun_incomes', []);
  },

  async addIncome(income) {
    const formattedIncome = {
      ...income,
      amount: Number(income.amount),
      date: income.date || new Date().toISOString().split('T')[0]
    };

    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('incomes').insert([formattedIncome]).select();
      if (!error && data) return data[0];
    }
    const current = getLocal('aygun_incomes', []);
    const newItem = { ...formattedIncome, id: Date.now().toString(), created_at: new Date().toISOString() };
    const updated = [newItem, ...current];
    setLocal('aygun_incomes', updated);
    return newItem;
  },

  async deleteIncome(id) {
    if (isSupabaseConfigured) {
      await supabase.from('incomes').delete().eq('id', id);
      return true;
    }
    const current = getLocal('aygun_incomes', []);
    const updated = current.filter(item => item.id !== id);
    setLocal('aygun_incomes', updated);
    return true;
  },

  // Giderler (Expenses)
  async getExpenses() {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('expenses').select('*').order('date', { ascending: false });
      if (!error && data) return data;
    }
    return getLocal('aygun_expenses', []);
  },

  async addExpense(expense) {
    const formattedExpense = {
      ...expense,
      amount: Number(expense.amount),
      date: expense.date || new Date().toISOString().split('T')[0]
    };

    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('expenses').insert([formattedExpense]).select();
      if (!error && data) return data[0];
    }
    const current = getLocal('aygun_expenses', []);
    const newItem = { ...formattedExpense, id: Date.now().toString(), created_at: new Date().toISOString() };
    const updated = [newItem, ...current];
    setLocal('aygun_expenses', updated);
    return newItem;
  },

  async deleteExpense(id) {
    if (isSupabaseConfigured) {
      await supabase.from('expenses').delete().eq('id', id);
      return true;
    }
    const current = getLocal('aygun_expenses', []);
    const updated = current.filter(item => item.id !== id);
    setLocal('aygun_expenses', updated);
    return true;
  },

  // Personel (Staff)
  async getStaff() {
    if (staffCache) return staffCache;
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('staff').select('*').order('name', { ascending: true });
      if (!error && data) {
        staffCache = data;
        setLocal('aygun_staff', data);
        return data;
      }
    }
    const localData = getLocal('aygun_staff', INITIAL_STAFF);
    staffCache = localData;
    return localData;
  },

  async addStaff(person) {
    staffCache = null; // Invalidate cache
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('staff').insert([person]).select();
      if (!error && data) return data[0];
    }
    const current = getLocal('aygun_staff', INITIAL_STAFF);
    const newItem = { ...person, id: Date.now().toString(), created_at: new Date().toISOString() };
    const updated = [...current, newItem];
    setLocal('aygun_staff', updated);
    return newItem;
  },

  async deleteStaff(id) {
    staffCache = null; // Invalidate cache
    if (isSupabaseConfigured) {
      await supabase.from('staff').delete().eq('id', id);
      return true;
    }
    const current = getLocal('aygun_staff', INITIAL_STAFF);
    const updated = current.filter(item => item.id !== id);
    setLocal('aygun_staff', updated);
    return true;
  }
};
