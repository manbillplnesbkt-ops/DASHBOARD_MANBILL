
import React, { useState, useEffect, useMemo } from 'react';
import { Upload, FileUp, CheckCircle2, AlertCircle, Loader2, ArrowLeft, Settings, Database, Activity, AlertTriangle, LockKeyhole, Wifi, RefreshCcw, Zap, ExternalLink, Trash2, Table, Check } from 'lucide-react';
import { uploadToSupabase, getSupabaseConfig, setSupabaseConfig, testSupabaseConnection, clearSupabaseCache } from '../services/supabaseService';

interface AdminPanelProps {
  onBack: () => void;
  onRefreshData: () => void;
}

type AdminTab = 'INPUT' | 'SETTING';
const SETTING_TAB_PASSWORD = "Settingmanbill";

const ALLOWED_COLUMNS = [
  'idpel', 'unit', 'nama', 'alamat', 'blth', 'petugas', 'latitude', 'longitude', 
  'validasi', 'tegangan', 'arus', 'cosphi', 'indikator', 'sisa_kwh', 'temper', 
  'tutup_meter', 'segel', 'lcd', 'keypad', 'relay', 'tarif_index', 'power_limit', 
  'kwh_kumulatif', 'jml_terminal', 'indi_temper', 'catatan', 'waktu_jam', 
  'no_meter', 'tarif', 'daya', 'kode_rbm'
];

// Daftar kolom yang harus dikirim sebagai tipe Numeric/Number ke Supabase
const NUMERIC_COLUMNS = [
  'latitude', 'longitude', 'tegangan', 'arus', 'cosphi', 
  'sisa_kwh', 'kwh_kumulatif', 'daya', 'power_limit', 'temper',
  'jml_terminal', 'tarif_index'
];

