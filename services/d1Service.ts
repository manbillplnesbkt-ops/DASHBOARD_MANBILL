
import { LPBData } from '../types';
import { fetchLPBData as fetchFromSheets } from './sheetService';

const CACHE_NAME = 'lpb_d1_cache_v126k_final';
const API_URL_STORAGE_KEY = 'lpb_api_url_config';
const DEFAULT_URL = 'https://lpb-api-worker.manbill-plnesbkt.workers.dev/';

const D1_WORKER_CODE = `
  self.onmessage = async (e) => {
    const { url, timeout } = e.data;
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, { 
        signal: controller.signal,
        headers: { 'Accept': 'application/json' }
      });
      clearTimeout(id);

      if (!response.ok) throw new Error("Worker Error: HTTP " + response.status);
      
      const rawData = await response.json();
      if (!Array.isArray(rawData)) throw new Error("Format database D1 tidak valid");

      const totalLen = rawData.length;
      const formatted = new Array(totalLen);
      
      // Proses pemetaan data secara efisien
      for (let i = 0; i < totalLen; i++) {
        const item = rawData[i];
        formatted[i] = {
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
        };
      }

      self.postMessage({ success: true, data: formatted });
    } catch (error) {
      clearTimeout(id);
      self.postMessage({ success: false, error: error.message });
    }
  };
`;

let d1Worker: Worker | null = null;
function getD1Worker(): Worker {
  if (!d1Worker) {
    const blob = new Blob([D1_WORKER_CODE], { type: 'application/javascript' });
    d1Worker = new Worker(URL.createObjectURL(blob));
  }
  return d1Worker;
}

export function getApiUrl(): string {
  return localStorage.getItem(API_URL_STORAGE_KEY) || DEFAULT_URL;
}

export function setApiUrl(url: string) {
  let cleanUrl = url.trim();
  if (cleanUrl.endsWith('/')) cleanUrl = cleanUrl.slice(0, -1);
  localStorage.setItem(API_URL_STORAGE_KEY, cleanUrl);
}

export async function fetchLPBDataFromD1(forceRefresh = false): Promise<{data: LPBData[], fromCache: boolean, timestamp: number, source: 'D1' | 'SHEETS'}> {
  const currentUrl = getApiUrl();
  
  if (!forceRefresh) {
    try {
      const cache = await caches.open(CACHE_NAME);
      const cachedResponse = await cache.match(currentUrl);
      if (cachedResponse) {
        const data = await cachedResponse.json();
        return { data, fromCache: true, timestamp: Date.now(), source: 'D1' };
      }
    } catch (e) {}
  }

  return new Promise((resolve) => {
    const worker = getD1Worker();
    const onMessage = async (e: MessageEvent) => {
      worker.removeEventListener('message', onMessage);
      if (e.data.success) {
        // Cache data untuk akses offline/cepat di masa depan
        const cache = await caches.open(CACHE_NAME);
        await cache.put(currentUrl, new Response(JSON.stringify(e.data.data)));
        resolve({ data: e.data.data, fromCache: false, timestamp: Date.now(), source: 'D1' });
      } else {
        // Fallback ke Google Sheets jika D1 gagal
        const sheetResult = await fetchFromSheets(forceRefresh);
        resolve({ ...sheetResult, source: 'SHEETS' });
      }
    };
    worker.addEventListener('message', onMessage);
    // Timeout ditingkatkan ke 60 detik untuk sinkronisasi 126k+ record
    worker.postMessage({ url: `${currentUrl}?_cb=${Date.now()}`, timeout: 60000 });
  });
}

export async function testConnection(): Promise<{success: boolean, message: string}> {
  try {
    const response = await fetch(`${getApiUrl()}?ping=true`, { 
      method: 'GET', 
      mode: 'cors',
      cache: 'no-store'
    });
    return { success: response.ok, message: response.ok ? 'Online' : 'Worker Error' };
  } catch (err) {
    return { success: false, message: 'Offline/Network Error' };
  }
}

export async function uploadLPBData(data: any[]): Promise<{success: boolean, message: string}> {
  try {
    const response = await fetch(getApiUrl(), {
      method: 'POST',
      mode: 'cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'UPLOAD_BULK', payload: data })
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return { success: true, message: `Sync Berhasil.` };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}
