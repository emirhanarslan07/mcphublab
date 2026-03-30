-- ============================================
-- MCPHub Veritabanı Şeması v1.0
-- Supabase (PostgreSQL) üzerinde çalışır
-- ============================================

-- Uzantıları etkinleştir
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- Fuzzy text search için

-- 1. MCP Sunucuları (Ana Tablo)
CREATE TABLE mcp_servers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  github_url TEXT UNIQUE,
  description TEXT,
  long_description TEXT,
  author TEXT,
  author_url TEXT,
  homepage_url TEXT,
  license TEXT,
  stars INTEGER DEFAULT 0,
  forks INTEGER DEFAULT 0,
  open_issues INTEGER DEFAULT 0,
  watchers INTEGER DEFAULT 0,
  category TEXT,
  subcategory TEXT,
  tags TEXT[] DEFAULT '{}',
  language TEXT,
  install_command TEXT,
  npm_package TEXT,
  docker_image TEXT,
  trust_score DECIMAL(3,1) DEFAULT 0,
  risk_level TEXT DEFAULT 'unscanned' CHECK (risk_level IN ('unscanned', 'low', 'medium', 'high', 'critical')),
  is_verified BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'deprecated', 'archived', 'removed')),
  source TEXT DEFAULT 'github' CHECK (source IN ('github', 'smithery', 'manual', 'community')),
  github_created_at TIMESTAMP WITH TIME ZONE,
  github_updated_at TIMESTAMP WITH TIME ZONE,
  last_commit_date TIMESTAMP WITH TIME ZONE,
  last_crawled_at TIMESTAMP WITH TIME ZONE,
  last_scanned_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Güvenlik Raporları
CREATE TABLE security_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  server_id UUID REFERENCES mcp_servers(id) ON DELETE CASCADE,
  overall_score DECIMAL(3,1) NOT NULL,
  risk_level TEXT NOT NULL CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  prompt_injection_score DECIMAL(3,1),
  data_exfiltration_score DECIMAL(3,1),
  permission_scope_score DECIMAL(3,1),
  dependency_risk_score DECIMAL(3,1),
  code_quality_score DECIMAL(3,1),
  findings JSONB DEFAULT '[]',
  summary TEXT,
  recommendations TEXT[],
  scanner_version TEXT DEFAULT 'v1.0',
  model_used TEXT DEFAULT 'claude-sonnet-4-20250514',
  tokens_used INTEGER,
  scan_duration_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tarama Kuyruğu
CREATE TABLE scan_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  server_id UUID REFERENCES mcp_servers(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  priority INTEGER DEFAULT 5,
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  last_error TEXT,
  scheduled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Veri Toplama Logları
CREATE TABLE crawl_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('running', 'completed', 'failed')),
  servers_found INTEGER DEFAULT 0,
  servers_new INTEGER DEFAULT 0,
  servers_updated INTEGER DEFAULT 0,
  servers_failed INTEGER DEFAULT 0,
  error_details JSONB,
  duration_ms INTEGER,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- 5. Kullanıcılar
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'developer', 'enterprise')),
  plan_started_at TIMESTAMP WITH TIME ZONE,
  plan_expires_at TIMESTAMP WITH TIME ZONE,
  lemon_squeezy_customer_id TEXT,
  lemon_squeezy_subscription_id TEXT,
  email_notifications BOOLEAN DEFAULT TRUE,
  theme TEXT DEFAULT 'dark',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Kurumsal Organizasyonlar
CREATE TABLE enterprise_orgs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  owner_id UUID REFERENCES users(id),
  default_policy TEXT DEFAULT 'allow_verified_only',
  min_trust_score DECIMAL(3,1) DEFAULT 7.0,
  sso_enabled BOOLEAN DEFAULT FALSE,
  sso_provider TEXT,
  sso_config JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Kurumsal Beyaz Liste
CREATE TABLE org_whitelists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES enterprise_orgs(id) ON DELETE CASCADE,
  server_id UUID REFERENCES mcp_servers(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('approved', 'rejected', 'pending', 'revoked')),
  approved_by UUID REFERENCES users(id),
  approval_note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(org_id, server_id)
);

-- 8. Denetim Kayıtları
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES enterprise_orgs(id),
  action TEXT NOT NULL,
  actor_id UUID REFERENCES users(id),
  target_type TEXT,
  target_id TEXT,
  details JSONB,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Maliyet Takibi
CREATE TABLE analysis_costs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  model TEXT NOT NULL,
  total_requests INTEGER DEFAULT 0,
  total_tokens_input INTEGER DEFAULT 0,
  total_tokens_output INTEGER DEFAULT 0,
  total_cost_usd DECIMAL(8,4) DEFAULT 0,
  UNIQUE(date, model)
);

-- İNDEKSLER
CREATE INDEX idx_servers_name_trgm ON mcp_servers USING gin (name gin_trgm_ops);
CREATE INDEX idx_servers_category ON mcp_servers (category);
CREATE INDEX idx_servers_stars ON mcp_servers (stars DESC);
CREATE INDEX idx_servers_trust_score ON mcp_servers (trust_score DESC);
CREATE INDEX idx_servers_verified ON mcp_servers (is_verified) WHERE is_verified = TRUE;
CREATE INDEX idx_servers_status ON mcp_servers (status);
CREATE INDEX idx_servers_last_scanned ON mcp_servers (last_scanned_at);
CREATE INDEX idx_reports_server ON security_reports (server_id);
CREATE INDEX idx_reports_score ON security_reports (overall_score DESC);
CREATE INDEX idx_reports_created ON security_reports (created_at DESC);
CREATE INDEX idx_queue_status ON scan_queue (status, priority);
CREATE INDEX idx_queue_scheduled ON scan_queue (scheduled_at) WHERE status = 'pending';
CREATE INDEX idx_whitelist_org ON org_whitelists (org_id, status);
CREATE INDEX idx_audit_org ON audit_logs (org_id, created_at DESC);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

ALTER TABLE mcp_servers ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_whitelists ENABLE ROW LEVEL SECURITY;

-- Servers: Herkes okuyabilir, sadece service_role yazabilir
CREATE POLICY "Public read ON mcp_servers" ON mcp_servers FOR SELECT USING (true);
CREATE POLICY "Service role write ON mcp_servers" ON mcp_servers FOR INSERT WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "Service role update ON mcp_servers" ON mcp_servers FOR UPDATE USING (auth.role() = 'service_role');

-- Reports: Herkes okuyabilir, sadece service_role yazabilir
CREATE POLICY "Public read ON security_reports" ON security_reports FOR SELECT USING (true);
CREATE POLICY "Service role write ON security_reports" ON security_reports FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- Whitelists: Sadece authenticate olan organizasyon üyeleri
CREATE POLICY "Org members read whitelists" ON org_whitelists FOR SELECT USING (auth.role() = 'authenticated');

