
import { LPBData, WOKontrakData } from '../types';

const CACHE_NAME = 'lpb_supabase_cache_v1';
const SUPABASE_CONFIG_KEY = 'lpb_supabase_config';

interface SupabaseConfig {
  url: string;
  key: string;
}

const DEFAULT_CONFIG: SupabaseConfig = {
  url: 'https://kviehdnagrqctbhwnbcv.supabase.co',
  key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2aWVoZG5hZ3JxY3RiaHduYmN2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDkxMjE5MCwiZXhwIjoyMDg2NDg4MTkwfQ.eA0bItQHgGAeo9UqJmzpt8nwRf4dns2lx9DWiKzT2tI'
};

export function getSupabaseConfig(): SupabaseConfig {
  const saved = localStorage.getItem(SUPABASE_CONFIG_KEY);
  return saved ? JSON.parse(saved) : DEFAULT_CONFIG;
}

export function setSupabaseConfig(config: SupabaseConfig) {
  localStorage.setItem(SUPABASE_CONFIG_KEY, JSON.stringify(config));
}

export async function clearSupabaseCache() {
  try {
    const cache = await caches.open(CACHE_NAME);
    const keys = await cache.keys();
    for (const key of keys) {
      await cache.delete(key);
    }
    return true;
  } catch (e) {
    return false;
  }
}

function formatIDPEL(val: any): string {
  if (val === undefined || val === null) return '';
  let str = String(val).trim();
  if (str.toUpperCase().includes('E+')) {
    try {
      const num = Number(str.replace(',', '.'));
      if (!isNaN(num)) return BigInt(Math.round(num)).toString();
    } catch (e) { return str; }
  }
  return str;
}

function getValue(item: any, key: string): any {
  if (!item) return undefined;
  if (item[key] !== undefined && item[key] !== null && item[key] !== '') return item[key];
  const upperKey = key.toUpperCase();
  if (item[upperKey] !== undefined && item[upperKey] !== null && item[upperKey] !== '') return item[upperKey];
  const underscoreKey = key.replace(/\s+/g, '_');
  if (item[underscoreKey] !== undefined && item[underscoreKey] !== null && item[underscoreKey] !== '') return item[underscoreKey];
  const foundKey = Object.keys(item).find(k => 
    k.toLowerCase() === key.toLowerCase() || 
    k.toLowerCase().replace(/\s+/g, '_') === key.toLowerCase().replace(/\s+/g, '_')
  );
  return (foundKey && item[foundKey] !== null) ? item[foundKey] : undefined;
}

function parseNumber(val: any): number {
  if (val === undefined || val === null || val === '') return 0;
  if (typeof val === 'number') return val;
  const n = parseFloat(String(val).replace(',', '.'));
  return isNaN(n) ? 0 : n;
}

function formatSupabaseData(item: any): LPBData {
  const rawDaya = getValue(item, 'daya');
  const rawPowerLimit = getValue(item, 'power_limit');
  const finalDaya = rawDaya || rawPowerLimit || '0';

  return {
    UNIT: getValue(item, 'unit') || '-',
    IDPEL: formatIDPEL(getValue(item, 'idpel')),
    NAMA: getValue(item, 'nama') || 'TANPA NAMA',
    ALAMAT: getValue(item, 'alamat') || '',
    BLTH: getValue(item, 'blth') || '',
    VALIDASI: getValue(item, 'validasi') || 'BELUM VALIDASI',
    PETUGAS: getValue(item, 'petugas') || '-',
    USER: getValue(item, 'user') || '',
    TANGGAL: getValue(item, 'tgl') || getValue(item, 'tanggal') || '',
    created_at: getValue(item, 'created_at') || '',
    TEGANGAN: getValue(item, 'tegangan') || '0',
    ARUS: getValue(item, 'arus') || '0',
    COSPHI: getValue(item, 'cosphi') || '0',
    INDIKATOR: getValue(item, 'indikator') || 'NORMAL',
    TEMPER: getValue(item, 'temper') || '0',
    KETERANGAN: getValue(item, 'catatan') || '',
    WAKTU_JAM: getValue(item, 'waktu_jam') || '',
    "NO METER": getValue(item, 'no_meter') || '',
    TARIF: getValue(item, 'tarif') || '',
    DAYA: String(finalDaya), 
    "KODE RBM": getValue(item, 'kode_rbm') || '',
    "TARIF INDEX": getValue(item, 'tarif_index') || '',
    "POWER LIMIT": String(rawPowerLimit || finalDaya),
    "KWH KUMULATIF": getValue(item, 'kwh_kumulatif') || '',
    "SISA KWH": getValue(item, 'sisa_kwh') || '',
    "TUTUP METER": getValue(item, 'tutup_meter') || '',
    SEGEL: getValue(item, 'segel') || '',
    LCD: getValue(item, 'lcd') || '',
    KEYPAD: getValue(item, 'keypad') || '',
    "JML TERMINAL": getValue(item, 'jml_terminal') || '',
    INDI_TEMPER: getValue(item, 'indi_temper') || '',
    RELAY: getValue(item, 'relay') || '',
    LATITUDE: parseNumber(getValue(item, 'latitude')),
    LONGITUDE: parseNumber(getValue(item, 'longitude')),
    TOTALLEMBAR: parseNumber(getValue(item, 'totallembar')),
    TOTALRUPIAH: parseNumber(getValue(item, 'totalrupiah')),
    LUNAS_MANDIRI: parseNumber(getValue(item, 'lunas_mandiri')),
    LUNAS_OFFLINE: parseNumber(getValue(item, 'lunas_offline')),
    JANJI_BAYAR: parseNumber(getValue(item, 'janji_bayar')),
    TOTAL: parseNumber(getValue(item, 'total'))
  };
}

