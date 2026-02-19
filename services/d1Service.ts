
import { LPBData } from '../types';

/**
 * CLOUDFLARE D1 SERVICE - DEACTIVATED
 * Layanan ini telah dinonaktifkan sesuai permintaan. 
 * Seluruh proses sinkronisasi dan pengambilan data kini telah bermigrasi sepenuhnya ke Supabase Engine.
 */

export function getApiUrl(): string {
  return "DISABLED";
}

export function setApiUrl(url: string) {
  // Logika penyimpanan URL dinonaktifkan
}

export async function fetchLPBDataFromD1(forceRefresh = false): Promise<{data: LPBData[], fromCache: boolean, timestamp: number, source: 'D1' | 'SHEETS'}> {
  console.warn("⚠️ Peringatan: Cloudflare D1 Engine sedang NON-AKTIF.");
  return { 
    data: [], 
    fromCache: false, 
    timestamp: 0, 
    source: 'D1' 
  };
}

export async function testConnection(): Promise<{success: boolean, message: string}> {
  return { success: false, message: 'D1 Engine Deactivated' };
}

export async function uploadLPBData(data: any[]): Promise<{success: boolean, message: string}> {
  return { success: false, message: 'D1 Engine Deactivated' };
}
