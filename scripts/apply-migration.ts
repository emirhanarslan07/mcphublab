import { createClient } from '@supabase/supabase-js';
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function applyMigration() {
  const sql = `
    CREATE TABLE IF NOT EXISTS leads (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      email TEXT NOT NULL,
      company_name TEXT,
      how_heard TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

    -- Drop policy if exists then recreate (Safeguard)
    DROP POLICY IF EXISTS "Public can insert leads" ON leads;
    CREATE POLICY "Public can insert leads" ON leads FOR INSERT WITH CHECK (true);
  `;
  
  const { error } = await supabase.rpc('exec_sql', { sql_query: sql });
  
  if (error) {
    // If rpc fails, we might just try inserting a lead to see if it works anyway
    console.error('Error applying migration via RPC:', error);
  } else {
    console.log('✅ Leads table migration applied successfully.');
  }
}

applyMigration();
