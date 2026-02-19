
/**
 * CLOUDFLARE WORKER SCRIPT - DEACTIVATED
 * Script ini tidak lagi melayani permintaan data. 
 * Sistem telah dialihkan ke infrastruktur Supabase.
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

    return new Response(JSON.stringify({ 
      status: "deactivated", 
      message: "Worker service is currently disabled. System migrated to Supabase Engine v7.5." 
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
};