const AdminPanel: React.FC<AdminPanelProps> = ({ onBack, onRefreshData }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('INPUT');
  const [isSettingAuth, setIsSettingAuth] = useState(false);
  const [passInput, setPassInput] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [mappedColumns, setMappedColumns] = useState<string[]>([]);
  const [testStatus, setTestStatus] = useState<{loading: boolean, result: string | null}>({loading: false, result: null});
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null, message: string }>({ type: null, message: '' });
  
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseKey, setSupabaseKey] = useState('');

  useEffect(() => {
    const config = getSupabaseConfig();
    setSupabaseUrl(config.url);
    setSupabaseKey(config.key);
  }, []);

  const handleTestConnection = async () => {
    setTestStatus({loading: true, result: null});
    const res = await testSupabaseConnection();
    setTestStatus({loading: false, result: res.message});
  };

  const fixScientific = (str: string) => {
    if (!str) return '';
    let s = String(str).toUpperCase().trim();
    if (!s.includes('E+')) return s;
    try {
      const num = Number(s.replace(',', '.'));
      if (!isNaN(num)) {
        return BigInt(Math.round(num)).toString();
      }
    } catch (e) {
      return s;
    }
    return s;
  };

  /**
   * Mengonversi string ke Number atau null.
   * Sangat penting mengirimkan null alih-alih "" untuk kolom bertipe numeric di PostgreSQL.
   */
  const cleanNumeric = (val: any): number | null => {
    if (val === undefined || val === null || val === '') return null;
    let str = String(val).trim();
    if (str === '') return null;
    
    // Hapus karakter non-numerik kecuali pemisah (titik/koma) dan minus
    str = str.replace(/[^0-9,.-]/g, '');

    const lastComma = str.lastIndexOf(',');
    const lastDot = str.lastIndexOf('.');
    
    if (lastComma > lastDot) {
      // Format Indonesia: ribuan titik, desimal koma (1.234,56)
      str = str.replace(/\./g, '').replace(',', '.');
    } else if (lastDot > lastComma) {
      // Format Internasional: ribuan koma, desimal titik (1,234.56)
      str = str.replace(/,/g, '');
    } else {
      // Hanya satu jenis pemisah atau tidak ada sama sekali
      str = str.replace(',', '.');
    }

    const parsed = parseFloat(str);
    return isNaN(parsed) ? null : parsed;
  };

  const parseCSV = async (text: string, isPreview: boolean = false): Promise<any[]> => {
    const lines = text.trim().split(/\r?\n/);
    if (lines.length < 1) return [];

    const firstLine = lines[0].replace(/^\uFEFF/, '');
    const delimiter = firstLine.includes(';') ? ';' : ',';
    const headers = firstLine.split(delimiter).map(h => h.replace(/"/g, '').trim().toUpperCase());
    
    const result = [];
    const limit = isPreview ? Math.min(6, lines.length) : lines.length;
    const detectedMappedKeys: string[] = [];

    for (let i = 1; i < limit; i++) {
      const vals = lines[i].split(new RegExp(`${delimiter}(?=(?:(?:[^"]*"){2})*[^"]*$)`)).map(v => v.trim().replace(/"/g, ''));
      const obj: any = {};
      
      headers.forEach((h, idx) => {
        let key = h.toLowerCase().replace(/\s+/g, '_');
        
        // Cerdas mapping berdasarkan substring
        if (h === "IDPEL" || h.includes("ID PEL")) key = "idpel";
        else if (h.includes("NAMA")) key = "nama";
        else if (h.includes("UNIT")) key = "unit";
        else if (h.includes("PETUGAS") || h.includes("PEGAWAI")) key = "petugas";
        else if (h.includes("ALAMAT")) key = "alamat";
        else if (h.includes("BLTH")) key = "blth";
        else if (h.includes("KOORDINAT X") || h === "LONGITUDE" || h === "LONG") key = "longitude";
        else if (h.includes("KOORDINAT Y") || h === "LATITUDE" || h === "LAT") key = "latitude";
        else if (h === "VOLT" || h === "TEGANGAN") key = "tegangan";
        else if (h === "AMP" || h === "ARUS") key = "arus";
        else if (h.includes("COSPHI")) key = "cosphi";
        else if (h === "SISA KWH" || h === "SISA") key = "sisa_kwh";
        else if (h.includes("KWH KUM") || h.includes("KUMULATIF")) key = "kwh_kumulatif";
        else if (h.includes("TEMPER")) key = "temper";
        else if (h.includes("NO METER")) key = "no_meter";
        else if (h === "TARIF") key = "tarif";
        else if (h === "DAYA" || h === "VA") key = "daya";
        else if (h.includes("POWER LIMIT") || h === "LIMIT") key = "power_limit";
        else if (h.includes("TARIF INDEX") || h === "INDEX") key = "tarif_index";
        else if (h.includes("RBM")) key = "kode_rbm";
        else if (h.includes("TERMINAL")) key = "jml_terminal";

        if (ALLOWED_COLUMNS.includes(key)) {
          if (i === 1 && !detectedMappedKeys.includes(key)) detectedMappedKeys.push(key);
          let val = vals[idx] || '';
          
          if (key === 'idpel') {
            val = fixScientific(val);
          }
          
          if (NUMERIC_COLUMNS.includes(key)) {
            obj[key] = cleanNumeric(val);
          } else {
            obj[key] = val;
          }
        }
      });

      // Sinkronisasi Daya vs Power Limit secara cerdas tanpa memaksa ke string
      if ((obj.daya === null || obj.daya === undefined) && obj.power_limit !== null) {
        obj.daya = obj.power_limit;
      }
      if ((obj.power_limit === null || obj.power_limit === undefined) && obj.daya !== null) {
        obj.power_limit = obj.daya;
      }

      if (obj.idpel) result.push(obj);
    }

    if (isPreview) setMappedColumns(detectedMappedKeys);
    return result;
  };

  useEffect(() => {
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const text = e.target?.result as string;
        const data = await parseCSV(text, true);
        setPreviewData(data);
      };
      reader.readAsText(file);
    } else {
      setPreviewData([]);
      setMappedColumns([]);
    }
  }, [file]);

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setStatus({ type: null, message: '' });
    
    try {
      const text = await file.text();
      const rawData = await parseCSV(text, false);
      
      if (rawData.length === 0) throw new Error('Kolom IDPEL tidak ditemukan atau file kosong.');

      // De-duplikasi IDPEL
      const uniqueDataMap = new Map();
      rawData.forEach(item => {
        uniqueDataMap.set(item.idpel, item);
      });
      const allData = Array.from(uniqueDataMap.values());
      const duplicateCount = rawData.length - allData.length;
      
      const chunkSize = 500;
      const total = Math.ceil(allData.length / chunkSize);
      setUploadProgress({ current: 0, total });

      for (let i = 0; i < allData.length; i += chunkSize) {
        const chunk = allData.slice(i, i + chunkSize);
        const res = await uploadToSupabase(chunk);
        if (!res.success) throw new Error(res.message);
        setUploadProgress(prev => ({ ...prev, current: prev.current + 1 }));
      }

      setStatus({ 
        type: 'success', 
        message: `Sinkron Berhasil: ${allData.length} data.${duplicateCount > 0 ? ` (${duplicateCount} duplikat dibuang)` : ''}` 
      });
      setFile(null);
      onRefreshData();
    } catch (err: any) {
      setStatus({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  const isCompatible = useMemo(() => mappedColumns.includes('idpel'), [mappedColumns]);

  return (
    <div className="bg-white border-2 border-slate-300 rounded-2xl flex flex-col h-full shadow-2xl overflow-hidden">
      <div className="bg-slate-900 p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-all"><ArrowLeft size={20} /></button>
          <h2 className="text-sm font-black text-white uppercase tracking-widest leading-none italic flex items-center gap-2">
            <Zap className="text-emerald-500" size={18} /> MESIN CLOUD SUPABASE
          </h2>
        </div>
        <div className="flex bg-slate-800 p-1 rounded-xl">
          <button onClick={() => setActiveTab('INPUT')} className={`px-5 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${activeTab === 'INPUT' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400'}`}>SINKRONISASI</button>
          <button onClick={() => setActiveTab('SETTING')} className={`px-5 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${activeTab === 'SETTING' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400'}`}>PENGATURAN</button>
        </div>
      </div>

      <div className="flex-1 p-6 overflow-auto bg-slate-50">
        {activeTab === 'SETTING' ? (
          !isSettingAuth ? (
            <div className="flex justify-center py-20">
              <form onSubmit={(e) => { e.preventDefault(); passInput === SETTING_TAB_PASSWORD ? setIsSettingAuth(true) : alert('Salah'); }} className="bg-white p-8 rounded-3xl border-2 border-slate-200 shadow-xl w-full max-sm space-y-4">
                <input type="password" value={passInput} onChange={(e)=>setPassInput(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 text-center font-black focus:border-emerald-500 outline-none" placeholder="PASSWORD" />
                <button type="submit" className="w-full py-4 bg-slate-900 text-white rounded-xl font-black uppercase tracking-widest text-[10px]">VERIFIKASI</button>
              </form>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto space-y-4">
               <div className="bg-white p-6 border-2 border-slate-200 rounded-2xl space-y-4">
                  <h3 className="text-xs font-black uppercase flex items-center gap-2 text-indigo-700"><Settings size={14}/> Konfigurasi Database</h3>
                  <input type="text" value={supabaseUrl} onChange={(e)=>setSupabaseUrl(e.target.value)} placeholder="URL Supabase" className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 text-xs font-mono" />
                  <input type="password" value={supabaseKey} onChange={(e)=>setSupabaseKey(e.target.value)} placeholder="API Key Supabase" className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 text-xs font-mono" />
                  <button onClick={() => { setSupabaseConfig({ url: supabaseUrl, key: supabaseKey }); alert('Berhasil Disimpan'); }} className="w-full py-3 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase">Simpan Konfigurasi</button>
               </div>
            </div>
          )
        ) : (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className={`bg-white border-4 border-dashed rounded-3xl p-8 flex flex-col items-center gap-4 transition-all ${file ? 'border-emerald-500 bg-emerald-50/10' : 'border-slate-200'}`}>
              <div className={`p-6 rounded-full ${file ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-300'}`}><FileUp size={40} /></div>
              <div className="text-center">
                <p className="text-sm font-black uppercase text-slate-900">{file ? file.name : 'UNGGAH FILE CSV'}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Presisi IDPEL 12 digit akan dipertahankan</p>
              </div>
              <input type="file" accept=".csv" onChange={(e)=>setFile(e.target.files?.[0] || null)} className="hidden" id="admin-csv-upload" />
              <label htmlFor="admin-csv-upload" className="px-8 py-3 bg-slate-900 text-white text-[10px] font-black uppercase rounded-xl cursor-pointer">CARI FILE</label>
            </div>

            {file && (
              <div className="bg-white border-2 border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="bg-slate-50 p-3 border-b border-slate-200 flex items-center justify-between">
                  <h4 className="text-[10px] font-black uppercase text-slate-500 flex items-center gap-2"><Table size={14}/> Pratinjau Data CSV</h4>
                  <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase flex items-center gap-1.5 ${isCompatible ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                    {isCompatible ? <Check size={10}/> : <AlertCircle size={10}/>}
                    {isCompatible ? 'Siap Sinkron ke Cloud' : 'IDPEL Tidak Ditemukan'}
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-100 text-[8px] font-black uppercase text-slate-400">
                      <tr>
                        {['idpel', 'nama', 'unit', 'daya', 'petugas', 'latitude'].map(col => (
                          <th key={col} className="px-4 py-3 border-r border-slate-200">{col}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="text-[10px] font-bold">
                      {previewData.map((row, idx) => (
                        <tr key={idx} className="border-b border-slate-100">
                          <td className="px-4 py-2 font-mono text-indigo-600 tracking-normal">{row.idpel}</td>
                          <td className="px-4 py-2 uppercase truncate max-w-[150px]">{row.nama}</td>
                          <td className="px-4 py-2 uppercase">{row.unit}</td>
                          <td className="px-4 py-2 font-black text-slate-900">{row.daya}</td>
                          <td className="px-4 py-2 uppercase italic text-slate-400">{row.petugas}</td>
                          <td className="px-4 py-2 text-slate-500">{row.latitude}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {loading && (
              <div className="bg-white border-2 border-emerald-100 rounded-2xl p-5 space-y-3">
                 <div className="flex justify-between text-[10px] font-black uppercase text-emerald-700">
                    <span className="flex items-center gap-2 animate-pulse">SINKRONISASI AKTIF...</span>
                    <span>{uploadProgress.current}/{uploadProgress.total} BATCH</span>
                 </div>
                 <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full transition-all duration-300" style={{width: `${(uploadProgress.current/uploadProgress.total)*100}%`}}></div>
                 </div>
              </div>
            )}

            {status.type && (
              <div className={`p-4 rounded-xl border-2 flex items-center gap-4 animate-in slide-in-from-bottom-2 ${status.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-rose-50 border-rose-100 text-rose-700'}`}>
                {status.type === 'success' ? <CheckCircle2 size={24} /> : <AlertTriangle size={24} />}
                <p className="text-[10px] font-black uppercase italic">{status.message}</p>
              </div>
            )}

            <button 
              disabled={!file || !isCompatible || loading} 
              onClick={handleUpload} 
              className={`w-full py-5 rounded-2xl flex items-center justify-center gap-4 text-xs font-black uppercase transition-all ${!file || !isCompatible || loading ? 'bg-slate-200 text-slate-400' : 'bg-emerald-600 text-white shadow-xl hover:bg-emerald-700'}`}
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <Database size={20} />}
              {loading ? 'MEMPROSES...' : 'KIRIM KE SUPABASE CLOUD'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
