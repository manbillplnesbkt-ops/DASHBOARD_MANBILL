
/**
 * CSV PROCESSING WORKER
 * Berjalan di background thread untuk mencegah UI Freeze saat parsing data besar.
 */

function fastParseCSV(csvText: string): string[][] {
  const result: string[][] = [];
  let row: string[] = [];
  let curr = '';
  let inQuotes = false;
  
  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const next = csvText[i + 1];
    
    if (inQuotes) {
      if (char === '"' && next === '"') {
        curr += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        curr += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        row.push(curr.trim());
        curr = '';
      } else if (char === '\n' || char === '\r') {
        row.push(curr.trim());
        if (row.length > 0) result.push(row);
        row = [];
        curr = '';
        if (char === '\r' && next === '\n') i++;
      } else {
        curr += char;
      }
    }
  }
  
  if (curr || row.length > 0) {
    row.push(curr.trim());
    result.push(row);
  }
  
  return result;
}

function processCsvRows(rows: string[][]): any[] {
  if (rows.length < 2) return [];

  const headers = rows[0];
  const data: any[] = [];
  
  const idxMap: Record<string, number> = {};
  headers.forEach((h, i) => idxMap[h] = i);

  const idxX = idxMap["KOORDINAT X"];
  const idxY = idxMap["KOORDINAT Y"];
  const idxPetugas = idxMap["PETUGAS"];
  const idxPegawai = idxMap["PEGAWAI"];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (row.length < headers.length) continue;

    const entry: any = {};
    for (let j = 0; j < headers.length; j++) {
      entry[headers[j]] = row[j];
    }

    // Petugas Logic
    entry.PETUGAS = row[idxPetugas] || row[idxPegawai] || '';

    // Coordinates Logic
    if (idxX !== undefined && idxY !== undefined) {
      const latRaw = row[idxY] || '0';
      const lngRaw = row[idxX] || '0';
      const lat = parseFloat(latRaw.replace(',', '.'));
      const lng = parseFloat(lngRaw.replace(',', '.'));
      entry.LATITUDE = !isNaN(lat) ? lat : 0;
      entry.LONGITUDE = !isNaN(lng) ? lng : 0;
    } else {
      entry.LATITUDE = 0;
      entry.LONGITUDE = 0;
    }
    
    data.push(entry);
  }

  return data;
}

self.onmessage = (e: MessageEvent) => {
  const { csvText } = e.data;
  try {
    const parsedRows = fastParseCSV(csvText);
    const structuredData = processCsvRows(parsedRows);
    self.postMessage({ success: true, data: structuredData });
  } catch (error) {
    self.postMessage({ success: false, error: (error as Error).message });
  }
};
