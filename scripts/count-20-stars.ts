import { createClient } from '@supabase/supabase-js';
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function check() {
  const { data: servers, error } = await supabase
    .from('mcp_servers')
    .select('name, stars')
    .gt('stars', 20);
  
  if (error) {
    console.error('Error fetching servers:', error);
    return;
  }

  console.log(`Total Servers in DB with >20 stars: ${servers.length}`);
  // List top 10 for sanity check
  console.log('Top 10 servers by stars in DB:');
  servers.sort((a, b) => b.stars - a.stars).slice(0, 10).forEach(s => {
    console.log(`- ${s.name}: ${s.stars} stars`);
  });
}

check();
