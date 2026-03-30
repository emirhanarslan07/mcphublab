require('dotenv').config({ path: '.env.local' });

async function checkGitHub() {
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  const queries = [
    'topic:mcp-server stars:>20',
    '"mcp server" stars:>20',
    'mcp-server stars:>20'
  ];
  
  const headers = {
    'Accept': 'application/vnd.github.v3+json'
  };
  
  if (GITHUB_TOKEN) {
    headers['Authorization'] = `Bearer ${GITHUB_TOKEN}`;
  }

  for (const query of queries) {
    const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&per_page=1`;
    try {
      const response = await fetch(url, { headers });
      const data = await response.json();
      console.log(`Query: [${query}] -> Total Found on GitHub: ${data.total_count}`);
    } catch (error) {
      console.error(`Error fetching for query [${query}]:`, error);
    }
  }
}

checkGitHub();
