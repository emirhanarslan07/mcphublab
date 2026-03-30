import { createClient } from '@supabase/supabase-js';
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const securitySeeds = [
  {
    slug: 'filesystem',
    data: {
      risk_level: 'HIGH',
      supports_scoping: true,
      what_it_does: "Yapay zeka ajanınızın doğrudan bilgisayarınızdaki dosyalara erişmesini ve işlem yapmasını sağlar.",
      what_it_accesses: [
        "Tüm diskteki dosyaları okuyabilir",
        "Dosya içeriğini değiştirebilir veya silebilir",
        "Yeni dosyalar oluşturabilir",
        "Kullanıcı şifreleri (.env, .ssh) gibi hassas dosyalara erişebilir"
      ],
      worst_case_scenario: "Bir ajan yanlışlıkla veya saldırı altında tüm önemli belgelerinizi silebilir veya gizli anahtarlarınızı internete sızdırabilir.",
      recommendation: "Asla tüm diske erişim vermeyin. Sadece üzerinde çalıştığınız belirli bir klasöre erişim izni tanıyın.",
      safe_install_command: "npx @modelcontextprotocol/server-filesystem /kullanici/belgelerim/proje",
      unsafe_install_command: "npx @modelcontextprotocol/server-filesystem",
      scope_guide: "Komutun sonuna sadece erişilmesini istediğiniz klasörün yolunu ekleyerek güvenliği sağlayın."
    }
  },
  {
    slug: 'postgres',
    data: {
      risk_level: 'MEDIUM',
      supports_scoping: true,
      what_it_does: "Yapay zekanın veritabanınızdaki verileri okumasına ve sorgulamasına imkan tanır.",
      what_it_accesses: [
        "Tüm tabloları ve verileri okuyabilir",
        "Verileri silebilir veya güncelleyebilir",
        "Yeni tablolar oluşturabilir"
      ],
      worst_case_scenario: "Ajan veritabanındaki tüm müşteri verilerini silebilir veya yanlışlıkla veritabanı şemasını bozabilir.",
      recommendation: "Bağlantı için sadece 'Okuma' (Read-only) yetkisi olan özel bir veritabanı kullanıcısı oluşturun.",
      safe_install_command: "DATABASE_URL=postgres://readonly_user:password@host:5432/mydb npx ...",
      unsafe_install_command: "DATABASE_URL=postgres://admin:password@host:5432/mydb npx ...",
      scope_guide: "Sadece belirli tablolara erişimi olan bir kullanıcı tanımlayarak riski minimize edin."
    }
  },
  {
      slug: 'slack',
      data: {
        risk_level: 'MEDIUM',
        supports_scoping: false,
        what_it_does: "Yapay zekanın Slack kanallarınıza mesaj göndermesine ve okumasına izin verir.",
        what_it_accesses: [
          "Kanallardaki tüm mesajlaşmaları okuyabilir",
          "Sizin adınıza mesaj gönderebilir",
          "Dosya paylaşımlarını görebilir"
        ],
        worst_case_scenario: "Gizli şirket içi konuşmalar ajan tarafından okunabilir veya ajan yetkisiz bir kanala yanlışlıkla mesaj atabilir.",
        recommendation: "MCP'yi sadece kısıtlı bir çalışma alanına (workspace) bağlayın ve hassas kanallara erişimi manuel kısıtlayın.",
        safe_install_command: "SLACK_BOT_TOKEN=xoxb-... npx @modelcontextprotocol/server-slack",
        unsafe_install_command: "SLACK_WORKSPACE_TOKEN=... npx ...",
        scope_guide: "Slack uygulama ayarlarından sadece belirli kanallar için izin (Scope) tanımlayın."
      }
    }
];

async function seedSecurity() {
  console.log('🛡️ Seeding Security Guides...');
  
  for (const seed of securitySeeds) {
    // Find the server ID
    const { data: server } = await supabase
      .from('mcp_servers')
      .select('id')
      .or(`name.ilike.%/${seed.slug},name.ilike.%/${seed.slug}-mcp,name.ilike.%/server-${seed.slug}`)
      .limit(1)
      .single();
    
    if (server) {
      console.log(`✅ Found server: ${seed.slug} (${server.id})`);
      
      // Update the server's cache columns first
      await supabase.from('mcp_servers').update({
        current_risk_level: seed.data.risk_level,
        supports_scoping: seed.data.supports_scoping
      }).eq('id', server.id);

      // Now insert into server_scopes
      const { error } = await supabase
        .from('server_scopes')
        .upsert({
          server_id: server.id,
          ...seed.data
        }, { onConflict: 'server_id' });
        
      if (error) {
        console.log(`  ❌ Failed to seed scope for ${seed.slug}:`, error.message);
      } else {
        console.log(`  🚀 Seeded scope for ${seed.slug}`);
      }
    } else {
      console.log(`  ⚠️ Server not found in DB: ${seed.slug}`);
    }
  }
}

seedSecurity();
