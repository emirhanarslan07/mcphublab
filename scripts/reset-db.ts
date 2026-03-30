const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function reset() {
  console.log('Clearing mcp_servers table...');
  const { error: delError } = await supabase.from('mcp_servers').delete().neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
  if (delError) {
    console.error('Delete error:', delError);
    return;
  }
  console.log('Table cleared.');
}

reset();
