
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
  PETUGAS: string;
  // Added TANGGAL property to support daily performance recap tracking
  TANGGAL?: string;
  created_at?: string;
  KETERANGAN?: string;
  WAKTU_JAM?: string;
  // Invoice specific fields
  USER?: string;
  TOTALLEMBAR?: number;
  TOTALRUPIAH?: number;
  LUNAS_MANDIRI?: number;
  LUNAS_OFFLINE?: number;
  JANJI_BAYAR?: number;
  TOTAL?: number;
  // Geo coordinates used by Leaflet
  LATITUDE: number;
  LONGITUDE: number;
}

export interface WOKontrakData {
  unit: string;
  wo_invoice: number;
}

export interface FilterState {
  blth: string;
  unit: string;
  PETUGAS: string;
  validasi: string;
}

export interface AdminAuthState {
  isAuthenticated: boolean;
  lastLogin?: number;
}
