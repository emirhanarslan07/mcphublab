require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
  const { count, error } = await supabase
    .from('mcp_servers')
    .select('*', { count: 'exact', head: true });
  
  if (error) console.error(error);
  console.log('REAL_DATABASE_COUNT:', count);
}

check();
