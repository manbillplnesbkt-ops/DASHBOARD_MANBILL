
import React, { useState, useEffect } from 'react';
import { Upload, FileUp, CheckCircle2, AlertCircle, Loader2, ArrowLeft, Settings, Code, Copy, Activity, AlertTriangle, ExternalLink, Database, SlidersHorizontal, LockKeyhole } from 'lucide-react';
import { uploadLPBData, getApiUrl, setApiUrl, testConnection } from '../services/d1Service';

interface AdminPanelProps {
  onBack: () => void;
  onRefreshData: () => void;
}

type AdminTab = 'INPUT' | 'SETTING';

const SETTING_TAB_PASSWORD = "Settingmanbill";

const AdminPanel: React.FC<AdminPanelProps> = ({ onBack, onRefreshData }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('INPUT');
  const [isSettingAuthenticated, setIsSettingAuthenticated] = useState(false);
  const [settingPasswordInput, setSettingPasswordInput] = useState('');
  const [settingAuthError, setSettingAuthError] = useState(false);

  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });
  const [testing, setTesting] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null, message: string }>({ type: null, message: '' });
  const [apiUrlInput, setApiUrlInput] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    setApiUrlInput(getApiUrl());
  }, []);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setApiUrl(apiUrlInput);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleSettingAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (settingPasswordInput === SETTING_TAB_PASSWORD) {
      setIsSettingAuthenticated(true);
      setSettingAuthError(false);
    } else {
      setSettingAuthError(true);
      setSettingPasswordInput('');
    }
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
        let val = values[idx] || '';
        let key = header.toLowerCase().replace(/\s+/g, '_');
        
        // PEMETAAN KHUSUS HEADER
        if (header === "KOORDINAT X" || header === "LONGITUDE" || header === "X") key = "longitude";
        if (header === "KOORDINAT Y" || header === "LATITUDE" || header === "Y") key = "latitude";
        if (header === "PEGAWAI" || header === "NAMA PETUGAS") key = "petugas";
        
        // FIX: PEMBERSIHAN DATA KOORDINAT (Koma -> Titik, Hanya Izinkan Angka 0-9, Titik, dan Minus)
        if (key === "longitude" || key === "latitude") {
          // Ubah koma ke titik, lalu hapus semua karakter kecuali angka, titik, dan tanda minus
          val = val.replace(',', '.').replace(/[^-0-9.]/g, ''); 
        }
        
        obj[key] = val;
        if (key === 'idpel' && val.length > 5) hasValidIdpel = true;
      });

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
      
      const chunkSize = 250;
      const totalChunks = Math.ceil(allData.length / chunkSize);
      setUploadProgress({ current: 0, total: totalChunks });

      for (let i = 0; i < allData.length; i += chunkSize) {
        const chunk = allData.slice(i, i + chunkSize);
        const chunkNum = Math.floor(i / chunkSize) + 1;
        setUploadProgress(prev => ({ ...prev, current: chunkNum }));
        
        const result = await uploadLPBData(chunk);
        if (!result.success) throw new Error(`Gagal pada bagian ke-${chunkNum}: ${result.message}`);
      }

      setStatus({ type: 'success', message: `BERHASIL! Total ${allData.length} data diperbarui.` });
      setFile(null);
      setTimeout(() => onRefreshData(), 500);
    } catch (err: any) {
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
 * CLOUDFLARE WORKER - LPB D1 CONNECTOR (V5.2)
 * Fokus: Keamanan Batching, CORS, & Diagnosa Tabel
 */
export default {
  async fetch(request, env) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Accept, Cache-Control, Authorization",
      "Access-Control-Max-Age": "86400",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

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

    if (!env.DB) return makeRes({ error: "Binding 'DB' tidak ditemukan." }, 500);

    try {
      if (request.method === "POST") {
        const body = await request.json();
        const { action, payload } = body;

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
              String(item.validasi || 'VALID'), 
              parseFloat(String(item.longitude || '0')), 
              parseFloat(String(item.latitude || '0')),
              String(item.catatan || ''), String(item.waktu_jam || '')
            );
          });
          await env.DB.batch(statements);
          return makeRes({ success: true, count: payload.length });
        }
      }

      try {
        const { results } = await env.DB.prepare("SELECT * FROM lpb_data").all();
        return makeRes(results);
      } catch (dbErr) {
        if (dbErr.message.includes("no such table")) {
          return makeRes({ error: "Tabel 'lpb_data' belum dibuat." }, 404);
        }
        throw dbErr;
      }

    } catch (e) {
      return makeRes({ error: e.message }, 500);
    }
  }
};`;

  const renderSettingAuth = () => (
    <div className="flex flex-col items-center justify-center py-20 px-4 animate-in fade-in slide-in-from-bottom-4">
      <div className="bg-white border-2 border-slate-300 rounded-3xl p-8 max-w-sm w-full shadow-2xl space-y-6">
        <div className="flex flex-col items-center gap-3">
          <div className="p-4 bg-indigo-100 rounded-2xl text-indigo-600 shadow-xl shadow-indigo-100/50">
            <LockKeyhole size={32} />
          </div>
          <div className="text-center">
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter italic">SETTING ACCESS</h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">RESTRICTED CONFIGURATION</p>
          </div>
        </div>

        <form onSubmit={handleSettingAuth} className="space-y-4">
          <div className="space-y-2">
            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Setting Password</label>
            <input 
              type="password"
              autoFocus
              value={settingPasswordInput}
              onChange={(e) => setSettingPasswordInput(e.target.value)}
              placeholder="••••••••••••"
              className={`
                w-full bg-slate-50 border-2 rounded-xl px-4 py-3 font-black text-center focus:outline-none transition-all
                ${settingAuthError ? 'border-rose-500 bg-rose-50 animate-shake' : 'border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10'}
              `}
            />
            {settingAuthError && <p className="text-[9px] font-black text-rose-600 uppercase text-center mt-2 tracking-tighter">Access Denied.</p>}
          </div>

          <button 
            type="submit"
            className="w-full py-4 bg-indigo-600 text-white rounded-xl font-black uppercase tracking-widest text-[11px] shadow-lg hover:bg-indigo-700 transition-all active:scale-[0.97]"
          >
            Authorize Setting
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <div className="bg-white border-2 border-slate-300 rounded-2xl flex flex-col h-full shadow-xl overflow-hidden animate-in fade-in zoom-in duration-300">
      <div className="bg-slate-900 p-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-all">
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-lg font-black text-white uppercase tracking-widest">D1 ADMIN MANAGER</h2>
        </div>
        <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700">
          <button 
            onClick={() => setActiveTab('INPUT')}
            className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'INPUT' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
          >
            <Database size={14} /> INPUT DATA
          </button>
          <button 
            onClick={() => setActiveTab('SETTING')}
            className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'SETTING' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
          >
            <SlidersHorizontal size={14} /> SETTING
          </button>
        </div>
      </div>

      <div className="flex-1 p-6 overflow-auto bg-slate-50 scrollbar-thin">
        {activeTab === 'SETTING' ? (
          !isSettingAuthenticated ? renderSettingAuth() : (
            <div className="animate-in slide-in-from-right-4 duration-300">
              <div className="bg-white border-2 border-indigo-100 rounded-2xl overflow-hidden shadow-sm">
                <div className="bg-indigo-50 border-b-2 border-indigo-100 p-4 flex items-center justify-between">
                   <h3 className="text-xs font-black uppercase flex items-center gap-2 text-indigo-700">
                     <Settings size={14} /> API SETTING & SETUP GUIDE
                   </h3>
                </div>
                
                <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Activity size={12} />
                      <span className="text-[10px] font-black uppercase tracking-widest">API Configuration</span>
                    </div>
                    <form onSubmit={handleSaveSettings} className="flex gap-2">
                      <input 
                        type="text" 
                        value={apiUrlInput} 
                        onChange={(e) => setApiUrlInput(e.target.value)}
                        className="flex-1 bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-2 text-xs font-bold font-mono focus:border-indigo-500 outline-none"
                        placeholder="https://worker-url.workers.dev"
                      />
                      <button type="submit" className="px-6 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase">
                        {saveSuccess ? 'SAVED' : 'SAVE URL'}
                      </button>
                    </form>
                    <button onClick={handleTestConnection} disabled={testing} className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-[10px] font-black uppercase flex items-center justify-center gap-2 transition-colors border border-slate-200">
                      {testing ? <Loader2 size={12} className="animate-spin" /> : <Activity size={12} />} TEST CONNECTIVITY
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Code size={12} />
                      <span className="text-[10px] font-black uppercase tracking-widest">Worker Script</span>
                    </div>
                    <div className="bg-slate-900 p-4 rounded-xl relative group">
                      <button onClick={() => copyToClipboard(workerCode)} className="absolute top-2 right-2 p-1.5 bg-white/5 text-slate-400 hover:text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                        <Copy size={14} />
                      </button>
                      <pre className="text-[9px] text-indigo-200 font-mono h-32 overflow-auto scrollbar-thin">{workerCode}</pre>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        ) : (
          <div className="max-w-xl mx-auto space-y-6 animate-in slide-in-from-left-4 duration-300">
            <div className="bg-white border-2 border-slate-200 rounded-2xl p-10 flex flex-col items-center gap-4 text-center shadow-sm relative overflow-hidden group">
              <div className={`p-4 rounded-2xl transition-all duration-500 ${file ? 'bg-emerald-100 text-emerald-600 scale-110' : 'bg-slate-100 text-slate-400'}`}>
                <FileUp size={40} />
              </div>
              <div className="z-10">
                <p className="text-xs font-black uppercase text-slate-900">{file ? file.name : 'UPLOAD CSV MONITORING'}</p>
                <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">Hanya mendukung format CSV</p>
              </div>
              <input type="file" accept=".csv" onChange={handleFileChange} className="hidden" id="admin-csv-upload" />
              <label htmlFor="admin-csv-upload" className="px-8 py-2.5 bg-slate-900 text-white text-[10px] font-black uppercase rounded-xl cursor-pointer hover:bg-slate-800 shadow-xl transition-all active:scale-95">PILIH FILE CSV</label>
            </div>

            {loading && uploadProgress.total > 0 && (
              <div className="bg-indigo-50 border-2 border-indigo-100 rounded-xl p-4 space-y-2">
                <div className="flex justify-between items-center text-[10px] font-black uppercase text-indigo-700">
                  <span>Uploading Data...</span>
                  <span>Chunk {uploadProgress.current} / {uploadProgress.total}</span>
                </div>
                <div className="w-full bg-indigo-200 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-indigo-600 h-full transition-all duration-500 ease-out"
                    style={{ width: `${(uploadProgress.current / uploadProgress.total) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}

            {status.type && (
              <div className={`p-4 rounded-xl border-2 flex items-start gap-4 animate-in slide-in-from-bottom-2 ${status.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'}`}>
                {status.type === 'success' ? <CheckCircle2 className="shrink-0" /> : <AlertTriangle className="shrink-0" />}
                <div className="space-y-1">
                  <p className="text-[10px] font-black leading-tight uppercase">{status.type === 'success' ? 'SUCCESS' : 'ERROR'}</p>
                  <p className="text-[10px] font-bold leading-tight opacity-80">{status.message}</p>
                </div>
              </div>
            )}

            <button 
              disabled={!file || loading}
              onClick={handleUpload}
              className={`w-full py-4 rounded-2xl flex items-center justify-center gap-3 text-sm font-black uppercase shadow-2xl transition-all active:scale-[0.98] ${!file || loading ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-indigo-700 text-white hover:bg-indigo-800'}`}
            >
              {loading ? <Loader2 className="animate-spin" /> : <Upload />}
              {loading ? 'PROCESSING...' : 'SYNC DATA'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
