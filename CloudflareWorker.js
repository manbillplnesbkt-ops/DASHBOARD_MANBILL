
/**
 * CLOUDFLARE WORKER SCRIPT FOR LPB DASHBOARD (UNLIMITED DATA ENGINE)
 * Versi 6.0 - Auto-Pagination untuk Dataset Besar (>100k)
 */

export default {
  async fetch(request, env) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);

    // Endpoint: Test Connection
    if (url.searchParams.has("ping")) {
      return new Response(JSON.stringify({ status: "online", database: "D1 Ready" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Endpoint: GET Data (UNLIMITED - Menggunakan Internal Loop)
    if (request.method === "GET") {
      try {
        let allResults = [];
        let offset = 0;
        const limit = 10000; // Batas aman per query D1
        let hasMore = true;

        // Loop untuk mengambil seluruh record tanpa batas
        while (hasMore) {
          const { results } = await env.DB.prepare(
            `SELECT * FROM lpb_data LIMIT ? OFFSET ?`
          ).bind(limit, offset).all();

          if (results && results.length > 0) {
            allResults = allResults.concat(results);
            offset += limit;
            
            // Jika hasil kurang dari limit, berarti ini batch terakhir
            if (results.length < limit) {
              hasMore = false;
            }
          } else {
            hasMore = false;
          }
          
          // Safety break untuk mencegah infinite loop jika ada error database
          if (offset > 500000) break; 
        }
        
        return new Response(JSON.stringify(allResults), {
          headers: { 
            ...corsHeaders, 
            "Content-Type": "application/json",
            "Cache-Control": "no-cache" 
          },
        });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { 
          status: 500, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        });
      }
    }

    // Endpoint: POST Upload Bulk
    if (request.method === "POST") {
      try {
        const body = await request.json();
        if (body.action === "UPLOAD_BULK") {
          const data = body.payload;
          
          const statements = data.map(item => {
            return env.DB.prepare(`
              INSERT OR REPLACE INTO lpb_data 
              (idpel, nama, unit, alamat, petugas, latitude, longitude, validasi, tegangan, arus, cosphi, indikator, temper, blth, waktu_jam, no_meter, tarif, daya, kode_rbm, tarif_index, power_limit, kwh_kumulatif, sisa_kwh, tutup_meter, segel, lcd, keypad, jml_terminal, indi_temper, relay)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `).bind(
              String(item.idpel || ''), 
              String(item.nama || ''), 
              String(item.unit || ''), 
              String(item.alamat || ''), 
              String(item.petugas || ''),
              Number(item.latitude || 0), 
              Number(item.longitude || 0), 
              String(item.validasi || ''), 
              String(item.tegangan || ''), 
              String(item.arus || ''),
              String(item.cosphi || ''), 
              String(item.indikator || ''), 
              String(item.temper || ''),
              String(item.blth || ''),
              String(item.waktu_jam || ''),
              String(item.no_meter || ''),
              String(item.tarif || ''),
              String(item.daya || ''),
              String(item.kode_rbm || ''),
              String(item.tarif_index || ''),
              String(item.power_limit || ''),
              String(item.kwh_kumulatif || ''),
              String(item.sisa_kwh || ''),
              String(item.tutup_meter || ''),
              String(item.segel || ''),
              String(item.lcd || ''),
              String(item.keypad || ''),
              String(item.jml_terminal || ''),
              String(item.indi_temper || ''),
              String(item.relay || '')
            );
          });

          await env.DB.batch(statements);
          return new Response(JSON.stringify({ success: true, count: data.length }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { 
          status: 500, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        });
      }
    }

    return new Response("LPB API Engine V6.0 UNLIMITED", { status: 200, headers: corsHeaders });
  }
};
