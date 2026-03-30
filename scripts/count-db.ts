const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
  const { data: servers } = await supabase.from('mcp_servers').select('*');
  console.log('Total Servers in DB:', servers.length);
  
  if (servers.length > 0) {
    const braveSearches = servers.filter(s => s.name.toLowerCase().includes('brave'));
    console.log('Brave Search entries:', braveSearches.map(s => ({ id: s.id, url: s.github_url })));
  }
}

check();
