
import { LPBData } from '../types';

/**
 * GOOGLE SHEETS SERVICE - DEACTIVATED
 * Layanan ini telah dinonaktifkan sesuai permintaan.
 * Seluruh proses pengambilan data kini dipusatkan pada Supabase Engine.
 */

export async function fetchLPBData(forceRefresh = false): Promise<{data: LPBData[], fromCache: boolean, timestamp: number}> {
  console.warn("⚠️ Peringatan: Pembacaan data dari Google Sheets telah DINONAKTIFKAN.");
  
  // Mengembalikan data kosong untuk memutus ketergantungan pada spreadsheet
  return { 
    data: [], 
    fromCache: false, 
    timestamp: Date.now() 
  };
}
