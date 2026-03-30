const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
  const { data } = await supabase.from('mcp_servers').select('id, name, github_url').eq('slug', 'brave-search').single();
  console.log('Current ID in DB:', data.id);
  console.log('Current URL in DB:', data.github_url);
}

check();
