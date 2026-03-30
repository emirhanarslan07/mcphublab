const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const ARCHIVED = [
  'github', 'sqlite', 'slack', 'brave-search', 'google-maps', 
  'sentry', 'gitlab', 'postgres', 'linear', 'notion', 
  'aws-s3', 'evernote', 'stripe', 'redis', 'gdrive', 'jira', 'docker', 'puppeteer'
];

async function fix() {
  console.log('Finetuning official repo links (archived vs core)...');
  
  const { data: servers } = await supabase
    .from('mcp_servers')
    .select('id, slug, github_url');

  for (const server of servers || []) {
    let newUrl = server.github_url;
    
    if (ARCHIVED.includes(server.slug)) {
      // Must point to servers-archived
      newUrl = `https://github.com/modelcontextprotocol/servers-archived/tree/main/src/${server.slug}`;
    } else if (['filesystem', 'fetch', 'git', 'memory', 'sequentialthinking', 'time', 'everything'].includes(server.slug)) {
      // Still in core
      newUrl = `https://github.com/modelcontextprotocol/servers/tree/main/src/${server.slug}`;
    }

    if (newUrl !== server.github_url) {
      await supabase.from('mcp_servers').update({ github_url: newUrl }).eq('id', server.id);
      console.log(`Updated ${server.slug}: ${newUrl}`);
    }
  }
}

fix();
