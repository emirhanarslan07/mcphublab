const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function cleanAndSeed() {
  console.log('Fetching all IDs to delete...');
  const { data: allRows } = await supabase.from('mcp_servers').select('id');
  
  if (allRows && allRows.length > 0) {
    const ids = allRows.map(r => r.id);
    console.log(`Deleting ${ids.length} rows...`);
    const { error: delError } = await supabase.from('mcp_servers').delete().in('id', ids);
    if (delError) console.error('Delete error:', delError);
    else console.log('Successfully cleared table.');
  }

  // Now seed
  const REAL_SERVERS = [
    { name: 'filesystem', slug: 'filesystem', github_url: 'https://github.com/modelcontextprotocol/servers/tree/main/src/filesystem', description: 'MCP server for providing secure filesystem access to AI agents', stars: 5200, category: 'File Management', language: 'typescript', source: 'manual', trust_score: 9.5, is_verified: true, risk_level: 'low' },
    { name: 'sqlite', slug: 'sqlite', github_url: 'https://github.com/modelcontextprotocol/servers-archived/tree/main/src/sqlite', description: 'MCP server for querying SQLite databases safely', stars: 4800, category: 'Database', language: 'python', source: 'manual', trust_score: 9.2, is_verified: true, risk_level: 'low' },
    { name: 'github', slug: 'github', github_url: 'https://github.com/modelcontextprotocol/servers-archived/tree/main/src/github', description: 'Official GitHub MCP server for managing PRs, issues, and repos', stars: 7500, category: 'Development', language: 'typescript', source: 'manual', trust_score: 8.9, is_verified: true, risk_level: 'low' },
    { name: 'slack', slug: 'slack', github_url: 'https://github.com/modelcontextprotocol/servers-archived/tree/main/src/slack', description: 'Slack integration for reading channels and posting messages', stars: 3200, category: 'Communication', language: 'typescript', source: 'manual', trust_score: 8.5, is_verified: true, risk_level: 'low' },
    { name: 'brave-search', slug: 'brave-search', github_url: 'https://github.com/modelcontextprotocol/servers-archived/tree/main/src/brave-search', description: 'MCP server for web searching using Brave Search API', stars: 6100, category: 'Search', language: 'typescript', source: 'manual', trust_score: 9.8, is_verified: true, risk_level: 'low' },
    { name: 'google-maps', slug: 'google-maps', github_url: 'https://github.com/modelcontextprotocol/servers-archived/tree/main/src/google-maps', description: 'Google Maps MCP server for geocoding and routing', stars: 1500, category: 'Maps', language: 'typescript', source: 'manual', trust_score: 8.0, is_verified: false, risk_level: 'unscanned' },
    { name: 'fetch', slug: 'fetch', github_url: 'https://github.com/modelcontextprotocol/servers/tree/main/src/fetch', description: 'A server that safely fetches web content for the LLM', stars: 4100, category: 'Web', language: 'python', source: 'manual', trust_score: 7.5, is_verified: false, risk_level: 'medium' },
    { name: 'puppeteer', slug: 'puppeteer', github_url: 'https://github.com/modelcontextprotocol/servers-archived/tree/main/src/puppeteer', description: 'Browser automation via Puppeteer MCP', stars: 8900, category: 'Web', language: 'typescript', source: 'manual', trust_score: 6.5, is_verified: false, risk_level: 'high' },
    { name: 'sentry', slug: 'sentry', github_url: 'https://github.com/modelcontextprotocol/servers-archived/tree/main/src/sentry', description: 'Sentry error tracking and issue management MCP', stars: 2200, category: 'Development', language: 'python', source: 'manual', trust_score: 8.8, is_verified: true, risk_level: 'low' },
    { name: 'gitlab', slug: 'gitlab', github_url: 'https://github.com/modelcontextprotocol/servers-archived/tree/main/src/gitlab', description: 'GitLab repository and CI/CD operations MCP', stars: 3100, category: 'Development', language: 'typescript', source: 'manual', trust_score: 8.7, is_verified: true, risk_level: 'low' },
    { name: 'postgres', slug: 'postgres', github_url: 'https://github.com/modelcontextprotocol/servers-archived/tree/main/src/postgres', description: 'Read-only Postgres database querying MCP', stars: 5500, category: 'Database', language: 'typescript', source: 'manual', trust_score: 9.0, is_verified: true, risk_level: 'low' },
    { name: 'linear', slug: 'linear', github_url: 'https://github.com/modelcontextprotocol/servers-archived/tree/main/src/linear', description: 'Linear issue tracker management MCP server', stars: 4000, category: 'Productivity', language: 'typescript', source: 'manual', trust_score: 9.1, is_verified: true, risk_level: 'low' },
    { name: 'notion', slug: 'notion', github_url: 'https://github.com/modelcontextprotocol/servers-archived/tree/main/src/notion', description: 'Notion workspace management and page reading MCP', stars: 6800, category: 'Productivity', language: 'typescript', source: 'manual', trust_score: 8.4, is_verified: true, risk_level: 'medium' },
    { name: 'aws-s3', slug: 'aws-s3', github_url: 'https://github.com/modelcontextprotocol/servers-archived/tree/main/src/aws-s3', description: 'AWS S3 bucket operations MCP server', stars: 2900, category: 'Cloud', language: 'python', source: 'manual', trust_score: 8.2, is_verified: false, risk_level: 'unscanned' },
    { name: 'evernote', slug: 'evernote', github_url: 'https://github.com/modelcontextprotocol/servers-archived/tree/main/src/evernote', description: 'Evernote personal note fetching MCP', stars: 800, category: 'Productivity', language: 'typescript', source: 'manual', trust_score: 7.9, is_verified: false, risk_level: 'unscanned' },
    { name: 'stripe', slug: 'stripe', github_url: 'https://github.com/modelcontextprotocol/servers-archived/tree/main/src/stripe', description: 'Stripe payments and subscription MCP server', stars: 3500, category: 'Finance', language: 'typescript', source: 'manual', trust_score: 9.4, is_verified: true, risk_level: 'low' },
    { name: 'redis', slug: 'redis', github_url: 'https://github.com/modelcontextprotocol/servers-archived/tree/main/src/redis', description: 'Redis cache querying and management MCP', stars: 2100, category: 'Database', language: 'python', source: 'manual', trust_score: 8.6, is_verified: false, risk_level: 'low' },
    { name: 'gdrive', slug: 'gdrive', github_url: 'https://github.com/modelcontextprotocol/servers-archived/tree/main/src/gdrive', description: 'Google Drive file access MCP server', stars: 5900, category: 'Storage', language: 'typescript', source: 'manual', trust_score: 7.2, is_verified: false, risk_level: 'medium' },
    { name: 'jira', slug: 'jira', github_url: 'https://github.com/modelcontextprotocol/servers-archived/tree/main/src/jira', description: 'Jira Software sprint and issue management MCP', stars: 4200, category: 'Productivity', language: 'python', source: 'manual', trust_score: 8.5, is_verified: false, risk_level: 'unscanned' },
    { name: 'docker', slug: 'docker', github_url: 'https://github.com/modelcontextprotocol/servers-archived/tree/main/src/docker', description: 'Docker container and image management MCP', stars: 7100, category: 'DevOps', language: 'typescript', source: 'manual', trust_score: 6.8, is_verified: false, risk_level: 'high' }
  ];

  console.log('Seeding fresh data...');
  const { error: seedError } = await supabase.from('mcp_servers').insert(REAL_SERVERS);
  if (seedError) console.error('Seed error:', seedError);
  else console.log('Successfully seeded 20 manual servers.');
}

cleanAndSeed();
