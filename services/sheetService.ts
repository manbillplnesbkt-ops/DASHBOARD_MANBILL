
import { LPBData } from '../types';

const SHEET_ID = '1k5pvZnvK7xkC9lTgirWEXxfQZ5xgX4-GiRfD5JlmPHg';
const SHEET_NAME = 'DATA LPB';
const DB_NAME = 'LPB_Dashboard_DB';
const STORE_NAME = 'csv_cache';
const CACHE_META_KEY = 'lpb_cache_meta';
const CACHE_TTL = 5 * 60 * 1000; // 5 menit

let inMemoryCache: { data: LPBData[], timestamp: number } | null = null;

const idb = {
  get: (key: string): Promise<string | null> => {
    return new Promise((resolve) => {
      const request = indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = () => request.result.createObjectStore(STORE_NAME);
      request.onsuccess = () => {
        const db = request.result;
        try {
          const transaction = db.transaction(STORE_NAME, 'readonly');
          const store = transaction.objectStore(STORE_NAME);
          const getReq = store.get(key);
          getReq.onsuccess = () => resolve(getReq.result || null);
          getReq.onerror = () => resolve(null);
        } catch (e) { resolve(null); }
      };
      request.onerror = () => resolve(null);
    });
  },
  set: (key: string, value: string): Promise<boolean> => {
    return new Promise((resolve) => {
      const request = indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = () => request.result.createObjectStore(STORE_NAME);
      request.onsuccess = () => {
        const db = request.result;
        try {
          const transaction = db.transaction(STORE_NAME, 'readwrite');
          const store = transaction.objectStore(STORE_NAME);
          store.put(value, key);
          transaction.oncomplete = () => resolve(true);
          transaction.onerror = () => resolve(false);
        } catch (e) { resolve(false); }
      };
      request.onerror = () => resolve(false);
    });
  }
};

export async function fetchLPBData(forceRefresh = false): Promise<{data: LPBData[], fromCache: boolean, timestamp: number}> {
  if (!forceRefresh && inMemoryCache) {
    const isExpired = Date.now() - inMemoryCache.timestamp > CACHE_TTL;
    if (!isExpired) return { ...inMemoryCache, fromCache: true };
  }

  if (!forceRefresh) {
    try {
      const meta = localStorage.getItem(CACHE_META_KEY);
      if (meta) {
        const { timestamp } = JSON.parse(meta);
        if (Date.now() - timestamp < CACHE_TTL) {
          const cachedCsv = await idb.get('raw_csv');
          if (cachedCsv) {
            const parsedData = parseCSV(cachedCsv);
            inMemoryCache = { data: parsedData, timestamp };
            return { data: parsedData, fromCache: true, timestamp };
          }
        }
      }
    } catch (e) { console.warn('Cache error:', e); }
  }

  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(SHEET_NAME)}`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Network response was not ok');
    const csvText = await response.text();
    
    const parsedData = parseCSV(csvText);
    const now = Date.now();

    inMemoryCache = { data: parsedData, timestamp: now };
    idb.set('raw_csv', csvText).then(() => {
      localStorage.setItem(CACHE_META_KEY, JSON.stringify({ timestamp: now }));
    });

    return { data: parsedData, fromCache: false, timestamp: now };
  } catch (error) {
    console.error('Fetch failed:', error);
    if (inMemoryCache) return { ...inMemoryCache, fromCache: true };
    return { data: [], fromCache: false, timestamp: 0 };
  }
}

function parseCSV(csvText: string): LPBData[] {
  const lines = csvText.split(/\r?\n/);
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.replace(/^"|"$/g, '').trim());
  const data: LPBData[] = [];
  
  const idxX = headers.indexOf("KOORDINAT X");
  const idxY = headers.indexOf("KOORDINAT Y");
  const idxPegawai = headers.indexOf("PEGAWAI");
  const idxPetugas = headers.indexOf("PETUGAS");

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;

    const values = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
    if (values.length < headers.length) continue;

    const entry: any = {};
    for (let j = 0; j < headers.length; j++) {
      const key = headers[j];
      let val = values[j]?.replace(/^"|"$/g, '').trim() || '';
      entry[key] = val;
    }

    // Mapping PETUGAS (prioritize actual header, then fallback to PEGAWAI)
    if (idxPetugas !== -1) {
      entry.PETUGAS = entry[headers[idxPetugas]];
    } else if (idxPegawai !== -1) {
      entry.PETUGAS = entry[headers[idxPegawai]];
    } else {
      entry.PETUGAS = '';
    }

    // Mapping koordinat
    if (idxX !== -1 && idxY !== -1) {
      const lat = parseFloat(String(entry[headers[idxY]]).replace(',', '.'));
      const lng = parseFloat(String(entry[headers[idxX]]).replace(',', '.'));
      entry.LATITUDE = !isNaN(lat) ? lat : 0;
      entry.LONGITUDE = !isNaN(lng) ? lng : 0;
    }
    
    data.push(entry as LPBData);
  }

  return data;
}
