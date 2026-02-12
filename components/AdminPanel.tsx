
import React, { useState, useEffect } from 'react';
import { Upload, Database, FileUp, CheckCircle2, AlertCircle, Loader2, ArrowLeft, Settings, Save, Globe, Code, Copy, Terminal, Info, Link, Activity, AlertTriangle, HelpCircle, ExternalLink } from 'lucide-react';
import { uploadLPBData, getApiUrl, setApiUrl, testConnection } from '../services/d1Service';

interface AdminPanelProps {
  onBack: () => void;
  onRefreshData: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onBack, onRefreshData }) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });
  const [testing, setTesting] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null, message: string }>({ type: null, message: '' });
  const [apiUrlInput, setApiUrlInput] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    setApiUrlInput(getApiUrl());
  }, []);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setApiUrl(apiUrlInput);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleTestConnection = async () => {
    setTesting(true);
    const result = await testConnection();
    setStatus({ type: result.success ? 'success' : 'error', message: result.message });
    setTesting(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setStatus({ type: null, message: '' });
      setUploadProgress({ current: 0, total: 0 });
    }
  };

  const parseCSV = (text: string) => {
    const lines = text.trim().split(/\r?\n/);
    if (lines.length < 2) return [];
    
    // Deteksi Delimiter (Koma vs Titik Koma)
    const firstLine = lines[0];
    const delimiter = firstLine.includes(';') ? ';' : ',';
    
    const rawHeaders = firstLine.split(delimiter).map(h => h.replace(/"/g, '').trim().toUpperCase());
    const data = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line.trim()) continue;
      
      const regex = new RegExp(`${delimiter}(?=(?:(?:[^"]*"){2})*[^"]*$)`);
      const values = line.split(regex).map(v => v.trim().replace(/"/g, ''));
      const obj: any = {};
      
      let hasValidIdpel = false;
      rawHeaders.forEach((header, idx) => {
        const val = values[idx] || '';
        let key = header.toLowerCase().replace(/\s+/g, '_');
        
        if (header === "KOORDINAT X") key = "longitude";
        if (header === "KOORDINAT Y") key = "latitude";
        if (header === "PEGAWAI") key = "petugas";
        
        obj[key] = val;
        if (key === 'idpel' && val.length > 5) hasValidIdpel = true;
      });

      // Hanya masukkan jika ada IDPEL yang valid untuk menghindari record kosong menumpuk di 1 baris
      if (hasValidIdpel) {
        data.push(obj);
      }
    }
    return data;
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setStatus({ type: null, message: '' });

    try {
      const text = await file.text();
      const allData = parseCSV(text);
      
      if (allData.length === 0) throw new Error('File CSV tidak valid atau IDPEL tidak ditemukan.');
      
      // CHUNKING: Kirim per 250 record untuk menghindari limit 1MB Cloudflare
      const chunkSize = 250;
      const totalChunks = Math.ceil(allData.length / chunkSize);
      setUploadProgress({ current: 0, total: totalChunks });

      for (let i = 0; i < allData.length; i += chunkSize) {
        const chunk = allData.slice(i, i + chunkSize);
        const chunkNum = Math.floor(i / chunkSize) + 1;
        
        setUploadProgress(prev => ({ ...prev, current: chunkNum }));
        
        const result = await uploadLPBData(chunk);
        if (!result.success) {
          throw new Error(`Gagal pada bagian ke-${chunkNum}: ${result.message}`);
        }
      }

      setStatus({ 
        type: 'success', 
        message: `BERHASIL! Total ${allData.length} data telah diunggah dalam ${totalChunks} tahap.` 
      });
      setFile(null);
      setTimeout(() => onRefreshData(), 500);
      
    } catch (err: any) {
      console.error('Upload Error:', err);
      setStatus({ type: 'error', message: err.message || 'Gagal sinkronisasi' });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Kode berhasil disalin!');
  };

  const workerCode = `/**
 * CLOUDFLARE WORKER - LPB D1 CONNECTOR (V5)
 * Fokus: Keamanan Batching & Pembersihan Cache
 */
export default {
  async fetch(request, env) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Accept, Cache-Control, Authorization",
      "Access-Control-Max-Age": "86400",
    };

    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders });

    const makeRes = (data, status = 200) => {
      return new Response(JSON.stringify(data), { 
        status, 
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
          "Cache-Control": "no-store, no-cache, must-revalidate",
        } 
      });
    };

    if (!env.DB) return makeRes({ error: "D1 DB Binding missing." }, 500);

    try {
      if (request.method === "POST") {
        const { action, payload } = await request.json();
        if (action === "UPLOAD_BULK" && Array.isArray(payload)) {
          const statements = payload.map(item => {
            return env.DB.prepare(\`
              INSERT INTO lpb_data (
                unit, idpel, nama, alamat, no_meter, tarif, daya, kode_rbm, blth, tegangan, arus, cosphi, 
                tarif_index, power_limit, kwh_kumulatif, indikator, sisa_kwh, temper, tutup_meter, 
                segel, lcd, keypad, jml_terminal, indi_temper, relay, petugas, validasi, 
                longitude, latitude, catatan, waktu_jam
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
              ON CONFLICT(idpel) DO UPDATE SET
                unit=excluded.unit, nama=excluded.nama, alamat=excluded.alamat, 
                blth=excluded.blth, tegangan=excluded.tegangan, arus=excluded.arus, 
                cosphi=excluded.cosphi, indikator=excluded.indikator, petugas=excluded.petugas,
                validasi=excluded.validasi, longitude=excluded.longitude, latitude=excluded.latitude,
                catatan=excluded.catatan, waktu_jam=excluded.waktu_jam
            \`).bind(
              String(item.unit || ''), String(item.idpel || ''), String(item.nama || ''), String(item.alamat || ''), String(item.no_meter || ''),
              String(item.tarif || ''), String(item.daya || ''), String(item.kode_rbm || ''), String(item.blth || ''), String(item.tegangan || '0'),
              String(item.arus || '0'), String(item.cosphi || '0'), String(item.tarif_index || ''), String(item.power_limit || ''),
              String(item.kwh_kumulatif || ''), String(item.indikator || 'NORMAL'), String(item.sisa_kwh || '0'), String(item.temper || '0'),
              String(item.tutup_meter || ''), String(item.segel || ''), String(item.lcd || ''), String(item.keypad || ''),
              String(item.jml_terminal || ''), String(item.indi_temper || ''), String(item.relay || ''), String(item.petugas || ''),
              String(item.validasi || 'VALID'), parseFloat(item.longitude || 0), parseFloat(item.latitude || 0),
              String(item.catatan || ''), String(item.waktu_jam || '')
            );
          });
          await env.DB.batch(statements);
          return makeRes({ success: true, count: payload.length });
        }
      }

      const { results } = await env.DB.prepare("SELECT * FROM lpb_data").all();
      return makeRes(results);
    } catch (e) {
      return makeRes({ error: e.message }, 500);
    }
  }
};`;

  return (
    <div className="bg-white border-2 border-slate-300 rounded-2xl flex flex-col h-full shadow-xl overflow-hidden animate-in fade-in zoom-in duration-300">
      <div className="bg-slate-900 p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-all">
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-lg font-black text-white uppercase tracking-widest">D1 ADMIN MANAGER</h2>
        </div>
        <button onClick={() => setShowGuide(!showGuide)} className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase">
          {showGuide ? 'Hide Setup' : 'Show Setup'}
        </button>
      </div>

      <div className="flex-1 p-6 overflow-auto bg-slate-50 space-y-6 scrollbar-thin">
        {showGuide && (
          <div className="bg-white border-2 border-indigo-200 rounded-2xl p-5 space-y-4 shadow-sm animate-in slide-in-from-top-2">
            <h3 className="text-xs font-black uppercase text-indigo-700 flex items-center gap-2">
              <Code size={14} /> Update Kode Worker (V5)
            </h3>
            <p className="text-[10px] text-slate-500 font-bold">Pastikan menggunakan versi V5 untuk kompatibilitas dengan Chunking Upload:</p>
            <div className="bg-slate-900 p-4 rounded-xl relative">
              <button onClick={() => copyToClipboard(workerCode)} className="absolute top-2 right-2 text-indigo-400 hover:text-white transition-colors">
                <Copy size={14} />
              </button>
              <pre className="text-[9px] text-indigo-200 font-mono h-32 overflow-auto scrollbar-thin">{workerCode}</pre>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <button 
                 onClick={() => copyToClipboard(`CREATE TABLE lpb_data (unit TEXT, idpel TEXT PRIMARY KEY, nama TEXT, alamat TEXT, no_meter TEXT, tarif TEXT, daya TEXT, kode_rbm TEXT, blth TEXT, tegangan TEXT, arus TEXT, cosphi TEXT, tarif_index TEXT, power_limit TEXT, kwh_kumulatif TEXT, indikator TEXT, sisa_kwh TEXT, temper TEXT, tutup_meter TEXT, segel TEXT, lcd TEXT, keypad TEXT, jml_terminal TEXT, indi_temper TEXT, relay TEXT, petugas TEXT, validasi TEXT, longitude REAL, latitude REAL, catatan TEXT, waktu_jam TEXT);`)}
                 className="py-2 bg-emerald-600 text-white rounded-lg text-[9px] font-black uppercase"
              >
                Salin SQL Init Table
              </button>
              <a href="https://dash.cloudflare.com" target="_blank" className="py-2 bg-slate-200 text-slate-700 rounded-lg text-[9px] font-black uppercase flex items-center justify-center gap-2 text-center">
                Buka Cloudflare Dashboard
              </a>
            </div>
          </div>
        )}

        <div className="max-w-xl mx-auto space-y-6">
          <div className="bg-white border-2 border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-xs font-black uppercase mb-4 flex items-center gap-2">
              <Settings size={14} className="text-slate-400" /> API Settings
            </h3>
            <form onSubmit={handleSaveSettings} className="flex gap-2">
              <input 
                type="text" 
                value={apiUrlInput} 
                onChange={(e) => setApiUrlInput(e.target.value)}
                className="flex-1 bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-2 text-xs font-bold font-mono focus:border-indigo-500 outline-none"
                placeholder="https://worker-url.workers.dev"
              />
              <button type="submit" className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${saveSuccess ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-white'}`}>
                {saveSuccess ? <CheckCircle2 size={14} /> : 'Save'}
              </button>
            </form>
            <button onClick={handleTestConnection} disabled={testing} className="mt-4 w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-[9px] font-black uppercase flex items-center justify-center gap-2">
              {testing ? <Loader2 size={12} className="animate-spin" /> : <Activity size={12} />} Test Connection
            </button>
          </div>

          <div className="bg-white border-2 border-slate-200 rounded-2xl p-10 flex flex-col items-center gap-4 text-center">
            <div className={`p-4 rounded-2xl ${file ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
              <FileUp size={40} />
            </div>
            <div>
              <p className="text-xs font-black uppercase text-slate-900">{file ? file.name : 'Pilih File CSV (Koma atau Titik Koma)'}</p>
              <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">Sistem akan otomatis mendeteksi pemisah kolom.</p>
            </div>
            <input type="file" accept=".csv" onChange={handleFileChange} className="hidden" id="admin-csv-upload" />
            <label htmlFor="admin-csv-upload" className="px-6 py-2 bg-slate-900 text-white text-[10px] font-black uppercase rounded-xl cursor-pointer hover:bg-slate-800 shadow-lg">Pilih File</label>
          </div>

          {loading && uploadProgress.total > 0 && (
            <div className="bg-indigo-50 border-2 border-indigo-100 rounded-xl p-4 space-y-2">
              <div className="flex justify-between items-center text-[10px] font-black uppercase text-indigo-700">
                <span>Memproses Data...</span>
                <span>Bagian {uploadProgress.current} dari {uploadProgress.total}</span>
              </div>
              <div className="w-full bg-indigo-200 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-indigo-600 h-full transition-all duration-300"
                  style={{ width: `${(uploadProgress.current / uploadProgress.total) * 100}%` }}
                ></div>
              </div>
            </div>
          )}

          {status.type && (
            <div className={`p-4 rounded-xl border-2 flex items-start gap-4 animate-in slide-in-from-bottom-2 ${status.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'}`}>
              {status.type === 'success' ? <CheckCircle2 className="shrink-0" /> : <AlertCircle className="shrink-0" />}
              <p className="text-[10px] font-bold leading-tight uppercase">{status.message}</p>
            </div>
          )}

          <button 
            disabled={!file || loading}
            onClick={handleUpload}
            className={`w-full py-4 rounded-2xl flex items-center justify-center gap-3 text-sm font-black uppercase shadow-xl transition-all ${!file || loading ? 'bg-slate-200 text-slate-400' : 'bg-indigo-700 text-white hover:bg-indigo-800'}`}
          >
            {loading ? <Loader2 className="animate-spin" /> : <Upload />}
            {loading ? 'SEDANG MENGIRIM...' : 'SINKRONKAN KE CLOUDFLARE'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
