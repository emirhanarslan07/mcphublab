import { createClient } from '@supabase/supabase-js';
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const fs = require('fs');

async function check() {
  const { count: total, error: totalErr } = await supabase
    .from('mcp_servers')
    .select('*', { count: 'exact', head: true });

  const { count: lowStars, error: lowErr } = await supabase
    .from('mcp_servers')
    .select('*', { count: 'exact', head: true })
    .lt('stars', 20);

  if (totalErr || lowErr) {
    fs.writeFileSync('db_stats.txt', 'Error fetching counts: ' + JSON.stringify(totalErr || lowErr));
    return;
  }

  const results = `📊 DB Stats:
- Total Servers: ${total}
- Low Star (<20) Servers: ${lowStars}
`;
  console.log(results);
  fs.writeFileSync('db_stats.txt', results);
}

check();
