import { createClient } from '@supabase/supabase-js';
require('dotenv').config({ path: '.env.local' });
const fs = require('fs');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function check() {
  const { data: samples } = await supabase
    .from('mcp_servers')
    .select('name, stars')
    .limit(10);

  const { count: zeroStars } = await supabase
    .from('mcp_servers')
    .select('*', { count: 'exact', head: true })
    .eq('stars', 0);

  const results = `📊 DB Deep Dive:
- Sample Stars: ${JSON.stringify(samples)}
- Exactly 0 Stars: ${zeroStars}
`;
  console.log(results);
  fs.writeFileSync('db_deep_dive.txt', results);
}

check();
