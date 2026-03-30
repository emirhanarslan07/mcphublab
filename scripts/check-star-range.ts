import { createClient } from '@supabase/supabase-js';
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function check() {
  const { data: servers, error } = await supabase
    .from('mcp_servers')
    .select('stars');
  
  if (error) {
    console.error('Error fetching servers:', error);
    return;
  }

  const stars = servers.map(s => s.stars || 0);
  console.log(`Min stars: ${Math.min(...stars)}`);
  console.log(`Max stars: ${Math.max(...stars)}`);
  console.log(`Total servers: ${servers.length}`);
  console.log(`Servers with >20 stars: ${stars.filter(s => s > 20).length}`);
  console.log(`Servers with <=20 stars: ${stars.filter(s => s <= 20).length}`);
}

check();
