const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
  const { data, error } = await supabase
    .from('mcp_servers')
    .select('name, github_url')
    .eq('slug', 'brave-search')
    .single();
  
  if (error) console.error(error);
  else console.log('Brave Search GitHub URL in DB:', data.github_url);
}

check();
