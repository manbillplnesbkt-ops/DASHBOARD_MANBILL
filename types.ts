
export interface LPBData {
  UNIT: string;
  IDPEL: string;
  BLTH: string;
  NAMA: string;
  ALAMAT: string;
  "NO METER": string;
  TARIF: string;
  DAYA: string;
  "KODE RBM": string;
  VALIDASI: string;
  TEGANGAN: string;
  ARUS: string;
  COSPHI: string;
  "TARIF INDEX": string;
  "POWER LIMIT": string;
  "KWH KUMULATIF": string;
  INDIKATOR: string;
  "SISA KWH": string;
  TEMPER: string;
  "TUTUP METER": string;
  SEGEL: string;
  LCD: string;
  KEYPAD: string;
  "JML TERMINAL": string;
  INDI_TEMPER: string;
  RELAY: string;
  "KOORDINAT X": string | number; // Longitude
  "KOORDINAT Y": string | number; // Latitude
  PETUGAS: string;
  // Legacy support for internal logic
  LATITUDE?: number;
  LONGITUDE?: number;
}

export interface FilterState {
  blth: string;
  unit: string;
  PETUGAS: string;
  validasi: string;
}
