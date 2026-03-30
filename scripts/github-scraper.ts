import { createClient } from '@supabase/supabase-js';
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function scrapeGithub() {
  console.log('🔍 Starting GitHub MCP Server Scraper...');
  
  // We'll fetch 3 pages to seed a good amount of real servers
  const maxPages = 3;
  let addedCount = 0;

  try {
    for (let page = 1; page <= maxPages; page++) {
      console.log(`📡 Fetching page ${page} from GitHub...`);
      
      const response = await fetch(`https://api.github.com/search/repositories?q=mcp-server+in:name,description,readme&sort=stars&order=desc&per_page=100&page=${page}`, {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'MCPHub-Scraper'
        }
      });
      
      if (!response.ok) {
         console.log(`❌ GitHub API Error: ${response.statusText}`);
         break;
      }

      const data = await response.json();
      const items = data.items || [];
      
      if (items.length === 0) break;

      console.log(`📦 Found ${items.length} repositories on page ${page}. Processing...`);

      for (const repo of items) {
        const serverData = {
          name: repo.full_name,
          slug: repo.full_name.replace('/', '-').toLowerCase(),
          github_url: repo.html_url,
          description: repo.description ? repo.description.substring(0, 200) : 'Community MCP Server implementation.',
          long_description: repo.description || 'No detailed description provided by the repository owner.',
          author: repo.owner.login,
          author_url: repo.owner.avatar_url,
          stars: repo.stargazers_count,
          category: 'community',
          tags: repo.topics && repo.topics.length > 0 ? repo.topics : ['mcp', 'server'],
          language: repo.language ? repo.language.toLowerCase() : 'unknown',
          install_command: `git clone ${repo.html_url}`,
          is_verified: false,
          trust_score: Math.min((repo.stargazers_count / 100) * 10, 8.5)
        };

        const { error } = await supabase
          .from('mcp_servers')
          .upsert(serverData, { onConflict: 'github_url' });
          
        if (error) {
           console.log(`  ❌ Failed to insert ${repo.name}:`, JSON.stringify(error));
        } else {
           addedCount++;
        }
      }
      
      // Delay to avoid hitting unauthenticated rate limits (10 requests/min for search API)
      await new Promise(r => setTimeout(r, 6000));
    }
  } catch(e) {
    console.log('CRITICAL ERROR:', e);
  }

  console.log(`✅ Scraping complete. Successfully added/updated ${addedCount} real servers in the database.`);
}

scrapeGithub();
