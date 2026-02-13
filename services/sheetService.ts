
import { LPBData } from '../types';

const SHEET_ID = '1k5pvZnvK7xkC9lTgirWEXxfQZ5xgX4-GiRfD5JlmPHg';
const SHEET_NAME = 'DATA LPB';
const DB_NAME = 'LPB_Dashboard_DB';
const STORE_NAME = 'csv_cache';
const CACHE_META_KEY = 'lpb_cache_meta';
const CACHE_TTL = 5 * 60 * 1000;

let inMemoryCache: { data: LPBData[], timestamp: number } | null = null;
let csvWorker: Worker | null = null;

const WORKER_CODE = `
  function fastParseCSV(csvText) {
    const result = [];
    let row = [];
    let curr = '';
    let inQuotes = false;
    for (let i = 0; i < csvText.length; i++) {
      const char = csvText[i];
      const next = csvText[i + 1];
      if (inQuotes) {
        if (char === '"' && next === '"') { curr += '"'; i++; }
        else if (char === '"') { inQuotes = false; }
        else { curr += char; }
      } else {
        if (char === '"') { inQuotes = true; }
        else if (char === ',') { row.push(curr.trim()); curr = ''; }
        else if (char === '\\n' || char === '\\r') {
          row.push(curr.trim());
          if (row.length > 0) result.push(row);
          row = []; curr = '';
          if (char === '\\r' && next === '\\n') i++;
        } else { curr += char; }
      }
    }
    if (curr || row.length > 0) { row.push(curr.trim()); result.push(row); }
    return result;
  }

  function fixScientific(str) {
    if (!str || typeof str !== 'string') return str;
    const s = str.toUpperCase().trim();
    if (s.includes('E+')) {
      try {
        const num = Number(s.replace(',', '.'));
        if (!isNaN(num)) {
          return BigInt(Math.round(num)).toString();
        }
      } catch (e) {}
    }
    return s;
  }

  function processCsvRows(rows) {
    if (rows.length < 2) return [];
    
    // Normalisasi headers ke UPPERCASE untuk konsistensi dengan UI
    const headers = rows[0].map(h => h.toUpperCase().trim());
    const data = [];
    
    const idxMap = {};
    headers.forEach((h, i) => idxMap[h] = i);
    
    const idxX = idxMap["KOORDINAT X"] || idxMap["LONGITUDE"];
    const idxY = idxMap["KOORDINAT Y"] || idxMap["LATITUDE"];
    const idxPetugas = idxMap["PETUGAS"] || idxMap["PEGAWAI"];
    const idxIdpel = idxMap["IDPEL"];
    const idxDaya = headers.findIndex(h => h.includes("DAYA") || h === "VA" || h === "POWER" || h.includes("LIMIT"));

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (row.length < headers.length) continue;
      
      const entry = {};
      // Isi semua data berdasarkan header yang sudah di-UPPERCASE
      headers.forEach((h, j) => {
        let val = row[j] || '';
        if (j === idxIdpel) val = fixScientific(val);
        entry[h] = val;
      });

      // Mapping manual untuk field yang sering memiliki variasi nama
      entry.PETUGAS = row[idxPetugas] || '';
      entry.DAYA = row[idxDaya] || '';
      
      if (idxX !== undefined && idxY !== undefined) {
        const lat = parseFloat((row[idxY] || '0').replace(',', '.'));
        const lng = parseFloat((row[idxX] || '0').replace(',', '.'));
        entry.LATITUDE = !isNaN(lat) ? lat : 0;
        entry.LONGITUDE = !isNaN(lng) ? lng : 0;
      } else {
        entry.LATITUDE = 0; entry.LONGITUDE = 0;
      }
      
      data.push(entry);
    }
    return data;
  }

  self.onmessage = (e) => {
    const { csvText } = e.data;
    try {
      const parsedRows = fastParseCSV(csvText);
      const structuredData = processCsvRows(parsedRows);
      self.postMessage({ success: true, data: structuredData });
    } catch (error) {
      self.postMessage({ success: false, error: error.message });
    }
  };
`;

function getWorker(): Worker {
  if (!csvWorker) {
    const blob = new Blob([WORKER_CODE], { type: 'application/javascript' });
    const workerUrl = URL.createObjectURL(blob);
    csvWorker = new Worker(workerUrl);
  }
  return csvWorker;
}

function parseWithWorker(csvText: string): Promise<LPBData[]> {
  return new Promise((resolve, reject) => {
    try {
      const worker = getWorker();
      const handler = (e: MessageEvent) => {
        worker.removeEventListener('message', handler);
        if (e.data.success) resolve(e.data.data);
        else reject(new Error(e.data.error));
      };
      worker.addEventListener('message', handler);
      worker.postMessage({ csvText });
    } catch (err) {
      reject(err);
    }
  });
}

const idb = {
  get: (key: string): Promise<string | null> => {
    return new Promise((resolve) => {
      const request = indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = () => {
        if (!request.result.objectStoreNames.contains(STORE_NAME)) {
          request.result.createObjectStore(STORE_NAME);
        }
      };
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
      request.onupgradeneeded = () => {
        if (!request.result.objectStoreNames.contains(STORE_NAME)) {
          request.result.createObjectStore(STORE_NAME);
        }
      };
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
            const parsedData = await parseWithWorker(cachedCsv);
            inMemoryCache = { data: parsedData, timestamp };
            return { data: parsedData, fromCache: true, timestamp };
          }
        }
      }
    } catch (e) { console.warn('Cache read error:', e); }
  }

  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(SHEET_NAME)}`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Network error: ${response.statusText}`);
    const csvText = await response.text();
    
    const parsedData = await parseWithWorker(csvText);
    const now = Date.now();

    inMemoryCache = { data: parsedData, timestamp: now };
    idb.set('raw_csv', csvText).then(() => {
      localStorage.setItem(CACHE_META_KEY, JSON.stringify({ timestamp: now }));
    }).catch(err => console.warn('Failed to update IndexedDB cache:', err));

    return { data: parsedData, fromCache: false, timestamp: now };
  } catch (error) {
    console.error('Fetch/Parse failed:', error);
    if (inMemoryCache) return { ...inMemoryCache, fromCache: true };
    return { data: [], fromCache: false, timestamp: 0 };
  }
}
