import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log('🚀 Starting Use Case Seeding...');

  // 1. Create Table (This might fail if already exists, but we'll try)
  // Note: supabase-js doesn't have a 'create table' method directly.
  // We'll assume the user might have run the migration manually or we'll use an RPC if available.
  // Actually, I'll just try to insert. If it fails, I'll know the table is missing.

  const serversToSeed = [
    { name: 'filesystem', use_cases: [
      { uc: 'Dosyalarımı okumak ve düzenlemek', desc: 'Bilgisayarınızdaki dosyaları okuma, yazma, taşıma ve silme', keys: ['dosya','file','read','write','edit','oku','yaz','düzenle','klasör','folder'] },
      { uc: 'Proje dosyalarımı yönetmek', desc: 'Kod projenizdeki dosyaları organize etme', keys: ['proje','project','kod','code','yazılım','software','manage'] },
      { uc: 'Log dosyalarını analiz etmek', desc: 'Sunucu veya uygulama loglarını okuma ve analiz etme', keys: ['log','analiz','analyze','hata','error','debug'] }
    ]},
    { name: 'postgres', use_cases: [
      { uc: 'Veritabanından veri çekmek', desc: 'PostgreSQL veritabanından sorgu çalıştırma', keys: ['veritabanı','database','sorgu','query','sql','veri','data','çek','fetch'] },
      { uc: 'Müşteri bilgilerini listelemek', desc: 'Veritabanından müşteri kayıtlarını getirme', keys: ['müşteri','customer','kayıt','record','liste','list'] }
    ]},
    { name: 'slack', use_cases: [
      { uc: 'Slack mesajlarımı okumak', desc: 'Slack kanallarındaki mesajları görüntüleme', keys: ['slack','read','kanal','channel','sohbet','chat'] },
      { uc: 'Birine mesaj göndermek', desc: 'Slack üzerinden mesaj yazma ve gönderme', keys: ['mesaj gönder','send message','yaz','write','gönder','send','dm','özel mesaj'] }
    ]},
    { name: 'github', use_cases: [
      { uc: 'GitHub issue oluşturmak', desc: 'GitHub projenizde yeni hata veya görev oluşturma', keys: ['github','issue','hata','bug','görev','task','oluştur','create'] },
      { uc: 'Kod incelemesi yapmak', desc: 'Pull request kontrol etme ve yorum yazma', keys: ['kod incele','code review','pull request','pr','review','inceleme'] }
    ]},
    { name: 'google-drive', use_cases: [
      { uc: 'Google Drive dosyalarımı bulmak', desc: 'Drive daki dosyaları arama ve görüntüleme', keys: ['google drive','drive','dosya','file','bul','find','ara','search','sunum','presentation','doküman','document'] }
    ]},
    { name: 'notion', use_cases: [
      { uc: 'Notion sayfalarımı okumak', desc: 'Notion workspace inizdeki sayfaları görüntüleme', keys: ['notion','sayfa','page','oku','read','not','note','wiki','dokümantasyon','documentation'] },
      { uc: 'Görev listemi yönetmek', desc: 'Notion daki görev ve projeleri takip etme', keys: ['görev','task','todo','yapılacak','proje','project','takip','track','yönet','manage'] }
    ]},
    { name: 'puppeteer', use_cases: [
      { uc: 'Web sayfasını scrape etmek', desc: 'İnternet sitelerinden veri çekme', keys: ['web','scrape','kazı','çek','fetch','internet','site','sayfa','page','veri çek','data extraction'] },
      { uc: 'Web sayfasının ekran görüntüsünü almak', desc: 'Bir sitenin fotoğrafını çekme', keys: ['ekran görüntüsü','screenshot','fotoğraf','photo','capture','yakala'] }
    ]},
    { name: 'sqlite', use_cases: [
      { uc: 'Yerel veritabanında sorgu çalıştırmak', desc: 'Bilgisayarınızdaki SQLite veritabanını kullanma', keys: ['sqlite','yerel','local','veritabanı','database','sorgu','query'] }
    ]},
    { name: 'stripe', use_cases: [
      { uc: 'Ödeme işlemlerini kontrol etmek', desc: 'Stripe hesabınızdaki ödemeleri görüntüleme', keys: ['ödeme','payment','stripe','fatura','invoice','abone','subscription','gelir','revenue'] }
    ]},
    { name: 'memory', use_cases: [
      { uc: 'AI ajanıma hafıza vermek', desc: 'Yapay zekanın önceki konuşmaları hatırlamasını sağlama', keys: ['hafıza','memory','hatırla','remember','bağlam','context','geçmiş','history','kişisel','personal'] }
    ]},
    { name: 'time', use_cases: [
      { uc: 'Saat dilimi dönüşümü yapmak', desc: 'Farklı saat dilimleri arasında hesaplama', keys: ['saat','time','dilim','timezone','dönüşüm','conversion','zaman','clock'] }
    ]},
    { name: 'brave-search', use_cases: [
      { uc: 'İnternette arama yapmak', desc: 'Web de bilgi arama', keys: ['ara','search','internet','web','google','bul','find','bilgi','information','haber','news'] }
    ]}
  ];

  for (const s of serversToSeed) {
    const { data: server } = await supabase
      .from('mcp_servers')
      .select('id')
      .ilike('name', `%${s.name}%`)
      .limit(1)
      .single();

    if (server) {
      console.log(`✅ Found server: ${s.name} (${server.id})`);
      for (const uc of s.use_cases) {
        const { error } = await supabase.from('server_use_cases').insert({
          server_id: server.id,
          use_case: uc.uc,
          description: uc.desc,
          keywords: uc.keys,
          language: 'tr'
        });
        if (error) {
          console.error(`❌ Error inserting use case for ${s.name}:`, error.message);
        } else {
          console.log(`   - Seeded: ${uc.uc}`);
        }
      }
    } else {
      console.warn(`⚠️ Server not found: ${s.name}`);
    }
  }

  console.log('🏁 Seeding Complete!');
}

seed();
