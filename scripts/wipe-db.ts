const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function wipe() {
  console.log('🧹 Wiping all records from security_reports...');
  const { error: err1 } = await supabase.from('security_reports').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (err1) console.error('Error wiping reports:', err1);

  console.log('🧹 Wiping all records from mcp_servers...');
  const { error: err2 } = await supabase.from('mcp_servers').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (err2) console.error('Error wiping servers:', err2);

  console.log('✅ Wipe complete.');
}

wipe();
