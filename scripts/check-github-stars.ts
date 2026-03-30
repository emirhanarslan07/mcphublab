require('dotenv').config({ path: '.env.local' });

async function checkGitHub() {
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  const query = '"mcp-server" OR "mcp server" stars:>20';
  const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&per_page=1`;
  
  const headers = {
    'Accept': 'application/vnd.github.v3+json'
  };
  
  if (GITHUB_TOKEN) {
    headers['Authorization'] = `Bearer ${GITHUB_TOKEN}`;
  }

  try {
    const response = await fetch(url, { headers });
    const data = await response.json();
    console.log('GitHub Search Results for MCPs with >20 stars:');
    console.log(`Total Found: ${data.total_count}`);
  } catch (error) {
    console.error('Error fetching from GitHub:', error);
  }
}

checkGitHub();
