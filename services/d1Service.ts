
import { LPBData } from '../types';
import { fetchLPBData as fetchFromSheets } from './sheetService';

const CACHE_NAME = 'lpb_d1_cache_v5';
const API_URL_STORAGE_KEY = 'lpb_custom_api_url';

export function getApiUrl(): string {
  return localStorage.getItem(API_URL_STORAGE_KEY) || 'https://lpb-api-worker.username.workers.dev';
}

export function setApiUrl(url: string) {
  let cleanUrl = url.trim();
  if (cleanUrl && !cleanUrl.startsWith('http')) {
    cleanUrl = 'https://' + cleanUrl;
  }
  if (cleanUrl.endsWith('/')) {
    cleanUrl = cleanUrl.slice(0, -1);
  }
  localStorage.setItem(API_URL_STORAGE_KEY, cleanUrl);
}

export async function testConnection(): Promise<{success: boolean, message: string}> {
  const url = getApiUrl();
  if (url.includes('username.workers.dev')) {
    return { success: false, message: 'URL masih menggunakan placeholder. Ganti di Settings.' };
  }

  try {
    const response = await fetch(`${url}?test=${Date.now()}`, { 
      method: 'GET',
      mode: 'cors',
      headers: { 
        'Accept': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      const count = Array.isArray(data) ? data.length : 0;
      return { success: true, message: `Koneksi Berhasil! Terdeteksi ${count} data di database.` };
    }
    return { success: false, message: `Error Server (HTTP ${response.status})` };
  } catch (err: any) {
    console.error('[D1 Test Error]:', err);
    return { 
      success: false, 
      message: 'Failed to fetch: Browser tidak bisa menjangkau Worker. Cek CORS, URL https://, atau status Deploy di Cloudflare.' 
    };
  }
}

export async function fetchLPBDataFromD1(forceRefresh = false): Promise<{data: LPBData[], fromCache: boolean, timestamp: number}> {
  const currentUrl = getApiUrl();
  
  if (currentUrl.includes('username.workers.dev')) {
    return fetchFromSheets(forceRefresh);
  }

  try {
    if (!forceRefresh) {
      const cache = await caches.open(CACHE_NAME);
      const cachedResponse = await cache.match(currentUrl);
      if (cachedResponse) {
        const data = await cachedResponse.json();
        if (Array.isArray(data) && data.length > 0) {
          return { data, fromCache: true, timestamp: Date.now() };
        }
      }
    }

    const response = await fetch(`${currentUrl}?_cb=${Date.now()}`, {
      mode: 'cors',
      headers: { 
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const rawData = await response.json();
    if (!Array.isArray(rawData)) {
      if (rawData?.error) throw new Error(rawData.error);
      return { data: [], fromCache: false, timestamp: Date.now() };
    }
    
    const formattedData = rawData.map((item: any) => ({
      UNIT: item.unit || '-',
      IDPEL: String(item.idpel || ''),
      NAMA: item.nama || 'TANPA NAMA',
      ALAMAT: item.alamat || '',
      BLTH: item.blth || '',
      VALIDASI: item.validasi || 'BELUM VALIDASI',
      PETUGAS: item.petugas || '-',
      TEGANGAN: item.tegangan || '0',
      ARUS: item.arus || '0',
      COSPHI: item.cosphi || '0',
      INDIKATOR: item.indikator || 'NORMAL',
      TEMPER: item.temper || '0',
      CATATAN: item.catatan || '',
      WAKTU_JAM: item.waktu_jam || '',
      "NO METER": item.no_meter || '',
      TARIF: item.tarif || '',
      DAYA: item.daya || '',
      "KODE RBM": item.kode_rbm || '',
      "TARIF INDEX": item.tarif_index || '',
      "POWER LIMIT": item.power_limit || '',
      "KWH KUMULATIF": item.kwh_kumulatif || '',
      "SISA KWH": item.sisa_kwh || '',
      "TUTUP METER": item.tutup_meter || '',
      SEGEL: item.segel || '',
      LCD: item.lcd || '',
      KEYPAD: item.keypad || '',
      "JML TERMINAL": item.jml_terminal || '',
      INDI_TEMPER: item.indi_temper || '',
      RELAY: item.relay || '',
      LATITUDE: parseFloat(item.latitude || 0),
      LONGITUDE: parseFloat(item.longitude || 0)
    }));

    const cache = await caches.open(CACHE_NAME);
    await cache.put(currentUrl, new Response(JSON.stringify(formattedData)));

    return { data: formattedData, fromCache: false, timestamp: Date.now() };
  } catch (error: any) {
    console.error('[D1 Fetch Error]:', error);
    if (error.message === 'Failed to fetch') {
      // Jika fetch gagal, coba bersihkan cache agar tidak stuck di error
      if ('caches' in window) await caches.delete(CACHE_NAME);
    }
    return fetchFromSheets(forceRefresh);
  }
}

export async function uploadLPBData(data: any[]): Promise<{success: boolean, message: string}> {
  const currentUrl = getApiUrl();
  
  try {
    const response = await fetch(currentUrl, {
      method: 'POST',
      mode: 'cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'UPLOAD_BULK', payload: data })
    });

    if (!response.ok) {
      const result = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
      throw new Error(result.error || `Server error: HTTP ${response.status}`);
    }

    const result = await response.json();
    
    if ('caches' in window) {
      await caches.delete(CACHE_NAME);
    }
    
    return { 
      success: true, 
      message: `Berhasil! ${data.length} data telah diperbarui di Cloudflare D1.` 
    };
  } catch (error: any) {
    console.error('[D1 Upload Error]:', error);
    if (error.message === 'Failed to fetch') {
      return { 
        success: false, 
        message: 'Koneksi Ditolak (Failed to fetch). Pastikan Worker Anda memiliki kode CORS terbaru (v3) dan sudah di-Deploy di Cloudflare.' 
      };
    }
    return { success: false, message: error.message || 'Gagal sinkronisasi data.' };
  }
}
