const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function dump() {
  const { data: all } = await supabase.from('mcp_servers').select('id, name, slug, github_url');
  console.log(JSON.stringify(all, null, 2));
}

dump();
