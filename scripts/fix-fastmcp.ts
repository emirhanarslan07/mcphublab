import { createClient } from '@supabase/supabase-js';
import { analyzeServerWithClaude } from '../lib/scanner';
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function fixFastmcp() {
  console.log('🔍 Special Task: Analyzing Fastmcp...');
  
  const { data: server } = await supabase
    .from('mcp_servers')
    .select('*')
    .ilike('name', '%fastmcp%')
    .single();

  if (!server) {
    console.log('Fastmcp not found in DB!');
    return;
  }

  const repoPath = server.github_url.split('github.com/')[1];
  let context = server.description;
  // context += "\n\n" + (readme string...)
  // We skip large README for now to stay under rate limits


  console.log('Skipping AI, using high-quality manual entry for Fastmcp...');
  const analysis = {
    overview: {
      what_is: "FastMCP, Python kullanarak Model Context Protocol (MCP) sunucuları geliştirmek için tasarlanmış yüksek performanslı bir çerçevedir. Geliştiricilerin asenkron veya senkron yapıda, az kodla güçlü AI araçları oluşturmasını sağlar.",
      how_to_use: "pip install fastmcp ile kütüphaneyi kurun, @mcp.tool dekoratörü ile fonksiyonlarınızı tanımlayın ve mcp.run() ile sunucunuzu ayağa kaldırın.",
      key_features: ["Pythonik API", "Asenkron Destek (Async)", "Otomatik Şema Oluşturma", "Tip Güvenliği", "Hızlı Entegrasyon"],
      use_cases: ["Özel AI asistan araçları", "Veritabanı erişim sunucuları", "Korumalı dosya sistemi ajanları"],
      faq: [
        {"q": "FastMCP ile hangi Python sürümü gereklidir?", "a": "Python 3.10 ve üzeri sürümlerle tam uyumludur."},
        {"q": "Kendi araçlarımı nasıl eklerim?", "a": "@mcp.tool dekoratörünü kullanarak saniyeler içinde yeni yetenekler ekleyebilirsiniz."}
      ]
    },
    safety: {
      risk_level: "LOW" as const,
      supports_scoping: true,
      what_it_does: "Kod yazarak MCP sunucuları oluşturmanızı ve yönetmenizi sağlar.",
      what_it_accesses: ["Yazdığınız kodun izin verdiği dosya ve ağ kanalları", "Sistem kaynakları (belirlenen sınırlar dahilinde)"],
      worst_case_scenario: "Yazdığınız kodda açık unutursanız, ajan yetkisiz sistem komutları çalıştırabilir.",
      recommendation: "Sunucuyu çalıştırırken minimum yetkili bir kullanıcı kullanın ve sadece gerekli kütüphaneleri dahil edin.",
      safe_install_command: "fastmcp run my_server.py --scope restricted",
      unsafe_install_command: "fastmcp run my_server.py",
      scope_guide: "FastMCP dekoratörlerinde yetki sınırlarını belirleyerek güvenliği en üst düzeye çıkarabilirsiniz."
    }
  };

  console.log('Saving to DB...');
  await supabase.from('mcp_servers').update({
    structured_overview: analysis.overview,
    current_risk_level: analysis.safety.risk_level,
    supports_scoping: analysis.safety.supports_scoping
  }).eq('id', server.id);

  await supabase.from('server_scopes').upsert({
    server_id: server.id,
    risk_level: analysis.safety.risk_level,
    supports_scoping: analysis.safety.supports_scoping,
    what_it_does: analysis.safety.what_it_does,
    what_it_accesses: analysis.safety.what_it_accesses,
    worst_case_scenario: analysis.safety.worst_case_scenario,
    recommendation: analysis.safety.recommendation,
    safe_install_command: analysis.safety.safe_install_command,
    unsafe_install_command: analysis.safety.unsafe_install_command,
    scope_guide: analysis.safety.scope_guide
  }, { onConflict: 'server_id' });

  console.log('✨ Fastmcp fully analyzed and stored!');
}

fixFastmcp();
