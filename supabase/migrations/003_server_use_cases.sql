-- Step 1: Create Table
CREATE TABLE IF NOT EXISTS server_use_cases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  server_id UUID REFERENCES mcp_servers(id) ON DELETE CASCADE,
  use_case TEXT NOT NULL,
  description TEXT,
  keywords TEXT[] DEFAULT '{}',
  language TEXT DEFAULT 'en',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: Create Indexes
CREATE INDEX IF NOT EXISTS idx_usecases_keywords ON server_use_cases USING gin(keywords);
CREATE INDEX IF NOT EXISTS idx_usecases_server ON server_use_cases(server_id);

-- Step 3: Seed Data (Using Name/Slug matching logic)
-- We'll use a temporary mapping logic or direct inserts if we know the names

DO $$ 
DECLARE 
    fs_id UUID;
    pg_id UUID;
    slack_id UUID;
    gh_id UUID;
    drive_id UUID;
    notion_id UUID;
    pup_id UUID;
    sqlite_id UUID;
    stripe_id UUID;
    mem_id UUID;
    time_id UUID;
    brave_id UUID;
BEGIN
    -- Resolve IDs
    SELECT id INTO fs_id FROM mcp_servers WHERE name ILIKE '%filesystem%' LIMIT 1;
    SELECT id INTO pg_id FROM mcp_servers WHERE name ILIKE '%postgres%' LIMIT 1;
    SELECT id INTO slack_id FROM mcp_servers WHERE name ILIKE '%slack%' LIMIT 1;
    SELECT id INTO gh_id FROM mcp_servers WHERE name ILIKE '%github%' LIMIT 1;
    SELECT id INTO drive_id FROM mcp_servers WHERE name ILIKE '%google-drive%' LIMIT 1;
    SELECT id INTO notion_id FROM mcp_servers WHERE name ILIKE '%notion%' LIMIT 1;
    SELECT id INTO pup_id FROM mcp_servers WHERE name ILIKE '%puppeteer%' LIMIT 1;
    SELECT id INTO sqlite_id FROM mcp_servers WHERE name ILIKE '%sqlite%' LIMIT 1;
    SELECT id INTO stripe_id FROM mcp_servers WHERE name ILIKE '%stripe%' LIMIT 1;
    SELECT id INTO mem_id FROM mcp_servers WHERE name ILIKE '%memory%' LIMIT 1;
    SELECT id INTO time_id FROM mcp_servers WHERE name ILIKE '%time%' LIMIT 1;
    SELECT id INTO brave_id FROM mcp_servers WHERE name ILIKE '%brave-search%' LIMIT 1;

    -- Filesystem
    IF fs_id IS NOT NULL THEN
        INSERT INTO server_use_cases (server_id, use_case, description, keywords, language) VALUES
        (fs_id, 'Dosyalarımı okumak ve düzenlemek', 'Bilgisayarınızdaki dosyaları okuma, yazma, taşıma ve silme', ARRAY['dosya','file','read','write','edit','oku','yaz','düzenle','klasör','folder'], 'tr'),
        (fs_id, 'Proje dosyalarımı yönetmek', 'Kod projenizdeki dosyaları organize etme', ARRAY['proje','project','kod','code','yazılım','software','manage'], 'tr'),
        (fs_id, 'Log dosyalarını analiz etmek', 'Sunucu veya uygulama loglarını okuma ve analiz etme', ARRAY['log','analiz','analyze','hata','error','debug'], 'tr');
    END IF;

    -- Postgres
    IF pg_id IS NOT NULL THEN
        INSERT INTO server_use_cases (server_id, use_case, description, keywords, language) VALUES
        (pg_id, 'Veritabanından veri çekmek', 'PostgreSQL veritabanından sorgu çalıştırma', ARRAY['veritabanı','database','sorgu','query','sql','veri','data','çek','fetch'], 'tr'),
        (pg_id, 'Müşteri bilgilerini listelemek', 'Veritabanından müşteri kayıtlarını getirme', ARRAY['müşteri','customer','kayıt','record','liste','list'], 'tr');
    END IF;

    -- Slack
    IF slack_id IS NOT NULL THEN
        INSERT INTO server_use_cases (server_id, use_case, description, keywords, language) VALUES
        (slack_id, 'Slack mesajlarımı okumak', 'Slack kanallarındaki mesajları görüntüleme', ARRAY['slack','read','kanal','channel','sohbet','chat'], 'tr'),
        (slack_id, 'Birine mesaj göndermek', 'Slack üzerinden mesaj yazma ve gönderme', ARRAY['mesaj gönder','send message','yaz','write','gönder','send','dm','özel mesaj'], 'tr');
    END IF;

    -- GitHub
    IF gh_id IS NOT NULL THEN
        INSERT INTO server_use_cases (server_id, use_case, description, keywords, language) VALUES
        (gh_id, 'GitHub issue oluşturmak', 'GitHub projenizde yeni hata veya görev oluşturma', ARRAY['github','issue','hata','bug','görev','task','oluştur','create'], 'tr'),
        (gh_id, 'Kod incelemesi yapmak', 'Pull request kontrol etme ve yorum yazma', ARRAY['kod incele','code review','pull request','pr','review','inceleme'], 'tr');
    END IF;

    -- Google Drive
    IF drive_id IS NOT NULL THEN
        INSERT INTO server_use_cases (server_id, use_case, description, keywords, language) VALUES
        (drive_id, 'Google Drive dosyalarımı bulmak', 'Drive daki dosyaları arama ve görüntüleme', ARRAY['google drive','drive','dosya','file','bul','find','ara','search','sunum','presentation','doküman','document'], 'tr');
    END IF;

    -- Notion
    IF notion_id IS NOT NULL THEN
        INSERT INTO server_use_cases (server_id, use_case, description, keywords, language) VALUES
        (notion_id, 'Notion sayfalarımı okumak', 'Notion workspace inizdeki sayfaları görüntüleme', ARRAY['notion','sayfa','page','oku','read','not','note','wiki','dokümantasyon','documentation'], 'tr'),
        (notion_id, 'Görev listemi yönetmek', 'Notion daki görev ve projeleri takip etme', ARRAY['görev','task','todo','yapılacak','proje','project','takip','track','yönet','manage'], 'tr');
    END IF;

    -- Puppeteer
    IF pup_id IS NOT NULL THEN
        INSERT INTO server_use_cases (server_id, use_case, description, keywords, language) VALUES
        (pup_id, 'Web sayfasını scrape etmek', 'İnternet sitelerinden veri çekme', ARRAY['web','scrape','kazı','çek','fetch','internet','site','sayfa','page','veri çek','data extraction'], 'tr'),
        (pup_id, 'Web sayfasının ekran görüntüsünü almak', 'Bir sitenin fotoğrafını çekme', ARRAY['ekran görüntüsü','screenshot','fotoğraf','photo','capture','yakala'], 'tr');
    END IF;

    -- SQLite
    IF sqlite_id IS NOT NULL THEN
        INSERT INTO server_use_cases (server_id, use_case, description, keywords, language) VALUES
        (sqlite_id, 'Yerel veritabanında sorgu çalıştırmak', 'Bilgisayarınızdaki SQLite veritabanını kullanma', ARRAY['sqlite','yerel','local','veritabanı','database','sorgu','query'], 'tr');
    END IF;

    -- Stripe
    IF stripe_id IS NOT NULL THEN
        INSERT INTO server_use_cases (server_id, use_case, description, keywords, language) VALUES
        (stripe_id, 'Ödeme işlemlerini kontrol etmek', 'Stripe hesabınızdaki ödemeleri görüntüleme', ARRAY['ödeme','payment','stripe','fatura','invoice','abone','subscription','gelir','revenue'], 'tr');
    END IF;

    -- Memory
    IF mem_id IS NOT NULL THEN
        INSERT INTO server_use_cases (server_id, use_case, description, keywords, language) VALUES
        (mem_id, 'AI ajanıma hafıza vermek', 'Yapay zekanın önceki konuşmaları hatırlamasını sağlama', ARRAY['hafıza','memory','hatırla','remember','bağlam','context','geçmiş','history','kişisel','personal'], 'tr');
    END IF;

    -- Time
    IF time_id IS NOT NULL THEN
        INSERT INTO server_use_cases (server_id, use_case, description, keywords, language) VALUES
        (time_id, 'Saat dilimi dönüşümü yapmak', 'Farklı saat dilimleri arasında hesaplama', ARRAY['saat','time','dilim','timezone','dönüşüm','conversion','zaman','clock'], 'tr');
    END IF;

    -- Brave Search
    IF brave_id IS NOT NULL THEN
        INSERT INTO server_use_cases (server_id, use_case, description, keywords, language) VALUES
        (brave_id, 'İnternette arama yapmak', 'Web de bilgi arama', ARRAY['ara','search','internet','web','google','bul','find','bilgi','information','haber','news'], 'tr');
    END IF;

END $$;