export async function fetchDataByBounds(tableName: string, bounds: { minLat: number, maxLat: number, minLng: number, maxLng: number }): Promise<LPBData[]> {
  const config = getSupabaseConfig();
  if (!config.url || !config.key) return [];
  if (isNaN(bounds.minLat) || isNaN(bounds.maxLat)) return [];
  const cleanUrl = config.url.replace(/\/$/, '');
  try {
    const params = new URLSearchParams();
    params.append('latitude', `gte.${bounds.minLat}`);
    params.append('latitude', `lte.${bounds.maxLat}`);
    params.append('longitude', `gte.${bounds.minLng}`);
    params.append('longitude', `lte.${bounds.maxLng}`);
    params.append('select', '*');
    const response = await fetch(`${cleanUrl}/rest/v1/${tableName}?${params.toString()}`, {
      headers: {
        'apikey': config.key.trim(),
        'Authorization': `Bearer ${config.key.trim()}`
      }
    });
    if (!response.ok) throw new Error(`Map Fetch Error ${response.status}`);
    const data = await response.json();
    return data.map(formatSupabaseData);
  } catch (error) {
    return [];
  }
}

export async function fetchTableDataFromSupabase<T = any>(tableName: string, forceRefresh = false): Promise<{data: T[], fromCache: boolean, timestamp: number, source: 'SUPABASE' | 'DISABLED'}> {
  const config = getSupabaseConfig();
  if (!config.url || !config.key) {
    return { data: [], fromCache: false, timestamp: Date.now(), source: 'DISABLED' };
  }

  const cleanUrl = config.url.replace(/\/$/, '');
  const cacheKey = `${cleanUrl}_${tableName}`;

  if (!forceRefresh) {
    try {
      const cache = await caches.open(CACHE_NAME);
      const cachedResponse = await cache.match(cacheKey);
      if (cachedResponse) {
        const data = await cachedResponse.json();
        return { data, fromCache: true, timestamp: Date.now(), source: 'SUPABASE' };
      }
    } catch (e) {}
  }

  try {
    let allData: any[] = [];
    let from = 0;
    const step = 1000; 
    let hasMore = true;

    while (hasMore) {
      const response = await fetch(`${cleanUrl}/rest/v1/${tableName}?select=*`, {
        headers: {
          'apikey': config.key.trim(),
          'Authorization': `Bearer ${config.key.trim()}`,
          'Range': `${from}-${from + step - 1}`
        }
      });
      
      if (!response.ok) {
        const errTxt = await response.text();
        throw new Error(`Supabase Fetch Error ${response.status}: ${errTxt}`);
      }
      
      const chunk = await response.json();
      
      if (!chunk || chunk.length === 0) {
        hasMore = false;
      } else {
        allData = allData.concat(chunk);
        if (chunk.length < step) {
          hasMore = false;
        } else {
          from += step;
        }
      }
      if (from > 1000000) break;
    }

    // Special formatting for known data tables, otherwise return raw
    let formatted: any[] = allData;
    if (tableName === 'lpb_data' || tableName === 'invoice_data') {
       formatted = allData.map(formatSupabaseData);
    }
    
    if (formatted.length > 0) {
      const cache = await caches.open(CACHE_NAME);
      await cache.put(cacheKey, new Response(JSON.stringify(formatted)));
    }
    return { data: formatted as T[], fromCache: false, timestamp: Date.now(), source: 'SUPABASE' };
  } catch (error: any) {
    console.error(`Supabase fetch error for '${tableName}':`, error.message);
    return { data: [], fromCache: false, timestamp: Date.now(), source: 'DISABLED' };
  }
}

export async function fetchLPBDataFromSupabase(forceRefresh = false) {
  return fetchTableDataFromSupabase('lpb_data', forceRefresh);
}

export async function testSupabaseConnection(): Promise<{success: boolean, message: string}> {
  const config = getSupabaseConfig();
  if (!config.url || !config.key) return { success: false, message: 'Config Missing' };
  try {
    const response = await fetch(`${config.url.replace(/\/$/, '')}/rest/v1/`, {
      headers: { 'apikey': config.key.trim(), 'Authorization': `Bearer ${config.key.trim()}` }
    });
    return { success: response.ok, message: response.ok ? 'Supabase Online' : `Error ${response.status}` };
  } catch (err) { return { success: false, message: 'Supabase Offline' }; }
}

export async function uploadToSupabase(data: any[], tableName: string = 'lpb_data'): Promise<{success: boolean, message: string}> {
  const config = getSupabaseConfig();
  if (!config.url || !config.key) return { success: false, message: 'Config Missing' };
  try {
    const response = await fetch(`${config.url.replace(/\/$/, '')}/rest/v1/${tableName}`, {
      method: 'POST',
      headers: {
        'apikey': config.key.trim(),
        'Authorization': `Bearer ${config.key.trim()}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText);
    }
    
    return { success: true, message: 'Berhasil diunggah ke Supabase.' };
  } catch (error: any) { 
    return { success: false, message: error.message }; 
  }
}
