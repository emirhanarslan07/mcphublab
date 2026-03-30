console.log('🚀 Loading script dependencies...');
import { createClient } from '@supabase/supabase-js';
require('dotenv').config({ path: '.env.local' });
console.log('🚀 Environment loaded.');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const GITHUB_TOKEN = process.env.GITHUB_TOKEN!;

const categoryMap: Record<string, string> = {
  'database': 'database', 'db': 'database', 'sql': 'database',
  'filesystem': 'file-management', 'file': 'file-management',
  'slack': 'communication', 'discord': 'communication',
  'github': 'development', 'gitlab': 'development',
  'docker': 'devops', 'kubernetes': 'devops',
  'search': 'search', 'web': 'web',
  'payment': 'finance', 'stripe': 'finance',
  'ai': 'ai-ml', 'llm': 'ai-ml'
};

function detectCategory(topics: string[], name: string, description: string): string {
  const allText = [...topics, name, description || ''].join(' ').toLowerCase();
  for (const [keyword, category] of Object.entries(categoryMap)) {
    if (allText.includes(keyword)) return category;
  }
  return 'other';
}

async function fetchFromGitHub(page: number = 1): Promise<any[]> {
  const url = `https://api.github.com/search/repositories?q=("mcp-server"+OR+"mcp+server"+OR+topic:mcp+OR+"Model+Context+Protocol")+stars:>=20&sort=stars&order=desc&per_page=100&page=${page}`;
  const response = await fetch(url, {
    headers: { 'Authorization': `Bearer ${GITHUB_TOKEN}`, 'Accept': 'application/vnd.github.v3+json' }
  });
  console.log(`  🔍 Search API Status: ${response.status}`);
  if (!response.ok) return [];
  const data = await response.json() as any;
  console.log(`  🔍 Total Results Found: ${data.total_count}`);
  return data.items || [];
}

async function fetchReadme(owner: string, repo: string): Promise<string> {
  try {
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/readme`, {
      headers: { 'Authorization': `Bearer ${GITHUB_TOKEN}`, 'Accept': 'application/vnd.github.v3.raw' }
    });
    if (!response.ok) return '';
    return await response.text();
  } catch { return ''; }
}

function parseLongDescription(readme: string): string {
  if (!readme) return '';
  // First paragraph, skipping headers
  const lines = readme.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && !trimmed.startsWith('!') && !trimmed.startsWith('[')) {
      return trimmed.substring(0, 500);
    }
  }
  return '';
}

function parseInstallCommand(readme: string): string {
  if (!readme) return '';
  const patterns = [/npx\s+[\w@/-]+/, /npm\s+install\s+[\w@/-]+/, /pip\s+install\s+[\w@/-]+/];
  for (const pattern of patterns) {
    const match = readme.match(pattern);
    if (match) return match[0];
  }
  return '';
}

function parseFeatures(readme: string): string[] {
  if (!readme) return [];
  const section = readme.match(/##\s+(?:Features|Tools|Capabilities)[\s\S]*?(?=##|$)/i);
  if (!section) return [];
  const listItems = section[0].match(/^\s*[-\*+]\s+(.+)$/gm);
  if (!listItems) return [];
  return listItems.map(item => item.replace(/^\s*[-\*+]\s+/, '').trim()).slice(0, 10);
}

async function crawl() {
  console.log('🕷️  Starting EXPANDED robust crawler...');
  let totalNew = 0;
  
  // Scrape 10 pages (up to 1000 results) to get all 20+ star repos
  for (let page = 1; page <= 10; page++) {
    const repos = await fetchFromGitHub(page);
    console.log(`  🔍 Found ${repos.length} candidates on page ${page}`);
    for (const repo of repos) {
      if (repo.stargazers_count < 20) continue; // Skip low-star repos as per user request

      // 1. URL Normalization
      let cleanUrl = repo.html_url.replace(/\/tree\/.*$/, '').replace(/\/blob\/.*$/, '').replace(/\/raw\/.*$/, '').replace(/\/$/, '');

      // 3. Rich Content Extraction
      const readme = await fetchReadme(repo.owner.login, repo.name);
      
      const features = parseFeatures(readme);
      let longDesc = parseLongDescription(readme);
      if (features.length > 0) {
          longDesc += '\n\n### Key Features\n- ' + features.join('\n- ');
      }
      
      const payload = {
        name: repo.name,
        slug: repo.name.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
        github_url: cleanUrl,
        description: repo.description ? repo.description.substring(0, 500) : 'No description available',
        long_description: longDesc || repo.description || '',
        install_command: parseInstallCommand(readme),
        author: repo.owner.login,
        author_url: repo.owner.avatar_url,
        stars: repo.stargazers_count,
        category: detectCategory(repo.topics || [], repo.name, repo.description || ''),
        tags: repo.topics,
        status: 'active',
        source: 'github',
        last_crawled_at: new Date().toISOString()
      };

      const { data: existing } = await supabase.from('mcp_servers').select('id').eq('slug', payload.slug).single();
      
      const { error } = await supabase.from('mcp_servers').upsert(payload, { onConflict: 'slug' });
      if (!error) {
        if (!existing) {
          console.log(`  ✨ NEW: ${repo.name} [Stars: ${repo.stargazers_count}] (Injected)`);
          totalNew++;
        } else {
          console.log(`  🔄 UPDATED: ${repo.name} [Stars: ${repo.stargazers_count}]`);
        }
      } else {
        console.error(`  ❌ FAILED: ${repo.name}:`, error.message);
      }
      // Very small delay to respect rate limits
      await new Promise(r => setTimeout(r, 100));
    }
  }
  console.log(`✅ Crawler complete. Total synced: ${totalNew} servers.`);
}

crawl();
