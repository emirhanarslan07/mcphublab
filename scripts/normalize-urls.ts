require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function normalizeUrls() {
  console.log('🧹 Normalizing all GitHub URLs in database...');
  
  const { data: servers, error } = await supabase
    .from('mcp_servers')
    .select('id, name, github_url');

  if (error) {
    console.error('Error fetching servers:', error.message);
    return;
  }

  let updateCount = 0;

  for (const server of servers) {
    if (!server.github_url) continue;

    const original = server.github_url;
    
    // Normalization logic: Strip everything after /{owner}/{repo}
    // and specifically fix the monorepo paths if they are folders
    let clean = original.split('/tree/')[0].split('/blob/')[0].split('/raw/')[0].split('/issues/')[0];
    
    // Remove trailing slash
    clean = clean.replace(/\/$/, '');

    // Common migration fix for old MCP servers repo folders
    // many are in servers-archived or have been moved to standalone repos
    // For now, root is always BETTER than a 404 subfolder
    
    if (clean !== original) {
      const { error: updateError } = await supabase
        .from('mcp_servers')
        .update({ github_url: clean })
        .eq('id', server.id);

      if (!updateError) {
        console.log(`  ✅ Fixed ${server.name}: ${original} -> ${clean}`);
        updateCount++;
      }
    }
  }

  console.log(`\n✨ Successfully normalized ${updateCount} URLs.`);
}

normalizeUrls();
