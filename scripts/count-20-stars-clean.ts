import { createClient } from '@supabase/supabase-js';
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function check() {
  const { data: servers, error } = await supabase
    .from('mcp_servers')
    .select('id, name, stars');
  
  if (error) {
    console.error('Error fetching servers:', error);
    return;
  }

  const filtered = servers.filter(s => s.stars > 20);
  console.log(`Total Servers in DB with >20 stars: ${filtered.length}`);
}

check();
