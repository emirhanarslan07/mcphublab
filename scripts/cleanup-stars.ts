import { createClient } from '@supabase/supabase-js';
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function cleanup() {
  console.log('🧹 Purging servers with less than 20 stars...');
  
  const { data: toDelete, error: fetchError } = await supabase
    .from('mcp_servers')
    .select('id, name, stars')
    .lt('stars', 20);

  if (fetchError) {
    console.error('Error fetching servers for cleanup:', fetchError);
    return;
  }

  if (!toDelete || toDelete.length === 0) {
    console.log('✨ No low-star servers found. Database is clean.');
    return;
  }

  console.log(`🗑️  Found ${toDelete.length} servers below 20 stars. Deleting...`);
  
  const ids = toDelete.map(s => s.id);
  const { error: deleteError } = await supabase
    .from('mcp_servers')
    .delete()
    .in('id', ids);

  if (deleteError) {
    console.error('Error deleting low-star servers:', deleteError);
  } else {
    console.log('✅ Successfully removed all low-star servers.');
  }
}

cleanup();
