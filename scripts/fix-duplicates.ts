const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function findDuplicates() {
  const { data: all } = await supabase.from('mcp_servers').select('id, slug, name, github_url');
  
  const seenSlugs = new Set();
  const toDelete = [];
  
  for (const row of all) {
    if (seenSlugs.has(row.slug)) {
      console.log(`Duplicate found: ${row.slug} (ID: ${row.id}, URL: ${row.github_url})`);
      toDelete.push(row.id);
    } else {
      seenSlugs.add(row.slug);
    }
  }
  
  if (toDelete.length > 0) {
    console.log(`Deleting ${toDelete.length} duplicates...`);
    const { error } = await supabase.from('mcp_servers').delete().in('id', toDelete);
    if (error) console.error(error);
    else console.log('Duplicates deleted.');
  } else {
    console.log('No duplicates found.');
  }
}

findDuplicates();
